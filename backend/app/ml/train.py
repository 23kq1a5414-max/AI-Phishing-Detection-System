import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score

# Synthetic dataset generator for phishing research & education
def generate_synthetic_dataset(num_samples: int = 1000):
    np.random.seed(42)
    phishing_templates = [
        "URGENT: Your {bank} account will be suspended within 24 hours. Verify your password now: {link}",
        "Congratulations! You won a cash prize of $5000. Claim your reward immediately: {link}",
        "Security Alert: Unauthorized login attempt detected on {service}. Confirm your OTP: {link}",
        "Your package delivery failed. Please enter your credit card billing details to reschedule: {link}",
        "Notice from {bank}: Immediate action required to restore your online banking access: {link}"
    ]
    legit_templates = [
        "Hi team, sharing the meeting minutes and presentation deck from our sprint review: {link}",
        "Your monthly receipt for cloud subscription services is now available in your customer portal.",
        "Reminder: The quarterly all-hands meeting starts tomorrow at 10 AM PST.",
        "Thank you for submitting your assignment. Grades have been posted to the student portal.",
        "Here are the release notes and API documentation for version 2.4 release: {link}"
    ]
    banks = ["Chase", "Wells Fargo", "PayPal", "Bank of America", "Citibank"]
    services = ["Google", "Microsoft 365", "Apple ID", "Netflix", "Amazon"]
    phishing_links = ["http://verify-bank-security.xyz/login", "http://update-chase-client.top", "http://192.168.1.10/auth"]
    legit_links = ["https://docs.google.com/doc", "https://github.com/project/repo", "https://wikipedia.org"]

    texts = []
    labels = []

    for _ in range(num_samples // 2):
        t = np.random.choice(phishing_templates)
        text = t.format(
            bank=np.random.choice(banks),
            service=np.random.choice(services),
            link=np.random.choice(phishing_links)
        )
        texts.append(text)
        labels.append(1) # Phishing

    for _ in range(num_samples // 2):
        t = np.random.choice(legit_templates)
        text = t.format(
            link=np.random.choice(legit_links)
        )
        texts.append(text)
        labels.append(0) # Legitimate

    df = pd.DataFrame({"text": texts, "label": labels})
    return df

def train_and_evaluate_models():
    print("[+] Step 1: Loading & Generating Cyber Threat Dataset...")
    df = generate_synthetic_dataset(1500)

    print("[+] Step 2: NLP Cleaning & Feature Extraction (TF-IDF Vectorizer)...")
    vectorizer = TfidfVectorizer(max_features=500, stop_words="english", ngram_range=(1, 2))
    X = vectorizer.fit_transform(df["text"]).toarray()
    y = df["label"].values

    print("[+] Step 3: Stratified Train / Test Split (80% Train, 20% Test)...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    models = {
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Multinomial Naive Bayes": MultinomialNB(alpha=1.0)
    }

    results = {}
    print("\n[+] Step 4: Training & Evaluating ML Classifiers:")
    print("=" * 60)

    for name, model in models.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        probs = model.predict_proba(X_test)[:, 1]

        acc = accuracy_score(y_test, preds)
        prec = precision_score(y_test, preds)
        rec = recall_score(y_test, preds)
        f1 = f1_score(y_test, preds)
        roc = roc_auc_score(y_test, probs)
        cm = confusion_matrix(y_test, preds)

        results[name] = {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1": round(float(f1), 4),
            "roc_auc": round(float(roc), 4),
            "confusion_matrix": cm.tolist()
        }

        print(f"Model: {name}")
        print(f"  Accuracy:  {acc:.4f} | Precision: {prec:.4f}")
        print(f"  Recall:    {rec:.4f} | F1 Score:  {f1:.4f} | ROC-AUC: {roc:.4f}")
        print(f"  Confusion Matrix: [TN={cm[0][0]}, FP={cm[0][1]}, FN={cm[1][0]}, TP={cm[1][1]}]\n")

    best_model_name = max(results, key=lambda k: results[k]["f1"])
    print("=" * 60)
    print(f"[+] Step 5: Best Model Selected: {best_model_name} (F1 Score: {results[best_model_name]['f1']})")
    return results

if __name__ == "__main__":
    train_and_evaluate_models()
