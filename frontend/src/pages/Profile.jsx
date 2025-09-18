import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/api";
import {
  User,
  MapPin,
  Tractor,
  Mail,
  Calendar,
  Edit3,
  Save,
  X,
  Loader,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  Target,
} from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stats, setStats] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    farm_location: "",
    farm_size: "",
    farming_type: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        farm_location: user.farm_location || "",
        farm_size: user.farm_size || "",
        farming_type: user.farming_type || "",
      });
    }
    loadUserStats();
  }, [user]);

  const loadUserStats = async () => {
    try {
      const response = await userService.getProfile();
      if (response.stats) {
        setStats(response.stats);
      }
    } catch (err) {
      console.error("Failed to load user stats:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const updateData = {
        ...formData,
        farm_size: formData.farm_size ? parseFloat(formData.farm_size) : null,
      };

      await userService.updateProfile(updateData);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);

      // Refresh user data
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || "",
      email: user?.email || "",
      farm_location: user?.farm_location || "",
      farm_size: user?.farm_size || "",
      farming_type: user?.farming_type || "",
    });
    setIsEditing(false);
    setError("");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-neutral-900">
            Profile Settings
          </h1>
          <p className="mt-2 text-neutral-600">
            Manage your account information and farming details
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="alert-success mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="alert-error mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-900">
                  Profile Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Account Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-neutral-900 border-b pb-2">
                    Account Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Username</label>
                      <div className="input-field bg-neutral-100 text-neutral-600 cursor-not-allowed">
                        {user.username}
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Username cannot be changed
                      </p>
                    </div>

                    <div>
                      <label className="label">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`input-field ${
                          !isEditing ? "bg-neutral-50" : ""
                        }`}
                        disabled={!isEditing}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className={`input-field ${
                        !isEditing ? "bg-neutral-50" : ""
                      }`}
                      disabled={!isEditing}
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                {/* Farm Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-neutral-900 border-b pb-2">
                    Farm Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Farm Location</label>
                      <input
                        type="text"
                        name="farm_location"
                        value={formData.farm_location}
                        onChange={handleInputChange}
                        className={`input-field ${
                          !isEditing ? "bg-neutral-50" : ""
                        }`}
                        disabled={!isEditing}
                        placeholder="City, State/Province"
                      />
                    </div>

                    <div>
                      <label className="label">Farm Size (acres)</label>
                      <input
                        type="number"
                        name="farm_size"
                        value={formData.farm_size}
                        onChange={handleInputChange}
                        className={`input-field ${
                          !isEditing ? "bg-neutral-50" : ""
                        }`}
                        disabled={!isEditing}
                        placeholder="e.g., 50"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Farming Type</label>
                    <select
                      name="farming_type"
                      value={formData.farming_type}
                      onChange={handleInputChange}
                      className={`input-field ${
                        !isEditing ? "bg-neutral-50" : ""
                      }`}
                      disabled={!isEditing}
                    >
                      <option value="">Select farming type</option>
                      <option value="Organic">Organic</option>
                      <option value="Conventional">Conventional</option>
                      <option value="Sustainable">Sustainable</option>
                      <option value="Precision">Precision Agriculture</option>
                      <option value="Mixed">Mixed Farming</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="card p-6">
              <div className="text-center">
                <div className="bg-primary-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  {user.full_name || user.username}
                </h3>
                <p className="text-neutral-600">{user.email}</p>
                <div className="mt-3 flex items-center justify-center text-sm text-neutral-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  Member since{" "}
                  {new Date(user.created_at || Date.now()).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Farm Details */}
            {(user.farm_location || user.farm_size || user.farming_type) && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Farm Details
                </h3>
                <div className="space-y-3">
                  {user.farm_location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 text-neutral-400 mr-3" />
                      <span className="text-neutral-600">
                        {user.farm_location}
                      </span>
                    </div>
                  )}
                  {user.farm_size && (
                    <div className="flex items-center text-sm">
                      <Tractor className="h-4 w-4 text-neutral-400 mr-3" />
                      <span className="text-neutral-600">
                        {user.farm_size} acres
                      </span>
                    </div>
                  )}
                  {user.farming_type && (
                    <div className="flex items-center text-sm">
                      <Target className="h-4 w-4 text-neutral-400 mr-3" />
                      <span className="text-neutral-600">
                        {user.farming_type}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activity Stats */}
            {stats && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Activity Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm text-neutral-600">
                        Predictions
                      </span>
                    </div>
                    <span className="font-semibold text-neutral-900">
                      {stats.total_predictions || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm text-neutral-600">
                        Last Active
                      </span>
                    </div>
                    <span className="text-sm text-neutral-600">
                      {stats.last_active
                        ? new Date(stats.last_active).toLocaleDateString()
                        : "Today"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
