import sys
sys.path.insert(0, 'D:\\Projects\\linkshield-ai\\backend')

from app.services.app_service import apply_sensitivity_adjustment

# Test the function directly
test_urls = [
    ("http://paypal-verify-account.suspicious.xyz", "benign", 0.75),
    ("http://192.168.1.1/login", "benign", 0.65),
    ("https://google.com", "benign", 0.95),
    ("http://amazon-security-update.fake.tk", "benign", 0.70)
]

print("="*80)
print("TESTING SENSITIVITY ADJUSTMENT FUNCTION")
print("="*80)

for url, ml_status, ml_conf in test_urls:
    print(f"\n{'='*80}")
    print(f"URL: {url}")
    print(f"ML Prediction: {ml_status} (confidence: {ml_conf})")
    print("-"*80)
    
    adjusted_status, adjusted_conf, details = apply_sensitivity_adjustment(
        url, ml_status, ml_conf, []
    )
    
    print(f"Adjusted Status: {adjusted_status} (confidence: {adjusted_conf:.4f})")
    print(f"\nOverride Details:")
    for detail in details:
        print(f"  {detail}")
    print("="*80)
