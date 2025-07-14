import sqlite3
from datetime import datetime

def init_db():
    conn = sqlite3.connect('server_stats.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS server_status
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  server_ip TEXT,
                  online INTEGER,
                  player_count INTEGER,
                  latency REAL,
                  timestamp DATETIME)''')
    conn.commit()
    conn.close()

def log_status(server_ip, status):
    conn = sqlite3.connect('server_stats.db')
    c = conn.cursor()
    c.execute('''INSERT INTO server_status 
                 (server_ip, online, player_count, latency, timestamp)
                 VALUES (?, ?, ?, ?, ?)''',
              (server_ip, status['online'], status.get('players', 0), 
               status.get('latency', 0), datetime.now()))
    conn.commit()
    conn.close()