import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import os

# Use the service account file
cred = credentials.Certificate("smartretail-iot-firebase-adminsdk-fbsvc-7faa181ef1.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# List collections
collections = db.collections()
print("Collections:")
for collection in collections:
    print(f"- {collection.id}")
    # Print first document in each collection to see structure
    docs = collection.limit(1).stream()
    for doc in docs:
        print(f"  Sample doc ({doc.id}): {doc.to_dict()}")
