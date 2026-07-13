# Frontend Changes - File Sharing Integration

## New Components

### 1. FileShare.tsx

A component that handles file uploads with threat analysis display.

**Features:**

- File selection and upload
- Real-time threat analysis feedback
- Modal display of threat details
- Color-coded threat levels (Safe, Medium, High)
- Blocks high-risk files from being shared
- Allows medium and low-risk files to be shared anyway

**Props:**

- `onFileShared: (fileUrl: string, filename: string, threatLevel: string) => void`
     - Called when a file is ready to be shared

**Usage:**

```tsx
<FileShare onFileShared={handleFileShared} />
```

## Updated Components

### 1. Chat.tsx

Enhanced to support file message types.

**Changes:**

- Added `FileShare` import
- Updated `Message` interface to include file metadata:
     - `type?: 'text' | 'file'`
     - `filename?: string`
     - `threatLevel?: string`
- Added `handleFileShared` function
- Updated message rendering to handle file messages differently
- File messages display with:
     - File icon (📎)
     - Filename
     - Threat level badge (color-coded)
     - Download button
- Added `getThreatColor()` helper function
- New styles for file message bubbles

**Message Types:**

```tsx
interface Message {
	id: number;
	text: string; // message content or file URL
	self: boolean; // true if sent by current user
	type?: "text" | "file"; // new: message type
	filename?: string; // new: for files
	threatLevel?: string; // new: threat analysis result
}
```

**Threat Colors:**

- 🟢 `#4ade80` - Safe
- 🟡 `#f59e0b` - Medium
- 🔴 `#ef4444` - High

### 2. App.tsx

Updated to handle authentication state.

**Changes:**

- Manages `token` and `username` state
- Stores/retrieves auth data from localStorage
- Routes between Auth and Chat components
- Persists session across page refreshes

## File Message Format

When a file is shared, a message is sent to the WebSocket in this format:

```
📎 [File] <filename> (THREAT_LEVEL) - <download_url>
```

Example:

```
📎 [File] document.pdf (SAFE) - http://localhost:3002/download/20260517_123456_document.pdf
```

## Styling

### FileShare Component

- Modal overlay for threat analysis
- Styled input field with file upload trigger
- Color-coded threat analysis display
- Action buttons (Close, Share File)

### File Message Bubble

- Gradient purple background for visual distinction
- Horizontal layout: Icon | Filename + Threat | Download
- Responsive on desktop and mobile
- Special styling for threat level badges

## Integration Flow

1. User clicks "📎 Share File"
2. File selection dialog opens
3. File is uploaded to Python service
4. Python service analyzes threat
5. Modal shows threat analysis results
6. If safe/medium:
      - User clicks "Share File"
      - WebSocket message sent to all users
      - File message appears in chat with download link
7. If high threat:
      - File is rejected
      - Error message shown
      - User can close and try another file

## Authentication Integration

Files are shared through the chat after authentication:

1. User logs in via Auth component
2. JWT token stored in localStorage
3. Chat component receives username
4. FileShare component becomes available
5. Uploaded files can be shared in chat messages

## Dependencies

No new dependencies were added to the frontend.
The file upload uses native HTML5 File API and `fetch`.

## Customization

### Change Max File Size

In FileShare.tsx, the size limit is set on the server side (50MB).
To change client-side validation, modify the FileShare component.

### Change Allowed File Types

In FileShare.tsx, modify the `ALLOWED_EXTENSIONS` check if needed.

### Change Threat Colors

In Chat.tsx, modify the `getThreatColor()` function.

### Change Server URL

Update `FILE_SERVICE_URL` in FileShare.tsx:

```tsx
const FILE_SERVICE_URL = "http://localhost:3002"; // Change this
```

## Error Handling

- Network errors are displayed to the user
- File validation errors (type, size) are shown
- Upload failures are caught and displayed
- Invalid threat analysis is logged but doesn't block sharing

## Browser Compatibility

- Works on all modern browsers (Chrome, Firefox, Safari, Edge)
- Uses HTML5 File API
- Uses Fetch API (ES6)
- Uses React 18+ hooks

## Performance

- Files are sent to server directly (no client-side processing)
- Threat analysis happens server-side
- Modal display is efficient and responsive
- Message rendering is optimized with unique IDs
