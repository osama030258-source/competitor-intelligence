import requests
import time
import json

# Start analysis
r = requests.post('http://localhost:8000/api/agents/run', json={'sector': 'Fintech'})
print('POST /agents/run:', r.status_code, r.json())

log_id = r.json()['log_id']

# Poll until completed or failed
for i in range(20):
    time.sleep(3)
    s = requests.get('http://localhost:8000/api/agents/status/' + log_id)
    data = s.json()
    status = data.get('status', 'unknown')
    print('  Poll %d: status=%s' % (i + 1, status))
    if status in ('completed', 'failed'):
        print(json.dumps(data, indent=2)[:2000])
        break
