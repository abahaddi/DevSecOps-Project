# DevSecOps Chatroom - Full Stack Setup

A simple chatroom project with React frontend and three microservices architecture:

1. **Go WebSocket Server** - Handles real-time chat connections
2. **Node.js Auth Service** - Manages user signup and login
3. **Python File Service** - File sharing with threat analysis

## Project Structure

```
devsecops/
├── backend/              # Go WebSocket server
│   ├── client.go
│   ├── hub.go
│   ├── main.go
│   └── go.mod
├── auth-service/         # Node.js authentication microservice
│   ├── server.js
│   ├── package.json
│   └── README.md
├── file-service/         # Python file sharing microservice
│   ├── server.py
│   ├── requirements.txt
│   └── README.md
└── frontend/             # React web interface
    ├── src/
    │   ├── App.tsx       # Main app with auth routing
    │   ├── Auth.tsx      # Login/signup component
    │   ├── Chat.tsx      # Chat interface component
    │   ├── FileShare.tsx # File upload component
    │   ├── main.tsx
    │   └── ...
    ├── package.json
    └── ...
```

## Quick Start

### Prerequisites

- Node.js v18+
- Go 1.26+
- Python 3.8+
- npm or yarn

### 1. Start Auth Service

```bash
cd auth-service
npm install
npm start
```

Service runs on: `http://localhost:3001`

### 2. Start File Service

```bash
cd file-service
pip install -r requirements.txt
python server.py
```

Service runs on: `http://localhost:3002`

### 3. Start Go WebSocket Server

```bash
cd backend
go run *.go
```

Server runs on: `http://localhost:8080`

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

## Docker

To build and run all services with Docker Compose (recommended for sharing):

```bash
docker-compose build
docker-compose up
```

Services will be available on:

- Auth: http://localhost:3001
- File Service: http://localhost:3002
- WebSocket Backend: http://localhost:8080
- Frontend: http://localhost:5173 (served through nginx on container port 80 mapped to 5173)

## Features

### Authentication (Node.js)

- User signup with email and password
- User login
- JWT token generation (24-hour expiration)
- Password hashing with bcryptjs

### Chat (Go + React)

- Real-time WebSocket connections
- Multi-user messaging
- Connection status indicator
- Responsive UI

### File Sharing (Python)

- File upload with validation
- Automatic threat analysis
- File integrity verification (SHA256)
- Download management
- Threat levels: Safe, Medium, High

## API Documentation

### Auth Service Endpoints

**POST /signup**

```json
{
	"username": "john",
	"email": "john@example.com",
	"password": "password123"
}
```

**POST /login**

```json
{
	"username": "john",
	"password": "password123"
}
```

**POST /verify**

```json
{
	"token": "jwt_token_here"
}
```

**GET /health**
Health check endpoint

### WebSocket Server

**WS /ws**

- Connect to WebSocket at `ws://localhost:8080/ws`
- Broadcasts messages to all connected clients
- Health check at `GET /health`

### File Service Endpoints

**POST /upload**

- Upload a file with threat analysis
- Returns: File URL, threat level, and analysis details

**GET /download/<filename>**

- Download a shared file

**GET /files**

- List all uploaded files

**POST /analyze**

- Analyze a file for threats without uploading

**GET /health**

- Health check endpoint

## Frontend Features

### Auth Component

- Toggle between login and signup modes
- Form validation
- Error handling
- Stores JWT token in localStorage

### Chat Component

- Shows username and connection status
- Message history
- Real-time messaging
- Logout functionality
- Responsive message bubbles (different styling for sent/received)

### File Share Component

- File upload with validation
- Real-time threat analysis
- Visual threat indicators (color-coded)
- Download links in chat
- File metadata display

## Threat Analysis

The Python service analyzes files for:

- Suspicious double extensions (e.g., file.txt.exe)
- Dangerous executable formats
- Malware-related keywords in documents
- File size warnings
- Overall threat level classification

## Development Notes

- The auth service uses in-memory storage (for demo). Use a database for production.
- JWT secret should be environment variables in production.
- CORS is enabled on all services for frontend requests.
- WebSocket uses gorilla/websocket library.
- Frontend uses React 19+ with TypeScript.
- File uploads are stored in `file-service/uploads/` directory.

## Future Enhancements

- [ ] Database integration (PostgreSQL)
- [ ] User profiles and avatars
- [ ] Message reactions and threading
- [ ] Advanced threat scanning (YARA, ClamAV)
- [ ] Typing indicators
- [ ] User presence/online status
- [ ] Message persistence
- [ ] File encryption
- [ ] Rate limiting and usage quotas
