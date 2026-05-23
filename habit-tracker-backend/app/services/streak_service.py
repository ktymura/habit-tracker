from datetime import date, timedelta


def compute_current_streak(entry_dates: list[date], today: date) -> int:
    if not entry_dates:
        return 0

    dates = sorted(set(entry_dates), reverse=True)

    if dates[0] < today - timedelta(days=1):
        return 0

    streak = 1
    for i in range(1, len(dates)):
        if (dates[i - 1] - dates[i]).days == 1:
            streak += 1
        else:
            break

    return streak


def compute_longest_streak(entry_dates: list[date]) -> int:
    if not entry_dates:
        return 0

    dates = sorted(set(entry_dates))

    longest = 1
    current = 1

    for i in range(1, len(dates)):
        if (dates[i] - dates[i - 1]).days == 1:
            current += 1
            if current > longest:
                longest = current
        else:
            current = 1

    return longest
