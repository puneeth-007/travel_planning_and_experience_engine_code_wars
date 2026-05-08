from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import uvicorn
import os
import json
import requests
from google import genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Travel Planning Engine API")

# Setup CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    context: dict = {}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/config")
def get_config():
    return {
        "google_maps_api_key": os.environ.get("GOOGLE_MAPS_API_KEY", "")
    }

@app.post("/api/chat")
async def chat(request: ChatRequest):
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key or gemini_key == "enter_your_gemini_api_key_here":
        return {
            "reply": "Error: Gemini API Key not configured. Please add it to your .env file.",
            "itinerary": [],
            "map_location": ""
        }

    try:
        client = genai.Client(api_key=gemini_key)
        prompt = f"""
        You are a highly intelligent travel planning assistant. The user says: "{request.message}"
        Plan a short, logical itinerary based on this.
        You MUST respond ONLY with a raw JSON object in the following format. Ensure each 'location' is highly specific and accurate (e.g. "Eiffel Tower, Paris, France" or "Munnar, Kerala, India") so it can be accurately geocoded on a map:
        {{
            "reply": "A friendly conversational response here",
            "map_location": "City Name, Country",
            "itinerary": [
                {{"time": "Day 1 - 09:00", "title": "Activity", "description": "Details", "location": "Exact Place Name, City, State/Country"}}
            ]
        }}
        """
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        # Clean the JSON output in case it has markdown ticks
        raw_json = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(raw_json)
        return data

    except Exception as e:
        return {
            "reply": f"Sorry, I ran into an error generating your trip: {str(e)}",
            "itinerary": [],
            "map_location": ""
        }

@app.get("/api/places")
async def get_places(location: str):
    google_maps_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    if not google_maps_key:
        # Fallback to mock data if key is missing or placeholder
        if google_maps_key == "enter_your_google_maps_api_key_here" or not google_maps_key:
            return {
                "location": location,
                "places": [
                    {"name": "Mock Hotel 1", "rating": 4.5},
                    {"name": "Mock Restaurant 1", "rating": 4.8}
                ]
            }

    url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={location}&key={google_maps_key}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        # Format the response to be cleaner for the frontend
        places = []
        for result in data.get("results", [])[:5]: # Return top 5
            places.append({
                "name": result.get("name"),
                "rating": result.get("rating"),
                "address": result.get("formatted_address")
            })
            
        return {"location": location, "places": places}
    except requests.exceptions.RequestException as e:
        return {"error": f"Failed to fetch data from Google Maps API: {str(e)}"}

# Serve React App
frontend_build_path = os.path.join(os.path.dirname(__file__), "frontend", "dist")
if os.path.exists(frontend_build_path):
    app.mount("/", StaticFiles(directory=frontend_build_path, html=True), name="frontend")
else:
    @app.get("/")
    def root():
        return {"message": "Frontend build not found. Run 'npm run build' in frontend/ directory."}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
