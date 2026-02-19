from ultralytics import YOLO
import cv2

# ===== SETTINGS =====
SHOW_PREVIEW = True      # Toggle preview window
CAMERA_INDEX = 0         # 0 = webcam, RTSP URL for CCTV
CONFIDENCE = 0.5

# ====================
model = YOLO("yolov8n.pt")
cap = cv2.VideoCapture(CAMERA_INDEX)

if SHOW_PREVIEW:
    cv2.namedWindow("Human Detection", cv2.WINDOW_NORMAL)
    cv2.resizeWindow("Human Detection", 900, 600)

while True:
    ret, frame = cap.read()
    if not ret:
        print("Camera not accessible")
        break

    # Human detection (class 0 = person)
    results = model(frame, conf=CONFIDENCE, classes=[0])

    if SHOW_PREVIEW:
        annotated = results[0].plot()
        cv2.imshow("Human Detection", annotated)

        # Press ESC to exit
        if cv2.waitKey(1) & 0xFF == 27:
            break

cap.release()
cv2.destroyAllWindows()
