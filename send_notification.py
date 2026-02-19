import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import time

def send_notification():
    # Check for service account key file
    try:
        cred = credentials.Certificate("smartretail-iot-firebase-adminsdk-fbsvc-7faa181ef1.json")
        firebase_admin.initialize_app(cred)
    except FileNotFoundError:
        print("Error: 'smartretail-iot-firebase-adminsdk-fbsvc-7faa181ef1.json' not found in current directory.")
        print("Please ensure the service account key is present.")
        return
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
        return

    db = firestore.client()

    print("\n--- Send Notification ---")
    title = input("Enter Title: ")
    message = input("Enter Message: ")

    if not title or not message:
        print("Title and Message cannot be empty.")
        return

    notification_data = {
        "title": title,
        "message": message,
        # Use server timestamp for consistency
        "timestamp": firestore.SERVER_TIMESTAMP,
        "read": False 
    }

    try:
        db.collection("notifications").add(notification_data)
        print("\nNotification sent successfully!")
        print(f"Title: {title}")
        print(f"Message: {message}")
    except Exception as e:
        print(f"Error sending notification: {e}")

if __name__ == "__main__":
    send_notification()
