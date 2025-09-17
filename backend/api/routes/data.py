from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import io
import pandas as pd
from datetime import datetime
import uuid

router = APIRouter()

class DataUploadResponse(BaseModel):
    upload_id: str
    filename: str
    records_count: int
    columns: List[str]
    data_type: str
    upload_timestamp: str
    status: str

class DataValidationResult(BaseModel):
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    summary: Dict[str, Any]

class DatasetInfo(BaseModel):
    name: str
    description: str
    records_count: int
    columns: List[str]
    last_updated: str
    size_mb: float

# In-memory storage for demo
uploaded_datasets = {}
data_validation_results = {}

@router.post("/upload/csv", response_model=DataUploadResponse)
async def upload_csv_data(
    file: UploadFile = File(...),
    data_type: str = Form(...),
    description: Optional[str] = Form(None)
):
    """
    Upload CSV data file
    """
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
        # Read CSV content
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        
        # Generate upload ID
        upload_id = str(uuid.uuid4())
        
        # Store dataset info
        dataset_info = {
            "upload_id": upload_id,
            "filename": file.filename,
            "data_type": data_type,
            "description": description,
            "dataframe": df,
            "upload_timestamp": datetime.now().isoformat(),
            "records_count": len(df),
            "columns": df.columns.tolist(),
            "size_mb": len(content) / (1024 * 1024)
        }
        
        uploaded_datasets[upload_id] = dataset_info
        
        return DataUploadResponse(
            upload_id=upload_id,
            filename=file.filename,
            records_count=len(df),
            columns=df.columns.tolist(),
            data_type=data_type,
            upload_timestamp=dataset_info["upload_timestamp"],
            status="uploaded"
        )
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="CSV file is empty")
    except pd.errors.ParserError as e:
        raise HTTPException(status_code=400, detail=f"CSV parsing error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")

@router.get("/datasets", response_model=List[DatasetInfo])
async def get_uploaded_datasets():
    """
    Get list of all uploaded datasets
    """
    try:
        datasets = []
        for dataset in uploaded_datasets.values():
            datasets.append(DatasetInfo(
                name=dataset["filename"],
                description=dataset.get("description", "No description"),
                records_count=dataset["records_count"],
                columns=dataset["columns"],
                last_updated=dataset["upload_timestamp"],
                size_mb=dataset["size_mb"]
            ))
        
        return datasets
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dataset fetch error: {str(e)}")

