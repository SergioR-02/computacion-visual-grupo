import csv
import datetime
import random
import os

def generate_sample_log(log_file, num_entries=20):
    """Generate a sample log file with randomized detections"""
    # Ensure the directory exists
    os.makedirs(os.path.dirname(log_file), exist_ok=True)
    
    # Classes that could be detected
    classes = ['person', 'car', 'dog', 'cat', 'bicycle']
    events = ['Persona detectada', 'Auto detectado', 'Perro detectado', 'Gato detectado', 'Bicicleta detectada',
              'Captura guardada', 'Captura guardada', 'Captura guardada', 'Captura guardada', 'Captura guardada']
    
    # Start time (30 minutes ago)
    start_time = datetime.datetime.now() - datetime.timedelta(minutes=30)
    
    with open(log_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['timestamp', 'evento', 'clase', 'confianza'])
        
        for i in range(num_entries):
            # Random class
            class_idx = random.randint(0, len(classes) - 1)
            obj_class = classes[class_idx]
            event = events[class_idx]
            
            # Random confidence
            confidence = random.uniform(0.75, 0.98)
            
            # Timestamp (random within last 30 minutes)
            minutes_ago = random.randint(0, 29)
            timestamp = start_time + datetime.timedelta(minutes=minutes_ago)
            
            # Write the row
            writer.writerow([
                timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                event,
                obj_class,
                f"{confidence:.2f}"
            ])
            
            # Also write "Captura guardada" entry
            if random.random() > 0.3:  # 70% chance to save a capture
                writer.writerow([
                    timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                    "Captura guardada",
                    obj_class,
                    f"{confidence:.2f}"
                ])

if __name__ == "__main__":
    log_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                           "logs", "sample_log.csv")
    generate_sample_log(log_file, 20)
    print(f"Sample log generated at: {log_file}")
