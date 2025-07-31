import { slugify } from "../utils/slugify";
import { formatTitle } from "../utils/formatTitle";

export interface Project {
	title: string;
	description: string;
	languages: string[];
	live_website_url?: string;
	github_link: string;
	readme: string;
	slug: string;
}

async function fetchProjects(): Promise<Project[]> {
	const response = await fetch(
		"https://github-stats.tashif.codes/tashifkhan/repos"
	);
	if (!response.ok) {
		console.error("Failed to fetch projects:", response.statusText);
		return [];
	}
	const apiData = await response.json();

	return apiData.map((project: any) => ({
		title: formatTitle(project.title),
		description: project.description || "No description available.",
		languages: project.languages || [],
		live_website_url: project.live_website_url,
		github_link: `https://github.com/tashifkhan/${project.title}`,
		readme: project.readme,
		slug: slugify(project.title),
	}));
}

export const allProjects: Project[] = await fetchProjects();
