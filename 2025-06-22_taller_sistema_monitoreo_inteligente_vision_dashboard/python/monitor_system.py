import cv2
import numpy as np
import os
import csv
import time
import datetime
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import tkinter as tk
from tkinter import ttk
from collections import defaultdict
import threading
import queue
import pandas as pd

# Try to import YOLOv8, if not available, fallback to cvlib
try:
    from ultralytics import YOLO
    USING_YOLO = True
    print("Using YOLOv8 for detection")
except ImportError:
    import cvlib as cv
    from cvlib.object_detection import draw_bbox
    USING_YOLO = False
    print("Using cvlib for detection")

class IntelligentMonitoringSystem:
    def __init__(self, root, camera_id=0):
        """Initialize the monitoring system with UI components"""
        self.root = root
        self.root.title("Intelligent Monitoring System")
        self.root.geometry("1200x700")
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        
        # Initialize paths
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.captures_dir = os.path.join(self.base_dir, "capturas")
        self.logs_dir = os.path.join(self.base_dir, "logs")
        
        # Ensure directories exist
        os.makedirs(self.captures_dir, exist_ok=True)
        os.makedirs(self.logs_dir, exist_ok=True)
        
        # Initialize log file
        self.log_file = os.path.join(self.logs_dir, f"log_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.csv")
        with open(self.log_file, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['timestamp', 'evento', 'clase', 'confianza'])
        
        # Initialize video capture
        self.camera_id = camera_id
        self.cap = cv2.VideoCapture(camera_id)
        self.running = True
        
        # Initialize detection model
        if USING_YOLO:
            self.model = YOLO("yolov8n.pt")  # Using YOLOv8 nano model
        
        # Setup data structures for tracking statistics
        self.detection_counts = defaultdict(int)
        self.detection_history = defaultdict(list)
        self.last_detected = defaultdict(float)
        self.detection_cooldown = 2.0  # seconds between logging the same object class
        
        # Setup frame for video
        self.video_frame = ttk.LabelFrame(root, text="Live Video Feed")
        self.video_frame.grid(row=0, column=0, padx=10, pady=10, sticky="nsew")
        
        self.video_label = ttk.Label(self.video_frame)
        self.video_label.pack(padx=5, pady=5)
        
        # Setup frame for statistics
        self.stats_frame = ttk.LabelFrame(root, text="Detection Statistics")
        self.stats_frame.grid(row=0, column=1, padx=10, pady=10, sticky="nsew")
        
        # Create figure for matplotlib
        self.fig, (self.ax1, self.ax2) = plt.subplots(2, 1, figsize=(5, 7))
        self.canvas = FigureCanvasTkAgg(self.fig, master=self.stats_frame)
        self.canvas_widget = self.canvas.get_tk_widget()
        self.canvas_widget.pack(padx=5, pady=5, fill=tk.BOTH, expand=True)
        
        # Setup frame for system status
        self.status_frame = ttk.LabelFrame(root, text="System Status")
        self.status_frame.grid(row=1, column=0, columnspan=2, padx=10, pady=10, sticky="ew")
        
        self.status_var = tk.StringVar(value="System starting...")
        self.status_label = ttk.Label(self.status_frame, textvariable=self.status_var, font=("Helvetica", 12))
        self.status_label.pack(padx=5, pady=5)
        
        # Recent events display
        self.events_frame = ttk.LabelFrame(root, text="Recent Events")
        self.events_frame.grid(row=2, column=0, columnspan=2, padx=10, pady=10, sticky="ew")
        
        self.events_text = tk.Text(self.events_frame, height=6, width=80)
        self.events_text.pack(padx=5, pady=5, fill=tk.BOTH, expand=True)
        
        # Queue for safe thread communication
        self.queue = queue.Queue()
        
        # Configure grid weights
        root.grid_columnconfigure(0, weight=3)
        root.grid_columnconfigure(1, weight=2)
        root.grid_rowconfigure(0, weight=3)
        root.grid_rowconfigure(1, weight=1)
        root.grid_rowconfigure(2, weight=1)
        
        # Start processing threads
        self.processing_thread = threading.Thread(target=self.process_video)
        self.processing_thread.daemon = True
        self.processing_thread.start()
        
        # Start UI update
        self.update_ui()
    
    def process_video(self):
        """Process video frames and detect objects in a separate thread"""
        while self.running:
            ret, frame = self.cap.read()
            if not ret:
                self.status_var.set("Error: Could not read from camera")
                time.sleep(0.1)
                continue
            
            # Perform object detection
            current_time = time.time()
            frame_with_boxes, detections = self.detect_objects(frame)
            
            # Process detections
            for obj_class, confidence, _ in detections:
                self.detection_counts[obj_class] += 1
                
                # Check if we should log this detection (cooldown)
                if current_time - self.last_detected[obj_class] > self.detection_cooldown:
                    self.last_detected[obj_class] = current_time
                    timestamp = datetime.datetime.now()
                    
                    # Log the detection
                    event = f"{obj_class.capitalize()} detected"
                    self.log_event(timestamp, event, obj_class, confidence)
                    
                    # Save capture
                    capture_path = os.path.join(self.captures_dir, 
                                             f"{obj_class}_{timestamp.strftime('%Y%m%d_%H%M%S')}.jpg")
                    cv2.imwrite(capture_path, frame)
                    
                    # Log capture saved event
                    self.log_event(timestamp, "Captura guardada", obj_class, confidence)
                    
                    # Add to history with timestamp for plotting
                    timestamp_str = timestamp.strftime('%H:%M:%S')
                    self.detection_history[obj_class].append((timestamp_str, confidence))
                    
                    # Put event in queue for UI thread
                    event_text = f"{timestamp.strftime('%H:%M:%S')} - {event} (Confidence: {confidence:.2f})"
                    self.queue.put(("event", event_text))
            
            # Put frame in queue for UI thread
            self.queue.put(("frame", frame_with_boxes))
            
            # Update status based on detections
            if detections:
                status = "ALERT: Objects detected!"
            else:
                status = "Monitoring: No objects detected"
            self.queue.put(("status", status))
            
            # Slight delay to reduce CPU usage
            time.sleep(0.01)
    
    def detect_objects(self, frame):
        """Detect objects in frame using YOLO or cvlib"""
        if USING_YOLO:
            results = self.model(frame)
            result = results[0]
            
            # Draw bounding boxes
            annotated_frame = result.plot()
            
            # Extract detections
            detections = []
            boxes = result.boxes.xyxy.cpu().numpy()
            confidences = result.boxes.conf.cpu().numpy()
            class_ids = result.boxes.cls.cpu().numpy().astype(int)
            
            for i, box in enumerate(boxes):
                class_id = class_ids[i]
                confidence = confidences[i]
                obj_class = result.names[class_id]
                detections.append((obj_class, confidence, box))
            
            return annotated_frame, detections
        else:
            # Using cvlib for detection
            bbox, labels, confidences = cv.detect_common_objects(frame)
            annotated_frame = draw_bbox(frame, bbox, labels, confidences)
            
            detections = []
            for i, label in enumerate(labels):
                detections.append((label, confidences[i], bbox[i]))
            
            return annotated_frame, detections
    
    def log_event(self, timestamp, event, obj_class, confidence):
        """Log event to CSV file"""
        with open(self.log_file, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([
                timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                event,
                obj_class,
                f"{confidence:.2f}"
            ])
    
    def update_ui(self):
        """Update UI components from the main thread"""
        try:
            while not self.queue.empty():
                msg_type, data = self.queue.get_nowait()
                
                if msg_type == "frame":
                    # Update video frame
                    img = cv2.cvtColor(data, cv2.COLOR_BGR2RGB)
                    img = cv2.resize(img, (640, 480))
                    img = tk.PhotoImage(data=cv2.imencode('.ppm', img)[1].tobytes())
                    self.video_label.config(image=img)
                    self.video_label.image = img
                
                elif msg_type == "status":
                    # Update status
                    self.status_var.set(data)
                
                elif msg_type == "event":
                    # Update events text
                    self.events_text.insert(tk.END, data + "\n")
                    self.events_text.see(tk.END)
            
            # Update statistics plots
            self.update_plots()
            
            # Schedule next update
            self.root.after(100, self.update_ui)
        except Exception as e:
            print(f"Error in UI update: {e}")
            self.root.after(100, self.update_ui)
    
    def update_plots(self):
        """Update the matplotlib plots with current statistics"""
        # Clear previous plots
        self.ax1.clear()
        self.ax2.clear()
        
        # Bar chart of detection counts
        if self.detection_counts:
            classes = list(self.detection_counts.keys())
            counts = list(self.detection_counts.values())
            
            bars = self.ax1.bar(classes, counts, color='skyblue')
            self.ax1.set_title('Object Detections Count')
            self.ax1.set_ylabel('Count')
            self.ax1.set_ylim(bottom=0)
            
            # Add count labels above bars
            for bar, count in zip(bars, counts):
                height = bar.get_height()
                self.ax1.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                             f'{count}', ha='center', va='bottom')
        
        # Line chart of detection history
        for obj_class, history in self.detection_history.items():
            if history:
                timestamps = [x[0] for x in history]
                confidences = [x[1] for x in history]
                
                # Take only the last 10 points to keep the chart readable
                if len(timestamps) > 10:
                    timestamps = timestamps[-10:]
                    confidences = confidences[-10:]
                
                self.ax2.plot(timestamps, confidences, 'o-', label=obj_class)
        
        if self.detection_history:
            self.ax2.set_title('Detection Confidence Over Time')
            self.ax2.set_ylabel('Confidence')
            self.ax2.set_ylim(0, 1.1)
            self.ax2.legend()
            self.ax2.tick_params(axis='x', rotation=45)
        
        # Adjust layout and draw
        self.fig.tight_layout()
        self.canvas.draw()
    
    def on_closing(self):
        """Handle window closing"""
        self.running = False
        if hasattr(self, 'cap') and self.cap.isOpened():
            self.cap.release()
        self.root.destroy()

def main():
    """Main function to start the application"""
    root = tk.Tk()
    app = IntelligentMonitoringSystem(root)
    root.mainloop()

if __name__ == "__main__":
    main()

