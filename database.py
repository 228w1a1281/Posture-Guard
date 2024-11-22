import sqlite3
from datetime import datetime

def init_db():
    """Initialize the database and create the alerts table if it doesn't exist."""
    conn = sqlite3.connect('posture_alerts.db')
    cursor = conn.cursor()
    
    # Create the alerts table if it doesn't already exist
    cursor.execute('''CREATE TABLE IF NOT EXISTS alerts (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT,
                        alert_type TEXT
                    )''')
    
    conn.commit()
    conn.close()

def log_alert(alert_type):
    """Log an alert with the current timestamp."""
    conn = sqlite3.connect('posture_alerts.db')
    cursor = conn.cursor()
    
    # Insert an alert with the current timestamp
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    cursor.execute('INSERT INTO alerts (timestamp, alert_type) VALUES (?, ?)', 
                   (timestamp, alert_type))
    
    conn.commit()
    conn.close()

def get_alerts():
    """Retrieve all alerts from the database."""
    conn = sqlite3.connect('posture_alerts.db')
    cursor = conn.cursor()
    
    # Fetch all alerts from the database
    cursor.execute('SELECT timestamp, alert_type FROM alerts')
    alerts = cursor.fetchall()
    
    conn.close()
    
    # Return alerts as a list of dictionaries
    return [{'timestamp': row[0], 'alert_type': row[1]} for row in alerts]
