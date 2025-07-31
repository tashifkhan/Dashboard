import { useState } from "react";
import { Search } from "lucide-react";

export default function ProjectFilters() {
	const [searchTerm, setSearchTerm] = useState("");

	const handleSearch = (value: string) => {
		console.log("ProjectFilters: handleSearch called with:", value);
		setSearchTerm(value);

		// Dispatch custom event directly
		const searchEvent = new CustomEvent("project-search", {
			detail: { term: value },
		});
		document.dispatchEvent(searchEvent);
	};

	return (
		<div className="mb-6 sm:mb-8 space-y-4">
			<div className="relative">
				<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<Search size={20} className="text-gray-400" />
				</div>
				<input
					type="text"
					placeholder="Search projects by title, description, or language... (supports exact and fuzzy matching)"
					value={searchTerm}
					onChange={(e) => handleSearch(e.target.value)}
					className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 cream:border-[var(--accent-color)] rounded-lg bg-white dark:bg-gray-900 cream:bg-[var(--primary-color)] text-gray-900 dark:text-white cream:text-[var(--text-color)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 cream:focus:ring-[var(--accent-color)]"
				/>
			</div>
		</div>
	);
}
