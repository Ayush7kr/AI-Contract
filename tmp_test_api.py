
import requests

BASE_URL = "http://localhost:8000"

def test_health():
    try:
        r = requests.get(f"{BASE_URL}/health")
        print(f"Health: {r.status_code} - {r.json()}")
    except Exception as e:
        print(f"Health failed: {e}")

def test_contracts():
    try:
        r = requests.get(f"{BASE_URL}/contracts/")
        print(f"Contracts: {r.status_code}")
        if r.status_code != 200:
            print(f"Error detail: {r.text}")
    except Exception as e:
        print(f"Contracts failed: {e}")

if __name__ == "__main__":
    test_health()
    test_contracts()
