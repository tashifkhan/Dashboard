import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
	const [isDark, setIsDark] = useState(true);

	useEffect(() => {
		const theme = localStorage.getItem("theme") || "dark";
		setIsDark(theme === "dark");
	}, []);

	const toggleTheme = () => {
		const newTheme = !isDark;
		setIsDark(newTheme);
		document.documentElement.classList.toggle("dark", newTheme);
		localStorage.setItem("theme", newTheme ? "dark" : "light");
	};

	return (
		<button
			onClick={toggleTheme}
			className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
			aria-label="Toggle theme"
		>
			{isDark ? <Sun size={20} /> : <Moon size={20} />}
		</button>
	);
}
