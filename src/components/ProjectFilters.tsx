import { useState, useEffect } from "react";
import { Search, ExternalLink, ListFilter } from "lucide-react";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { starLists } from "../data/starLists";

interface StarListOption {
	key: string; // identifier
	label: string; // display label
	repos?: string[]; // owner/repo slugs
}

export default function ProjectFilters() {
	const [searchTerm, setSearchTerm] = useState("");
	const [showLiveOnly, setShowLiveOnly] = useState(false);
	const [selectedList, setSelectedList] = useState<string>("all-projects");
	const [lists, setLists] = useState<StarListOption[]>([]);

	// Initialize from pre-fetched build-time starLists module
	useEffect(() => {
		const mapped: StarListOption[] = [
			{ key: "all-projects", label: "All Projects" },
			...starLists.map((l) => ({
				key: l.name,
				label: l.name,
				repos: (l.repositories || []).map((r) => r.split("/").pop() || r),
			})),
		];
		setLists(mapped);
		// Expose globally for existing filter handler referencing window.__STAR_LISTS__
		// @ts-ignore
		window.__STAR_LISTS__ = starLists;
	}, []);

	// External star list selection (triggered from GitHub contribution section)
	useEffect(() => {
		function applyList(listName: string) {
			if (!listName) return;
			if (!lists.some((l) => l.key === listName)) return; // ensure exists
			setSelectedList(listName);
			const searchEvent = new CustomEvent("project-search", {
				detail: { term: searchTerm, showLiveOnly, list: listName },
			});
			document.dispatchEvent(searchEvent);
		}
		function handleIncoming(e: Event) {
			const name = (e as CustomEvent).detail?.list as string | undefined;
			if (name) applyList(name);
		}
		document.addEventListener("project-list-select", handleIncoming);
		// Pending selection from navigation (set before component mounted)
		const pending = localStorage.getItem("pending_star_list_select");
		if (pending) {
			applyList(pending);
			localStorage.removeItem("pending_star_list_select");
		}
		return () =>
			document.removeEventListener("project-list-select", handleIncoming);
	}, [lists.length]);

	// Dispatch initial filter state when component mounts
	useEffect(() => {
		// Small delay to ensure component is fully hydrated
		const timer = setTimeout(() => {
			const searchEvent = new CustomEvent("project-search", {
				detail: { term: searchTerm, showLiveOnly, list: selectedList },
			});
			document.dispatchEvent(searchEvent);
		}, 100);

		return () => clearTimeout(timer);
	}, []); // run once

	const handleSearch = (value: string) => {
		console.log("ProjectFilters: handleSearch called with:", value);
		setSearchTerm(value);

		// Dispatch custom event with current state
		const searchEvent = new CustomEvent("project-search", {
			detail: { term: value, showLiveOnly, list: selectedList },
		});
		document.dispatchEvent(searchEvent);
	};

	const handleLiveFilter = () => {
		const newShowLiveOnly = !showLiveOnly;
		setShowLiveOnly(newShowLiveOnly);

		console.log("ProjectFilters: Live filter toggled to:", newShowLiveOnly);

		// Dispatch custom event with both search term and live filter
		const searchEvent = new CustomEvent("project-search", {
			detail: {
				term: searchTerm,
				showLiveOnly: newShowLiveOnly,
				list: selectedList,
			},
		});
		document.dispatchEvent(searchEvent);
	};

	const handleListChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;
		setSelectedList(value);
		const searchEvent = new CustomEvent("project-search", {
			detail: { term: searchTerm, showLiveOnly, list: value },
		});
		document.dispatchEvent(searchEvent);
	};

	return (
		<div className="mb-6 sm:mb-8">
			<div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
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

				{/* Star list selector */}
				<div className="flex items-stretch gap-2">
					<div className="relative">
						<Select
							value={selectedList}
							onValueChange={(v: string) => {
								// emulate the original change handler
								setSelectedList(v);
								const searchEvent = new CustomEvent("project-search", {
									detail: { term: searchTerm, showLiveOnly, list: v },
								});
								document.dispatchEvent(searchEvent);
							}}
						>
							<SelectTrigger
								data-project-list-select
								hideIcon
								className="h-full pr-10"
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{lists.map((l) => (
									<SelectItem key={l.key} value={l.key}>
										{l.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<ListFilter
							size={16}
							className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
						/>
					</div>
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
				{/* Exact toggle removed: exact matches always prioritized, then fuzzy results appended */}
			</div>
		</div>
	);
}
