"""
ThingSpeak Demo Data Populator
Sends multiple entries of realistic demo data to ThingSpeak channel
This ensures there's always data available for visualization even if WiFi module fails
"""
import requests
import time
import random
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

# Get ThingSpeak configuration
WRITE_API_KEY = os.getenv('THINGSPEAK_WRITE_API_KEY', '')
CHANNEL_ID = os.getenv('THINGSPEAK_CHANNEL_ID', '')

if not WRITE_API_KEY or not CHANNEL_ID:
    print("⚠️  ERROR: ThingSpeak credentials not found!")
    print("Please set THINGSPEAK_WRITE_API_KEY and THINGSPEAK_CHANNEL_ID in your .env file")
    exit(1)

print("=" * 70)
print("🌾 AgroTech - ThingSpeak Demo Data Populator")
print("=" * 70)
print(f"📡 Channel ID: {CHANNEL_ID}")
print(f"🔑 Write API Key: {WRITE_API_KEY[:8]}...{WRITE_API_KEY[-4:]}")
print("=" * 70)
print("\n📝 This script will populate your ThingSpeak channel with demo data")
print("   to ensure there's always data available for visualization.\n")

# Demo data profiles for different soil conditions
DEMO_PROFILES = {
    "nutrient_rich": {
        "name": "🌟 Nutrient-Rich Soil",
        "nitrogen": (55, 75),
        "phosphorus": (40, 60),
        "potassium": (50, 70),
        "moisture": (60, 75),
        "ph": (6.5, 7.2),
        "description": "Optimal conditions for most crops"
    },
    "nitrogen_deficient": {
        "name": "🔵 Nitrogen-Deficient Soil",
        "nitrogen": (15, 28),
        "phosphorus": (35, 50),
        "potassium": (40, 60),
        "moisture": (50, 70),
        "ph": (6.0, 7.0),
        "description": "Needs nitrogen-rich fertilizer"
    },
    "phosphorus_deficient": {
        "name": "🟠 Phosphorus-Deficient Soil",
        "nitrogen": (45, 65),
        "phosphorus": (8, 14),
        "potassium": (45, 65),
        "moisture": (55, 75),
        "ph": (6.2, 7.3),
        "description": "Needs phosphorus supplement"
    },
    "dry_soil": {
        "name": "🏜️ Dry Soil Conditions",
        "nitrogen": (35, 55),
        "phosphorus": (25, 45),
        "potassium": (30, 50),
        "moisture": (25, 40),
        "ph": (6.8, 7.5),
        "description": "Requires increased irrigation"
    },
    "wet_soil": {
        "name": "💧 Wet Soil Conditions",
        "nitrogen": (40, 60),
        "phosphorus": (30, 50),
        "potassium": (35, 55),
        "moisture": (75, 88),
        "ph": (6.0, 6.8),
        "description": "Risk of waterlogging"
    },
    "acidic_soil": {
        "name": "🧪 Acidic Soil",
        "nitrogen": (40, 60),
        "phosphorus": (28, 48),
        "potassium": (38, 58),
        "moisture": (50, 70),
        "ph": (5.0, 5.8),
        "description": "Needs lime treatment"
    },
    "alkaline_soil": {
        "name": "⚗️ Alkaline Soil",
        "nitrogen": (42, 62),
        "phosphorus": (30, 50),
        "potassium": (40, 60),
        "moisture": (48, 68),
        "ph": (7.8, 8.5),
        "description": "Needs sulfur treatment"
    },
    "balanced": {
        "name": "⚖️ Balanced Soil",
        "nitrogen": (45, 65),
        "phosphorus": (30, 50),
        "potassium": (40, 60),
        "moisture": (55, 72),
        "ph": (6.5, 7.2),
        "description": "Good maintenance conditions"
    }
}


def generate_profile_data(profile):
    """
    Generate realistic data based on soil profile
    """
    return {
        "nitrogen": round(random.uniform(*profile["nitrogen"]), 1),
        "phosphorus": round(random.uniform(*profile["phosphorus"]), 1),
        "potassium": round(random.uniform(*profile["potassium"]), 1),
        "moisture": round(random.uniform(*profile["moisture"]), 1),
        "ph": round(random.uniform(*profile["ph"]), 2),
    }


def send_data_to_thingspeak(data):
    """
    Send sensor data to ThingSpeak channel (5 fields only)
    """
    url = "https://api.thingspeak.com/update"

    params = {
        "api_key": WRITE_API_KEY,
        "field1": data["nitrogen"],
        "field2": data["phosphorus"],
        "field3": data["potassium"],
        "field4": data["moisture"],
        "field5": data["ph"],
    }

    try:
        response = requests.post(url, params=params, timeout=10)

        if response.status_code == 200 and response.text != "0":
            return True, response.text
        else:
            return (
                False,
                f"Error: Status {response.status_code}, Response: {response.text}",
            )
    except Exception as e:
        return False, str(e)


def display_data(data, profile_name, entry_id):
    """
    Display the sent data in a formatted way
    """
    print(f"\n  [{entry_id}] {profile_name}")
    print(f"      N: {data['nitrogen']:.1f} | P: {data['phosphorus']:.1f} | K: {data['potassium']:.1f}")
    print(f"      Moisture: {data['moisture']:.1f}% | pH: {data['ph']:.2f}")


