#!/bin/bash

# DevSecOps Chatroom - All-in-One Startup Script
# This script starts all services in parallel

set -e

echo "🚀 Starting DevSecOps Chatroom Services..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create a function to start services
start_service() {
    local service=$1
    local dir=$2
    local cmd=$3
    
    echo -e "${BLUE}Starting $service...${NC}"
    cd "$dir"
    $cmd &
    cd - > /dev/null
}

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start all services
echo -e "${BLUE}1. Starting Auth Service (Node.js)${NC}"
cd "$SCRIPT_DIR/auth-service"
npm install > /dev/null 2>&1
npm start &
AUTH_PID=$!
echo -e "${GREEN}✓ Auth Service started (PID: $AUTH_PID) on http://localhost:3001${NC}"
sleep 2

echo ""
echo -e "${BLUE}2. Starting File Service (Python)${NC}"
cd "$SCRIPT_DIR/file-service"
pip install -r requirements.txt > /dev/null 2>&1
python server.py &
FILE_PID=$!
echo -e "${GREEN}✓ File Service started (PID: $FILE_PID) on http://localhost:3002${NC}"
sleep 2

echo ""
echo -e "${BLUE}3. Starting WebSocket Server (Go)${NC}"
cd "$SCRIPT_DIR/backend"
go run *.go &
GO_PID=$!
echo -e "${GREEN}✓ WebSocket Server started (PID: $GO_PID) on http://localhost:8080${NC}"
sleep 2

echo ""
echo -e "${BLUE}4. Starting Frontend (React)${NC}"
cd "$SCRIPT_DIR/frontend"
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!
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

# Wait for all background processes
wait
