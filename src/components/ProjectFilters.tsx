import { useState } from "react";
import { Search } from "lucide-react";

interface Props {
	onSearch: (term: string) => void;
}

export default function ProjectFilters({ onSearch }: Props) {
	const [searchTerm, setSearchTerm] = useState("");

	const handleSearch = (value: string) => {
		setSearchTerm(value);
		onSearch(value);
	};

	return (
		<div className="mb-6 sm:mb-8 space-y-4">
			<div className="relative">
				<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<Search size={20} className="text-gray-400" />
				</div>
				<input
					type="text"
					placeholder="Search projects by title, description, or language..."
					value={searchTerm}
					onChange={(e) => handleSearch(e.target.value)}
					className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
				/>
			</div>
		</div>
	);
}