@router.get("/datasets/{upload_id}")
async def get_dataset_details(upload_id: str):
    """
    Get detailed information about a specific dataset
    """
    try:
        if upload_id not in uploaded_datasets:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        dataset = uploaded_datasets[upload_id]
        df = dataset["dataframe"]
        
        # Generate summary statistics
        summary_stats = {}
        for column in df.columns:
            if df[column].dtype in ['int64', 'float64']:
                summary_stats[column] = {
                    "type": "numeric",
                    "mean": float(df[column].mean()),
                    "std": float(df[column].std()),
                    "min": float(df[column].min()),
                    "max": float(df[column].max()),
                    "null_count": int(df[column].isnull().sum())
                }
            else:
                summary_stats[column] = {
                    "type": "categorical",
                    "unique_values": int(df[column].nunique()),
                    "most_common": df[column].mode().iloc[0] if not df[column].mode().empty else None,
                    "null_count": int(df[column].isnull().sum())
                }
        
        return {
            "upload_id": upload_id,
            "filename": dataset["filename"],
            "data_type": dataset["data_type"],
            "description": dataset.get("description"),
            "upload_timestamp": dataset["upload_timestamp"],
            "records_count": dataset["records_count"],
            "columns": dataset["columns"],
            "size_mb": dataset["size_mb"],
            "summary_statistics": summary_stats,
            "sample_data": df.head(5).to_dict(orient="records")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dataset details error: {str(e)}")

@router.post("/validate/{upload_id}", response_model=DataValidationResult)
async def validate_dataset(upload_id: str, expected_columns: Optional[List[str]] = None):
    """
    Validate uploaded dataset for quality and completeness
    """
    try:
        if upload_id not in uploaded_datasets:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        dataset = uploaded_datasets[upload_id]
        df = dataset["dataframe"]
        
        errors = []
        warnings = []
        is_valid = True
        
        # Check for empty dataset
        if len(df) == 0:
            errors.append("Dataset is empty")
            is_valid = False
        
        # Check for missing columns if expected columns provided
        if expected_columns:
            missing_columns = set(expected_columns) - set(df.columns)
            if missing_columns:
                errors.append(f"Missing expected columns: {list(missing_columns)}")
                is_valid = False
        
        # Check for null values
        null_counts = df.isnull().sum()
        high_null_columns = null_counts[null_counts > len(df) * 0.5].index.tolist()
        if high_null_columns:
            warnings.append(f"Columns with >50% null values: {high_null_columns}")
        
        # Check for duplicate rows
        duplicate_count = df.duplicated().sum()
        if duplicate_count > 0:
            warnings.append(f"Found {duplicate_count} duplicate rows")
        
        # Data type validation for crop recommendation dataset
        if dataset["data_type"] == "crop_recommendation":
            required_numeric_columns = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
            for col in required_numeric_columns:
                if col in df.columns and not pd.api.types.is_numeric_dtype(df[col]):
                    errors.append(f"Column '{col}' should be numeric")
                    is_valid = False
        
        # Generate summary
        summary = {
            "total_records": len(df),
            "total_columns": len(df.columns),
            "null_percentage": float((df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100),
            "duplicate_records": int(duplicate_count),
            "data_types": df.dtypes.astype(str).to_dict()
        }
        
        # Store validation results
        validation_result = DataValidationResult(
            is_valid=is_valid,
            errors=errors,
            warnings=warnings,
            summary=summary
        )
        
        data_validation_results[upload_id] = validation_result
        
        return validation_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")

@router.post("/transform/{upload_id}")
async def transform_dataset(
    upload_id: str,
    transformations: Dict[str, Any]
):
    """
    Apply transformations to uploaded dataset
    """
    try:
        if upload_id not in uploaded_datasets:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        dataset = uploaded_datasets[upload_id]
        df = dataset["dataframe"].copy()
        
        applied_transformations = []
        
        # Handle null values
        if "handle_nulls" in transformations:
            null_strategy = transformations["handle_nulls"]
            if null_strategy == "drop":
                original_count = len(df)
                df = df.dropna()
                applied_transformations.append(f"Dropped {original_count - len(df)} rows with null values")
            elif null_strategy == "fill_mean":
                numeric_columns = df.select_dtypes(include=['number']).columns
                df[numeric_columns] = df[numeric_columns].fillna(df[numeric_columns].mean())
                applied_transformations.append("Filled null values in numeric columns with mean")
        
        # Remove duplicates
        if transformations.get("remove_duplicates", False):
            original_count = len(df)
            df = df.drop_duplicates()
            applied_transformations.append(f"Removed {original_count - len(df)} duplicate rows")
        
        # Column renaming
        if "rename_columns" in transformations:
            rename_map = transformations["rename_columns"]
            df = df.rename(columns=rename_map)
            applied_transformations.append(f"Renamed columns: {rename_map}")
        
        # Data type conversions
        if "convert_types" in transformations:
            type_conversions = transformations["convert_types"]
            for column, new_type in type_conversions.items():
                if column in df.columns:
                    try:
                        if new_type == "numeric":
                            df[column] = pd.to_numeric(df[column], errors='coerce')
                        elif new_type == "categorical":
                            df[column] = df[column].astype('category')
                        applied_transformations.append(f"Converted {column} to {new_type}")
                    except Exception as e:
                        applied_transformations.append(f"Failed to convert {column} to {new_type}: {str(e)}")
        
        # Create new dataset with transformations
        new_upload_id = str(uuid.uuid4())
        transformed_dataset = {
            "upload_id": new_upload_id,
            "filename": f"transformed_{dataset['filename']}",
            "data_type": dataset["data_type"],
            "description": f"Transformed version of {dataset['filename']}",
            "dataframe": df,
            "upload_timestamp": datetime.now().isoformat(),
            "records_count": len(df),
            "columns": df.columns.tolist(),
            "size_mb": df.memory_usage(deep=True).sum() / (1024 * 1024),
            "parent_upload_id": upload_id,
            "transformations_applied": applied_transformations
        }
        
        uploaded_datasets[new_upload_id] = transformed_dataset
        
        return {
            "new_upload_id": new_upload_id,
            "transformations_applied": applied_transformations,
            "original_records": dataset["records_count"],
            "new_records": len(df),
            "status": "transformed"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transformation error: {str(e)}")

@router.get("/export/{upload_id}")
async def export_dataset(upload_id: str, format: str = "csv"):
    """
    Export dataset in specified format
    """
    try:
        if upload_id not in uploaded_datasets:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        dataset = uploaded_datasets[upload_id]
        df = dataset["dataframe"]
        
        if format.lower() == "csv":
            from fastapi.responses import StreamingResponse
            import io
            
            output = io.StringIO()
            df.to_csv(output, index=False)
            output.seek(0)
            
            return StreamingResponse(
                io.StringIO(output.getvalue()),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename={dataset['filename']}"}
            )
        elif format.lower() == "json":
            from fastapi.responses import JSONResponse
            return JSONResponse(content=df.to_dict(orient="records"))
        else:
            raise HTTPException(status_code=400, detail="Unsupported export format")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export error: {str(e)}")

@router.delete("/datasets/{upload_id}")
async def delete_dataset(upload_id: str):
    """
    Delete uploaded dataset
    """
    try:
        if upload_id not in uploaded_datasets:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        dataset = uploaded_datasets[upload_id]
        filename = dataset["filename"]
        
        # Remove dataset
        del uploaded_datasets[upload_id]
        
        # Remove validation results if exists
        if upload_id in data_validation_results:
            del data_validation_results[upload_id]
        
        return {
            "message": f"Dataset '{filename}' deleted successfully",
            "upload_id": upload_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete error: {str(e)}")

@router.get("/statistics")
async def get_data_statistics():
    """
    Get overall statistics about uploaded data
    """
    try:
        total_datasets = len(uploaded_datasets)
        total_records = sum(dataset["records_count"] for dataset in uploaded_datasets.values())
        total_size_mb = sum(dataset["size_mb"] for dataset in uploaded_datasets.values())
        
        # Data types distribution
        data_types = {}
        for dataset in uploaded_datasets.values():
            data_type = dataset["data_type"]
            data_types[data_type] = data_types.get(data_type, 0) + 1
        
        # Recent uploads (last 7 days)
        from datetime import datetime, timedelta
        week_ago = datetime.now() - timedelta(days=7)
        recent_uploads = [
            dataset for dataset in uploaded_datasets.values()
            if datetime.fromisoformat(dataset["upload_timestamp"]) > week_ago
        ]
        
        return {
            "total_datasets": total_datasets,
            "total_records": total_records,
            "total_size_mb": round(total_size_mb, 2),
            "data_types_distribution": data_types,
            "recent_uploads_count": len(recent_uploads),
            "average_dataset_size_mb": round(total_size_mb / total_datasets, 2) if total_datasets > 0 else 0,
            "validation_results_count": len(data_validation_results)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Statistics error: {str(e)}")

@router.post("/sample-data")
async def create_sample_data():
    """
    Create sample datasets for testing
    """
    try:
        import numpy as np
        
        # Create sample crop recommendation data
        np.random.seed(42)
        n_samples = 1000
        
        crop_data = pd.DataFrame({
            'N': np.random.randint(0, 150, n_samples),
            'P': np.random.randint(0, 150, n_samples),
            'K': np.random.randint(0, 300, n_samples),
            'temperature': np.random.normal(25, 5, n_samples),
            'humidity': np.random.normal(70, 15, n_samples),
            'ph': np.random.normal(6.5, 1, n_samples),
            'rainfall': np.random.normal(100, 50, n_samples),
            'label': np.random.choice(['rice', 'maize', 'wheat', 'cotton', 'sugarcane'], n_samples)
        })
        
        # Store sample dataset
        upload_id = str(uuid.uuid4())
        dataset_info = {
            "upload_id": upload_id,
            "filename": "sample_crop_data.csv",
            "data_type": "crop_recommendation",
            "description": "Sample crop recommendation dataset for testing",
            "dataframe": crop_data,
            "upload_timestamp": datetime.now().isoformat(),
            "records_count": len(crop_data),
            "columns": crop_data.columns.tolist(),
            "size_mb": crop_data.memory_usage(deep=True).sum() / (1024 * 1024)
        }
        
        uploaded_datasets[upload_id] = dataset_info
        
        return {
            "message": "Sample data created successfully",
            "upload_id": upload_id,
            "records_count": len(crop_data),
            "filename": "sample_crop_data.csv"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sample data creation error: {str(e)}")

@router.get("/schema/{data_type}")
async def get_data_schema(data_type: str):
    """
    Get expected schema for different data types
    """
    try:
        schemas = {
            "crop_recommendation": {
                "required_columns": ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"],
                "optional_columns": ["label", "crop_type"],
                "column_types": {
                    "N": "numeric",
                    "P": "numeric", 
                    "K": "numeric",
                    "temperature": "numeric",
                    "humidity": "numeric",
                    "ph": "numeric",
                    "rainfall": "numeric",
                    "label": "categorical"
                },
                "description": "Dataset for crop recommendation based on soil and environmental conditions"
            },
            "soil_analysis": {
                "required_columns": ["ph", "organic_matter", "nitrogen", "phosphorus", "potassium"],
                "optional_columns": ["soil_type", "location", "depth"],
                "column_types": {
                    "ph": "numeric",
                    "organic_matter": "numeric",
                    "nitrogen": "numeric",
                    "phosphorus": "numeric",
                    "potassium": "numeric",
                    "soil_type": "categorical"
                },
                "description": "Dataset for soil chemical analysis and health assessment"
            },
            "weather_data": {
                "required_columns": ["date", "temperature", "humidity", "rainfall"],
                "optional_columns": ["wind_speed", "pressure", "location"],
                "column_types": {
                    "date": "datetime",
                    "temperature": "numeric",
                    "humidity": "numeric",
                    "rainfall": "numeric",
                    "wind_speed": "numeric",
                    "pressure": "numeric"
                },
                "description": "Weather data for agricultural planning and analysis"
            }
        }
        
        if data_type not in schemas:
            available_types = list(schemas.keys())
            raise HTTPException(
                status_code=404,
                detail=f"Schema not found for data type '{data_type}'. Available types: {available_types}"
            )
        
        return schemas[data_type]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Schema fetch error: {str(e)}")