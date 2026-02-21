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

print("\n--- Listing products with images ---")
docs = db.collection('products').limit(10).stream()

for doc in docs:
    data = doc.to_dict()
    name = data.get('Product_Name', 'N/A')
    img = data.get('Image_URL')
    
    if img:
        print(f"Doc ID: {doc.id} | Name: {name} | Image: {img[:30]}...")
    else:
        print(f"Doc ID: {doc.id} | Name: {name} | No Image_URL field")
        # Check if keys have different casing
        keys = list(data.keys())
        image_keys = [k for k in keys if 'image' in k.lower()]
        if image_keys:
             print(f"  Found potential image keys: {image_keys}")

print("\n--- End ---")
