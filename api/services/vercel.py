"""
Vercel Data Service Layer

Handles loading and processing of Vercel migration data from local JSON files.
"""

import json
from pathlib import Path

from models import AllStats, Metadata, Stats, TimeseriesEntry
from datetime import datetime, timezone


def load_vercel_data(file_path: Path) -> AllStats | None:
    """
    Load Vercel migration data from a JSON file.
    
    Args:
        file_path: Path to the JSON file
        
    Returns:
        AllStats object or None if file doesn't exist
    """
    try:
        with open(file_path, "r") as f:
            data = json.load(f)
            return AllStats(**data)
    except FileNotFoundError:
        return None
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON file {file_path}: {e}")
        return None


def get_empty_stats() -> AllStats:
    """
    Create an empty AllStats object for projects without migration data.
    
    Returns:
        AllStats with empty timeseries and stats
    """
    return AllStats(
        metadata=Metadata(
            export_date=datetime.now(timezone.utc),
            source="initialized"
        ),
        timeseries=[],
        stats=Stats()
    )


def filter_timeseries_by_date(
    timeseries: list[TimeseriesEntry],
    days: int | None = None
) -> list[TimeseriesEntry]:
    """
    Filter timeseries entries to only include entries within the specified day range.
    
    Args:
        timeseries: List of TimeseriesEntry objects
        days: Number of days to include (None for all)
        
    Returns:
        Filtered list of TimeseriesEntry objects
    """
    if days is None:
        return timeseries
    
    cutoff = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    cutoff = cutoff.replace(day=cutoff.day - days) if days > 0 else cutoff
    
    return [
        entry for entry in timeseries
        if entry.date.replace(tzinfo=timezone.utc) >= cutoff
    ]