def populate_demo_data():
    """
    Populate ThingSpeak with diverse demo data
    """
    print("\n🚀 Starting demo data population...\n")
    
    # Ask user how many entries per profile
    while True:
        try:
            entries_input = input("How many entries per soil profile? (1-5, default 2): ").strip()
            entries_per_profile = int(entries_input) if entries_input else 2
            if 1 <= entries_per_profile <= 5:
                break
            else:
                print("Please enter a number between 1 and 5")
        except ValueError:
            print("Please enter a valid number")
    
    total_entries = len(DEMO_PROFILES) * entries_per_profile
    print(f"\n📊 Will send {total_entries} total entries ({entries_per_profile} per profile)")
    print(f"⏱️  Estimated time: {total_entries * 15 / 60:.1f} minutes")
    print(f"⚠️  Note: ThingSpeak free tier requires 15 seconds between updates\n")
    
    proceed = input("Continue? (y/n): ").strip().lower()
    if proceed != 'y':
        print("❌ Cancelled by user")
        return
    
    entry_count = 0
    successful = 0
    failed = 0
    
    print("\n" + "=" * 70)
    print("📤 Sending demo data to ThingSpeak...")
    print("=" * 70)
    
    try:
        for profile_key, profile in DEMO_PROFILES.items():
            print(f"\n{profile['name']}")
            print(f"   {profile['description']}")
            
            for i in range(entries_per_profile):
                entry_count += 1
                
                # Generate data for this profile
                data = generate_profile_data(profile)
                
                # Send to ThingSpeak
                success, message = send_data_to_thingspeak(data)
                
                if success:
                    successful += 1
                    display_data(data, profile['name'], entry_count)
                else:
                    failed += 1
                    print(f"\n  ❌ Failed to send entry {entry_count}: {message}")
                
                # Wait 15 seconds between entries (except for last one)
                if entry_count < total_entries:
                    remaining = total_entries - entry_count
                    print(f"  ⏳ Waiting 15s... ({remaining} entries remaining)")
                    time.sleep(15)
        
        print("\n" + "=" * 70)
        print("✅ Demo Data Population Complete!")
        print("=" * 70)
        print(f"\n📊 Summary:")
        print(f"   Total entries sent: {successful}/{total_entries}")
        if failed > 0:
            print(f"   Failed entries: {failed}")
        print(f"\n💡 View your data at: https://thingspeak.com/channels/{CHANNEL_ID}")
        print(f"🌐 Your API is now ready with demo data for visualization!")
        print("=" * 70)
        
    except KeyboardInterrupt:
        print("\n\n" + "=" * 70)
        print(f"🛑 Stopped by user")
        print(f"📊 Entries sent before stopping: {successful}/{entry_count}")
        print("=" * 70)


def quick_populate():
    """
    Quick populate with 1 entry from each profile
    """
    print("\n🚀 Quick populating with 1 entry from each profile...\n")
    
    entry_count = 0
    successful = 0
    
    try:
        for profile_key, profile in DEMO_PROFILES.items():
            entry_count += 1
            
            # Generate data for this profile
            data = generate_profile_data(profile)
            
            # Send to ThingSpeak
            success, message = send_data_to_thingspeak(data)
            
            if success:
                successful += 1
                display_data(data, profile['name'], entry_count)
            else:
                print(f"\n  ❌ Failed: {message}")
            
            # Wait 15 seconds between entries
            if entry_count < len(DEMO_PROFILES):
                print(f"  ⏳ Waiting 15s...")
                time.sleep(15)
        
        print("\n" + "=" * 70)
        print(f"✅ Quick population complete! {successful}/{entry_count} entries sent")
        print(f"💡 View at: https://thingspeak.com/channels/{CHANNEL_ID}")
        print("=" * 70)
        
    except KeyboardInterrupt:
        print(f"\n🛑 Stopped. Sent {successful} entries.")


def main():
    """
    Main function with menu
    """
    while True:
        print("\n" + "=" * 70)
        print("Choose an option:")
        print("=" * 70)
        print("1. 📊 Custom populate (choose entries per profile)")
        print("2. ⚡ Quick populate (1 entry per profile)")
        print("3. 🔄 Continuous demo mode (like send_test_data.py)")
        print("4. ❌ Exit")
        print("=" * 70)
        
        choice = input("\nEnter choice (1-4): ").strip()
        
        if choice == "1":
            populate_demo_data()
            break
        elif choice == "2":
            quick_populate()
            break
        elif choice == "3":
            print("\n🔄 Switching to continuous mode...\n")
            print("This will send random data continuously every 15 seconds")
            print("Press Ctrl+C to stop\n")
            
            proceed = input("Continue? (y/n): ").strip().lower()
            if proceed == 'y':
                entry_count = 0
                try:
                    while True:
                        entry_count += 1
                        
                        # Pick a random profile
                        profile = random.choice(list(DEMO_PROFILES.values()))
                        data = generate_profile_data(profile)
                        
                        success, message = send_data_to_thingspeak(data)
                        
                        if success:
                            display_data(data, profile['name'], entry_count)
                        else:
                            print(f"\n❌ Failed: {message}")
                        
                        print(f"\n⏳ Waiting 15s... (Total sent: {entry_count})")
                        time.sleep(15)
                        
                except KeyboardInterrupt:
                    print(f"\n\n🛑 Stopped. Total entries sent: {entry_count}")
            break
        elif choice == "4":
            print("\n👋 Goodbye!")
            break
        else:
            print("\n❌ Invalid choice. Please enter 1-4")


if __name__ == "__main__":
    main()
