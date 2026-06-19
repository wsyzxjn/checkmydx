import { LxnsOAuthClient } from 'lxns-rhythm-api';
import { env } from '$env/dynamic/public';
import type {
	PlayerProfile,
	PlayerScore,
	ScoreQuality,
	GradeBucket,
	FCType,
	FSType,
	SyncWeek,
	ChartType,
	RatingTrendPoint
} from '$lib/types/player';

const BASE_URL = 'https://maimai.lxns.net/api/v0/';
const TOKEN_KEY = 'checkmydx:lxns-token';
const OAUTH_STATE_KEY = 'checkmydx:lxns-oauth-state';
const OAUTH_VERIFIER_KEY = 'checkmydx:lxns-oauth-verifier';
const OAUTH_SCOPES = ['read_user_profile', 'read_player'] as const;

type LxnsToken = {
	accessToken: string;
	refreshToken: string;
	expiresAt: number;
	scope: string;
};

type LxnsPlayer = {
	name: string;
	rating: number;
	friend_code: number;
	star: number;
	course_rank: number;
	class_rank: number;
	upload_time?: string;
	icon?: { id: number; name?: string };
	trophy?: { name?: string };
	name_plate?: { id: number; name?: string };
	frame?: { id: number; name?: string };
};

type LxnsScore = {
	id: number;
	song_name?: string;
	level?: string;
	achievements: number;
	dx_score: number;
	dx_rating?: number;
	rate?: string;
	fc?: 'app' | 'ap' | 'fcp' | 'fc' | null;
	fs?: 'fsdp' | 'fsd' | 'fsp' | 'fs' | 'sync' | null;
	dx_star?: number | null;
	type: 'standard' | 'dx' | 'utage';
	upload_time?: string;
	play_time?: string;
};

type LxnsBests = {
	standard: LxnsScore[];
	dx: LxnsScore[];
	standard_total: number;
	dx_total: number;
};

type LxnsHeatmap = Record<string, number>;

type LxnsTrendPoint = {
	total: number;
	standard_total: number;
	dx_total: number;
	date: string | number;
};

export function isLxnsOAuthConfigured() {
	return Boolean(env.PUBLIC_LXNS_OAUTH_CLIENT_ID);
}

function getRedirectURI() {
	return `${window.location.origin}/oauth/callback`;
}

function createOAuthClient() {
	if (!env.PUBLIC_LXNS_OAUTH_CLIENT_ID) {
		throw new Error('尚未配置 PUBLIC_LXNS_OAUTH_CLIENT_ID');
	}

	return new LxnsOAuthClient({
		clientId: env.PUBLIC_LXNS_OAUTH_CLIENT_ID,
		redirectURI: getRedirectURI(),
		baseURL: BASE_URL
	});
}

function randomToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return base64Url(bytes);
}

function base64Url(bytes: Uint8Array) {
	return btoa(String.fromCharCode(...bytes))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/g, '');
}

async function sha256Base64Url(value: string) {
	const bytes = new TextEncoder().encode(value);
	const digest = await crypto.subtle.digest('SHA-256', bytes);
	return base64Url(new Uint8Array(digest));
}

export async function beginLxnsOAuth() {
	const client = createOAuthClient();
	const state = randomToken();
	const verifier = randomToken();
	const challenge = await sha256Base64Url(verifier);

	sessionStorage.setItem(OAUTH_STATE_KEY, state);
	sessionStorage.setItem(OAUTH_VERIFIER_KEY, verifier);

	window.location.href = client.createAuthorizeURL({
		scope: [...OAUTH_SCOPES],
		state,
		codeChallenge: challenge,
		codeChallengeMethod: 'S256'
	});
}

