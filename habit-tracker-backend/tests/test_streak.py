from datetime import date, timedelta

from app.services.streak_service import compute_current_streak, compute_longest_streak

TODAY = date(2026, 5, 10)


# --- compute_current_streak ---

def test_current_streak_empty():
    # Brak wpisów -> streak = 0
    assert compute_current_streak([], TODAY) == 0


def test_current_streak_single_today():
    # Wpis tylko dzisiaj -> streak = 1
    assert compute_current_streak([TODAY], TODAY) == 1


def test_current_streak_single_yesterday():
    # Wczorajszy wpis bez dzisiejszego -> streak nadal aktywny (grace period)
    assert compute_current_streak([TODAY - timedelta(days=1)], TODAY) == 1


def test_current_streak_broken_two_days_ago():
    # Ostatni wpis 2 dni temu -> streak przerwany, zwraca 0
    assert compute_current_streak([TODAY - timedelta(days=2)], TODAY) == 0


def test_current_streak_consecutive_five_days():
    # 5 kolejnych dni kończących się dziś -> streak = 5
    dates = [TODAY - timedelta(days=i) for i in range(5)]
    assert compute_current_streak(dates, TODAY) == 5


def test_current_streak_gap_in_middle():
    # 3 dni z rzędu, przerwa, potem starsze wpisy -> liczymy tylko ostatnią serię
    recent = [TODAY - timedelta(days=i) for i in range(3)]
    older = [TODAY - timedelta(days=5), TODAY - timedelta(days=6)]
    assert compute_current_streak(recent + older, TODAY) == 3


def test_current_streak_ignores_duplicates():
    # Duplikaty dat nie wydłużają streaka
    dates = [TODAY, TODAY, TODAY - timedelta(days=1)]
    assert compute_current_streak(dates, TODAY) == 2


# --- compute_longest_streak ---

def test_longest_streak_empty():
    # Brak wpisów -> longest = 0
    assert compute_longest_streak([]) == 0


def test_longest_streak_single():
    # Jeden wpis -> longest = 1
    assert compute_longest_streak([TODAY]) == 1


def test_longest_streak_all_consecutive():
    # 7 kolejnych dni -> longest = 7
    dates = [TODAY - timedelta(days=i) for i in range(7)]
    assert compute_longest_streak(dates) == 7


def test_longest_streak_picks_longer_of_two():
    # Dwie serie (3 i 5 dni) -> zwraca 5
    streak_3 = [date(2026, 1, 1) + timedelta(days=i) for i in range(3)]
    streak_5 = [date(2026, 2, 1) + timedelta(days=i) for i in range(5)]
    assert compute_longest_streak(streak_3 + streak_5) == 5


def test_longest_streak_ignores_duplicates():
    # Duplikaty dat nie wydłużają streaka
    dates = [TODAY, TODAY, TODAY - timedelta(days=1)]
    assert compute_longest_streak(dates) == 2


def test_longest_streak_non_consecutive():
    # Żadne dwa dni nie sąsiadują -> longest = 1
    dates = [date(2026, 1, 1), date(2026, 1, 3), date(2026, 1, 5)]
    assert compute_longest_streak(dates) == 1
