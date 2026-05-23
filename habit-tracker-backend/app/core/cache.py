import time


class TTLCache:
    def __init__(self) -> None:
        self.store: dict[str, tuple[float, object]] = {}

    def get(self, key: str):
        item = self.store.get(key)

        if not item:
            return None

        expires_at, value = item

        if time.time() > expires_at:
            self.store.pop(key, None)
            return None

        return value

    def set(self, key: str, value, ttl_seconds: int) -> None:
        self.store[key] = (time.time() + ttl_seconds, value)

    def invalidate_prefix(self, prefix: str) -> None:
        keys_to_remove = [key for key in self.store if key.startswith(prefix)]

        for key in keys_to_remove:
            self.store.pop(key, None)


analytics_cache = TTLCache()