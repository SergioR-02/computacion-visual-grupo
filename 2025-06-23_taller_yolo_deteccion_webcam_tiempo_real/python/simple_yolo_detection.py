"""
Simple YOLO Webcam Detection
============================

A simplified version of YOLO webcam detection for quick testing
and demonstration purposes.
"""

from ultralytics import YOLO
import cv2
import time

def simple_yolo_detection():
    """
    Simple YOLO detection with minimal code
    """
    # Load YOLO model
    print("Loading YOLO model...")
    model = YOLO('yolov8n.pt')  # This will download the model if not available
    
    # Initialize webcam
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Cannot access webcam")
        return
    
    print("Starting detection... Press 'q' to quit")
    
    # Variables for FPS calculation
    prev_time = time.time()
    
    while True:
        # Read frame from webcam
        ret, frame = cap.read()
        if not ret:
            break
        
        # Flip frame for mirror effect
        frame = cv2.flip(frame, 1)
        
        # Run YOLO inference
        results = model(frame)
        
        # Draw results on frame
        annotated_frame = results[0].plot()
        
        # Calculate FPS
        current_time = time.time()
        fps = 1.0 / (current_time - prev_time)
        prev_time = current_time
        
        # Add FPS text to frame
        cv2.putText(annotated_frame, f'FPS: {fps:.1f}', (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # Display frame
        cv2.imshow('Simple YOLO Detection', annotated_frame)
        
        # Break on 'q' key press
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    # Cleanup
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    simple_yolo_detection()
