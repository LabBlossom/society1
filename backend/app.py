from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any

from flask import Flask, jsonify, request, send_from_directory


BASE_DIR = Path(__file__).resolve().parents[1]
DB_PATH = BASE_DIR / "backend" / "community.db"


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with get_conn() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT NOT NULL,
              phone TEXT NOT NULL UNIQUE,
              password TEXT NOT NULL,
              contact TEXT DEFAULT '',
              address TEXT DEFAULT '',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS signups (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              phone TEXT NOT NULL,
              province_id TEXT NOT NULL,
              city_id TEXT NOT NULL,
              category_id TEXT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            """
        )


app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")
init_db()


@app.get("/")
def index() -> Any:
    return send_from_directory(BASE_DIR, "index.html")


@app.post("/api/register")
def register() -> Any:
    body = request.get_json(silent=True) or {}
    username = str(body.get("username", "")).strip()
    phone = str(body.get("phone", "")).strip()
    password = str(body.get("password", "")).strip()
    contact = str(body.get("contact", "")).strip()
    address = str(body.get("address", "")).strip()

    if not username or not phone or not password:
        return jsonify({"ok": False, "error": "missing_required_fields"}), 400

    try:
        with get_conn() as conn:
            conn.execute(
                """
                INSERT INTO users (username, phone, password, contact, address)
                VALUES (?, ?, ?, ?, ?)
                """,
                (username, phone, password, contact, address),
            )
    except sqlite3.IntegrityError:
        return jsonify({"ok": False, "error": "phone_exists"}), 409

    return jsonify({"ok": True})


@app.post("/api/login")
def login() -> Any:
    body = request.get_json(silent=True) or {}
    phone = str(body.get("phone", "")).strip()
    password = str(body.get("password", "")).strip()
    if not phone or not password:
        return jsonify({"ok": False, "error": "missing_phone_or_password"}), 400

    with get_conn() as conn:
        row = conn.execute(
            "SELECT username, phone, contact, address FROM users WHERE phone=? AND password=?",
            (phone, password),
        ).fetchone()

    if row is None:
        return jsonify({"ok": False, "error": "invalid_credentials"}), 401

    return jsonify({"ok": True, "user": dict(row)})


@app.post("/api/signup")
def signup() -> Any:
    body = request.get_json(silent=True) or {}
    phone = str(body.get("phone", "")).strip()
    province_id = str(body.get("provinceId", "")).strip()
    city_id = str(body.get("cityId", "")).strip()
    category_id = str(body.get("categoryId", "")).strip()
    if not phone or not province_id or not city_id or not category_id:
        return jsonify({"ok": False, "error": "missing_required_fields"}), 400

    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO signups (phone, province_id, city_id, category_id)
            VALUES (?, ?, ?, ?)
            """,
            (phone, province_id, city_id, category_id),
        )

    return jsonify({"ok": True})


@app.get("/api/stats")
def stats() -> Any:
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT province_id, city_id, category_id, COUNT(*) AS total
            FROM signups
            GROUP BY province_id, city_id, category_id
            ORDER BY total DESC
            """
        ).fetchall()
    return jsonify({"ok": True, "items": [dict(r) for r in rows]})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)

