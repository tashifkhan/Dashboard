import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

// Segmented light/dark toggle (recommended set option 3B). Removed legacy "cream" theme.
export default function ThemeToggle() {
	const [theme, setTheme] = useState<"light" | "dark">("dark");

	useEffect(() => {
		const saved =
			(localStorage.getItem("theme") as "light" | "dark" | null) || "dark";
		applyTheme(saved);
	}, []);

	function applyTheme(next: "light" | "dark") {
		setTheme(next);
		document.documentElement.classList.toggle("dark", next === "dark");
		localStorage.setItem("theme", next);
	}

	return (
		<div
			role="group"
			aria-label="Theme toggle"
			className="inline-flex border-2 border-border shadow-neo-xs select-none"
		>
			<button
				type="button"
				onClick={() => applyTheme("light")}
				aria-pressed={theme === "light"}
				className={`px-3 py-1.5 text-xs font-semibold tracking-tight transition-colors focus:outline-none focus-visible:outline-none ${
					theme === "light"
						? "bg-primary text-primary-foreground"
						: "bg-card text-foreground hover:bg-accent hover:text-accent-foreground"
				}`}
			>
				<Sun className="w-4 h-4" />
				<span className="sr-only">Light theme</span>
			</button>
			<button
				type="button"
				onClick={() => applyTheme("dark")}
				aria-pressed={theme === "dark"}
				className={`px-3 py-1.5 text-xs font-semibold tracking-tight border-l-2 border-border transition-colors focus:outline-none focus-visible:outline-none ${
					theme === "dark"
						? "bg-primary text-primary-foreground"
						: "bg-card text-foreground hover:bg-accent hover:text-accent-foreground"
				}`}
			>
				<Moon className="w-4 h-4" />
				<span className="sr-only">Dark theme</span>
			</button>
		</div>
	);
}