export async function finishLxnsOAuthCallback(url: URL) {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = sessionStorage.getItem(OAUTH_STATE_KEY);
	const verifier = sessionStorage.getItem(OAUTH_VERIFIER_KEY);

	if (!code) throw new Error('LXNS 没有返回授权码');
	if (!state || state !== storedState) throw new Error('LXNS OAuth 状态校验失败');
	if (!verifier) throw new Error('缺少 LXNS OAuth 校验信息');

	const token = await createOAuthClient().exchangeCodeForToken({
		code,
		codeVerifier: verifier
	});

	sessionStorage.removeItem(OAUTH_STATE_KEY);
	sessionStorage.removeItem(OAUTH_VERIFIER_KEY);

	const storedToken: LxnsToken = {
		accessToken: token.access_token,
		refreshToken: token.refresh_token,
		expiresAt: Date.now() + token.expires_in * 1000,
		scope: token.scope
	};
	localStorage.setItem(TOKEN_KEY, JSON.stringify(storedToken));
	return storedToken;
}

export function hasStoredLxnsToken() {
	return Boolean(readStoredToken());
}

function readStoredToken(): LxnsToken | null {
	const raw = localStorage.getItem(TOKEN_KEY);
	if (!raw) return null;

	try {
		return JSON.parse(raw) as LxnsToken;
	} catch {
		localStorage.removeItem(TOKEN_KEY);
		return null;
	}
}

async function getAccessToken() {
	const token = readStoredToken();
	if (!token) throw new Error('请先连接 LXNS');

	if (Date.now() < token.expiresAt - 30_000) {
		return token.accessToken;
	}

	const refreshed = await createOAuthClient().refreshAccessToken({
		refreshToken: token.refreshToken
	});

	const nextToken: LxnsToken = {
		accessToken: refreshed.access_token,
		refreshToken: refreshed.refresh_token,
		expiresAt: Date.now() + refreshed.expires_in * 1000,
		scope: refreshed.scope
	};
	localStorage.setItem(TOKEN_KEY, JSON.stringify(nextToken));
	return nextToken.accessToken;
}

export async function fetchAuthorizedMaimaiProfile(): Promise<PlayerProfile> {
	const accessToken = await getAccessToken();
	const authorized = createOAuthClient().createAuthorizedClient(accessToken);
	const [player, bests, allScoresRaw, heatmap, trend] = await Promise.all([
		authorized.maimai.getPlayer() as Promise<LxnsPlayer>,
		authorized.maimai.getBests() as Promise<LxnsBests>,
		authorized.maimai.getScores().catch(() => [] as LxnsScore[]) as Promise<LxnsScore[]>,
		authorized.maimai.getHeatmap().catch(() => null) as Promise<LxnsHeatmap | null>,
		authorized.maimai.getTrend().catch(() => []) as Promise<LxnsTrendPoint[]>
	]);

	return transformLxnsProfile(player, bests, allScoresRaw, heatmap, trend);
}

function scoreToPlayerScore(score: LxnsScore): PlayerScore {
	const level = score.level || '??';
	const constant = parseConstant(level);
	return {
		id: score.id,
		title: score.song_name || `曲目 ${score.id}`,
		difficulty: level,
		constant,
		achievements: score.achievements,
		grade: score.rate?.toUpperCase() || '—',
		rating: score.dx_rating ?? 0,
		dxScore: score.dx_score,
		type: score.type as ChartType,
		fc: (score.fc ?? null) as FCType,
		fs: (score.fs ?? null) as FSType,
		dxStar: score.dx_star ?? null,
		timestamp: score.play_time || score.upload_time || null
	};
}

// '14+' -> 14.9, '13.6' -> 13.6. Returns null when unparseable.
function parseConstant(level: string): number | null {
	const match = level.match(/(\d+(?:\.\d+)?)/);
	if (!match) return null;
	const base = parseFloat(match[1]);
	return level.includes('+') ? base + 0.9 : base;
}

// Map a LXNS rate code (e.g. 'sssp') to a display label ('SSS+') and a color.
const GRADE_META: Record<string, { label: string; color: string }> = {
	sssp: { label: 'SSS+', color: '#fbbf24' },
	sss: { label: 'SSS', color: '#fcd34d' },
	ssp: { label: 'SS+', color: '#a3e635' },
	ss: { label: 'SS', color: '#84cc16' },
	sp: { label: 'S+', color: '#22d3ee' },
	s: { label: 'S', color: '#38bdf8' }
};

