import requests, json

# Upload the CSV
with open('../sample_tech_dataset.csv', 'rb') as f:
    r = requests.post('http://localhost:8000/api/upload', files={'file': ('sample_tech_dataset.csv', f, 'text/csv')})
print('UPLOAD RESPONSE:', json.dumps(r.json(), indent=2))

# Now check if trending updated
r2 = requests.get('http://localhost:8000/api/trending')
items = r2.json().get('items', [])
print('\nTRENDING AFTER UPLOAD:')
for item in items:
    print(f'  - {item["name"]} | score={item["score"]} | category={item["category"]}')
