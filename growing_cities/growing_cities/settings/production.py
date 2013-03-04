from .base import *

MIDDLEWARE_CLASSES = (
    'johnny.middleware.LocalStoreClearMiddleware',
    'johnny.middleware.QueryCacheMiddleware',
) + MIDDLEWARE_CLASSES

CACHES = {
    'default' : dict(
        BACKEND = 'johnny.backends.memcached.MemcachedCache',
        LOCATION = ['127.0.0.1:11211'],
        JOHNNY_CACHE = True,
    )
}

JOHNNY_MIDDLEWARE_KEY_PREFIX = get_env_variable('GROWING_CITIES_CACHE_KEY_PREFIX')
