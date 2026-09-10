#!/usr/bin/env bash

# AgriLink Prototype 2 Startup Script
# Team APEX {SYNTAX} @ MGIT.ac.in

PORT=${1:-8080}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "============================================================"
echo " Starting AgriLink Mandi Price Portal..."
echo " Team APEX {SYNTAX} @ MGIT.ac.in"
echo " Languages: Telugu, Tamil, Marathi, English, Punjabi, Hindi"
echo " Crops: Chilli, Paddy, Cotton, Tomato, Wheat"
echo " Source: Government of India (Agmarknet / data.gov.in)"
echo "============================================================"

python3 "${SCRIPT_DIR}/server.py" "${PORT}"
