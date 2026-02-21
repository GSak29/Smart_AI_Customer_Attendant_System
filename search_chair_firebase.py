import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Use the service account file
cred = credentials.Certificate("smartretail-iot-firebase-adminsdk-fbsvc-7faa181ef1.json")
try:
    firebase_admin.get_app()
except ValueError:
    firebase_admin.initialize_app(cred)

db = firestore.client()

print("\n--- Searching for 'Chair' in 'products' collection ---")
# Firebase doesn't support substring search natively easily, so we have to list and filter or use specific query if we know exact name.
# Let's list a batch and check.
docs = db.collection('products').stream() # Might be large, but let's try reading all names
count = 0
found_count = 0
for doc in docs:
    count += 1
    data = doc.to_dict()
    name = data.get('Product_Name', '')
    if 'Chair' in name:
        print(f"Found Chair: {name} (ID: {doc.id})")
        print(f"  Image_URL: {data.get('Image_URL')}")
        found_count += 1
        if found_count >= 5: break

print(f"Total docs scanned: {count}")
if found_count == 0:
    print("No chairs found in products collection.")
