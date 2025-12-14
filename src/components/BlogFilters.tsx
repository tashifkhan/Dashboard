import { useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
	categories: string[];
}

export default function BlogFilters({ categories }: Props) {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");

	const handleSearch = (value: string) => {
		setSearchTerm(value);
		const searchEvent = new CustomEvent("blog-search", {
			detail: { term: value },
		});
		document.dispatchEvent(searchEvent);
	};

	const handleCategoryChange = (category: string) => {
		setSelectedCategory(category);
		const categoryEvent = new CustomEvent("blog-category", {
			detail: { category },
		});
		document.dispatchEvent(categoryEvent);
	};

	return (
		<div className="mb-8 space-y-6">
			<div className="relative max-w-xl">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					type="text"
					placeholder="Search posts..."
					value={searchTerm}
					onChange={(e) => handleSearch(e.target.value)}
					className="pl-9 bg-background/50 backdrop-blur-sm"
				/>
			</div>
			<div className="flex flex-wrap gap-2">
				<Badge
					variant={selectedCategory === "all" ? "default" : "outline"}
					className={cn(
						"cursor-pointer px-4 py-1.5 text-sm transition-all hover:scale-105",
						selectedCategory !== "all" && "hover:bg-muted"
					)}
					onClick={() => handleCategoryChange("all")}
				>
					All
				</Badge>
				{categories.map((category) => (
					<Badge
						key={category}
						variant={selectedCategory === category ? "default" : "outline"}
						className={cn(
							"cursor-pointer px-4 py-1.5 text-sm transition-all hover:scale-105",
							selectedCategory !== category && "hover:bg-muted"
						)}
						onClick={() => handleCategoryChange(category)}
					>
						{category}
					</Badge>
				))}
			</div>
		</div>
	);
}
