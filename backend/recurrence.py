"""Expand a chore's recurrence rule into concrete occurrence dates within [start, end]."""
import json
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from models import Chore


def expand_occurrences(chore: Chore, window_start: date, window_end: date) -> list[date]:
    """Return all dates in [window_start, window_end] on which this chore occurs."""
    if not chore.active:
        return []

    chore_end = chore.end_date if chore.end_date else window_end
    effective_end = min(chore_end, window_end)

    if chore.recurrence == "none":
        if window_start <= chore.start_date <= effective_end:
            return [chore.start_date]
        return []

    if chore.recurrence == "daily":
        return _daily(chore.start_date, window_start, effective_end)

    if chore.recurrence == "weekly":
        days = json.loads(chore.recurrence_days or "[]")
        return _weekly(chore.start_date, window_start, effective_end, days)

    if chore.recurrence == "monthly":
        return _monthly(chore.start_date, window_start, effective_end)

    return []


def _daily(start: date, win_start: date, win_end: date) -> list[date]:
    results = []
    current = max(start, win_start)
    while current <= win_end:
        results.append(current)
        current += timedelta(days=1)
    return results


def _weekly(start: date, win_start: date, win_end: date, days: list[int]) -> list[date]:
    """days = list of weekday ints, 0=Monday … 6=Sunday."""
    if not days:
        # Default to the weekday of the start date
        days = [start.weekday()]
    days_set = set(days)
    results = []
    current = max(start, win_start)
    while current <= win_end:
        if current.weekday() in days_set:
            results.append(current)
        current += timedelta(days=1)
    return results


def _monthly(start: date, win_start: date, win_end: date) -> list[date]:
    results = []
    # Start from the first monthly occurrence >= win_start
    current = start
    # Advance to the first occurrence on or after win_start
    while current < win_start:
        current = current + relativedelta(months=1)
    while current <= win_end:
        results.append(current)
        current = current + relativedelta(months=1)
    return results
