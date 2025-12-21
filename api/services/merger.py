"""
Data Merging Service

Handles the unification of Vercel migration data and PostHog live data.
"""

from models import StatEntry, TimeseriesEntry, Stats


def merge_stat_lists(
    list_a: list[StatEntry], list_b: list[StatEntry]
) -> list[StatEntry]:
    """
    Merge two lists of StatEntry objects, summing pageviews/visitors for matching keys.
    Keys are normalized to lowercase for case-insensitive matching.

    Args:
        list_a: First list of StatEntry objects (e.g., from Vercel)
        list_b: Second list of StatEntry objects (e.g., from PostHog)

    Returns:
        Merged and sorted list of StatEntry objects
    """
    merged: dict[str, StatEntry] = {}

    for entry in list_a + list_b:
        # Normalize key to lowercase for case-insensitive matching
        normalized_key = entry.key.lower() if entry.key else entry.key
        if normalized_key in merged:
            # Sum the values for duplicate keys
            merged[normalized_key].pageviews += entry.pageviews
            merged[normalized_key].visitors += entry.visitors
        else:
            # Create a new copy with normalized key
            merged[normalized_key] = StatEntry(
                key=normalized_key, pageviews=entry.pageviews, visitors=entry.visitors
            )

    # Sort by pageviews descending
    return sorted(merged.values(), key=lambda x: x.pageviews, reverse=True)


def merge_timeseries(
    list_a: list[TimeseriesEntry], list_b: list[TimeseriesEntry]
) -> list[TimeseriesEntry]:
    """
    Merge two timeseries lists and sort by date.

    For overlapping dates, data from both sources is kept (they represent different time periods).

    Args:
        list_a: First timeseries list (e.g., from Vercel)
        list_b: Second timeseries list (e.g., from PostHog)

    Returns:
        Merged and sorted timeseries list
    """
    # Combine and sort by date
    combined = list_a + list_b
    return sorted(combined, key=lambda x: x.date)


def merge_stats(
    vercel_stats: Stats, posthog_stats: dict[str, list[StatEntry]]
) -> Stats:
    """
    Merge Vercel Stats with PostHog breakdown data.

    Args:
        vercel_stats: Stats object from Vercel migration data
        posthog_stats: Dictionary of PostHog breakdown results

    Returns:
        Merged Stats object
    """
    return Stats(
        path=merge_stat_lists(vercel_stats.path, posthog_stats.get("path", [])),
        device_type=merge_stat_lists(
            vercel_stats.device_type, posthog_stats.get("device_type", [])
        ),
        referrer=merge_stat_lists(
            vercel_stats.referrer, posthog_stats.get("referrer", [])
        ),
        os_name=merge_stat_lists(
            vercel_stats.os_name, posthog_stats.get("os_name", [])
        ),
        country=merge_stat_lists(
            vercel_stats.country, posthog_stats.get("country", [])
        ),
    )
