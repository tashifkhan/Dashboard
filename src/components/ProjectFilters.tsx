import { useState, useEffect } from "react";
import { Search, ExternalLink, ListFilter } from "lucide-react";
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
		<div className="mb-6 sm:mb-8 neo-section bg-background p-4 sm:p-5 border-2">
			<div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
				<div className="relative flex-1">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
						<Search size={18} />
					</div>
					<input
						type="text"
						placeholder="Search projects..."
						value={searchTerm}
						onChange={(e) => handleSearch(e.target.value)}
						className="neo-input pl-10 w-full rounded-none focus:ring-0 focus:outline-none placeholder:text-muted-foreground/60"
					/>
				</div>
				<div className="flex items-stretch gap-2">
					<div className="relative">
						<select
							data-project-list-select
							value={selectedList}
							onChange={handleListChange}
							className="neo-input pr-8 h-full rounded-none appearance-none cursor-pointer text-sm font-medium"
						>
							{lists.map((l) => (
								<option key={l.key} value={l.key} className="bg-background">
									{l.label}
								</option>
							))}
						</select>
						<ListFilter
							size={16}
							className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
						/>
					</div>
					<button
						onClick={handleLiveFilter}
						className={`neo-btn !px-3 !py-2 rounded-none text-xs sm:text-sm font-mono gap-1 ${
							showLiveOnly
								? "!bg-primary !text-primary-foreground"
								: "!bg-accent !text-accent-foreground"
						}`}
					>
						<ExternalLink size={14} />
						<span>Live</span>
					</button>
				</div>
			</div>
		</div>
	);
}
