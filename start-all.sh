#!/usr/bin/env bash

# DevSecOps Chatroom - All-in-One Startup Script
# This script starts all services in parallel and validates their startup.

if [ -z "${BASH_VERSION:-}" ]; then
    echo "Error: This script requires bash to run."
    echo "Run it with: bash \"$0\""
    exit 1
fi

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

port_in_use() {
    local port=$1
    if command -v ss >/dev/null 2>&1; then
        ss -ltn "sport = :$port" | awk 'NR > 1 { print }' | grep -q .
    elif command -v netstat >/dev/null 2>&1; then
        netstat -tln | awk '{ print $4 }' | grep -E ":$port$|\.$port$" >/dev/null
    elif command -v lsof >/dev/null 2>&1; then
        lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
    else
        return 1
    fi
}

assert_port_free() {
    local port=$1
    local service=$2
    if port_in_use "$port"; then
        echo -e "${BLUE}✗ $service port $port is already in use.${NC}"
        echo "Please stop the process listening on port $port or change the configured port."
        exit 1
    fi
}

check_process_alive() {
    local pid=$1
    local service=$2
    if ! kill -0 "$pid" >/dev/null 2>&1; then
        echo -e "${BLUE}✗ $service stopped unexpectedly.${NC}"
        exit 1
    fi
}

cleanup() {
    if [ "${#PIDS[@]}" -gt 0 ]; then
        echo -e "\n${BLUE}Stopping services...${NC}"
        kill "${PIDS[@]}" >/dev/null 2>&1 || true
    fi
}
trap cleanup EXIT

PIDS=()

echo "🚀 Starting DevSecOps Chatroom Services..."
echo ""

# Auth Service
assert_port_free 3001 "Auth Service"
echo -e "${BLUE}1. Starting Auth Service (Node.js)${NC}"
pushd "$SCRIPT_DIR/auth-service" >/dev/null
npm install
npm start &
AUTH_PID=$!
PIDS+=("$AUTH_PID")
popd >/dev/null
sleep 2
check_process_alive "$AUTH_PID" "Auth Service"
echo -e "${GREEN}✓ Auth Service started (PID: $AUTH_PID) on http://localhost:3001${NC}"

echo ""

# File Service
assert_port_free 3002 "File Service"
echo -e "${BLUE}2. Starting File Service (Python)${NC}"
PYTHON_BIN="$SCRIPT_DIR/file-service/env/bin/python"
if [ ! -x "$PYTHON_BIN" ]; then
    PYTHON_BIN=python3
fi
pushd "$SCRIPT_DIR/file-service" >/dev/null
"$PYTHON_BIN" -m pip install -r requirements.txt
"$PYTHON_BIN" server.py &
FILE_PID=$!
PIDS+=("$FILE_PID")
popd >/dev/null
sleep 2
check_process_alive "$FILE_PID" "File Service"
echo -e "${GREEN}✓ File Service started (PID: $FILE_PID) on http://localhost:3002${NC}"

echo ""

# WebSocket Server
assert_port_free 8080 "WebSocket Server"
echo -e "${BLUE}3. Starting WebSocket Server (Go)${NC}"
pushd "$SCRIPT_DIR/backend" >/dev/null
go run *.go &
GO_PID=$!
PIDS+=("$GO_PID")
popd >/dev/null
sleep 2
check_process_alive "$GO_PID" "WebSocket Server"
echo -e "${GREEN}✓ WebSocket Server started (PID: $GO_PID) on http://localhost:8080${NC}"

echo ""

# Frontend
assert_port_free 5173 "Frontend"
echo -e "${BLUE}4. Starting Frontend (React)${NC}"
pushd "$SCRIPT_DIR/frontend" >/dev/null
npm install
npm run dev &
FRONTEND_PID=$!
PIDS+=("$FRONTEND_PID")
popd >/dev/null
sleep 2
check_process_alive "$FRONTEND_PID" "Frontend"
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID) on http://localhost:5173${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}All services are running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Services:"
echo "  Auth Service:      http://localhost:3001"
echo "  File Service:      http://localhost:3002"
echo "  WebSocket Server:  http://localhost:8080"
echo "  Frontend:          http://localhost:5173"
echo ""
echo "Process IDs:"
echo "  Auth Service:      $AUTH_PID"
echo "  File Service:      $FILE_PID"
echo "  Go Backend:        $GO_PID"
echo "  Frontend:          $FRONTEND_PID"
echo ""
echo "To stop all services, run:"
echo "  kill $AUTH_PID $FILE_PID $GO_PID $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop"

echo ""

# Wait for all background processes
wait
