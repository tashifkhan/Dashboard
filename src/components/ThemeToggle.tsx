import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			className="rounded-full hover:bg-muted"
			aria-label="Toggle theme"
			title={`Switch theme (current: ${theme})`}
		>
			{theme === "dark" ? (
				<Sun className="h-5 w-5" />
			) : theme === "cream" ? (
				<span style={{ color: "#A47551" }}>
					<Moon className="h-5 w-5" />
				</span>
			) : (
				<Moon className="h-5 w-5" />
			)}
		</Button>
	);
}
