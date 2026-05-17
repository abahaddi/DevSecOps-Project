import { useState } from "react";

interface AuthProps {
	onAuthenticated: (token: string, username: string) => void;
}

export default function Auth({ onAuthenticated }: AuthProps) {
	const [mode, setMode] = useState<"login" | "signup">("login");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const API_URL = "http://localhost:3001";

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const endpoint = mode === "login" ? "/login" : "/signup";
			const body =
				mode === "login"
					? { username, password }
					: { username, email, password };

			const response = await fetch(`${API_URL}${endpoint}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Authentication failed");
			}

			onAuthenticated(data.token, data.user.username);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "An error occurred",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={styles.container}>
			<div style={styles.card}>
				<h1 style={styles.title}>Chatroom</h1>

				<div style={styles.tabs}>
					<button
						style={{
							...styles.tab,
							borderBottom:
								mode === "login"
									? "2px solid #3b82f6"
									: "none",
							color:
								mode === "login"
									? "#3b82f6"
									: "#999",
						}}
						onClick={() => {
							setMode("login");
							setError("");
						}}
					>
						Login
					</button>
					<button
						style={{
							...styles.tab,
							borderBottom:
								mode === "signup"
									? "2px solid #3b82f6"
									: "none",
							color:
								mode === "signup"
									? "#3b82f6"
									: "#999",
						}}
						onClick={() => {
							setMode("signup");
							setError("");
						}}
					>
						Sign Up
					</button>
				</div>

				<form onSubmit={handleSubmit} style={styles.form}>
					<input
						type="text"
						placeholder="Username"
						value={username}
						onChange={(e) =>
							setUsername(e.target.value)
						}
						style={styles.input}
						required
						disabled={loading}
					/>

					{mode === "signup" && (
						<input
							type="email"
							placeholder="Email"
							value={email}
							onChange={(e) =>
								setEmail(e.target.value)
							}
							style={styles.input}
							required
							disabled={loading}
						/>
					)}

					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) =>
							setPassword(e.target.value)
						}
						style={styles.input}
						required
						disabled={loading}
					/>

					{error && <div style={styles.error}>{error}</div>}

					<button
						type="submit"
						style={styles.button}
						disabled={loading}
					>
						{loading
							? mode === "login"
								? "Logging in..."
								: "Creating account..."
							: mode === "login"
								? "Login"
								: "Sign Up"}
					</button>
				</form>
			</div>
		</div>
	);
}

const styles = {
	container: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		minHeight: "100vh",
		background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
		fontFamily: "system-ui, -apple-system, sans-serif",
	},
	card: {
		background: "#1a1a2e",
		padding: "40px",
		borderRadius: "12px",
		boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
		width: "100%",
		maxWidth: "400px",
	},
	title: {
		textAlign: "center" as const,
		color: "#fff",
		marginBottom: "30px",
		fontSize: "28px",
		fontWeight: "bold",
	},
	tabs: {
		display: "flex",
		borderBottom: "1px solid #333",
		marginBottom: "30px",
	},
	tab: {
		flex: 1,
		padding: "12px",
		background: "none",
		border: "none",
		color: "#999",
		cursor: "pointer",
		fontSize: "16px",
		fontWeight: "500",
		transition: "color 0.3s",
	},
	form: {
		display: "flex",
		flexDirection: "column" as const,
		gap: "15px",
	},
	input: {
		padding: "12px",
		background: "#16213e",
		border: "1px solid #333",
		borderRadius: "6px",
		color: "#fff",
		fontSize: "14px",
		transition: "border-color 0.3s",
	},
	button: {
		padding: "12px",
		background: "#3b82f6",
		color: "#fff",
		border: "none",
		borderRadius: "6px",
		fontSize: "16px",
		fontWeight: "bold",
		cursor: "pointer",
		transition: "background 0.3s",
		marginTop: "10px",
	},
	error: {
		color: "#ef4444",
		fontSize: "14px",
		padding: "10px",
		background: "rgba(239, 68, 68, 0.1)",
		borderRadius: "6px",
		textAlign: "center" as const,
	},
};
