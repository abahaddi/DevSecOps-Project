import { useState, useEffect, useRef } from "react";

interface Message {
	id: number;
	text: string;
	self: boolean;
}

export default function Chat() {
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

	return (
		<div style={styles.root}>
			<div style={styles.header}>
				<span style={styles.title}>CHATROOM</span>
				<span
					style={{
						...styles.dot,
						background: connected
							? "#4ade80"
							: "#f87171",
					}}
				/>
			</div>

			<div style={styles.messages}>
				{messages.map((msg) => (
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
							borderBottomRightRadius: msg.self
								? 4
								: 18,
							borderBottomLeftRadius: msg.self
								? 18
								: 4,
						}}
					>
						{msg.text}
					</div>
				))}
				<div ref={bottomRef} />
			</div>

			<div style={styles.inputRow}>
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
	);
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
};
