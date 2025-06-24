import pandas as pd
import tkinter as tk
from tkinter import ttk, filedialog
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import os
import threading
import time
from datetime import datetime

class LogDashboardViewer:
    def __init__(self, root, log_file=None):
        """Initialize the dashboard for viewing log files"""
        self.root = root
        self.root.title("Intelligent Monitoring System - Log Dashboard")
        self.root.geometry("1200x700")
        
        # Variables
        self.log_file = log_file
        self.df = None
        self.update_interval = 5000  # ms
        self.auto_update = False
        
        # Main frame
        main_frame = ttk.Frame(root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Control panel frame
        control_frame = ttk.LabelFrame(main_frame, text="Controls")
        control_frame.pack(fill=tk.X, padx=5, pady=5)
        
        # Log file selection
        ttk.Label(control_frame, text="Log File:").grid(row=0, column=0, padx=5, pady=5)
        self.log_path_var = tk.StringVar()
        if log_file:
            self.log_path_var.set(log_file)
        
        log_entry = ttk.Entry(control_frame, textvariable=self.log_path_var, width=50)
        log_entry.grid(row=0, column=1, padx=5, pady=5)
        
        browse_btn = ttk.Button(control_frame, text="Browse", command=self.browse_log)
        browse_btn.grid(row=0, column=2, padx=5, pady=5)
        
        load_btn = ttk.Button(control_frame, text="Load Log", command=self.load_log)
        load_btn.grid(row=0, column=3, padx=5, pady=5)
        
        # Auto-update toggle
        self.auto_update_var = tk.BooleanVar(value=False)
        auto_update_check = ttk.Checkbutton(
            control_frame, text="Auto Update", variable=self.auto_update_var,
            command=self.toggle_auto_update
        )
        auto_update_check.grid(row=0, column=4, padx=5, pady=5)
        
        # Statistics summary frame
        stats_frame = ttk.LabelFrame(main_frame, text="Summary Statistics")
        stats_frame.pack(fill=tk.X, padx=5, pady=5)
        
        # Statistics labels
        self.total_detections_var = tk.StringVar(value="Total Detections: 0")
        self.unique_classes_var = tk.StringVar(value="Unique Classes: 0")
        self.avg_confidence_var = tk.StringVar(value="Avg Confidence: 0.00")
        self.last_detection_var = tk.StringVar(value="Last Detection: N/A")
        
        ttk.Label(stats_frame, textvariable=self.total_detections_var, font=("Helvetica", 12)).pack(side=tk.LEFT, padx=20, pady=5)
        ttk.Label(stats_frame, textvariable=self.unique_classes_var, font=("Helvetica", 12)).pack(side=tk.LEFT, padx=20, pady=5)
        ttk.Label(stats_frame, textvariable=self.avg_confidence_var, font=("Helvetica", 12)).pack(side=tk.LEFT, padx=20, pady=5)
        ttk.Label(stats_frame, textvariable=self.last_detection_var, font=("Helvetica", 12)).pack(side=tk.LEFT, padx=20, pady=5)
        
        # Visualization frame
        viz_frame = ttk.LabelFrame(main_frame, text="Visualizations")
        viz_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Create matplotlib figure
        self.fig, self.axs = plt.subplots(2, 2, figsize=(12, 8))
        self.canvas = FigureCanvasTkAgg(self.fig, master=viz_frame)
        self.canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)
        
        # Event log frame
        log_frame = ttk.LabelFrame(main_frame, text="Recent Events")
        log_frame.pack(fill=tk.X, padx=5, pady=5)
        
        # Event log table
        columns = ("Timestamp", "Event", "Class", "Confidence")
        self.tree = ttk.Treeview(log_frame, columns=columns, show="headings", height=6)
        
        # Set column headings
        for col in columns:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=150)
        
        self.tree.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Export frame
        export_frame = ttk.Frame(main_frame)
        export_frame.pack(fill=tk.X, padx=5, pady=5)
        
        export_btn = ttk.Button(export_frame, text="Export Visualization", command=self.export_visualization)
        export_btn.pack(side=tk.RIGHT, padx=5, pady=5)
        
        # Load log if provided
        if self.log_file:
            self.load_log()
    
    def browse_log(self):
        """Open file dialog to select log file"""
        filetypes = [("CSV files", "*.csv"), ("All files", "*.*")]
        filename = filedialog.askopenfilename(
            title="Select Log File",
            filetypes=filetypes
        )
        if filename:
            self.log_path_var.set(filename)
    
    def load_log(self):
        """Load and display log data"""
        log_path = self.log_path_var.get()
        if not log_path or not os.path.exists(log_path):
            return
        
        try:
            self.log_file = log_path
            self.df = pd.read_csv(log_path)
            
            # Convert timestamp to datetime
            self.df['timestamp'] = pd.to_datetime(self.df['timestamp'])
            
            # Update statistics
            self.update_statistics()
            
            # Update visualizations
            self.update_visualizations()
            
            # Update event log
            self.update_event_log()
            
        except Exception as e:
            print(f"Error loading log file: {e}")
    
    def update_statistics(self):
        """Update summary statistics"""
        if self.df is None:
            return
        
        # Filter out 'Captura guardada' events for counting detections
        detections = self.df[self.df['evento'] != 'Captura guardada']
        
        total_detections = len(detections)
        unique_classes = detections['clase'].nunique()
        avg_confidence = detections['confianza'].mean()
        
        if not detections.empty:
            last_detection = detections.iloc[-1]
            last_detection_time = last_detection['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
            last_detection_class = last_detection['clase']
        else:
            last_detection_time = "N/A"
            last_detection_class = "N/A"
        
        # Update labels
        self.total_detections_var.set(f"Total Detections: {total_detections}")
        self.unique_classes_var.set(f"Unique Classes: {unique_classes}")
        self.avg_confidence_var.set(f"Avg Confidence: {avg_confidence:.2f}")
        self.last_detection_var.set(f"Last Detection: {last_detection_class} at {last_detection_time}")
    
    def update_visualizations(self):
        """Update all visualizations"""
        if self.df is None:
            return
        
        # Clear previous plots
        for ax in self.axs.flat:
            ax.clear()
        
        # Filter out 'Captura guardada' events for analysis
        detections = self.df[self.df['evento'] != 'Captura guardada']
        
        # 1. Count by class
        class_counts = detections['clase'].value_counts()
        self.axs[0, 0].bar(class_counts.index, class_counts.values, color='skyblue')
        self.axs[0, 0].set_title('Detections by Class')
        self.axs[0, 0].set_ylabel('Count')
        self.axs[0, 0].set_xlabel('Class')
        self.axs[0, 0].tick_params(axis='x', rotation=45)
        
        # 2. Confidence distribution
        self.axs[0, 1].hist(detections['confianza'], bins=10, color='lightgreen', edgecolor='black')
        self.axs[0, 1].set_title('Confidence Distribution')
        self.axs[0, 1].set_xlabel('Confidence')
        self.axs[0, 1].set_ylabel('Frequency')
        
        # 3. Events over time
        detections['time_interval'] = detections['timestamp'].dt.floor('5min')
        time_series = detections.groupby('time_interval').size()
        
        self.axs[1, 0].plot(time_series.index, time_series.values, marker='o', linestyle='-', color='orange')
        self.axs[1, 0].set_title('Detections Over Time')
        self.axs[1, 0].set_xlabel('Time')
        self.axs[1, 0].set_ylabel('Number of Detections')
        self.axs[1, 0].tick_params(axis='x', rotation=45)
        
        # 4. Confidence by class
        class_confidence = detections.groupby('clase')['confianza'].mean().sort_values(ascending=False)
        self.axs[1, 1].bar(class_confidence.index, class_confidence.values, color='lightcoral')
        self.axs[1, 1].set_title('Average Confidence by Class')
        self.axs[1, 1].set_xlabel('Class')
        self.axs[1, 1].set_ylabel('Avg Confidence')
        self.axs[1, 1].set_ylim(0, 1.0)
        self.axs[1, 1].tick_params(axis='x', rotation=45)
        
        # Adjust layout
        self.fig.tight_layout()
        self.canvas.draw()
    
    def update_event_log(self):
        """Update the event log table"""
        if self.df is None:
            return
        
        # Clear existing items
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # Add the most recent 50 events (or fewer if there aren't that many)
        recent_events = self.df.tail(50).iloc[::-1]  # Reverse to show newest first
        
        for _, row in recent_events.iterrows():
            timestamp = row['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
            event = row['evento']
            obj_class = row['clase']
            confidence = f"{row['confianza']:.2f}"
            
            self.tree.insert("", "end", values=(timestamp, event, obj_class, confidence))
    
    def toggle_auto_update(self):
        """Toggle automatic updates"""
        self.auto_update = self.auto_update_var.get()
        
        if self.auto_update:
            # Start the auto-update cycle
            self.schedule_update()
    
    def schedule_update(self):
        """Schedule the next update if auto-update is enabled"""
        if self.auto_update:
            self.load_log()  # Reload the log file
            self.root.after(self.update_interval, self.schedule_update)
    
    def export_visualization(self):
        """Export current visualization to a file"""
        if self.df is None:
            return
        
        filetypes = [("PNG files", "*.png"), ("All files", "*.*")]
        filename = filedialog.asksaveasfilename(
            title="Save Visualization",
            filetypes=filetypes,
            defaultextension=".png"
        )
        
        if filename:
            self.fig.savefig(filename, dpi=300, bbox_inches='tight')
            print(f"Visualization saved to: {filename}")

def main():
    """Main function to start the application"""
    root = tk.Tk()
    
    # If a log file is specified as an argument, use it
    import sys
    log_file = None
    
    if len(sys.argv) > 1:
        log_file = sys.argv[1]
    
    app = LogDashboardViewer(root, log_file)
    root.mainloop()

if __name__ == "__main__":
    main()
