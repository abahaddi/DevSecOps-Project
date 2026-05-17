# Auth Service

A simple authentication microservice for the chatroom application.

## Features

- User signup with validation
- User login with password hashing (bcryptjs)
- JWT token generation and verification
- CORS enabled for cross-origin requests

## API Endpoints

### POST /signup

Register a new user

```json
{
	"username": "john",
	"email": "john@example.com",
	"password": "password123"
}
```

### POST /login

Login with username and password

```json
{
	"username": "john",
	"password": "password123"
}
```

### POST /verify

Verify JWT token

```json
{
	"token": "jwt_token_here"
}
```

### GET /health

Health check endpoint

## Running the Service

```bash
npm install
npm start
```

The service runs on `http://localhost:3001`

## Requirements

- Node.js v18+
