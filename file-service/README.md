# File Service

A Python microservice for secure file sharing with threat analysis.

## Features

- File upload with validation
- Threat analysis and detection
- File integrity verification (SHA256)
- Secure file storage
- Download management
- CORS enabled for cross-origin requests

## API Endpoints

### POST /upload

Upload and analyze a file

- Accepts: multipart/form-data with 'file' field
- Returns: File URL, threat analysis, and file hash
- Max file size: 50MB
- Allowed types: txt, pdf, png, jpg, jpeg, gif, doc, docx, xls, xlsx, zip

**Example Response:**

```json
{
	"success": true,
	"filename": "document.pdf",
	"stored_name": "20260517_123456_document.pdf",
	"url": "http://localhost:3002/download/20260517_123456_document.pdf",
	"file_hash": "abc123...",
	"file_size": 102400,
	"threat_analysis": {
		"level": "safe",
		"issues": [],
		"warnings": []
	}
}
```

### GET /download/<filename>

Download a shared file

- Returns: File binary data

### GET /files

List all uploaded files

- Returns: Array of files with metadata

### POST /analyze

Analyze a file without uploading

- Accepts: multipart/form-data with 'file' field
- Returns: Threat analysis only

### GET /health

Health check endpoint

## Threat Levels

- **safe**: No threats detected
- **medium**: Suspicious patterns or keywords found
- **high**: Dangerous file type or suspicious extensions

## Running the Service

```bash
pip install -r requirements.txt
python server.py
```

The service runs on `http://localhost:3002`

## Requirements

- Python 3.8+
- Flask
- Flask-CORS
- python-magic (optional, for mime type detection)
