import type { PageServerLoad } from './$types';
import { getGlobalViewCount } from '$lib/server/kv';

export const load: PageServerLoad = async ({ platform }) => {
	// Get global view count with caching and 429 fallback
	const result = await getGlobalViewCount(platform);

	return {
		totalPortfolios: result.count
	};
};
