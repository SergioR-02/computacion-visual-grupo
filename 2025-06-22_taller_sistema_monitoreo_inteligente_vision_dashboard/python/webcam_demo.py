import cv2
import numpy as np
import time
import random
import os
import datetime
import csv

def simulate_detection(frame, frame_count):
    """Simulate object detection when no real model is available"""
    height, width = frame.shape[:2]
    
    # Classes we can detect
    classes = ['person', 'car', 'dog', 'cat', 'bicycle']
    colors = {
        'person': (0, 255, 0),  # Green
        'car': (255, 0, 0),     # Blue 
        'dog': (0, 0, 255),     # Red
        'cat': (255, 255, 0),   # Cyan
        'bicycle': (255, 0, 255) # Magenta
    }
    
    # Every 30 frames, randomly decide if we'll detect something
    detections = []
    if frame_count % 30 == 0 and random.random() > 0.3:
        # How many objects to detect (1-3)
        num_objects = random.randint(1, 3)
        
        for _ in range(num_objects):
            # Random class
            obj_class = random.choice(classes)
            
            # Random position (ensure box is within frame)
            box_width = random.randint(width // 8, width // 4)
            box_height = random.randint(height // 8, height // 4)
            
            x1 = random.randint(0, width - box_width)
            y1 = random.randint(0, height - box_height)
            x2 = x1 + box_width
            y2 = y1 + box_height
            
            # Random confidence
            confidence = random.uniform(0.75, 0.98)
            
            # Draw the box
            color = colors.get(obj_class, (0, 255, 0))
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            
            # Draw label
            label = f"{obj_class}: {confidence:.2f}"
            cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            
            # Add to detections
            detections.append((obj_class, confidence, (x1, y1, x2, y2)))
    
    return frame, detections

def run_webcam_demo(output_dir=None, log_file=None):
    """Run a demo with the webcam or simulated data"""
    # Create directories if needed
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
    
    if log_file:
        log_dir = os.path.dirname(log_file)
        os.makedirs(log_dir, exist_ok=True)
        
        # Initialize log file
        with open(log_file, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['timestamp', 'evento', 'clase', 'confianza'])
    
    # Try to open webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Warning: Could not open webcam. Using a simulated video stream.")
        # Create a blank frame for simulation
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
    
    # Variables for detection logic
    frame_count = 0
    start_time = time.time()
    fps = 0
    last_detected = {}  # Track when we last detected each class
    detection_cooldown = 2.0  # seconds between logging the same object class
    
    print("Press 'q' to quit")
    
    while True:
        # Read frame (or create blank frame if webcam not available)
        if cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                print("Error: Could not read from webcam")
                break
        else:
            # Create simulated frame (gray background with changing pattern)
            frame = np.ones((480, 640, 3), dtype=np.uint8) * 200
            # Add some dynamic pattern based on time
            t = time.time() - start_time
            for i in range(0, 480, 10):
                cv2.line(frame, (0, i), (640, i), 
                        (int(127 + 127 * np.sin(t + i * 0.01)),
                         int(127 + 127 * np.sin(t * 1.5 + i * 0.01)),
                         int(127 + 127 * np.sin(t * 2 + i * 0.01))), 1)
            for i in range(0, 640, 10):
                cv2.line(frame, (i, 0), (i, 480), 
                        (int(127 + 127 * np.sin(t + i * 0.01)),
                         int(127 + 127 * np.sin(t * 1.5 + i * 0.01)),
                         int(127 + 127 * np.sin(t * 2 + i * 0.01))), 1)
        
        # Perform simulated detection
        frame_with_boxes, detections = simulate_detection(frame.copy(), frame_count)
        
        # Process detections
        current_time = time.time()
        for obj_class, confidence, bbox in detections:
            # Check if we should log this detection (cooldown)
            if obj_class not in last_detected or current_time - last_detected[obj_class] > detection_cooldown:
                last_detected[obj_class] = current_time
                timestamp = datetime.datetime.now()
                
                # Log the detection if log file is specified
                if log_file:
                    event = f"{obj_class.capitalize()} detected"
                    with open(log_file, 'a', newline='') as f:
                        writer = csv.writer(f)
                        writer.writerow([
                            timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                            event,
                            obj_class,
                            f"{confidence:.2f}"
                        ])
                
                # Save capture if output directory is specified
                if output_dir:
                    capture_path = os.path.join(output_dir, 
                                             f"{obj_class}_{timestamp.strftime('%Y%m%d_%H%M%S')}.jpg")
                    cv2.imwrite(capture_path, frame)
                    
                    # Log capture saved event
                    if log_file:
                        with open(log_file, 'a', newline='') as f:
                            writer = csv.writer(f)
                            writer.writerow([
                                timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                                "Captura guardada",
                                obj_class,
                                f"{confidence:.2f}"
                            ])
        
        # Calculate FPS
        frame_count += 1
        if frame_count % 10 == 0:
            end_time = time.time()
            fps = 10 / (end_time - start_time)
            start_time = end_time
        
        # Display FPS
        cv2.putText(frame_with_boxes, f"FPS: {fps:.1f}", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # Display the frame
        cv2.imshow('Intelligent Monitoring System (Demo)', frame_with_boxes)
        
        # Check for exit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    # Release resources
    if cap.isOpened():
        cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    import sys
    import os
    
    # Default paths relative to the script location
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    captures_dir = os.path.join(base_dir, "capturas")
    log_file = os.path.join(base_dir, "logs", f"demo_log_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.csv")
    
    run_webcam_demo(captures_dir, log_file)
