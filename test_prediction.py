import requests
import json

url = "http://127.0.0.1:8000/api/v1/predict/"
test_urls = [
    "http://paypal-verify-account.suspicious.xyz",
    "http://192.168.1.1/login",
    "https://google.com",
    "http://amazon-security-update.fake.tk"
]

for test_url in test_urls:
    try:
        response = requests.post(url, json={"url": test_url}, timeout=10)
        result = response.json()
        print(f"\nURL: {test_url}")
        print(f"Status: {result['status']}")
        print(f"Confidence: {result['confidence']}")
        print(f"Message: {result['message']}")
        if result.get('details'):
            print("Details:")
            for detail in result['details'][:5]:
                print(f"  - {detail}")
        print("-" * 80)
    except Exception as e:
        print(f"Error testing {test_url}: {e}")
