import math
import re
from urllib.parse import urlparse

SUSPICIOUS_KEYWORDS = [
    'login', 'verify', 'update', 'banking', 'secure', 'account', 'confirm',
    'security', 'signin', 'support', 'wallet', 'crypto', 'recover', 'free',
    'gift', 'prize', 'bonus', 'alert', 'authenticate', 'service', 'paypal',
    'apple', 'microsoft', 'google', 'netflix', 'amazon', 'ebay', 'chase',
    'wellsfargo', 'bankofamerica', 'citibank', 'recover-account', 'validation',
    'billing', 'unlock', 'suspended', 'reactivate', 'identity', 'password'
]

SUSPICIOUS_TLDS = {
    '.xyz', '.top', '.buzz', '.tk', '.ml', '.ga', '.cf', '.gq', '.cam',
    '.monster', '.work', '.icu', '.cn', '.ru', '.rest', '.quest', '.live',
    '.bar', '.site', '.fit'
}

IPV4_PATTERN = re.compile(r'^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$')

def calculate_shannon_entropy(text: str) -> float:
    if not text:
        return 0.0
    frequencies = {}
    for char in text:
        frequencies[char] = frequencies.get(char, 0) + 1
    entropy = 0.0
    length = len(text)
    for count in frequencies.values():
        p = count / length
        entropy -= p * math.log2(p)
    return round(entropy, 3)

def extract_url_features(url_str: str) -> dict:
    raw = url_str.strip()
    if not (raw.startswith("http://") or raw.startswith("https://")):
        parsed = urlparse("http://" + raw)
        protocol = "none"
    else:
        parsed = urlparse(raw)
        protocol = parsed.scheme

    domain = parsed.netloc.split(':')[0]
    path = parsed.path
    query = parsed.query

    url_length = len(raw)
    domain_length = len(domain)
    num_dots = raw.count('.')
    num_hyphens = raw.count('-')
    num_digits = sum(c.isdigit() for c in raw)
    num_special_chars = len(re.findall(r'[@%_?&=+!*~#]', raw))

    domain_parts = domain.split('.')
    num_subdomains = max(0, len(domain_parts) - 2)

    has_https = protocol == "https" or raw.startswith("https://")
    has_ip_address = bool(IPV4_PATTERN.match(domain)) or bool(re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', domain))

    lower_raw = raw.lower()
    suspicious_found = [kw for kw in SUSPICIOUS_KEYWORDS if kw in lower_raw]

    has_url_encoding = bool(re.search(r'%[0-9a-fA-F]{2}', raw))
    path_length = len(path)
    query_length = len(query)

    tld_match = re.search(r'\.([a-z]{2,})$', domain, re.IGNORECASE)
    tld = f".{tld_match.group(1).lower()}" if tld_match else ""
    has_suspicious_tld = tld in SUSPICIOUS_TLDS
    entropy = calculate_shannon_entropy(domain)

    return {
        "urlLength": url_length,
        "domainLength": domain_length,
        "numDots": num_dots,
        "numHyphens": num_hyphens,
        "numDigits": num_digits,
        "numSpecialChars": num_special_chars,
        "numSubdomains": num_subdomains,
        "hasHttps": has_https,
        "hasIpAddress": has_ip_address,
        "suspiciousKeywordsCount": len(suspicious_found),
        "suspiciousKeywordsFound": suspicious_found,
        "hasUrlEncoding": has_url_encoding,
        "pathLength": path_length,
        "queryLength": query_length,
        "tld": tld,
        "hasSuspiciousTld": has_suspicious_tld,
        "domain": domain,
        "protocol": protocol,
        "entropy": entropy
    }
