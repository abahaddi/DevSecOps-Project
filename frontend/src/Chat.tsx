import { useState, useEffect, useRef } from "react";
import FileShare from "./FileShare";

interface Message {
	id: number;
	text: string;
	self: boolean;
	type?: "text" | "file";
	filename?: string;
	threatLevel?: string;
}

interface ChatProps {
	username: string;
	onLogout: () => void;
}

export default function Chat({ username, onLogout }: ChatProps) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [connected, setConnected] = useState(false);
	const wsRef = useRef<WebSocket | null>(null);
	const bottomRef = useRef<HTMLDivElement | null>(null);
	const idRef = useRef(0);

	useEffect(() => {
		const ws = new WebSocket("ws://localhost:8080/ws");
		wsRef.current = ws;

		ws.onopen = () => setConnected(true);
		ws.onclose = () => setConnected(false);

		ws.onmessage = (e) => {
			setMessages((prev) => [
				...prev,
				{ id: idRef.current++, text: e.data, self: false },
			]);
		};

		return () => ws.close();
	}, []);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const send = () => {
		const trimmed = input.trim();
		if (
			!trimmed ||
			!wsRef.current ||
			wsRef.current.readyState !== WebSocket.OPEN
		)
			return;
		wsRef.current.send(trimmed);
		setMessages((prev) => [
			...prev,
			{ id: idRef.current++, text: trimmed, self: true },
		]);
		setInput("");
	};

	const handleKey = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	};

	const handleFileShared = (
		fileUrl: string,
		filename: string,
		threatLevel: string,
	) => {
		const fileMessage = `📎 [File] ${filename} (${threatLevel.toUpperCase()}) - ${fileUrl}`;
		if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
			wsRef.current.send(fileMessage);
			setMessages((prev) => [
				...prev,
				{
					id: idRef.current++,
					text: fileUrl,
					self: true,
					type: "file",
					filename: filename,
					threatLevel: threatLevel,
				},
			]);
		}
	};

	return (
		<>
			<div style={styles.root}>
				<div style={styles.header}>
					<span style={styles.title}>CHATROOM</span>
					<div style={styles.headerRight}>
						<span style={styles.username}>
							{username}
						</span>
						<span
							style={{
								...styles.dot,
								background: connected
									? "#4ade80"
									: "#f87171",
							}}
						/>
						<button
							onClick={onLogout}
							style={styles.logoutButton}
						>
							Logout
						</button>
					</div>
				</div>

				<div style={styles.messages}>
					{messages.map((msg) =>
						msg.type === "file" ? (
							<div
								key={msg.id}
								style={{
									...styles.fileBubble,
									alignSelf: msg.self
										? "flex-end"
										: "flex-start",
								}}
							>
								<div style={styles.fileContent}>
									<div
										style={
											styles.fileIcon
										}
									>
										📎
									</div>
									<div
										style={
											styles.fileInfo
										}
									>
										<div
											style={
												styles.fileTitle
											}
										>
											{msg.filename}
										</div>
										<div
											style={{
												...styles.threatBadge,
												background:
													getThreatColor(
														msg.threatLevel ||
															"safe",
													),
											}}
										>
											{msg.threatLevel?.toUpperCase()}
										</div>
									</div>
									<a
										href={msg.text}
										target="_blank"
										rel="noopener noreferrer"
										style={
											styles.downloadLink
										}
										download
									>
										⬇
									</a>
								</div>
							</div>
						) : (
							<div
								key={msg.id}
								style={{
									...styles.bubble,
									alignSelf: msg.self
										? "flex-end"
										: "flex-start",
									background: msg.self
										? "#1a1a2e"
										: "#16213e",
									borderBottomRightRadius:
										msg.self ? 4 : 18,
									borderBottomLeftRadius:
										msg.self ? 18 : 4,
								}}
							>
								{msg.text}
							</div>
						),
					)}
				</div>

				<div style={styles.inputRow}>
					<FileShare onFileShared={handleFileShared} />
					<input
						style={styles.input}
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKey}
						placeholder="Type a message..."
						disabled={!connected}
					/>
					<button
						style={styles.button}
						onClick={send}
						disabled={!connected}
					>
						Send
					</button>
				</div>
			</div>
		</>
	);
}

function getThreatColor(level?: string) {
	switch (level) {
		case "high":
			return "#ef4444";
		case "medium":
			return "#f59e0b";
		case "safe":
			return "#4ade80";
		default:
			return "#6b7280";
	}
}

const styles: Record<string, React.CSSProperties> = {
	root: {
		display: "flex",
		flexDirection: "column",
		height: "100vh",
		background: "#0f0e17",
		color: "#fffffe",
		fontFamily: "'IBM Plex Mono', monospace",
	},
	header: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		padding: "1rem 1.5rem",
		borderBottom: "1px solid #1a1a2e",
		letterSpacing: "0.2em",
		fontSize: 13,
	},
	headerRight: {
		display: "flex",
		alignItems: "center",
		gap: "1rem",
	},
	username: {
		fontSize: 13,
		color: "#a0aec0",
	},
	title: {
		fontWeight: 700,
		fontSize: 15,
		letterSpacing: "0.3em",
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: "50%",
		display: "inline-block",
	},
	logoutButton: {
		background: "none",
		color: "#f87171",
		border: "1px solid #f87171",
		borderRadius: 4,
		padding: "0.4rem 0.8rem",
		fontSize: 12,
		cursor: "pointer",
		fontWeight: 500,
		transition: "all 0.3s",
	},
	messages: {
		flex: 1,
		overflowY: "auto",
		display: "flex",
		flexDirection: "column",
		padding: "1.5rem",
		gap: "0.5rem",
	},
	bubble: {
		maxWidth: "65%",
		padding: "0.6rem 1rem",
		borderRadius: 18,
		fontSize: 14,
		lineHeight: 1.5,
		wordBreak: "break-word",
		color: "#fffffe",
	},
	inputRow: {
		display: "flex",
		gap: "0.75rem",
		padding: "1rem 1.5rem",
		borderTop: "1px solid #1a1a2e",
	},
	input: {
		flex: 1,
		background: "#1a1a2e",
		border: "1px solid #2a2a4e",
		borderRadius: 8,
		padding: "0.6rem 1rem",
		color: "#fffffe",
		fontFamily: "inherit",
		fontSize: 14,
		outline: "none",
	},
	button: {
		background: "#fffffe",
		color: "#0f0e17",
		border: "none",
		borderRadius: 8,
		padding: "0.6rem 1.25rem",
		fontFamily: "inherit",
		fontWeight: 700,
		fontSize: 13,
		letterSpacing: "0.1em",
		cursor: "pointer",
	},
	fileBubble: {
		maxWidth: "70%",
		padding: "0",
		borderRadius: 12,
		background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
		overflow: "hidden",
	},
	fileContent: {
		display: "flex",
		alignItems: "center",
		gap: "1rem",
		padding: "1rem",
	},
	fileIcon: {
		fontSize: 24,
		flexShrink: 0,
	},
	fileInfo: {
		flex: 1,
		minWidth: 0,
	},
	fileTitle: {
		color: "#fff",
		fontSize: 13,
		fontWeight: "bold",
		wordBreak: "break-word",
		marginBottom: "0.5rem",
	},
	threatBadge: {
		display: "inline-block",
		color: "#fff",
		padding: "0.25rem 0.6rem",
		borderRadius: 4,
		fontSize: 11,
		fontWeight: "bold",
	},
	downloadLink: {
		color: "#fff",
		fontSize: 20,
		cursor: "pointer",
		textDecoration: "none",
		flexShrink: 0,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
};
