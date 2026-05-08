import os
import requests
from google import genai
from dotenv import load_dotenv

load_dotenv()

def test_keys():
    print("Testing Gemini API...")
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key or gemini_key == "enter_your_gemini_api_key_here":
        print("[FAILED] Gemini API Key not found or still placeholder.")
    else:
        try:
            client = genai.Client(api_key=gemini_key)
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents='Say hi in 1 word',
            )
            print(f"[SUCCESS] Gemini API Works! Response: {response.text.strip()}")
        except Exception as e:
            print(f"[FAILED] Gemini API Failed: {str(e)}")

    print("\nTesting Google Maps API...")
    maps_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    if not maps_key or maps_key == "enter_your_google_maps_api_key_here":
        print("[FAILED] Google Maps API Key not found or still placeholder.")
    else:
        try:
            url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query=Paris&key={maps_key}"
            res = requests.get(url)
            res.raise_for_status()
            data = res.json()
            if data.get("status") == "OK":
                print("[SUCCESS] Google Maps API Works! Successfully fetched Places.")
            else:
                print(f"[FAILED] Google Maps API Returned Error Status: {data.get('status')} - {data.get('error_message', '')}")
        except Exception as e:
            print(f"[FAILED] Google Maps API Failed: {str(e)}")

if __name__ == "__main__":
    test_keys()
