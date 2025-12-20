# Multi-Project Analytics API

A unified FastAPI service that combines Vercel migration data with live PostHog analytics data.

## Features

- **Multi-Project Support**: Handle multiple projects with a single API
- **Unified Data**: Merge historical Vercel data with live PostHog analytics
- **Parallel Fetching**: All PostHog queries run concurrently for fast responses
- **Dynamic Registry**: Easy to add new projects via configuration

## Project Structure

```
api/
├── main.py              # FastAPI application and routes
├── config.py            # Project registry configuration
├── models.py            # Pydantic data models
├── services/
│   ├── __init__.py
│   ├── posthog.py       # PostHog API integration
│   ├── vercel.py        # Vercel data loading
│   └── merger.py        # Data merging logic
├── data/                # Vercel migration JSON files
│   ├── portfolio.json
│   ├── blog.json
│   ├── dashboard.json
│   ├── jiit-campus-updates.json
│   └── jiit-timetable-website.json
├── .env.example         # Environment variables template
└── pyproject.toml       # Python dependencies
```

## Setup

1. **Install dependencies**:
   ```bash
   cd api
   pip install -e .
   # or with uv:
   uv sync
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your PostHog API key and project IDs
   ```

3. **Run the API**:
   ```bash
   uvicorn main:app --reload
   # or
   python main.py
   ```

## API Endpoints

### List Projects
```
GET /api/v1/projects
```
Returns all available projects:
```json
{
  "projects": [
    {"slug": "portfolio", "name": "Portfolio Website"},
    {"slug": "blog", "name": "Blog"}
  ],
  "total": 2
}
```

### Get Project Stats
```
GET /api/v1/{project_slug}/stats?days=30
```
Returns unified analytics for a specific project:
- `timeseries`: Daily pageviews and visitors
- `stats`: Breakdowns by path, device, referrer, OS, country

### Get Timeseries Only
```
GET /api/v1/{project_slug}/timeseries?days=30
```
Lightweight endpoint for time-based data only.

## Adding a New Project

1. **Get PostHog Project ID**: Settings → Project Settings in PostHog

2. **Add to Registry** (in `config.py`):
   ```python
   PROJECT_REGISTRY = {
       "my-new-project": {
           "ph_id": os.getenv("PH_MY_PROJECT_ID", ""),
           "vercel_file": DATA_DIR / "my-new-project.json",
           "display_name": "My New Project"
       }
   }
   ```

3. **Add environment variable** (in `.env`):
   ```
   PH_MY_PROJECT_ID=12345
   ```

4. **Add Vercel data** (optional): Place migration JSON in `data/my-new-project.json`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `POSTHOG_API_KEY` | Your PostHog personal API key |
| `POSTHOG_BASE_URL` | PostHog API URL (default: `https://us.posthog.com`) |
| `PH_*_ID` | PostHog project IDs for each project |
