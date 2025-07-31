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
			stars: stars || { total_stars: 0, repositories: [] },
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

export const githubStats: GitHubStats = await fetchGitHubStats();