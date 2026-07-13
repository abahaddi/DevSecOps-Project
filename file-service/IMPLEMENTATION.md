# Python File Service - Implementation Details

## Architecture

The Python file service is built with Flask and provides a REST API for file uploads, threat analysis, and download management.

## Core Features

### 1. File Upload & Validation

- **Endpoint:** `POST /upload`
- **Allowed Extensions:** txt, pdf, png, jpg, jpeg, gif, doc, docx, xls, xlsx, zip
- **Max File Size:** 50MB
- **Returns:**
     - File URL
     - SHA256 hash for integrity verification
     - Threat analysis results
     - Upload timestamp

### 2. Threat Analysis Engine

Analyzes files for security threats:

#### File Extension Threats

- Detects suspicious double extensions (e.g., `file.txt.exe`)
- Blocks dangerous executable formats:
     - `exe`, `bat`, `cmd`, `sh`, `scr`, `vbs`, `ps1`, `app`, `msi`, `dll`
- Marks these as **HIGH threat**

#### Content-Based Detection

For text-based files (txt, pdf, doc, docx):

- Scans for malware-related keywords:
     - `powershell`, `cmd.exe`, `regsvr32`, `wscript`
     - `rundll32`, `mshta`, `certutil`, `bitsadmin`
- Marks presence as **MEDIUM threat**
- Only reads first 50KB to avoid performance issues

#### Size Warnings

- Files >10MB trigger warnings
- Added to threat analysis but not blocking

### 3. File Storage

- Files stored in `uploads/` directory
- Named with timestamp prefix to avoid collisions
- Example: `20260517_123456_document.pdf`
- Original filename preserved for display

### 4. Download Management

- **Endpoint:** `GET /download/<filename>`
- Secure file delivery
- Prevents directory traversal attacks (uses `secure_filename`)
- Returns file with attachment headers

### 5. File Listing

- **Endpoint:** `GET /files`
- Lists all uploaded files
- Returns metadata: filename, size, download URL

### 6. File Analysis (Non-Upload)

- **Endpoint:** `POST /analyze`
- Analyzes without storing
- Useful for pre-upload checking
- Temporary file cleanup

## Threat Level Classification

### SAFE 🟢

- No issues or warnings detected
- File type is allowed
- No suspicious content found
- No excessive file size

### MEDIUM 🟡

- Contains suspicious keywords (malware patterns)
- File size is large (>10MB)
- Other warnings detected
- Still allowed to share

### HIGH 🔴

- Double file extension with executable
- Dangerous file type (exe, dll, etc.)
- Blocks sharing (frontend enforces)

## API Response Format

### Successful Upload

```json
{
	"success": true,
	"filename": "document.pdf",
	"stored_name": "20260517_123456_document.pdf",
	"url": "http://localhost:3002/download/20260517_123456_document.pdf",
	"file_hash": "abc123def456...",
	"file_size": 102400,
	"upload_time": "2026-05-17T12:34:56.789Z",
	"threat_analysis": {
		"level": "safe",
		"issues": [],
		"warnings": []
	}
}
```

### Threat Analysis Details

```json
{
	"threat_analysis": {
		"level": "safe|medium|high",
		"issues": [
			"Suspicious double file extension detected",
			"Executable files are not allowed"
		],
		"warnings": [
			"Large file detected (15.42MB)",
			"Potentially suspicious keyword found: powershell"
		]
	}
}
```

## Error Handling

### Validation Errors

- Missing file: 400 Bad Request
- Invalid file type: 400 + allowed_types list
- File too large: 400 + max size info

### Server Errors

- Upload/analysis failures: 500 with error message
- File not found on download: 404

## Security Features

1. **File Type Whitelist**
      - Only approved file types allowed
      - Prevents executable uploads

2. **Filename Sanitization**
      - Uses `secure_filename()` to prevent path traversal
      - Removes dangerous characters

3. **Size Limits**
      - 50MB max prevents DoS attacks
      - Checked before full file upload

4. **Threat Scanning**
      - Pattern-based malware detection
      - Keyword scanning in documents
      - Suspicious extension detection

5. **File Integrity**
      - SHA256 hash provided
      - Allows clients to verify downloads

## Configuration

Edit `server.py` to customize:

```python
UPLOAD_FOLDER = 'uploads'           # Storage directory
ALLOWED_EXTENSIONS = {...}          # File types allowed
MAX_FILE_SIZE = 50 * 1024 * 1024    # 50MB limit
PORT = 3002                         # Service port
```

## Dependencies

```
flask==3.0.0              # Web framework
flask-cors==4.0.0         # CORS support
python-magic==0.4.27      # Mime type detection (optional)
```

## Performance Considerations

1. **File Reading**
      - Only first 50KB read for threat analysis
      - Prevents memory issues with large files

2. **Content Scanning**
      - Only for text-based formats
      - Binary files skip content analysis

3. **Disk Space**
      - Monitor `uploads/` directory size
      - Consider retention policies

## Future Enhancements

### Advanced Threat Detection

- **YARA Rules**: Behavioral pattern detection
- **ClamAV Integration**: Antivirus scanning
- **Magic Numbers**: Verify actual file type vs extension
- **Signature Database**: Update threat signatures regularly

### File Management

- **Expiration**: Auto-delete files after N days
- **Virus Scanning**: Real-time scanning before serving
- **Encryption**: Encrypt stored files
- **Backup**: Redundant storage

### Analytics

- **Upload Statistics**: Track file types, sizes
- **Threat Patterns**: Identify attack trends
- **Usage Reports**: User download patterns

### Compliance

- **Audit Logging**: Log all uploads/downloads
- **Access Control**: Restrict downloads by user
- **Data Retention**: GDPR/CCPA compliance
- **Encryption at Rest**: Encrypted storage

## Testing

### Unit Tests

```python
def test_file_upload():
    response = client.post('/upload', data={'file': ...})
    assert response.status_code == 201
    assert 'threat_analysis' in response.json

def test_threat_detection():
    # Test suspicious extensions
    assert threat_level_high('malware.txt.exe')
    # Test keywords
    assert threat_level_medium('document_with_powershell_code.pdf')
```

### Integration Tests

```bash
# Test upload
curl -X POST http://localhost:3002/upload -F "file=@test.pdf"

# Test list
curl http://localhost:3002/files

# Test download
curl -O http://localhost:3002/download/20260517_123456_test.pdf
```

## Deployment

### Docker

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY server.py .
EXPOSE 3002
CMD ["python", "server.py"]
```

### Environment Variables

```bash
FLASK_ENV=production
FLASK_DEBUG=0
UPLOAD_FOLDER=/var/data/uploads
MAX_FILE_SIZE=104857600  # 100MB
PORT=3002
```

## Monitoring

### Health Check

```bash
curl http://localhost:3002/health
```

### Logs

- Check Flask console output
- Add logging middleware for requests
- Monitor upload/download rates

### Storage

```bash
du -sh uploads/           # Check folder size
find uploads/ -type f | wc -l  # Count files
```

## Troubleshooting

### Files Not Being Saved

- Check `uploads/` directory exists
- Check write permissions: `ls -la uploads/`
- Check disk space: `df -h`

### Threat Analysis Not Working

- Check file encoding (UTF-8 for text files)
- Verify keyword list in code
- Check file size limits

### CORS Issues

- Ensure `flask_cors` is installed
- Verify `CORS(app)` is called
- Check browser console for headers
