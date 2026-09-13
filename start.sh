#!/bin/bash

cd backend
source .venv/bin/activate
uvicorn main:app --reload &

cd ../frontend
python3 -m http.server 5500
