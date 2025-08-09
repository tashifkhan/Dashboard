import { useState } from "react";
import { Search } from "lucide-react";

interface Props {
	categories: string[];
}

export default function BlogFilters({ categories }: Props) {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");

	const handleSearch = (value: string) => {
		setSearchTerm(value);
		// Dispatch custom event for search
		console.log("BlogFilters: Dispatching search event with term:", value);
		const searchEvent = new CustomEvent("blog-search", {
			detail: { term: value },
		});
		document.dispatchEvent(searchEvent);
	};

	const handleCategoryChange = (category: string) => {
		setSelectedCategory(category);
		// Dispatch custom event for category change
		console.log(
			"BlogFilters: Dispatching category event with category:",
			category
		);
		const categoryEvent = new CustomEvent("blog-category", {
			detail: { category },
		});
		document.dispatchEvent(categoryEvent);
	};

	return (
		<div className="mb-6 sm:mb-8 space-y-4">
			<div className="relative">
				<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<Search size={20} className="text-gray-400" />
				</div>
				<input
					type="text"
					placeholder="Search blog posts by title or category... (supports exact and fuzzy matching)"
					value={searchTerm}
					onChange={(e) => handleSearch(e.target.value)}
					className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 cream:border-[var(--accent-color)] rounded-lg bg-white dark:bg-gray-900 cream:bg-[var(--primary-color)] text-gray-900 dark:text-white cream:text-[var(--text-color)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 cream:focus:ring-[var(--accent-color)]"
				/>
			</div>
			<div className="flex flex-wrap gap-2">
				<button
					onClick={() => handleCategoryChange("all")}
					className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-mono transition-colors ${
						selectedCategory === "all"
							? "bg-orange-500 text-white dark:bg-orange-600 cream:bg-[var(--accent-color)] cream:text-white"
							: "bg-gray-200 dark:bg-gray-800 cream:bg-[var(--primary-color)] text-gray-700 dark:text-gray-300 cream:text-[var(--text-color)] hover:bg-gray-300 dark:hover:bg-gray-700 cream:hover:bg-[var(--accent-color-hover)]"
					}`}
				>
					All
				</button>
				{categories.map((category) => (
					<button
						key={category}
						onClick={() => handleCategoryChange(category)}
						className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-mono transition-colors ${
							selectedCategory === category
								? "bg-orange-500 text-white dark:bg-orange-600 cream:bg-[var(--accent-color)] cream:text-white"
								: "bg-gray-200 dark:bg-gray-800 cream:bg-[var(--primary-color)] text-gray-700 dark:text-gray-300 cream:text-[var(--text-color)] hover:bg-gray-300 dark:hover:bg-gray-700 cream:hover:bg-[var(--accent-color-hover)]"
						}`}
					>
						{category}
					</button>
				))}
			</div>
		</div>
	);
}