// S and above only — anything below is dropped from the distribution.
const GRADE_ORDER = ['sssp', 'sss', 'ssp', 'ss', 'sp', 's'];

function buildGradeDistribution(scores: PlayerScore[]): GradeBucket[] {
	const counts = new Map<string, number>();
	for (const score of scores) {
		const key = score.grade.toLowerCase();
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}
	return GRADE_ORDER.filter((key) => counts.has(key)).map((key) => ({
		name: GRADE_META[key]?.label ?? key.toUpperCase(),
		count: counts.get(key) ?? 0,
		color: GRADE_META[key]?.color ?? '#94a3b8'
	}));
}

function computeQuality(scores: PlayerScore[]): ScoreQuality {
	let allPerfect = 0;
	let fullCombo = 0;
	let fullSyncDx = 0;
	let fullSync = 0;
	for (const score of scores) {
		if (score.fc === 'app' || score.fc === 'ap') allPerfect += 1;
		else if (score.fc === 'fcp' || score.fc === 'fc') fullCombo += 1;
		if (score.fs === 'fsdp' || score.fs === 'fsd') fullSyncDx += 1;
		else if (score.fs === 'fsp' || score.fs === 'fs') fullSync += 1;
	}
	return { allPerfect, fullCombo, fullSyncDx, fullSync };
}

function heatmapToWeeks(heatmap: LxnsHeatmap): { total: number; weeks: SyncWeek[] } {
	const today = new Date();
	const start = new Date(today);
	start.setDate(today.getDate() - 52 * 7);

	const weeks: SyncWeek[] = [];
	let total = 0;
	for (let week = 0; week < 52; week++) {
		const days = [];
		for (let day = 0; day < 7; day++) {
			const date = new Date(start);
			date.setDate(start.getDate() + week * 7 + day);
			const key = date.toISOString().slice(0, 10);
			const count = heatmap[key] ?? 0;
			total += count;
			days.push({ date: key, count });
		}
		weeks.push({ days });
	}
	return { total, weeks };
}

function transformLxnsProfile(
	player: LxnsPlayer,
	bests: LxnsBests,
	allScoresRaw: LxnsScore[],
	heatmap: LxnsHeatmap | null,
	trend: LxnsTrendPoint[]
): PlayerProfile {
	// B50 = best entries (used for featured scores + rating breakdown).
	const b50 = [...bests.standard, ...bests.dx]
		.map(scoreToPlayerScore)
		.sort((a, b) => b.rating - a.rating);
	const featured = b50.slice(0, 6);
	// Full score history = every chart the player has recorded. Used for the
	// quality / grade distribution stats so they reflect all play, not just B50.
	const allScores = allScoresRaw.map(scoreToPlayerScore);
	const gradeDistribution = buildGradeDistribution(allScores);
	const quality = computeQuality(allScores);
	const oldB35 = bests.standard_total;
	const newB15 = bests.dx_total;
	const syncHeatmap = heatmap ? heatmapToWeeks(heatmap) : null;
	const ratingTrend: RatingTrendPoint[] = trend.map((p) => ({
		total: p.total,
		oldB35: p.standard_total,
		newB15: p.dx_total,
		date: typeof p.date === 'number' ? new Date(p.date).toISOString() : p.date
	}));

	return {
		identity: {
			name: player.name,
			friendCode: String(player.friend_code),
			avatarUrl: player.icon?.id
				? `https://assets2.lxns.net/maimai/icon/${player.icon.id}.png`
				: '/favicon.svg',
			trophy: player.trophy?.name ?? null,
			courseRank: player.course_rank ?? null,
			classRank: player.class_rank ?? null,
			star: player.star ?? null,
			rating: player.rating,
			lastSync: player.upload_time ?? null
		},
		rating: { total: player.rating, oldB35, newB15 },
		ratingTrend,
		scores: featured,
		b50Count: b50.length,
		totalScoreCount: allScores.length,
		quality,
		gradeDistribution,
		heatmap: syncHeatmap
	};
}
