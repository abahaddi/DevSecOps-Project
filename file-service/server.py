import os
import json
import hashlib
import mimetypes
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'xls', 'xlsx', 'zip'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
PORT = 3002

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_file_hash(filepath):
    """Generate SHA256 hash of file for integrity check"""
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def analyze_file_for_threats(filepath, filename):
    """
    Analyze file for potential threats.
    Returns threat level and details.
    """
    threats = {
        'level': 'safe',
        'issues': [],
        'warnings': []
    }
    
    try:
        file_size = os.path.getsize(filepath)
        file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        
        # Check file size
        if file_size > 10 * 1024 * 1024:  # 10MB
            threats['warnings'].append(f"Large file detected ({file_size / 1024 / 1024:.2f}MB)")
        
        # Check for suspicious extensions when double-extending (e.g., file.txt.exe)
        parts = filename.split('.')
        if len(parts) > 2:
            if parts[-1] in {'exe', 'bat', 'cmd', 'sh', 'scr', 'vbs', 'js', 'ps1'}:
                threats['level'] = 'high'
                threats['issues'].append("Suspicious double file extension detected")
        
        # Check for executable files in restricted format
        dangerous_exts = {'exe', 'bat', 'cmd', 'sh', 'scr', 'vbs', 'ps1', 'app', 'msi', 'dll'}
        if file_ext in dangerous_exts:
            threats['level'] = 'high'
            threats['issues'].append("Executable files are not allowed")
        
        # Check for potential malware patterns in text files
        if file_ext in {'txt', 'pdf', 'doc', 'docx'}:
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read(50000)  # Read first 50KB
                    
                    malware_keywords = [
                        'powershell', 'cmd.exe', 'regsvr32', 'wscript',
                        'rundll32', 'mshta', 'certutil', 'bitsadmin'
                    ]
                    
                    for keyword in malware_keywords:
                        if keyword.lower() in content.lower():
                            threats['level'] = 'medium'
                            threats['warnings'].append(f"Potentially suspicious keyword found: {keyword}")
            except Exception:
                pass
        
        # If no issues, mark as safe
        if threats['level'] == 'safe' and not threats['warnings']:
            threats['details'] = 'File passed all security checks'
        
    except Exception as e:
        threats['warnings'].append(f"Could not complete full analysis: {str(e)}")
    
    return threats

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'OK'})

@app.route('/upload', methods=['POST'])
def upload_file():
    """Upload and analyze a file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'error': 'File type not allowed',
                'allowed_types': list(ALLOWED_EXTENSIONS)
            }), 400
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_length = file.tell()
        if file_length > MAX_FILE_SIZE:
            return jsonify({'error': f'File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB'}), 400
        
        file.seek(0)
        
        # Save file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        filename = timestamp + filename
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        file.save(filepath)
        
        # Analyze file for threats
        threats = analyze_file_for_threats(filepath, file.filename)
        
        # Generate file hash
        file_hash = generate_file_hash(filepath)
        
        # Generate download URL
        download_url = f"http://localhost:{PORT}/download/{filename}"
        
        return jsonify({
            'success': True,
            'filename': file.filename,
            'stored_name': filename,
            'url': download_url,
            'file_hash': file_hash,
            'file_size': file_length,
            'upload_time': datetime.now().isoformat(),
            'threat_analysis': threats
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    """Download a shared file"""
    try:
        filepath = os.path.join(UPLOAD_FOLDER, secure_filename(filename))
        
        if not os.path.exists(filepath):
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(
            filepath,
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        return jsonify({'error': f'Download failed: {str(e)}'}), 500

@app.route('/files', methods=['GET'])
def list_files():
    """List all uploaded files"""
    try:
        files = []
        if os.path.exists(UPLOAD_FOLDER):
            for filename in os.listdir(UPLOAD_FOLDER):
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                if os.path.isfile(filepath):
                    file_size = os.path.getsize(filepath)
                    files.append({
                        'filename': filename,
                        'size': file_size,
                        'url': f"http://localhost:{PORT}/download/{filename}"
                    })
        return jsonify({'files': files}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to list files: {str(e)}'}), 500

@app.route('/analyze', methods=['POST'])
def analyze_file_endpoint():
    """Analyze an uploaded file for threats"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        # Save temporarily
        filename = secure_filename(file.filename)
        temp_path = os.path.join(UPLOAD_FOLDER, f"temp_{filename}")
        file.save(temp_path)
        
        try:
            # Analyze
            threats = analyze_file_for_threats(temp_path, file.filename)
            file_size = os.path.getsize(temp_path)
            
            return jsonify({
                'filename': file.filename,
                'file_size': file_size,
                'threat_analysis': threats
            }), 200
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

if __name__ == '__main__':
    print(f'File Service running on http://localhost:{PORT}')
    app.run(debug=True, port=PORT, host='0.0.0.0')
