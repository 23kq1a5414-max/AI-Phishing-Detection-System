import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database.db import get_db
from ..database.models import Scan
from ..models.schemas import ScanResponse

router = APIRouter(prefix="/api/scans", tags=["Scans"])

@router.get("", response_model=list[ScanResponse])
def get_scans(
    limit: int = Query(50, ge=1, le=100),
    filter: str = Query("all"),
    search: str = Query(""),
    db: Session = Depends(get_db)
):
    query = db.query(Scan)
    if filter != "all":
        query = query.filter(Scan.risk_level == filter.upper())
    if search:
        query = query.filter(Scan.input_content.contains(search) | Scan.explanation.contains(search))

    scans = query.order_by(Scan.created_at.desc()).limit(limit).all()

    results = []
    for s in scans:
        results.append({
            "id": s.id,
            "createdAt": s.created_at.isoformat() if s.created_at else "",
            "inputType": s.input_type,
            "inputContent": s.input_content,
            "riskScore": s.risk_score,
            "riskLevel": s.risk_level,
            "confidence": s.confidence,
            "primaryPrediction": s.primary_prediction,
            "explanation": s.explanation,
            "detectedFactors": json.loads(s.detected_factors or "[]"),
            "safeIndicators": json.loads(s.safe_indicators or "[]"),
            "safetyRecommendations": json.loads(s.safety_recommendations or "[]"),
            "urlFeatures": json.loads(s.url_features) if s.url_features else None,
            "textFeatures": json.loads(s.text_features) if s.text_features else None,
            "modelPredictions": json.loads(s.model_predictions or "[]"),
            "executionTimeMs": s.execution_time_ms
        })
    return results

@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan(scan_id: str, db: Session = Depends(get_db)):
    s = db.query(Scan).filter(Scan.id == scan_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Scan not found")
    return {
        "id": s.id,
        "createdAt": s.created_at.isoformat() if s.created_at else "",
        "inputType": s.input_type,
        "inputContent": s.input_content,
        "riskScore": s.risk_score,
        "riskLevel": s.risk_level,
        "confidence": s.confidence,
        "primaryPrediction": s.primary_prediction,
        "explanation": s.explanation,
        "detectedFactors": json.loads(s.detected_factors or "[]"),
        "safeIndicators": json.loads(s.safe_indicators or "[]"),
        "safetyRecommendations": json.loads(s.safety_recommendations or "[]"),
        "urlFeatures": json.loads(s.url_features) if s.url_features else None,
        "textFeatures": json.loads(s.text_features) if s.text_features else None,
        "modelPredictions": json.loads(s.model_predictions or "[]"),
        "executionTimeMs": s.execution_time_ms
    }

@router.delete("/{scan_id}")
def delete_scan(scan_id: str, db: Session = Depends(get_db)):
    s = db.query(Scan).filter(Scan.id == scan_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Scan not found")
    db.delete(s)
    db.commit()
    return {"success": True, "id": scan_id}

@router.delete("")
def clear_all_scans(db: Session = Depends(get_db)):
    db.query(Scan).delete()
    db.commit()
    return {"success": True, "message": "All scan history cleared"}
