"""
Performance Testing and Benchmarking for YOLO Webcam Detection
==============================================================

This script runs automated tests to measure and analyze the performance
of the YOLO webcam detection system.
"""

from ultralytics import YOLO
import cv2
import time
import numpy as np
import matplotlib.pyplot as plt
import json
import os

class YOLOPerformanceTester:
    """
    Performance testing suite for YOLO webcam detection
    """
    
    def __init__(self, model_name='yolov8n.pt'):
        self.model = YOLO(model_name)
        self.model_name = model_name
        self.results = {
            'model': model_name,
            'fps_history': [],
            'inference_times': [],
            'detection_counts': [],
            'frame_times': [],
            'test_duration': 0
        }
    
    def run_performance_test(self, duration_seconds=30, camera_index=0):
        """
        Run performance test for specified duration
        
        Args:
            duration_seconds: How long to run the test
            camera_index: Camera to use for testing
        """
        print(f"Starting {duration_seconds}s performance test with {self.model_name}")
        
        cap = cv2.VideoCapture(camera_index)
        if not cap.isOpened():
            print("Error: Cannot access camera")
            return None
        
        # Set camera properties
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        start_test_time = time.time()
        frame_count = 0
        
        while time.time() - start_test_time < duration_seconds:
            frame_start = time.time()
            
            # Capture frame
            ret, frame = cap.read()
            if not ret:
                continue
            
            frame = cv2.flip(frame, 1)
            
            # Run inference
            inference_start = time.time()
            results = self.model.predict(source=frame, verbose=False)
            inference_time = time.time() - inference_start
            
            # Count detections
            detection_count = 0
            for result in results:
                if result.boxes is not None:
                    detection_count = len(result.boxes)
            
            # Calculate frame metrics
            frame_time = time.time() - frame_start
            fps = 1.0 / frame_time if frame_time > 0 else 0
            
            # Store metrics
            self.results['fps_history'].append(fps)
            self.results['inference_times'].append(inference_time * 1000)  # Convert to ms
            self.results['detection_counts'].append(detection_count)
            self.results['frame_times'].append(frame_time * 1000)  # Convert to ms
            
            frame_count += 1
            
            # Optional: show progress
            if frame_count % 30 == 0:
                elapsed = time.time() - start_test_time
                print(f"Progress: {elapsed:.1f}s / {duration_seconds}s - FPS: {fps:.1f}")
        
        self.results['test_duration'] = time.time() - start_test_time
        self.results['total_frames'] = frame_count
        
        cap.release()
        
        return self.analyze_results()
    
    def analyze_results(self):
        """
        Analyze and summarize test results
        """
        if not self.results['fps_history']:
            return None
        
        analysis = {
            'model': self.model_name,
            'total_frames': len(self.results['fps_history']),
            'test_duration': self.results['test_duration'],
            'fps': {
                'average': np.mean(self.results['fps_history']),
                'max': np.max(self.results['fps_history']),
                'min': np.min(self.results['fps_history']),
                'std': np.std(self.results['fps_history'])
            },
            'inference_time_ms': {
                'average': np.mean(self.results['inference_times']),
                'max': np.max(self.results['inference_times']),
                'min': np.min(self.results['inference_times']),
                'std': np.std(self.results['inference_times'])
            },
            'detections': {
                'average': np.mean(self.results['detection_counts']),
                'max': np.max(self.results['detection_counts']),
                'total': np.sum(self.results['detection_counts'])
            },
            'frame_time_ms': {
                'average': np.mean(self.results['frame_times']),
                'max': np.max(self.results['frame_times']),
                'min': np.min(self.results['frame_times'])
            }
        }
        
        return analysis
    
    def create_performance_plots(self, save_dir='../resultados'):
        """
        Create performance visualization plots
        """
        if not self.results['fps_history']:
            print("No data to plot")
            return
        
        # Create plots directory if it doesn't exist
        os.makedirs(save_dir, exist_ok=True)
        
        # Create figure with subplots
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
        fig.suptitle(f'YOLO Performance Analysis - {self.model_name}', fontsize=16)
        
        # FPS over time
        ax1.plot(self.results['fps_history'])
        ax1.set_title('FPS Over Time')
        ax1.set_xlabel('Frame Number')
        ax1.set_ylabel('FPS')
        ax1.grid(True)
        ax1.axhline(y=np.mean(self.results['fps_history']), color='r', linestyle='--', 
                   label=f'Average: {np.mean(self.results["fps_history"]):.1f}')
        ax1.legend()
        
        # Inference time distribution
        ax2.hist(self.results['inference_times'], bins=50, alpha=0.7, edgecolor='black')
        ax2.set_title('Inference Time Distribution')
        ax2.set_xlabel('Inference Time (ms)')
        ax2.set_ylabel('Frequency')
        ax2.axvline(x=np.mean(self.results['inference_times']), color='r', linestyle='--',
                   label=f'Average: {np.mean(self.results["inference_times"]):.1f}ms')
        ax2.legend()
        
        # Detection count over time
        ax3.plot(self.results['detection_counts'])
        ax3.set_title('Objects Detected Over Time')
        ax3.set_xlabel('Frame Number')
        ax3.set_ylabel('Number of Detections')
        ax3.grid(True)
        
        # FPS vs Detection Count scatter
        ax4.scatter(self.results['detection_counts'], self.results['fps_history'], alpha=0.6)
        ax4.set_title('FPS vs Number of Detections')
        ax4.set_xlabel('Number of Detections')
        ax4.set_ylabel('FPS')
        ax4.grid(True)
        
        plt.tight_layout()
        
        # Save plot
        plot_filename = os.path.join(save_dir, f'performance_analysis_{self.model_name.replace(".", "_")}.png')
        plt.savefig(plot_filename, dpi=300, bbox_inches='tight')
        print(f"Performance plot saved: {plot_filename}")
        
        plt.show()
    
    def save_results(self, filename='performance_results.json', save_dir='../resultados'):
        """
        Save detailed results to JSON file
        """
        os.makedirs(save_dir, exist_ok=True)
        filepath = os.path.join(save_dir, filename)
        
        with open(filepath, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"Results saved to: {filepath}")

