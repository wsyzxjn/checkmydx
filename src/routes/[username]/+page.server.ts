import type { PageServerLoad } from './$types';
import { fetchMaimaiProfile } from '$lib/server/maimai';
import { getProfileViews } from '$lib/server/kv';

export const load: PageServerLoad = async ({ params, platform, cookies }) => {
	const { username } = params;

	// Return username immediately for optimistic UI
	// Stream the profile data so skeleton can show while loading
	const profilePromise = fetchMaimaiProfile(username).then((result) => {
		if (!result.success) {
			// Throw a regular error that will be caught by {:catch} in the template
			const errorMessage =
				result.error.type === 'NOT_FOUND'
					? `找不到玩家「${username}」`
					: result.error.type === 'RATE_LIMIT'
						? '成绩服务请求过于频繁，请稍后再试。'
						: result.error.message || '获取 maimai 玩家数据失败';
			throw new Error(errorMessage);
		}
		return result.data;
	});

	// Read-only: render the current count (with an optimistic +1 for new
	// visitors). The actual increment is persisted by the /api/view beacon, which
	// only fires in real browsers — keeping crawlers off the KV write path.
	const viewsPromise = getProfileViews({
		platform,
		username,
		cookies: { get: (name) => cookies.get(name) }
	}).catch(() => 0);

	return {
		username,
		profile: profilePromise,
		views: viewsPromise
	};
};
