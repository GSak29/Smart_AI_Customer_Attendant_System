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

print("\n--- Inspecting P0008 in 'products' collection ---")
doc_ref = db.collection('products').document('P0008')
doc = doc_ref.get()
if doc.exists:
    data = doc.to_dict()
    print(f"Product_Name: '{data.get('Product_Name')}'")
    print(f"Image_URL: '{data.get('Image_URL')}'")
else:
    print("P0008 not found")