def compare_models(models=['yolov8n.pt', 'yolov8s.pt'], test_duration=30):
    """
    Compare performance of different YOLO models
    """
    print("Starting model comparison...")
    
    results = {}
    
    for model_name in models:
        print(f"\nTesting {model_name}...")
        tester = YOLOPerformanceTester(model_name)
        analysis = tester.run_performance_test(duration_seconds=test_duration)
        
        if analysis:
            results[model_name] = analysis
            tester.create_performance_plots()
            tester.save_results(f'results_{model_name.replace(".", "_")}.json')
    
    # Print comparison summary
    print("\n" + "="*60)
    print("MODEL COMPARISON SUMMARY")
    print("="*60)
    
    for model_name, analysis in results.items():
        print(f"\n{model_name}:")
        print(f"  Average FPS: {analysis['fps']['average']:.2f}")
        print(f"  Average Inference Time: {analysis['inference_time_ms']['average']:.2f}ms")
        print(f"  Average Detections: {analysis['detections']['average']:.2f}")
        print(f"  Total Frames: {analysis['total_frames']}")

def main():
    """
    Main function to run performance tests
    """
    print("YOLO Performance Testing Suite")
    print("="*40)
    
    # Single model test
    tester = YOLOPerformanceTester('yolov8n.pt')
    analysis = tester.run_performance_test(duration_seconds=60)
    
    if analysis:
        print("\nPerformance Analysis Results:")
        print("-" * 40)
        print(f"Model: {analysis['model']}")
        print(f"Total Frames: {analysis['total_frames']}")
        print(f"Test Duration: {analysis['test_duration']:.2f}s")
        print(f"Average FPS: {analysis['fps']['average']:.2f}")
        print(f"FPS Range: {analysis['fps']['min']:.2f} - {analysis['fps']['max']:.2f}")
        print(f"Average Inference Time: {analysis['inference_time_ms']['average']:.2f}ms")
        print(f"Average Detections per Frame: {analysis['detections']['average']:.2f}")
        
        # Create visualizations
        tester.create_performance_plots()
        tester.save_results()
    
    # Uncomment to compare multiple models
    # compare_models(['yolov8n.pt', 'yolov8s.pt'], test_duration=30)

if __name__ == "__main__":
    main()
