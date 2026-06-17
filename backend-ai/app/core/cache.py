import json
import hashlib
import redis.asyncio as redis
from typing import Optional, Any
from app.config import settings

redis_client: Optional[redis.Redis] = None


async def get_redis():
    global redis_client
    if redis_client is None:
        redis_client = redis.from_url(settings.redis_url, decode_responses=True)
    return redis_client


def make_cache_key(prefix: str, *args, **kwargs) -> str:
    raw = str(args) + str(sorted(kwargs.items()))
    h = hashlib.md5(raw.encode()).hexdigest()
    return f"{prefix}:{h}"


async def cache_get(key: str) -> Optional[Any]:
    r = await get_redis()
    data = await r.get(key)
    if data:
        return json.loads(data)
    return None


async def cache_set(key: str, value: Any, ttl: int = 3600):
    r = await get_redis()
    await r.setex(key, ttl, json.dumps(value, default=str))


async def cache_delete(pattern: str):
    r = await get_redis()
    keys = await r.keys(pattern)
    if keys:
        await r.delete(*keys)


async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None
