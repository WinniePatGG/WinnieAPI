# Minecraft Server Monitor

A web application to check the status of Minecraft servers.

## Public Access
- https://api.winniepat.de
- https://api.winniepat.de/api/status/-ip-

## Features
- Fast status checking
- Player count and list visualization
- Server version and MOTD display
- Latency measurement
- Responsive design

## Installation

### Linux
1. Clone this repository
2. Setup venv: `python -m venv .venv`
3. Install requirements: `.venv/bin/pip install -r requirements.txt`
4. Run the application: `.venv/bin/python app.py`
5. Access at `http://localhost:5000`

### Windows
1. Clone this repository
2. Setup venv: `python -m venv .venv`
3. Install requirements: `.venv/Scripts/pip install -r requirements.txt`
4. Run the application: `.venv/Scripts/python app.py`
5. Access at `http://localhost:5000`

## Usage
- Enter a server address (e.g., `lunaris-mc.de`)
- Click "Check Server" to view status
- Direct access with `http://localhost:5000/api/quick-status/-ip-`