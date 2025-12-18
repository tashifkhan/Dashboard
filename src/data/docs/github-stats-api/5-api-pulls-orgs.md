# API Endpoints: Pull Requests & Organizations

Endpoints for tracking user contributions to their own projects and external organizations.

---

## 1. Get User's Pull Requests (Own Repos)

Returns all pull requests created by the user in their own repositories.

- **Endpoint**: `GET /{username}/me/pulls`
- **Description**: Includes status (merged, closed, or open) and PR metadata.

### Response

```json
[
	{
		"repo": "RepoName",
		"number": 123,
		"title": "Fix bug in feature X",
		"state": "merged",
		"url": "https://github.com/...",
		"body": "This PR fixes ..."
	}
]
```

---

## 2. Get Organizations Contributed To

Returns organizations where the user has contributed via merged PRs.

- **Endpoint**: `GET /{username}/org-contributions`
- **Description**: Lists organizations and the specific repositories contributed to.

### Response

```json
[
	{
		"org": "openai",
		"org_url": "https://github.com/openai",
		"repos": ["repo1", "repo2"]
	}
]
```

---

## 3. Get PRs in Other Repositories

Returns pull requests opened by the user in external repositories (open source contributions).

- **Endpoint**: `GET /{username}/prs`
- **Description**: Tracks PRs not owned by the user.

### Response

```json
[
	{
		"repo": "OtherRepo",
		"number": 456,
		"title": "Add new feature",
		"state": "closed",
		"user": "tashifkhan",
		"url": "https://github.com/..."
	}
]
```
