import pandas as pd
from database import get_alerts 
# Function to generate daily report
def daily_report(alerts):
    # Convert alerts to a DataFrame
    df = pd.DataFrame(alerts, columns=['timestamp', 'alert_type'])
    
    # Convert the 'timestamp' column to datetime format
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Group by date and alert type, counting occurrences
    daily_summary = df.groupby(df['timestamp'].dt.date)['alert_type'].value_counts().unstack(fill_value=0)
    
    # Print or save the daily report
    print(daily_summary)
    
    return daily_summary

# Example usage (when called independently):
if __name__ == '__main__':
    alerts = get_alerts()  # Assuming get_alerts() is available
    daily_summary = daily_report(alerts)
