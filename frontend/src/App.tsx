import { useState, useEffect } from "react";
import Auth from "./Auth";
import Chat from "./Chat";

export default function App() {
	const [token, setToken] = useState<string | null>(null);
	const [username, setUsername] = useState<string | null>(null);

	useEffect(() => {
		// Check for stored token on mount
		const storedToken = localStorage.getItem("authToken");
		const storedUsername = localStorage.getItem("authUsername");
		if (storedToken && storedUsername) {
			setToken(storedToken);
			setUsername(storedUsername);
		}
	}, []);

	const handleAuthenticated = (authToken: string, authUsername: string) => {
		setToken(authToken);
		setUsername(authUsername);
		localStorage.setItem("authToken", authToken);
		localStorage.setItem("authUsername", authUsername);
	};

	const handleLogout = () => {
		setToken(null);
		setUsername(null);
		localStorage.removeItem("authToken");
		localStorage.removeItem("authUsername");
	};

	return token && username ? (
		<Chat username={username} onLogout={handleLogout} />
	) : (
		<Auth onAuthenticated={handleAuthenticated} />
	);
}
