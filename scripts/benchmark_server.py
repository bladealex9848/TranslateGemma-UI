import time
import requests
import json
import statistics

import os

# Default to localhost, or use env var. 
# WARNING: Do not hardcode private servers here.
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")

def get_models():
    try:
        response = requests.get(f"{OLLAMA_HOST}/api/tags")
        if response.status_code == 200:
            models = [m['name'] for m in response.json()['models']]
            return [m for m in models if 'gemma' in m or 'translate' in m]
        return []
    except Exception as e:
        print(f"Error connecting: {e}")
        return []

def benchmark_model(model_name):
    print(f"\n--- Testing {model_name} ---")
    
    prompt = """You are a professional English (en) to Spanish (es) translator. Produce only the Spanish translation. Please translate:
    
    
    Artificial intelligence is transforming the way we communicate globally."""

    payload = {
        "model": model_name,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False
    }

    times = []
    tokens_per_sec = []

    # Warmup
    try:
        requests.post(f"{OLLAMA_HOST}/api/chat", json=payload)
    except:
        pass

    # 3 Runs
    for i in range(3):
        start_t = time.time()
        try:
            resp = requests.post(f"{OLLAMA_HOST}/api/chat", json=payload)
            end_t = time.time()
            
            if resp.status_code == 200:
                data = resp.json()
                duration = end_t - start_t
                eval_count = data.get('eval_count', 0)
                eval_duration = data.get('eval_duration', 1) / 1e9 # ns to s
                
                tps = eval_count / eval_duration if eval_duration > 0 else 0
                
                times.append(duration)
                tokens_per_sec.append(tps)
                print(f"Run {i+1}: {duration:.2f}s | {tps:.2f} tok/s | Output: {data['message']['content'].strip()}")
            else:
                print(f"Run {i+1}: Failed {resp.status_code}")
        except Exception as e:
            print(f"Run {i+1}: Error {e}")

    if times:
        avg_time = statistics.mean(times)
        avg_tps = statistics.mean(tokens_per_sec)
        return {"avg_time": avg_time, "avg_tps": avg_tps}
    return None

def main():
    print(f"Connecting to {OLLAMA_HOST}...")
    models = get_models()
    
    if not models:
        print("No 'gemma' or 'translate' models found!")
        # Fallback to listing all just in case
        try:
            all_models = requests.get(f"{OLLAMA_HOST}/api/tags").json()['models']
            print("Available models:", [m['name'] for m in all_models])
        except:
            print("Could not list models.")
        return

    print(f"Found candidate models: {models}")
    
    results = {}
    for model in models:
        res = benchmark_model(model)
        if res:
            results[model] = res

    print("\n=== FINAL RESULTS ===")
    print(f"{'Model':<30} | {'Avg Time':<10} | {'Tokens/Sec':<10}")
    print("-" * 55)
    for model, metrics in results.items():
        print(f"{model:<30} | {metrics['avg_time']:.2f}s     | {metrics['avg_tps']:.2f}")

if __name__ == "__main__":
    main()
