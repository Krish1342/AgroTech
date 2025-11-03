"""
ThingSpeak Test Data Sender
Sends realistic agricultural sensor data to ThingSpeak channel
"""

import requests
import time
import random
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get ThingSpeak configuration
WRITE_API_KEY = os.getenv("THINGSPEAK_WRITE_API_KEY", "")
CHANNEL_ID = os.getenv("THINGSPEAK_CHANNEL_ID", "")

if not WRITE_API_KEY or not CHANNEL_ID:
    print("⚠️  ERROR: ThingSpeak credentials not found!")
    print(
        "Please set THINGSPEAK_WRITE_API_KEY and THINGSPEAK_CHANNEL_ID in your .env file"
    )
    exit(1)

print("=" * 60)
print("🌾 AgroTech - ThingSpeak Test Data Sender")
print("=" * 60)
print(f"📡 Channel ID: {CHANNEL_ID}")
print(f"🔑 Write API Key: {WRITE_API_KEY[:8]}...{WRITE_API_KEY[-4:]}")
print("=" * 60)


def generate_realistic_data():
    """
    Generate realistic agricultural sensor data with some variation
    Only 5 fields: N, P, K, Moisture, pH (no temperature - comes from weather API)
    """
    # Base values with realistic ranges
    nitrogen = round(random.uniform(25, 75), 1)  # 25-75 kg/ha
    phosphorus = round(random.uniform(12, 55), 1)  # 12-55 kg/ha
    potassium = round(random.uniform(18, 65), 1)  # 18-65 kg/ha
    moisture = round(random.uniform(35, 85), 1)  # 35-85%
    ph = round(random.uniform(5.5, 7.8), 2)  # 5.5-7.8

    return {
        "nitrogen": nitrogen,
        "phosphorus": phosphorus,
        "potassium": potassium,
        "moisture": moisture,
        "ph": ph,
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


def display_data(data, entry_id):
    """
    Display the sent data in a formatted way
    """
    print(f"\n📊 Entry #{entry_id}")
    print(f"   🔵 Nitrogen (N):    {data['nitrogen']:.1f} kg/ha")
    print(f"   🟠 Phosphorus (P):  {data['phosphorus']:.1f} kg/ha")
    print(f"   🟢 Potassium (K):   {data['potassium']:.1f} kg/ha")
    print(f"   💧 Moisture:        {data['moisture']:.1f}%")
    print(f"   🧪 pH Level:        {data['ph']:.2f}")
    print(f"   🌡️  Temperature:     From Weather API")
    print(f"   ✅ Status: Sent successfully to ThingSpeak")


def main():
    """
    Main function to continuously send test data
    """
    print("\n🚀 Starting continuous data transmission...")
    print("⚠️  Note: ThingSpeak free tier allows 1 update every 15 seconds")
    print("📝 Press Ctrl+C to stop\n")

    entry_count = 0

    try:
        while True:
            entry_count += 1

            # Generate realistic data
            data = generate_realistic_data()

            # Send to ThingSpeak
            success, message = send_data_to_thingspeak(data)

            if success:
                display_data(data, entry_count)
            else:
                print(f"\n❌ Failed to send data: {message}")

            # Wait 15 seconds (ThingSpeak rate limit for free tier)
            print(
                f"\n⏳ Waiting 15 seconds before next update... (Total sent: {entry_count})"
            )
            time.sleep(15)

    except KeyboardInterrupt:
        print("\n\n" + "=" * 60)
        print(f"🛑 Stopped by user")
        print(f"📊 Total data entries sent: {entry_count}")
        print("=" * 60)
        print("✨ Data transmission completed!")
        print("\n💡 View your data at: https://thingspeak.com/channels/" + CHANNEL_ID)
        print("=" * 60)


if __name__ == "__main__":
    main()
