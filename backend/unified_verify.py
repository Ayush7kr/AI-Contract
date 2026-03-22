import subprocess
import time
import requests

def run_test():
    print("Starting backend...")
    proc = subprocess.Popen(["python", "-m", "uvicorn", "main:app", "--port", "8000"], 
                           stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    
    # Wait for startup
    max_retries = 30
    for i in range(max_retries):
        try:
            print(f"Checking health (attempt {i+1})...")
            resp = requests.post("http://localhost:8000/auth/register", 
                               json={"email": f"tester_{int(time.time())}@example.com", 
                                     "password": "password123", 
                                     "full_name": "Tester"},
                               timeout=2)
            if resp.status_code in [201, 400]:
                print(f"SUCCESS: Server is up! (Status: {resp.status_code})")
                print(resp.json())
                return True
        except Exception:
            pass
        time.sleep(2)
    
    print("FAILED: Server did not respond in time.")
    # Check output
    out, _ = proc.communicate(timeout=1)
    print("SERVER OUTPUT:")
    print(out)
    proc.terminate()
    return False

if __name__ == "__main__":
    run_test()
