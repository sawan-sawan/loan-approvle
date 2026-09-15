#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PORT=8000
FRONTEND_PORT=5500
BACKEND_PID=""

port_in_use() {
  lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
}

cleanup() {
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

if port_in_use "$BACKEND_PORT"; then
  echo "Backend port $BACKEND_PORT is already in use."
  echo "Stop the existing backend first, or open http://127.0.0.1:$BACKEND_PORT if it is already running."
  exit 1
fi

if port_in_use "$FRONTEND_PORT"; then
  echo "Frontend port $FRONTEND_PORT is already in use."
  echo "Stop the existing frontend first, or open http://127.0.0.1:$FRONTEND_PORT if it is already running."
  exit 1
fi

if [ ! -d "$ROOT_DIR/backend/.venv" ]; then
  echo "Creating backend virtual environment..."
  python3 -m venv "$ROOT_DIR/backend/.venv"
fi

if [ ! -f "$ROOT_DIR/backend/model/loan_model.pkl" ]; then
  echo "Training loan model..."
  "$ROOT_DIR/backend/.venv/bin/python" "$ROOT_DIR/backend/train_model.py"
fi

echo "Starting backend on http://127.0.0.1:$BACKEND_PORT"
cd "$ROOT_DIR/backend"
source .venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port "$BACKEND_PORT" &
BACKEND_PID=$!

echo "Starting frontend on http://127.0.0.1:$FRONTEND_PORT"
cd "$ROOT_DIR/frontend"
python3 -m http.server "$FRONTEND_PORT"
