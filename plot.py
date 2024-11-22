import sqlite3
import matplotlib.pyplot as plt
import pandas as pd

def get_alerts():
    """Retrieve alerts from the database."""
    conn = sqlite3.connect('posture_alerts.db')
    cursor = conn.cursor()
    cursor.execute('SELECT timestamp, alert_type FROM alerts')
    rows = cursor.fetchall()
    conn.close()
    return rows

def plot_alerts(alerts):
    """Plot the posture alerts over the day."""
    df = pd.DataFrame(alerts, columns=['timestamp', 'alert_type'])
    df['timestamp'] = pd.to_datetime(df['timestamp'])

    # Extract the hour from the timestamp
    df['hour'] = df['timestamp'].dt.hour
    # Group by hour of the day and alert type
    hourly_alerts = df.groupby(['hour', 'alert_type']).size().unstack(fill_value=0)

    # Create the plot
    hourly_alerts.plot(kind='line', marker='o')
    plt.title('Posture Alerts Over the Day')
    plt.xlabel('Hour of Day')
    plt.ylabel('Count of Alerts')
    plt.xticks(range(0, 24))
    plt.legend(['Green (Good)', 'Red (Bad)', 'Blue (Lean Forward)', 'Black (Lean Back)'])
    plt.grid(True)
    plt.show()

if __name__ == "__main__":
    alerts = get_alerts()
    plot_alerts(alerts)
