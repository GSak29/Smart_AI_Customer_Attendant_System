import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import os

# Use the service account file
cred = credentials.Certificate("smartretail-iot-firebase-adminsdk-fbsvc-7faa181ef1.json")
try:
    firebase_admin.get_app()
except ValueError:
    firebase_admin.initialize_app(cred)

db = firestore.client()

print("\n--- Inspecting 'products' collection ---")
docs = db.collection('products').limit(1).stream()
for doc in docs:
    print(f"ID: {doc.id}")
    data = doc.to_dict()
    print("Keys found:", list(data.keys()))
    # Check for image URL specifically
    for k, v in data.items():
        if 'image' in k.lower() or 'url' in k.lower():
            print(f"Match found: '{k}': {v}")
