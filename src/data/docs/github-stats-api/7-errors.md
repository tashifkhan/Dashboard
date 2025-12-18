# Error Handling

The GitHub Analytics API uses standard HTTP status codes to indicate the success or failure of an API request.

---

## Error Status Codes

| Status Code | Description                                                                                                          |
| :---------- | :------------------------------------------------------------------------------------------------------------------- |
| `200`       | **Success**: The request was successful and the response body contains the requested data.                           |
| `404`       | **Not Found**: The requested GitHub user could not be found or does not exist.                                       |
| `500`       | **Internal Server Error**: Something went wrong on the server, often related to rate limits or configuration issues. |

---

## Error Response Format

Errors are returned as a JSON object containing a status and a descriptive message.

### 1. User Not Found

Returned when the specified username does not exist on GitHub.

```json
{
	"status": "error",
	"message": "User not found or API error",
	"topLanguages": [],
	"totalCommits": 0,
	"longestStreak": 0,
	"currentStreak": 0
}
```

### 2. GitHub Token Configuration Error

Returned when the server-side GitHub API token is missing or incorrectly configured.

```json
{
	"status": "error",
	"message": "GitHub token not configured",
	"topLanguages": [],
	"totalCommits": 0,
	"longestStreak": 0,
	"currentStreak": 0
}
```

---

## Rate Limits

Since this API communicates with the GitHub API, it is subject to GitHub's rate limits. If you receive persistent `500` errors, you may be hitting these limits.
