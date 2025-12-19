export interface TopLanguage {
	name: string;
	percentage: number;
	color: string;
}

export interface YearlyContributions {
	[date: string]: number;
}

export interface GitHubStatsData {
	status: string;
	message: string;
	topLanguages: TopLanguage[];
	totalCommits: number;
	longestStreak: number;
	currentStreak: number;
	profile_visitors: number;
	contributions: {
		[year: string]: YearlyContributions;
	};
}

export interface PullRequest {
	repo: string;
	number: number;
	title: string;
	state: string;
	created_at: string;
	updated_at: string;
	closed_at: string | null;
	merged_at: string | null;
	user: string;
	url: string;
	body: string | null;
}

export interface StarredRepository {
	name: string;
	description: string | null;
	language: string | null;
	stars: number;
	forks: number;
	url: string;
}

export interface StarsData {
	total_stars: number;
	repositories: StarredRepository[];
}

export interface Commit {
	repo: string;
	message: string;
	timestamp: string;
	sha: string;
	url: string;
}

export interface Pull {
	repo: string;
	number: number;
	title: string;
	state: string;
	created_at: string;
	updated_at: string;
	closed_at: string | null;
	merged_at: string | null;
	user: string;
	url: string;
	body: string | null;
}

export interface OrgContribution {
	org: string;
	org_id: number;
	org_url: string;
	org_avatar_url: string;
	repos: string[];
}

export interface GitHubStats {
	stats: GitHubStatsData;
	prs: PullRequest[];
	stars: StarsData;
	commits: Commit[];
	pulls: Pull[];
	orgContributions: OrgContribution[];
}

async function fetchExtraParentStars(): Promise<number> {
    const mappings = [
        { user: 'codeblech', repos: ['jsjiit', 'jportal'] },
        { user: 'codelif', repos: ['pyjiit'] }
    ];

    let totalExtraStars = 0;

    await Promise.all(mappings.map(async ({ user, repos }) => {
        try {
            const res = await fetch(`https://github-stats.tashif.codes/${user}/stars`);
            if (res.ok) {
                const data = await res.json();
                if (data.repositories && Array.isArray(data.repositories)) {
                    data.repositories.forEach((repo: any) => {
                        if (repos.includes(repo.name.toLowerCase())) {
                            totalExtraStars += repo.stars;
                        }
                    });
                }
            }
        } catch (e) {
            console.error(`Error fetching extra stars for ${user}:`, e);
        }
    }));

    return totalExtraStars;
}

async function fetchGitHubStats(): Promise<GitHubStats> {
	const endpoints = [
		"https://github-stats.tashif.codes/tashifkhan/stats?exclude=HTML,CSS,Jupyter Notebook,SCSS",
		"https://github-stats.tashif.codes/tashifkhan/prs",
		"https://github-stats.tashif.codes/tashifkhan/stars",
		"https://github-stats.tashif.codes/tashifkhan/commits",
		"https://github-stats.tashif.codes/tashifkhan/me/pulls",
		"https://github-stats.tashif.codes/tashifkhan/org-contributions"
	];

	try {
        // Start fetching extra stars in parallel
        const extraStarsPromise = fetchExtraParentStars();

		const responses = await Promise.all(
			endpoints.map(endpoint => fetch(endpoint))
		);

		const [stats, prs, stars, commits, pulls, orgContributions] = await Promise.all(
			responses.map(response => {
				if (!response.ok) {
					console.error(`Failed to fetch from ${response.url}:`, response.statusText);
					return null;
				}
				return response.json();
			})
		);

        const extraStars = await extraStarsPromise;

		return {
			stats: stats || {
				status: "",
				message: "",
				topLanguages: [],
				totalCommits: 0,
				longestStreak: 0,
				currentStreak: 0,
				profile_visitors: 0,
				contributions: {}
			},
			prs: prs || [],
			stars: { 
                total_stars: (stars?.total_stars || 0) + extraStars, 
                repositories: stars?.repositories || [] 
            },
			commits: commits || [],
			pulls: pulls || [],
			orgContributions: orgContributions || []
		};
	} catch (error) {
		console.error("Error fetching GitHub stats:", error);
		return {
			stats: {
				status: "",
				message: "",
				topLanguages: [],
				totalCommits: 0,
				longestStreak: 0,
				currentStreak: 0,
				profile_visitors: 0,
				contributions: {}
			},
			prs: [],
			stars: { total_stars: 0, repositories: [] },
			commits: [],
			pulls: [],
			orgContributions: []
		};
	}
}

async function getViews(githubstats: GitHubStats): Promise<GitHubStats> {
	const viewsResponse = await fetch("https://komarev.com/ghpvc/?username=tashifkhan&style=for-the-badge&color=orange");
	if (viewsResponse.ok) {
		const viewsData = await viewsResponse.text();
		const titleMatch = viewsData.match(/<title>(.*?)<\/title>/);
		const matches = titleMatch ? titleMatch[1].match(/(\d[\d,]*)/) : null;
		if (matches && matches[0]) {
			const profile_visitors = parseInt(matches[0].replace(/,/g, ""), 10);
			return {
				...githubstats,
				stats: {
					...githubstats.stats,
					profile_visitors
				}
			};
		}
	}
	return githubstats;
}

export const githubStats: GitHubStats = await getViews(await fetchGitHubStats());
