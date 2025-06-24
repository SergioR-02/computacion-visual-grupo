import pandas as pd
import matplotlib.pyplot as plt
import os
import seaborn as sns
from datetime import datetime
import sys

def visualize_log(log_file):
    """Visualize a log file with various plots"""
    # Check if file exists
    if not os.path.exists(log_file):
        print(f"Error: Log file {log_file} not found")
        return
    
    # Read the CSV log file
    df = pd.read_csv(log_file)
    
    # Convert timestamp to datetime
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Set theme
    sns.set_theme(style="whitegrid")
    
    # Create figure with subplots
    fig, axs = plt.subplots(2, 2, figsize=(15, 10))
    fig.suptitle('Log Analysis', fontsize=16)
    
    # 1. Count by class
    class_counts = df[df['evento'] != 'Captura guardada']['clase'].value_counts()
    axs[0, 0].bar(class_counts.index, class_counts.values, color=sns.color_palette("muted"))
    axs[0, 0].set_title('Detections by Class')
    axs[0, 0].set_ylabel('Count')
    axs[0, 0].set_xlabel('Class')
    
    # Add count labels
    for i, v in enumerate(class_counts.values):
        axs[0, 0].text(i, v + 0.1, str(v), ha='center')
    
    # 2. Confidence distribution
    axs[0, 1].hist(df['confianza'], bins=10, color='skyblue', edgecolor='black')
    axs[0, 1].set_title('Confidence Distribution')
    axs[0, 1].set_xlabel('Confidence')
    axs[0, 1].set_ylabel('Frequency')
    
    # 3. Events over time
    detection_events = df[df['evento'] != 'Captura guardada']
    # Group by 5-minute intervals and count
    detection_events['time_interval'] = detection_events['timestamp'].dt.floor('5min')
    time_series = detection_events.groupby('time_interval').size()
    
    axs[1, 0].plot(time_series.index, time_series.values, marker='o', linestyle='-', color='green')
    axs[1, 0].set_title('Detections Over Time')
    axs[1, 0].set_xlabel('Time')
    axs[1, 0].set_ylabel('Number of Detections')
    plt.setp(axs[1, 0].xaxis.get_majorticklabels(), rotation=45)
    
    # 4. Confidence by class
    sns.boxplot(x='clase', y='confianza', data=detection_events, ax=axs[1, 1])
    axs[1, 1].set_title('Confidence by Class')
    axs[1, 1].set_xlabel('Class')
    axs[1, 1].set_ylabel('Confidence')
    
    # Adjust layout
    plt.tight_layout()
    
    # Save the visualization
    results_dir = os.path.join(os.path.dirname(os.path.dirname(log_file)), "resultados")
    os.makedirs(results_dir, exist_ok=True)
    
    output_file = os.path.join(results_dir, "log_visualization.png")
    plt.savefig(output_file)
    
    print(f"Visualization saved to: {output_file}")
    plt.show()

if __name__ == "__main__":
    # If a log file is provided as an argument, use it; otherwise use a default path
    if len(sys.argv) > 1:
        log_file = sys.argv[1]
    else:
        # Default path for sample log
        log_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                               "logs", "sample_log.csv")
    
    visualize_log(log_file)
