import { useState } from "react";

interface FileShareProps {
	onFileShared: (
		fileUrl: string,
		filename: string,
		threatLevel: string,
	) => void;
}

interface ThreatAnalysis {
	level: string;
	issues: string[];
	warnings: string[];
}

export default function FileShare({ onFileShared }: FileShareProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [showAnalysis, setShowAnalysis] = useState(false);
	const [lastAnalysis, setLastAnalysis] = useState<{
		filename: string;
		threat_analysis: ThreatAnalysis;
	} | null>(null);

	const FILE_SERVICE_URL = "http://localhost:3002";

	const handleFileUpload = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setError("");
		setLoading(true);
		setShowAnalysis(false);

		try {
			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch(`${FILE_SERVICE_URL}/upload`, {
				method: "POST",
				body: formData,
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Upload failed");
			}

			setLastAnalysis({
				filename: data.filename,
				threat_analysis: data.threat_analysis,
			});
			setShowAnalysis(true);

			// Only share if threat level is not high
			if (data.threat_analysis.level !== "high") {
				onFileShared(
					data.url,
					data.filename,
					data.threat_analysis.level,
				);
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Upload failed",
			);
		} finally {
			setLoading(false);
			// Reset file input
			e.target.value = "";
		}
	};

	const getThreatColor = (level: string) => {
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
	};

	const handleShareAnyway = () => {
		if (lastAnalysis) {
			// Extract filename from the last uploaded file
			const mockUrl = `http://localhost:3002/download/file_${Date.now()}`;
			onFileShared(
				mockUrl,
				lastAnalysis.filename,
				lastAnalysis.threat_analysis.level,
			);
			setShowAnalysis(false);
		}
	};

	return (
		<div style={styles.container}>
			<label style={styles.label} htmlFor="file-input">
				📎 Share File
			</label>
			<input
				id="file-input"
				type="file"
				onChange={handleFileUpload}
				disabled={loading}
				style={{ display: "none" }}
			/>

			{error && <div style={styles.error}>{error}</div>}

			{showAnalysis && lastAnalysis && (
				<div style={styles.analysisModal}>
					<div style={styles.analysisCard}>
						<h3 style={styles.analysisTitle}>
							Threat Analysis
						</h3>
						<p style={styles.filename}>
							{lastAnalysis.filename}
						</p>

						<div
							style={{
								...styles.threatBadge,
								background: getThreatColor(
									lastAnalysis
										.threat_analysis
										.level,
								),
							}}
						>
							{lastAnalysis.threat_analysis.level.toUpperCase()}
						</div>

						{lastAnalysis.threat_analysis.issues
							.length > 0 && (
							<div style={styles.issuesSection}>
								<p style={styles.sectionTitle}>
									🚨 Issues:
								</p>
								<ul style={styles.list}>
									{lastAnalysis.threat_analysis.issues.map(
										(issue, i) => (
											<li
												key={i}
												style={
													styles.listItem
												}
											>
												{issue}
											</li>
										),
									)}
								</ul>
							</div>
						)}

						{lastAnalysis.threat_analysis.warnings
							.length > 0 && (
							<div style={styles.warningsSection}>
								<p style={styles.sectionTitle}>
									⚠️ Warnings:
								</p>
								<ul style={styles.list}>
									{lastAnalysis.threat_analysis.warnings.map(
										(warning, i) => (
											<li
												key={i}
												style={
													styles.listItem
												}
											>
												{
													warning
												}
											</li>
										),
									)}
								</ul>
							</div>
						)}

						<div style={styles.buttonGroup}>
							<button
								style={styles.closeButton}
								onClick={() =>
									setShowAnalysis(false)
								}
							>
								Close
							</button>
							{lastAnalysis.threat_analysis
								.level !== "high" && (
								<button
									style={styles.shareButton}
									onClick={
										handleShareAnyway
									}
								>
									Share File
								</button>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

const styles = {
	container: {
		position: "relative" as const,
	},
	label: {
		cursor: "pointer",
		fontSize: 14,
		color: "#60a5fa",
		hover: {
			color: "#3b82f6",
		},
	},
	error: {
		color: "#ef4444",
		fontSize: 12,
		marginTop: "0.5rem",
		padding: "0.5rem",
		background: "rgba(239, 68, 68, 0.1)",
		borderRadius: 4,
	},
	analysisModal: {
		position: "fixed" as const,
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		background: "rgba(0, 0, 0, 0.7)",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 1000,
	},
	analysisCard: {
		background: "#1a1a2e",
		borderRadius: 12,
		padding: "24px",
		maxWidth: "400px",
		width: "90%",
		maxHeight: "80vh",
		overflowY: "auto" as const,
		border: "1px solid #333",
	},
	analysisTitle: {
		color: "#fff",
		margin: "0 0 1rem 0",
		fontSize: 18,
	},
	filename: {
		color: "#a0aec0",
		fontSize: 14,
		marginBottom: "1rem",
		wordBreak: "break-all" as const,
	},
	threatBadge: {
		display: "inline-block",
		color: "#fff",
		padding: "0.5rem 1rem",
		borderRadius: 6,
		fontSize: 12,
		fontWeight: "bold",
		marginBottom: "1rem",
	},
	issuesSection: {
		marginBottom: "1rem",
	},
	warningsSection: {
		marginBottom: "1rem",
	},
	sectionTitle: {
		color: "#fff",
		fontSize: 13,
		fontWeight: "bold",
		margin: "0 0 0.5rem 0",
	},
	list: {
		listStyle: "none",
		padding: 0,
		margin: 0,
	},
	listItem: {
		color: "#cbd5e1",
		fontSize: 12,
		padding: "0.25rem 0 0.25rem 1.5rem",
		position: "relative" as const,
	},
	buttonGroup: {
		display: "flex",
		gap: "0.75rem",
		marginTop: "1.5rem",
	},
	closeButton: {
		flex: 1,
		background: "#333",
		color: "#fff",
		border: "1px solid #555",
		borderRadius: 6,
		padding: "0.6rem",
		fontSize: 13,
		cursor: "pointer",
		fontWeight: "bold",
	},
	shareButton: {
		flex: 1,
		background: "#4ade80",
		color: "#000",
		border: "none",
		borderRadius: 6,
		padding: "0.6rem",
		fontSize: 13,
		cursor: "pointer",
		fontWeight: "bold",
	},
};
