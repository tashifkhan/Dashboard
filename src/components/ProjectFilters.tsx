import { useState, useEffect } from "react";
import { Search, ExternalLink } from "lucide-react";

export default function ProjectFilters() {
	const [searchTerm, setSearchTerm] = useState("");
	const [showLiveOnly, setShowLiveOnly] = useState(false);

	// Dispatch initial filter state when component mounts
	useEffect(() => {
		// Small delay to ensure component is fully hydrated
		const timer = setTimeout(() => {
			const searchEvent = new CustomEvent("project-search", {
				detail: { term: searchTerm, showLiveOnly },
			});
			document.dispatchEvent(searchEvent);
		}, 100);

		return () => clearTimeout(timer);
	}, []); // Empty dependency array means this runs once on mount

	const handleSearch = (value: string) => {
		console.log("ProjectFilters: handleSearch called with:", value);
		setSearchTerm(value);

		// Dispatch custom event with current state
		const searchEvent = new CustomEvent("project-search", {
			detail: { term: value, showLiveOnly },
		});
		document.dispatchEvent(searchEvent);
	};

	const handleLiveFilter = () => {
		const newShowLiveOnly = !showLiveOnly;
		setShowLiveOnly(newShowLiveOnly);

		console.log("ProjectFilters: Live filter toggled to:", newShowLiveOnly);

		// Dispatch custom event with both search term and live filter
		const searchEvent = new CustomEvent("project-search", {
			detail: { term: searchTerm, showLiveOnly: newShowLiveOnly },
		});
		document.dispatchEvent(searchEvent);
	};

	return (
		<div className="mb-6 sm:mb-8">
			<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
				<div className="relative flex-1">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Search size={20} className="text-gray-400" />
					</div>
					<input
						type="text"
						placeholder="Search projects by title, description, or language..."
						value={searchTerm}
						onChange={(e) => handleSearch(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 cream:border-[var(--accent-color)] rounded-lg bg-white dark:bg-gray-900 cream:bg-[var(--primary-color)] text-gray-900 dark:text-white cream:text-[var(--text-color)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 cream:focus:ring-[var(--accent-color)]"
					/>
				</div>
				<button
					onClick={handleLiveFilter}
					className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-mono transition-colors flex items-center space-x-1 whitespace-nowrap ${
						showLiveOnly
							? "bg-orange-500 text-white dark:bg-orange-600 cream:bg-[var(--accent-color)] cream:text-white"
							: "bg-gray-200 dark:bg-gray-800 cream:bg-[var(--primary-color)] text-gray-700 dark:text-gray-300 cream:text-[var(--text-color)] hover:bg-gray-300 dark:hover:bg-gray-700 cream:hover:bg-[var(--accent-color-hover)]"
					}`}
				>
					<ExternalLink size={14} />
					<span>Live Only</span>
				</button>
			</div>
		</div>
	);
}
