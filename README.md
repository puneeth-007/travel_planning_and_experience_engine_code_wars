# Travel Planning & Experience Engine

[![Run on Google Cloud](https://deploy.cloud.run/button.svg)](https://deploy.cloud.run/?git_repo=https://github.com/puneeth-007/travel_planning_and_experience_engine_code_wars.git)

A dynamic, Apple-inspired glassmorphic travel planning assistant powered by Google Gemini and Google Maps. It uses a React (Vite) frontend with an Apple-inspired glassmorphism design and a Python FastAPI backend to integrate with Google Services (Gemini, Maps).

## Prerequisites

- Node.js & npm (for local frontend development)
- Python 3.11+
- Google Cloud account (for Gemini API, Maps API, and Cloud Run deployment)

## Setup Locally

1. **Backend Setup**
   ```bash
   pip install -r requirements.txt
   ```
2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run build
   ```
3. **Environment Variables**
   Copy `.env.example` to `.env` and fill in your API keys (you can leave them blank to use the mock data for testing).
   ```bash
   cp .env.example .env
   ```
4. **Run the Application**
   Run the FastAPI server from the root directory:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   Open `http://localhost:8000` in your browser.

## Deployment to Google Cloud Run

This project includes a `Dockerfile` that packages both the frontend and backend into a single container.

1. Install the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install).
2. Authenticate: `gcloud auth login`
3. Set your project: `gcloud config set project YOUR_PROJECT_ID`
4. Build and deploy to Cloud Run:
   ```bash
   gcloud run deploy travel-engine \
     --source . \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars="GEMINI_API_KEY=your_key,GOOGLE_MAPS_API_KEY=your_key"
   ```

## Next Steps

- Integrate actual `google-genai` SDK logic in `main.py` when you plug in the Gemini API key.
- Enhance the Maps placeholder in `App.jsx` with `@react-google-maps/api`.
