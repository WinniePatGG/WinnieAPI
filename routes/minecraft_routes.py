from flask import Blueprint, jsonify, Response, send_file
import requests
from io import BytesIO
from PIL import Image
import base64
import json

minecraft_routes = Blueprint('minecraft_routes', __name__)

ASCII_CHARS = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,^`'. "

def get_uuid(username):
    r = requests.get(f"https://api.mojang.com/users/profiles/minecraft/{username}")
    if r.status_code != 200:
        return None
    return r.json()["id"]

def get_avatar(uuid):
    url = f"https://crafatar.com/avatars/{uuid}?size=512&default=MHF_Steve&overlay"
    r = requests.get(url)
    if r.status_code != 200:
        return None
    return Image.open(BytesIO(r.content))

def pixel_to_ascii(image):
    image = image.convert("L")
    pixels = image.getdata()
    ascii_str = ""
    for pixel in pixels:
        ascii_str += ASCII_CHARS[int(pixel / 255 * (len(ASCII_CHARS)-1))]
    return ascii_str

def format_ascii(ascii_str, width):
    lines = [ascii_str[i:i+width] for i in range(0, len(ascii_str), width)]
    return "\n".join(lines)

@minecraft_routes.route("/api/v1/ascii/face/<username>")
def avatar_to_ascii(username):
    uuid = get_uuid(username)
    if not uuid:
        return jsonify({"error": "Username not found"}), 404

    avatar = get_avatar(uuid)
    if not avatar:
        return jsonify({"error": "Avatar not found"}), 404

    width = 64
    height = int(width * 0.5)
    avatar = avatar.resize((width, height))

    ascii_str = pixel_to_ascii(avatar)
    formatted = format_ascii(ascii_str, width=width)

    return Response(formatted, mimetype="text/plain")

@minecraft_routes.route("/api/v1/ascii/fullskin/<username>")
def fullskin_to_ascii(username):
    uuid = get_uuid(username)
    if not uuid:
        return jsonify({"error": "Username not found"}), 404

    url = f"https://crafatar.com/renders/body/{uuid}?scale=10"
    r = requests.get(url)
    if r.status_code != 200:
        return jsonify({"error": "Full skin render not found"}), 404

    skin = Image.open(BytesIO(r.content))

    width = 64
    height = int(skin.height / skin.width * width * 0.5)
    skin = skin.resize((width, height))

    ascii_str = pixel_to_ascii(skin)
    formatted = format_ascii(ascii_str, width=width)

    return Response(formatted, mimetype="text/plain")

@minecraft_routes.route("/api/v1/uuid/<username>")
def fetch_uuid(username):
    uuid = get_uuid(username)
    if not uuid:
        return jsonify({"error": "Username not found"}), 404
    return jsonify({"username": username, "uuid": uuid})

@minecraft_routes.route("/api/v1/skinurl/<username>")
def skin_url(username):
    uuid = get_uuid(username)
    if not uuid:
        return jsonify({"error": "Username not found"}), 404

    r = requests.get(f"https://sessionserver.mojang.com/session/minecraft/profile/{uuid}")
    if r.status_code != 200:
        return jsonify({"error": "UUID not found"}), 404

    data = r.json()
    props = data["properties"][0]["value"]
    decoded = base64.b64decode(props).decode()
    url = json.loads(decoded)["textures"]["SKIN"]["url"]
    return jsonify({"username": username, "skin_url": url})

@minecraft_routes.route("/api/v1/cape/<username>")
def player_cape(username):
    uuid = get_uuid(username)
    if not uuid:
        return jsonify({"error": "Username not found"}), 404

    url = f"https://crafatar.com/capes/{uuid}"
    r = requests.get(url)
    if r.status_code != 200:
        return jsonify({"error": "Cape not found"}), 404

    return send_file(BytesIO(r.content), mimetype="image/png")