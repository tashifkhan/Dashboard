"""
Cloudflare Web Analytics Service Layer

Handles all interactions with Cloudflare's GraphQL API for RUM (Real User Monitoring) data.
"""

import os
from datetime import datetime, timezone, timedelta
import httpx

from models import StatEntry, TimeseriesEntry


# Cloudflare API Configuration
CF_API_TOKEN = os.getenv("CLOUDFLARE_API_TOKEN", "")
CF_ACCOUNT_TAG = os.getenv("CLOUDFLARE_ACCOUNT_TAG", "")
CF_API_URL = "https://api.cloudflare.com/client/v4/graphql"


async def query_cloudflare(query: str, variables: dict) -> dict:
    """
    Execute a GraphQL query against Cloudflare's API.

    Args:
        query: The GraphQL query string
        variables: Query variables

    Returns:
        The response data or empty dict on error
    """
    if not CF_API_TOKEN or not CF_ACCOUNT_TAG:
        return {}

    headers = {
        "Authorization": f"Bearer {CF_API_TOKEN}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                CF_API_URL,
                headers=headers,
                json={"query": query, "variables": variables},
                timeout=20.0,
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            print(f"Cloudflare API error: {e}")
            return {}


async def fetch_cf_timeseries(site_tag: str, days: int = 30) -> list[TimeseriesEntry]:
    """
    Fetch timeseries pageview/visit data from Cloudflare Web Analytics.

    Args:
        site_tag: The Cloudflare site tag
        days: Number of days to look back

    Returns:
        List of TimeseriesEntry objects
    """
    now = datetime.now(timezone.utc)
    from_date = (now - timedelta(days=days)).isoformat()
    to_date = now.isoformat()

    query = """
    query RumTimeseries($accountTag: string!, $filter: ZoneRumPageloadEventsAdaptiveGroupsFilter_InputObject!) {
        viewer {
            accounts(filter: {accountTag: $accountTag}) {
                rumPageloadEventsAdaptiveGroups(limit: 5000, filter: $filter, orderBy: [datetimeHour_ASC]) {
                    count
                    sum {
                        visits
                    }
                    dimensions {
                        ts: datetimeHour
                    }
                }
            }
        }
    }
    """

    variables = {
        "accountTag": CF_ACCOUNT_TAG,
        "filter": {
            "AND": [
                {"datetime_geq": from_date, "datetime_leq": to_date},
                {"siteTag": site_tag},
                {"bot": 0},
            ]
        },
    }

    result = await query_cloudflare(query, variables)

    try:
        groups = (
            result.get("data", {})
            .get("viewer", {})
            .get("accounts", [{}])[0]
            .get("rumPageloadEventsAdaptiveGroups", [])
        )

        # Aggregate by day
        daily_data: dict[str, TimeseriesEntry] = {}
        for group in groups:
            ts = group.get("dimensions", {}).get("ts", "")
            if not ts:
                continue

            date_obj = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            day_key = date_obj.strftime("%Y-%m-%d")

            pageviews = group.get("count", 0)
            visitors = group.get("sum", {}).get("visits", 0)

            if day_key in daily_data:
                daily_data[day_key].pageviews += pageviews
                daily_data[day_key].visitors += visitors
            else:
                daily_data[day_key] = TimeseriesEntry(
                    date=datetime.fromisoformat(f"{day_key}T00:00:00+00:00"),
                    pageviews=pageviews,
                    visitors=visitors,
                    bounce_rate=0.0,
                )

        return sorted(daily_data.values(), key=lambda x: x.date)
    except Exception as e:
        print(f"Error parsing Cloudflare timeseries: {e}")
        return []


async def fetch_cf_breakdown(
    site_tag: str, dimension: str, days: int = 30, limit: int = 15
) -> list[StatEntry]:
    """
    Fetch breakdown statistics for a specific dimension from Cloudflare.

    Args:
        site_tag: The Cloudflare site tag
        dimension: The dimension to break down by (userAgentOS, userAgentBrowser, countryName, refererHost, requestPath)
        days: Number of days to look back
        limit: Maximum number of results to return

    Returns:
        List of StatEntry objects
    """
    now = datetime.now(timezone.utc)
    from_date = (now - timedelta(days=days)).isoformat()
    to_date = now.isoformat()

    query = f"""
    query GetRumBreakdown($accountTag: string!, $siteTag: string!, $from: Time!, $to: Time!) {{
        viewer {{
            accounts(filter: {{ accountTag: $accountTag }}) {{
                rumPageloadEventsAdaptiveGroups(
                    limit: {limit}
                    filter: {{ datetime_geq: $from, datetime_leq: $to, siteTag: $siteTag, bot: 0 }}
                    orderBy: [sum_visits_DESC]
                ) {{
                    dimensions {{
                        key: {dimension}
                    }}
                    count
                    sum {{
                        visits
                    }}
                }}
            }}
        }}
    }}
    """

    variables = {
        "accountTag": CF_ACCOUNT_TAG,
        "siteTag": site_tag,
        "from": from_date,
        "to": to_date,
    }

    result = await query_cloudflare(query, variables)

    try:
        groups = (
            result.get("data", {})
            .get("viewer", {})
            .get("accounts", [{}])[0]
            .get("rumPageloadEventsAdaptiveGroups", [])
        )

        entries = []
        for group in groups:
            key = group.get("dimensions", {}).get("key", "")
            if not key:
                key = "(unknown)"

            # Normalize key to lowercase
            normalized_key = key.lower() if key else key

            entries.append(
                StatEntry(
                    key=normalized_key,
                    pageviews=group.get("count", 0),
                    visitors=group.get("sum", {}).get("visits", 0),
                )
            )

        return entries
    except Exception as e:
        print(f"Error parsing Cloudflare breakdown: {e}")
        return []


async def fetch_cf_all_breakdowns(
    site_tag: str, days: int = 30
) -> dict[str, list[StatEntry]]:
    """
    Fetch all breakdown statistics in parallel from Cloudflare.

    Args:
        site_tag: The Cloudflare site tag
        days: Number of days to look back

    Returns:
        Dictionary mapping field names to lists of StatEntry objects
    """
    import asyncio

    # Map our standard field names to Cloudflare dimensions
    dimension_map = {
        "path": "requestPath",
        "os_name": "userAgentOS",
        "device_type": "userAgentDevice",
        "referrer": "refererHost",
        "country": "countryName",
    }

    tasks = {
        field: fetch_cf_breakdown(site_tag, cf_dim, days)
        for field, cf_dim in dimension_map.items()
    }

    results = await asyncio.gather(*tasks.values())

    return dict(zip(tasks.keys(), results))
