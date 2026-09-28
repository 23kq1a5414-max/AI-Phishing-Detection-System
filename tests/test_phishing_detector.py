import pytest
import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

from app.services.url_feature_extractor import extract_url_features, calculate_shannon_entropy
from app.services.text_nlp_service import preprocess_text
from app.ml.train import generate_synthetic_dataset

def test_url_feature_extraction_suspicious():
    suspicious_url = "http://192.168.1.100/paypal.com/security/login.php?update=account"
    features = extract_url_features(suspicious_url)

    assert features["hasIpAddress"] is True
    assert features["hasHttps"] is False
    assert features["suspiciousKeywordsCount"] >= 2
    assert "paypal" in features["suspiciousKeywordsFound"]
    assert "security" in features["suspiciousKeywordsFound"]

def test_url_feature_extraction_legitimate():
    legit_url = "https://www.google.com/search?q=cybersecurity"
    features = extract_url_features(legit_url)

    assert features["hasIpAddress"] is False
    assert features["hasHttps"] is True
    assert features["hasSuspiciousTld"] is False
    assert features["numDots"] <= 2

def test_shannon_entropy_calculation():
    # Repetitive string has low entropy
    low_entropy = calculate_shannon_entropy("aaaaaaaaaa")
    assert low_entropy == 0.0

    # Random string has high entropy
    high_entropy = calculate_shannon_entropy("x7k9mqz38w0p")
    assert high_entropy > 3.0

def test_text_preprocessing_phishing_urgency_and_credentials():
    phishing_text = "URGENT: Your bank account will be suspended within 24 hours. Send your OTP and confirm your password immediately!"
    features = preprocess_text(phishing_text)

    assert len(features["urgencyKeywordsFound"]) >= 2
    assert "within 24 hours" in features["urgencyKeywordsFound"]
    assert "send your otp" in features["sensitiveDataKeywordsFound"]
    assert "confirm your password" in features["sensitiveDataKeywordsFound"]
    assert features["urgencyScore"] >= 25

def test_text_preprocessing_benign():
    benign_text = "Good morning everyone. Please find the project update notes attached for the sprint review."
    features = preprocess_text(benign_text)

    assert len(features["urgencyKeywordsFound"]) == 0
    assert len(features["sensitiveDataKeywordsFound"]) == 0
    assert features["urgencyScore"] == 0

def test_ml_synthetic_dataset_shape():
    df = generate_synthetic_dataset(100)
    assert len(df) == 100
    assert set(df["label"].unique()) == {0, 1}
    assert "text" in df.columns
