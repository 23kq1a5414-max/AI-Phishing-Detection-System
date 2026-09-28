from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database.db import init_db
from .routes import analyze, scans, metrics
from .models.schemas import HealthResponse
import datetime

app = FastAPI(
    title="AI-Based Phishing Detection & Cyber Safety Assistant API",
    description="Defensive cybersecurity API for analyzing URLs, emails, and SMS messages using machine learning, NLP, and explainable AI risk scoring.",
    version="2.4.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/health", response_model=HealthResponse, tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "AI-Based Phishing Detection & Cyber Safety Assistant API",
        "version": "2.4.0",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "database": "SQLite (SQLAlchemy)",
        "modelsLoaded": ["Random Forest", "Logistic Regression", "Multinomial Naive Bayes"],
        "defensiveGuarantees": "No URL fetching, No arbitrary code execution, Zero credential retention"
    }

# Include routers
app.include_router(analyze.router)
app.include_router(scans.router)
app.include_router(metrics.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
