import { formatTitle } from "../utils/formatTitle";
import { getProjectEntry } from "../utils/docs";
import { slugify } from "../utils/slugify";
import fs from 'fs';
import path from 'path';

export interface Project {
	title: string;
	description: string;
	languages: string[];
	live_website_url?: string;
	github_link: string;
	readme: string;
	slug: string;
	// Optional metadata
	pinned?: boolean;
	stars?: number;
	forks?: number;
    docs_slug?: string | null;
}

async function fetchPinnedProjects(first = 6): Promise<Project[]> {
	try {
		const res = await fetch(
			`https://github-stats.tashif.codes/tashifkhan/pinned?first=${first}`
		);
		if (!res.ok) {
			console.error("Failed to fetch pinned projects:", res.status, res.statusText);
			return [];
		}
		const data = await res.json();
		return (data as any[]).map((p) => ({
			title: formatTitle(p.name),
			description: p.description || "No description available.",
			languages: p.primary_language ? [p.primary_language] : [],
			github_link: p.url,
			readme: "", // Not provided by pinned endpoint
			slug: slugify(p.name),
			pinned: true,
			stars: p.stars,
			forks: p.forks,
			docs_slug: getProjectEntry(slugify(p.name))
		}));
	} catch (e) {
		console.error("Error fetching pinned projects", e);
		return [];
	}
}

async function fetchAllProjects(): Promise<Project[]> {
	let repos: any[] = [];
	try {
		const response = await fetch(
			"https://github-stats.tashif.codes/tashifkhan/repos"
		);
		if (!response.ok) {
			console.error("Failed to fetch projects:", response.statusText);
		} else {
			repos = await response.json();
		}
	} catch (e) {
		console.error("Error fetching repos", e);
	}

	// Fetch stars
	const starMap = new Map<string, number>();
	try {
		const starsRes = await fetch(
			"https://github-stats.tashif.codes/tashifkhan/stars"
		);
		if (starsRes.ok) {
			const starsData = await starsRes.json();
			if (starsData.repositories && Array.isArray(starsData.repositories)) {
				starsData.repositories.forEach((repo: any) => {
					// Map by name (lowercase for safety)
					starMap.set(repo.name.toLowerCase(), repo.stars);
					// Also map by full URL if needed, but name is usually enough
				});
			}
		} else {
			console.error(
				"Failed to fetch stars:",
				starsRes.status,
				starsRes.statusText
			);
		}
	} catch (e) {
		console.error("Error fetching stars:", e);
	}

	// Fetch pinned in parallel / earlier
	const pinnedProjects = await fetchPinnedProjects();
	const pinnedNames = new Set(
		pinnedProjects.map((p) => p.title.toLowerCase().trim())
	);

	// Map repos -> Project objects
	const repoProjects: Project[] = repos.map((project: any) => {
		const titleFormatted = formatTitle(project.title);
		const isPinned = pinnedNames.has(titleFormatted.toLowerCase());
		
		// Priority: Star map -> project.stars -> project.stargazers -> 0
		let stars = starMap.get(project.title.toLowerCase());
		if (stars === undefined) {
			stars =
				project.stars ??
				project.stargazers ??
				project.stargazers_count ??
				0;
		}

		const forks = project.forks ?? project.forks_count ?? 0;
		return {
			title: titleFormatted,
			description: project.description || "No description available.",
			languages: project.languages || [],
			live_website_url: project.live_website_url,
			github_link: `https://github.com/tashifkhan/${project.title}`,
			readme: project.readme,
			slug: slugify(project.title),
			pinned: isPinned,
			stars,
			forks,
            docs_slug: getProjectEntry(slugify(project.title))
		};
	});

	// Include any pinned repos not in the user's own repo list (e.g. collaborations)
	const existingSlugs = new Set(repoProjects.map((p) => p.slug));
	for (const pinned of pinnedProjects) {
		if (!existingSlugs.has(pinned.slug)) {
			// Try to update stars for pinned projects if available in starMap
             // pinnedProjects might rely on the pinned API's star count, 
             // but let's check our starMap too just in case it's fresher.
            const freshStars = starMap.get(pinned.title.toLowerCase());
            if (freshStars !== undefined) {
                pinned.stars = freshStars;
            }
			repoProjects.push(pinned);
		}
	}

	// Sort: pinned first, then by stars desc within pinned; preserve original order otherwise
	repoProjects.sort((a, b) => {
		const aPinned = a.pinned ? 1 : 0;
		const bPinned = b.pinned ? 1 : 0;
		if (aPinned !== bPinned) return bPinned - aPinned;
		// If both pinned or both not pinned, sort by stars descending
        const starsA = a.stars ?? 0;
        const starsB = b.stars ?? 0;
        if (starsA !== starsB) return starsB - starsA;

		return 0; 
	});

	return repoProjects;
}


export const allProjects: Project[] = await fetchAllProjects();

