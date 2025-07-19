import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

const themes = ["dark", "light", "cream"];

export default function ThemeToggle() {
	const [theme, setTheme] = useState("dark");

	useEffect(() => {
		const saved = localStorage.getItem("theme") || "dark";
		setTheme(saved);
		document.documentElement.classList.toggle("dark", saved === "dark");
		document.documentElement.classList.toggle("cream", saved === "cream");
	}, []);

	const toggleTheme = () => {
		const idx = themes.indexOf(theme);
		const next = themes[(idx + 1) % themes.length];
		setTheme(next);
		document.documentElement.classList.toggle("dark", next === "dark");
		document.documentElement.classList.toggle("cream", next === "cream");
		if (next !== "dark") document.documentElement.classList.remove("dark");
		if (next !== "cream") document.documentElement.classList.remove("cream");
		localStorage.setItem("theme", next);
	};

	return (
		<button
			onClick={toggleTheme}
			className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 cream:bg-[var(--primary-color)] text-gray-700 dark:text-gray-300 cream:text-[var(--text-color)] hover:text-gray-900 dark:hover:text-white transition-colors"
			aria-label="Toggle theme"
			title={`Switch theme (current: ${theme})`}
		>
			{theme === "dark" ? (
				<Sun size={20} />
			) : theme === "cream" ? (
				<span style={{ color: "#A47551" }}>
					<Moon size={20} />
				</span>
			) : (
				<Moon size={20} />
			)}
		</button>
	);
}
