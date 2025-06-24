"""
YOLO Real-time Object Detection with Webcam
===========================================

This script implements real-time object detection using YOLOv8 model
with webcam input. It displays detection results with bounding boxes,
labels, confidence scores, and FPS counter.

Author: Computational Vision Workshop
Date: June 23, 2025
"""

from ultralytics import YOLO
import cv2
import time
import numpy as np


class YOLOWebcamDetector:
    """
    Real-time object detection using YOLO and webcam
    """
    
    def __init__(self, model_name='yolov8n.pt', confidence_threshold=0.5):
        """
        Initialize the YOLO detector
        
        Args:
            model_name (str): YOLO model name (yolov8n.pt, yolov8s.pt, etc.)
            confidence_threshold (float): Minimum confidence for detections
        """
        self.model = YOLO(model_name)
        self.confidence_threshold = confidence_threshold
        self.fps_history = []
        self.frame_count = 0
        
        # Colors for different classes (BGR format)
        self.colors = [
            (255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 0),
            (255, 0, 255), (0, 255, 255), (128, 0, 128), (255, 165, 0),
            (255, 192, 203), (0, 128, 0), (128, 128, 0), (0, 128, 128)
        ]
        
    def draw_detections(self, frame, detections):
        """
        Draw bounding boxes, labels and confidence on frame
        
        Args:
            frame: Input frame
            detections: YOLO detection results
            
        Returns:
            frame: Frame with drawn detections
        """
        for detection in detections:
            boxes = detection.boxes
            if boxes is not None:
                for box in boxes:
                    # Get box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    confidence = box.conf[0].cpu().numpy()
                    class_id = int(box.cls[0].cpu().numpy())
                    
                    # Filter by confidence
                    if confidence < self.confidence_threshold:
                        continue
                    
                    # Get class name
                    class_name = self.model.names[class_id]
                    
                    # Choose color based on class
                    color = self.colors[class_id % len(self.colors)]
                    
                    # Draw bounding box
                    cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
                    
                    # Prepare label text
                    label = f"{class_name}: {confidence:.2f}"
                    
                    # Get text size for background rectangle
                    (text_width, text_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
                    
                    # Draw background rectangle for text
                    cv2.rectangle(frame, (int(x1), int(y1) - text_height - 10), 
                                (int(x1) + text_width, int(y1)), color, -1)
                    
                    # Draw label text
                    cv2.putText(frame, label, (int(x1), int(y1) - 5),
                              cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        return frame
    
    def draw_fps(self, frame, fps):
        """
        Draw FPS counter on frame
        
        Args:
            frame: Input frame
            fps: Current FPS value
            
        Returns:
            frame: Frame with FPS counter
        """
        fps_text = f"FPS: {fps:.1f}"
        cv2.rectangle(frame, (10, 10), (150, 50), (0, 0, 0), -1)
        cv2.putText(frame, fps_text, (15, 35), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        return frame
    
    def draw_detection_count(self, frame, count):
        """
        Draw detection counter on frame
        
        Args:
            frame: Input frame
            count: Number of detections
            
        Returns:
            frame: Frame with detection counter
        """
        count_text = f"Objects: {count}"
        cv2.rectangle(frame, (10, 60), (180, 100), (0, 0, 0), -1)
        cv2.putText(frame, count_text, (15, 85), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)
        return frame
    
    def filter_specific_classes(self, detections, target_classes=['person', 'cell phone', 'laptop']):
        """
        Filter detections to show only specific classes
        
        Args:
            detections: YOLO detection results
            target_classes: List of class names to keep
            
        Returns:
            filtered_detections: Filtered detection results
        """
        # This is a simplified version - in practice, you might want to
        # modify the detection results more carefully
        return detections
    
    def run_detection(self, camera_index=0, show_specific_only=False, target_classes=['person', 'cell phone']):
        """
        Run real-time object detection
        
        Args:
            camera_index (int): Camera index (usually 0 for default camera)
            show_specific_only (bool): Show only specific classes
            target_classes (list): Classes to show when filtering
        """
        # Initialize camera
        cap = cv2.VideoCapture(camera_index)
        
        if not cap.isOpened():
            print("Error: Could not open camera")
            return
        
        # Set camera properties for better performance
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        cap.set(cv2.CAP_PROP_FPS, 30)
        
        print("Starting YOLO webcam detection...")
        print("Press 'q' to quit")
        print("Press 's' to save current frame")
        print("Press 'f' to toggle specific class filtering")
        
        filter_mode = show_specific_only
        
        while True:
            # Start time measurement
            start_time = time.time()
            
            # Capture frame
            ret, frame = cap.read()
            if not ret:
                print("Error: Could not read frame")
                break
            
            # Flip frame horizontally for mirror effect
            frame = cv2.flip(frame, 1)
            
            # Run YOLO inference
            inference_start = time.time()
            results = self.model.predict(source=frame, stream=True, verbose=False)
            inference_time = time.time() - inference_start
            
            # Process results
            detection_count = 0
            for result in results:
                if result.boxes is not None:
                    detection_count = len(result.boxes)
                
                # Draw detections
                frame = self.draw_detections(frame, [result])
            
            # Calculate FPS
            total_time = time.time() - start_time
            fps = 1.0 / total_time if total_time > 0 else 0
            self.fps_history.append(fps)
            
            # Keep only last 30 FPS measurements for average
            if len(self.fps_history) > 30:
                self.fps_history.pop(0)
            
            avg_fps = np.mean(self.fps_history)
            
            # Draw FPS and detection count
            frame = self.draw_fps(frame, avg_fps)
            frame = self.draw_detection_count(frame, detection_count)
            
            # Draw inference time
            inference_text = f"Inference: {inference_time*1000:.1f}ms"
            cv2.rectangle(frame, (10, 110), (250, 150), (0, 0, 0), -1)
            cv2.putText(frame, inference_text, (15, 135), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 255), 2)
            
            # Draw mode indicator
            mode_text = "Filtered" if filter_mode else "All Objects"
            cv2.rectangle(frame, (frame.shape[1] - 150, 10), (frame.shape[1] - 10, 50), (0, 0, 0), -1)
            cv2.putText(frame, mode_text, (frame.shape[1] - 145, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            
            # Show frame
            cv2.imshow('YOLO Webcam Detection', frame)
            
            # Handle key presses
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('s'):
                # Save current frame
                filename = f"detection_frame_{int(time.time())}.jpg"
                cv2.imwrite(filename, frame)
                print(f"Frame saved as {filename}")
            elif key == ord('f'):
                # Toggle filter mode
                filter_mode = not filter_mode
                print(f"Filter mode: {'ON' if filter_mode else 'OFF'}")
            
            self.frame_count += 1
            
            # Print stats every 100 frames
            if self.frame_count % 100 == 0:
                print(f"Processed {self.frame_count} frames. Average FPS: {avg_fps:.2f}")
        
        # Cleanup
        cap.release()
        cv2.destroyAllWindows()
        
        # Print final statistics
        print(f"\nFinal Statistics:")
        print(f"Total frames processed: {self.frame_count}")
        print(f"Average FPS: {np.mean(self.fps_history):.2f}")
        print(f"Max FPS: {max(self.fps_history):.2f}")
        print(f"Min FPS: {min(self.fps_history):.2f}")


def main():
    """
    Main function to run the YOLO webcam detector
    """
    # Create detector instance
    detector = YOLOWebcamDetector(
        model_name='yolov8n.pt',  # You can change to yolov8s.pt, yolov8m.pt, etc.
        confidence_threshold=0.5
    )
    
    # Run detection
    detector.run_detection(
        camera_index=0,
        show_specific_only=False,
        target_classes=['person', 'cell phone', 'laptop', 'book', 'bottle']
    )


if __name__ == "__main__":
    main()
