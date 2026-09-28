import datetime
from sqlalchemy import Column, String, Float, Integer, Text, DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Scan(Base):
    __tablename__ = "scans"

    id = Column(String(64), primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    input_type = Column(String(16), nullable=False) # 'url', 'email', 'sms', 'text'
    input_content = Column(Text, nullable=False)
    risk_score = Column(Float, nullable=False) # 0 to 100
    risk_level = Column(String(16), nullable=False) # 'LOW', 'MEDIUM', 'HIGH'
    confidence = Column(Float, nullable=False)
    primary_prediction = Column(String(128), nullable=False)
    explanation = Column(Text, nullable=False)
    detected_factors = Column(Text, nullable=False) # JSON array
    safe_indicators = Column(Text, nullable=False) # JSON array
    safety_recommendations = Column(Text, nullable=False) # JSON array
    url_features = Column(Text, nullable=True) # JSON
    text_features = Column(Text, nullable=True) # JSON
    model_predictions = Column(Text, nullable=False) # JSON
    execution_time_ms = Column(Float, nullable=False)

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True)
    username = Column(String(64), unique=True, index=True)
    role = Column(String(32), default="analyst")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ModelMetric(Base):
    __tablename__ = "model_metrics"

    model_name = Column(String(64), primary_key=True)
    accuracy = Column(Float, nullable=False)
    precision_score = Column(Float, nullable=False)
    recall_score = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    auc_roc = Column(Float, nullable=False)
    training_samples = Column(Integer, nullable=False)
    confusion_matrix = Column(Text, nullable=False) # JSON
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
