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
    parentRepo?: string;
    isFork?: boolean;
}

async function fetchPinnedProjects(usernames: string[]): Promise<Project[]> {
	const allPinned: Project[] = [];
	
	await Promise.all(usernames.map(async (username) => {
		try {
			const res = await fetch(
				`https://github-stats.tashif.codes/${username}/pinned?first=6`
			);
			if (!res.ok) {
				console.error(`Failed to fetch pinned projects for ${username}:`, res.status, res.statusText);
				return;
			}
			const data = await res.json();
			const projects = (data as any[]).map((p) => ({
				title: formatTitle(p.name),
				description: p.description || "No description available.",
				languages: p.primary_language ? [p.primary_language] : [],
				github_link: p.url,
				readme: "", // Not provided by pinned endpoint
				slug: slugify(p.name),
				pinned: true,
				stars: p.stars,
				forks: p.forks,
				docs_slug: getProjectEntry(slugify(p.name)),
                // Store original owner for potential parent repo matching if needed
                parentRepo: username !== 'tashifkhan' ? username : undefined 
			}));
            allPinned.push(...projects);
		} catch (e) {
			console.error(`Error fetching pinned projects for ${username}`, e);
		}
	}));
    
    return allPinned;
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
	const pinnedProjects = await fetchPinnedProjects(['tashifkhan', 'codeblech', 'codelif']);
	const pinnedNames = new Set(
		pinnedProjects.map((p) => p.title.toLowerCase().trim())
	);

	// Map repos -> Project objects
    const FORK_MAPPINGS: Record<string, string> = {
        "jsjiit": "codeblech",
        "jportal": "codeblech",
        "pyjiit": "codelif",
    };

	const repoProjects: Project[] = repos.map((project: any) => {
		const titleFormatted = formatTitle(project.title);
		const isPinned = pinnedNames.has(titleFormatted.toLowerCase());
        const projectSlug = slugify(project.title);
        
        let parentRepo = FORK_MAPPINGS[projectSlug] || FORK_MAPPINGS[project.title.toLowerCase()] || undefined;

		// Priority: Star map (parent if exists, else self) -> project.stars -> project.stargazers -> 0
        let targetRepoForStars = parentRepo ? parentRepo.toLowerCase() : project.title.toLowerCase();
		let stars = starMap.get(targetRepoForStars);
		
        if (stars === undefined) {
             // Fallback if not in starMap (only for non-forks usually, as forks should use parent)
             if (!parentRepo) {
                stars =
                    project.stars ??
                    project.stargazers ??
                    project.stargazers_count ??
                    0;
             } else {
                 // Try to find parent in pinned projects first (as they contain updated star counts)
                 const parentPinned = pinnedProjects.find(p => 
                    p.slug === projectSlug // Assuming slug matches repo name
                 );
                 
                 stars = parentPinned?.stars ?? project.stars ?? 0;
             }
		}

		const forks = project.forks ?? project.forks_count ?? 0;
		return {
			title: titleFormatted,
			description: project.description || "No description available.",
			languages: project.languages || [],
			live_website_url: project.live_website_url,
			github_link: `https://github.com/tashifkhan/${project.title}`,
			readme: project.readme,
			slug: projectSlug,
			pinned: isPinned,
			stars,
			forks,
            docs_slug: getProjectEntry(projectSlug),
            parentRepo,
            isFork: project.fork
		};
	});

	// Include any pinned projects from the main user (tashifkhan) that might be missing from the repos list
    // OR if we strictly want only what's in repos + pinned(tashifkhan), we filter the pinnedProjects first.
    // The external ones (codeblech, codelif) are ONLY for star stats.
	const existingSlugs = new Set(repoProjects.map((p) => p.slug));
	for (const pinned of pinnedProjects) {
        // Skip if this pinned project came from an external source (parentRepo was set to username in fetchPinnedProjects)
        // We only want to display pinned projects from tashifkhan
        if (pinned.parentRepo && pinned.parentRepo !== 'tashifkhan') continue;

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

	return repoProjects.filter((p) => {
        // Always show pinned projects
        if (p.pinned) return true;
        
        // Show if it's one of the special mapped forks
        if (FORK_MAPPINGS[p.slug] || FORK_MAPPINGS[p.title.toLowerCase()]) return true;
        
        // Show if it is NOT a fork (source repo)
        return !p.isFork;
    });
}


export const allProjects: Project[] = await fetchAllProjects();

