import express from "express";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import cors from "cors";

const app = express();
const PORT = 3001;
const JWT_SECRET = "your_jwt_secret_key_change_in_production";

// Middleware
app.use(express.json());
app.use(cors());

// In-memory user store (for demo purposes)
const users = new Map();

// Helper function to hash password
async function hashPassword(password) {
	const salt = await bcryptjs.genSalt(10);
	return await bcryptjs.hash(password, salt);
}

// Helper function to compare password
async function comparePassword(password, hash) {
	return await bcryptjs.compare(password, hash);
}

// Health check endpoint
app.get("/health", (req, res) => {
	res.json({ status: "OK" });
});

// Signup endpoint
app.post("/signup", async (req, res) => {
	try {
		const { username, email, password } = req.body;

		// Validation
		if (!username || !email || !password) {
			return res
				.status(400)
				.json({ error: "Missing required fields" });
		}

		if (username.length < 3) {
			return res
				.status(400)
				.json({
					error: "Username must be at least 3 characters",
				});
		}

		if (password.length < 6) {
			return res
				.status(400)
				.json({
					error: "Password must be at least 6 characters",
				});
		}

		// Check if user already exists
		if (users.has(username)) {
			return res
				.status(400)
				.json({ error: "Username already exists" });
		}

		// Hash password and store user
		const hashedPassword = await hashPassword(password);
		users.set(username, {
			email,
			password: hashedPassword,
			createdAt: new Date(),
		});

		// Generate JWT token
		const token = jwt.sign({ username }, JWT_SECRET, {
			expiresIn: "24h",
		});

		res.status(201).json({
			message: "User created successfully",
			token,
			user: { username, email },
		});
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// Login endpoint
app.post("/login", async (req, res) => {
	try {
		const { username, password } = req.body;

		// Validation
		if (!username || !password) {
			return res
				.status(400)
				.json({ error: "Username and password required" });
		}

		// Check if user exists
		const user = users.get(username);
		if (!user) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		// Compare passwords
		const isPasswordValid = await comparePassword(
			password,
			user.password,
		);
		if (!isPasswordValid) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		// Generate JWT token
		const token = jwt.sign({ username }, JWT_SECRET, {
			expiresIn: "24h",
		});

		res.json({
			message: "Login successful",
			token,
			user: { username, email: user.email },
		});
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// Verify token endpoint
app.post("/verify", (req, res) => {
	try {
		const { token } = req.body;

		if (!token) {
			return res.status(400).json({ error: "Token required" });
		}

		const decoded = jwt.verify(token, JWT_SECRET);
		res.json({ valid: true, user: { username: decoded.username } });
	} catch (error) {
		res.status(401).json({ valid: false, error: "Invalid token" });
	}
});

app.listen(PORT, () => {
	console.log(`Auth service running on http://localhost:${PORT}`);
});
