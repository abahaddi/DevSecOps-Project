# Quick Start Guide - DevSecOps Chatroom

This guide will help you get all three microservices and the frontend running.

## Prerequisites

Ensure you have installed:

- Node.js 18+ (`node --version`)
- Go 1.26+ (`go version`)
- Python 3.8+ (`python3 --version`)
- npm (`npm --version`)

## Option 1: Start Services Individually (Recommended for Development)

Open 4 terminal windows and run these commands in parallel:

### Terminal 1 - Auth Service (Node.js)

```bash
cd auth-service
npm install
npm start
```

✓ Should output: "Auth service running on http://localhost:3001"

### Terminal 2 - File Service (Python)

```bash
cd file-service
pip install -r requirements.txt
python3 server.py
```

✓ Should output: "File Service running on http://localhost:3002"

### Terminal 3 - WebSocket Server (Go)

```bash
cd backend
go run *.go
```

✓ Should output: "WebSocket server running on http://localhost:8080"

### Terminal 4 - Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

✓ Should output: "Local: http://localhost:5173"

## Option 2: Start All Services at Once

```bash
chmod +x start-all.sh
./start-all.sh
```

This script will start all services in the background.

## Testing the Application

1. **Open Frontend**: Navigate to http://localhost:5173

2. **Create Account**:
      - Click "Sign Up" tab
      - Enter username (min 3 chars), email, password (min 6 chars)
      - Click "Sign Up"

3. **Login**:
      - Enter username and password
      - Click "Login"

4. **Send Messages**:
      - You should see "CHATROOM" header with green dot (connected)
      - Type a message and press Enter or click Send
      - Open another browser window/incognito and login with a different account
      - Send messages between accounts

5. **Upload Files**:
      - Click the "📎 Share File" button
      - Select a file (PDF, image, document, etc.)
      - View threat analysis results
      - If threat level is not "high", click "Share File"
      - The file appears in chat with download link

## API Testing

### Auth Service

```bash
# Signup
curl -X POST http://localhost:3001/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Health Check
curl http://localhost:3001/health
```

### File Service

```bash
# Upload a file
curl -X POST http://localhost:3002/upload \
  -F "file=@/path/to/file.pdf"

# List files
curl http://localhost:3002/files

# Health Check
curl http://localhost:3002/health
```

### WebSocket Server

```bash
# Health Check
curl http://localhost:8080/health
```

## Troubleshooting

### Port Already in Use

If a port is already in use, you can either:

- Kill the process using that port
- Change the port in the service files

**Find process using port:**

```bash
lsof -i :3001  # Auth Service
lsof -i :3002  # File Service
lsof -i :8080  # WebSocket Server
lsof -i :5173  # Frontend
```

**Kill process:**

```bash
kill -9 <PID>
```

### Python Dependencies Not Installing

```bash
# Use pip3 instead
cd file-service
pip3 install -r requirements.txt
python3 server.py
```

### Frontend Not Loading

```bash
# Clear npm cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### WebSocket Connection Issues

- Ensure Go service is running on port 8080
- Check browser console for errors
- Verify CORS is enabled (it is by default)

## Next Steps

### Development

- Frontend: `npm run lint` - Run ESLint
- Frontend: `npm run build` - Build for production
- Python: Add more sophisticated threat detection (YARA, ClamAV)
- Node.js: Integrate with PostgreSQL for persistent user data

### Production

- Environment variables for secrets (JWT_SECRET, etc.)
- Database setup (PostgreSQL recommended)
- HTTPS/WSS configuration
- Rate limiting and authentication middleware
- File encryption and secure storage
- Comprehensive logging and monitoring

## Service Architecture

```
┌─────────────────┐
│   React App     │ (localhost:5173)
│   (Frontend)    │
└────────┬────────┘
         │
    ┌────┴────────────────────┐
    │                         │
    v                         v
┌─────────────┐       ┌──────────────┐
│  Auth Svc   │       │ File Service │
│ (Node.js)   │       │  (Python)    │
│ :3001       │       │  :3002       │
└──────┬──────┘       └──────┬───────┘
       │                     │
       └──────────┬──────────┘
                  │
                  v
         ┌─────────────────┐
         │  WebSocket Svc  │
         │     (Go)        │
         │     :8080       │
         └─────────────────┘
```

## File Structure

```
devsecops/
├── auth-service/        # Node.js signup/login service
├── file-service/        # Python file sharing service
├── backend/             # Go WebSocket chat server
├── frontend/            # React web interface
├── start-all.sh         # Script to start all services
└── README.md            # Full documentation
```

Happy chatting! 🚀
