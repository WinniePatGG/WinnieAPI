from flask import Flask
from routes.server_routes import routes as server_routes
from routes.minecraft_routes import minecraft_routes

app = Flask(__name__)

app.register_blueprint(server_routes)
app.register_blueprint(minecraft_routes)

if __name__ == '__main__':
    app.run(debug=True)