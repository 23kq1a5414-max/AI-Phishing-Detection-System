from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class UrlAnalysisRequest(BaseModel):
    url: str = Field(..., min_length=1, max_length=2048, description="Target URL for defensive inspection")

class TextAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Email/SMS or chat text message to analyze")
    type: Optional[str] = Field("email", description="Input type: 'email', 'sms', or 'text'")

class RiskFactorSchema(BaseModel):
    id: str
    category: str
    name: str
    description: str
    severity: str
    weight: float
    highlight: Optional[str] = None

class SafeIndicatorSchema(BaseModel):
    id: str
    name: str
    description: str
    weight: float

class ModelPredictionDetailSchema(BaseModel):
    modelName: str
    prediction: str
    phishingProbability: float
    safeProbability: float
    confidence: float

class ScanResponse(BaseModel):
    id: str
    createdAt: str
    inputType: str
    inputContent: str
    riskScore: float
    riskLevel: str
    confidence: float
    primaryPrediction: str
    explanation: str
    detectedFactors: List[RiskFactorSchema]
    safeIndicators: List[SafeIndicatorSchema]
    safetyRecommendations: List[str]
    urlFeatures: Optional[Dict[str, Any]] = None
    textFeatures: Optional[Dict[str, Any]] = None
    modelPredictions: List[ModelPredictionDetailSchema]
    executionTimeMs: float

class StatsResponse(BaseModel):
    totalScans: int
    safeScans: int
    mediumRiskScans: int
    highRiskScans: int
    avgRiskScore: float
    urlScansCount: int
    textScansCount: int
    detectionRate: float

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    timestamp: str
    database: str
    modelsLoaded: List[str]
    defensiveGuarantees: str
