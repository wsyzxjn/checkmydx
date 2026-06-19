import {
	CACHE_KEY_PREFIX,
	CACHE_TTL_SECONDS,
	STALE_CACHE_MAX_AGE_MS,
	GLOBAL_VIEW_KEY
} from './constants';
import type { CachedViewCount } from './types';

// Build cache key for a username's view count
export function buildCacheKey(username: string): string {
	return `${CACHE_KEY_PREFIX}${username.toLowerCase()}`;
}

// Build cache key for global view count
export function buildGlobalCacheKey(): string {
	return `${CACHE_KEY_PREFIX}${GLOBAL_VIEW_KEY}`;
}

// Get cached view count from edge cache
export async function getCachedCount(
	caches: CacheStorage & { default: Cache },
	key: string
): Promise<CachedViewCount | null> {
	try {
		const cache = caches.default;
		const response = await cache.match(new Request(key));

		if (!response) return null;

		const data = (await response.json()) as CachedViewCount;
		return data;
	} catch {
		return null;
	}
}

// Store view count in edge cache
export async function setCachedCount(
	caches: CacheStorage & { default: Cache },
	key: string,
	data: CachedViewCount
): Promise<void> {
	try {
		const cache = caches.default;
		const response = new Response(JSON.stringify(data), {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': `max-age=${CACHE_TTL_SECONDS}`
			}
		});
		await cache.put(new Request(key), response);
	} catch (error) {
		console.error('Failed to set cache:', error);
	}
}

export function isCacheExpired(cached: CachedViewCount): boolean {
	const ageMs = Date.now() - cached.cachedAt;
	return ageMs > CACHE_TTL_SECONDS * 1000;
}

export function isCacheTooStale(cached: CachedViewCount): boolean {
	const ageMs = Date.now() - cached.cachedAt;
	return ageMs > STALE_CACHE_MAX_AGE_MS;
}
