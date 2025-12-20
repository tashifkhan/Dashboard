"""
Multi-Project Analytics API

A unified API for fetching analytics data from multiple projects,
combining Vercel migration data with live PostHog data.

Endpoints:
- GET /api/v1/projects - List all available projects
- GET /api/v1/{project_slug}/stats - Get unified stats for a project
"""

import asyncio
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables BEFORE importing modules that depend on them
load_dotenv()

from config import PROJECT_REGISTRY, get_project_config, list_available_projects
from models import AllStats, Metadata, ProjectInfo, ProjectListResponse
from services import (
    fetch_timeseries,
    fetch_all_breakdowns,
    load_vercel_data,
    get_empty_stats,
    merge_timeseries,
    merge_stats,
)

# --- APP SETUP ---
app = FastAPI(
    title="Multi-Project Analytics API",
    description="Unified analytics combining Vercel migration data with PostHog live data",
    version="1.0.0",
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- ENDPOINTS ---

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "message": "Multi-Project Analytics API",
        "version": "1.0.0"
    }


@app.get("/api/v1/projects", response_model=ProjectListResponse)
async def get_projects():
    """
    List all projects available on this dashboard.
    
    Returns a list of projects with their slugs and display names.
    """
    projects = list_available_projects()
    return ProjectListResponse(
        projects=[ProjectInfo(**p) for p in projects],
        total=len(projects)
    )


@app.get("/api/v1/{project_slug}/stats", response_model=AllStats)
async def get_project_stats(
    project_slug: str,
    days: int = Query(default=30, ge=1, le=365, description="Number of days to fetch data for")
):
    """
    Get unified analytics stats for a specific project.
    
    Combines Vercel migration data with live PostHog data.
    
    Args:
        project_slug: The URL slug of the project (e.g., "portfolio", "blog")
        days: Number of days to look back (1-365, default: 30)
        
    Returns:
        AllStats object containing merged timeseries and breakdown stats
    """
    # Validate project exists
    config = get_project_config(project_slug)
    if config is None:
        raise HTTPException(
            status_code=404,
            detail=f"Project '{project_slug}' not found. Use /api/v1/projects to see available projects."
        )
    
    ph_id = config["ph_id"]
    vercel_file = config["vercel_file"]
    
    # 1. Load Vercel migration data
    vercel_data = load_vercel_data(vercel_file)
    if vercel_data is None:
        vercel_data = get_empty_stats()
    
    # 2. Fetch PostHog data in parallel (if project has a PostHog ID configured)
    ph_timeseries = []
    ph_breakdowns = {}
    
    if ph_id:
        # Fetch timeseries and all breakdowns concurrently
        ts_task = fetch_timeseries(ph_id, days)
        breakdowns_task = fetch_all_breakdowns(ph_id, days)
        
        ph_timeseries, ph_breakdowns = await asyncio.gather(ts_task, breakdowns_task)
    
    # 3. Merge Vercel and PostHog data
    merged_timeseries = merge_timeseries(vercel_data.timeseries, ph_timeseries)
    merged_stats = merge_stats(vercel_data.stats, ph_breakdowns)
    
    # 4. Build unified response
    return AllStats(
        metadata=Metadata(
            export_date=datetime.now(timezone.utc),
            source=f"unified_{project_slug}"
        ),
        timeseries=merged_timeseries,
        stats=merged_stats
    )


@app.get("/api/v1/{project_slug}/timeseries")
async def get_project_timeseries(
    project_slug: str,
    days: int = Query(default=30, ge=1, le=365, description="Number of days to fetch data for")
):
    """
    Get only timeseries data for a specific project.
    
    This is a lighter endpoint when you only need the time-based data.
    """
    config = get_project_config(project_slug)
    if config is None:
        raise HTTPException(
            status_code=404,
            detail=f"Project '{project_slug}' not found."
        )
    
    ph_id = config["ph_id"]
    vercel_file = config["vercel_file"]
    
    # Load Vercel data
    vercel_data = load_vercel_data(vercel_file)
    vercel_ts = vercel_data.timeseries if vercel_data else []
    
    # Fetch PostHog timeseries
    ph_ts = []
    if ph_id:
        ph_ts = await fetch_timeseries(ph_id, days)
    
    # Merge and return
    merged = merge_timeseries(vercel_ts, ph_ts)
    
    return {
        "project": project_slug,
        "days": days,
        "timeseries": merged
    }


# --- MAIN ENTRY POINT ---

def main():
    """Run the API server (for development)."""
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
