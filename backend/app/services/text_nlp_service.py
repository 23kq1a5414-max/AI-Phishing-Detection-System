import re

URGENCY_PATTERNS = [
    ('account will be closed', 18),
    ('verify immediately', 16),
    ('immediate action required', 16),
    ('within 24 hours', 14),
    ('within 12 hours', 15),
    ('suspended', 12),
    ('urgent attention', 13),
    ('act now', 10),
    ('temporary hold', 12),
    ('unauthorized transaction', 14),
    ('unusual login activity', 12),
    ('final notice', 15)
]

SENSITIVE_DATA_PATTERNS = [
    ('send your otp', 26),
    ('confirm your password', 25),
    ('enter your password', 24),
    ('one-time password', 20),
    ('enter pin', 22),
    ('credit card', 20),
    ('debit card', 18),
    ('cvv', 24),
    ('bank account', 18),
    ('social security', 24),
    ('ssn', 22),
    ('billing details', 14),
    ('security code', 18)
]

REWARD_LURE_PATTERNS = [
    ('you won a prize', 20),
    ('lottery winner', 22),
    ('claim your reward', 18),
    ('refund waiting', 16),
    ('unclaimed bonus', 18),
    ('congratulations you have won', 22),
    ('crypto giveaway', 20)
]

IMPERSONATION_TARGETS = [
    'paypal', 'bank of america', 'wells fargo', 'chase', 'citibank',
    'apple support', 'apple id', 'google security', 'microsoft 365', 'office 365',
    'netflix', 'amazon', 'usps', 'fedex', 'dhl', 'irs', 'tax department'
]

ACTION_CALL_PATTERNS = [
    'click this link', 'click here', 'click below', 'open attachment',
    'log in to restore', 'download file', 'tap here', 'update payment method'
]

def preprocess_text(text: str) -> dict:
    cleaned = text.strip()
    lower = cleaned.lower()
    
    # Tokenization: remove non-alphanumeric and split
    words = re.findall(r'\b[a-z0-9]+\b', lower)
    
    # Find links
    links = re.findall(r'https?://[^\s]+|www\.[^\s]+', cleaned)

    # Check urgency
    urgency_found = []
    urgency_score = 0
    for phrase, weight in URGENCY_PATTERNS:
        if phrase in lower:
            urgency_found.append(phrase)
            urgency_score += weight

    # Check sensitive data
    sensitive_found = []
    for phrase, _ in SENSITIVE_DATA_PATTERNS:
        if phrase in lower:
            sensitive_found.append(phrase)

    # Check impersonation
    impersonation_found = []
    for brand in IMPERSONATION_TARGETS:
        if brand in lower:
            impersonation_found.append(brand)

    # Check action calls
    action_calls = sum(1 for phrase in ACTION_CALL_PATTERNS if phrase in lower)

    return {
        "charCount": len(cleaned),
        "wordCount": len(words),
        "cleanTextSnippet": " ".join(words[:20]) + ("..." if len(words) > 20 else ""),
        "tokensCount": len(words),
        "urgencyScore": min(100, urgency_score),
        "urgencyKeywordsFound": urgency_found,
        "sensitiveDataKeywordsFound": sensitive_found,
        "impersonationKeywordsFound": impersonation_found,
        "containsLinks": len(links) > 0,
        "linksFound": links,
        "actionCallCount": action_calls
    }
