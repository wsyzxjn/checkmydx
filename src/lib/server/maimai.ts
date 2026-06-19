import type {
	PlayerProfile,
	PlayerResult,
	PlayerScore,
	ScoreQuality,
	GradeBucket,
	FCType,
	FSType,
	SyncWeek,
	ChartType,
	RatingTrendPoint
} from '$lib/types/player';

// Deterministic mock data so demo profiles (amatsuka / rainbow14 / dxstar)
// stay stable across reloads without hitting any real API. Song ids are the
// real LXNS ids so jacket covers resolve against assets2.lxns.net.
const SONG_POOL: Array<[id: number, title: string, level: string, constant: number, type: ChartType]> = [
	[1663, '系ぎて', '14+', 14.9, 'dx'],
	[1379, 'sølips', '14+', 14.8, 'dx'],
	[799, 'QZKago Requiem', '14+', 14.6, 'standard'],
	[803, 'Schwarzschild', '14+', 14.9, 'standard'],
	[833, 'the EmpErroR', '14+', 14.9, 'standard'],
	[834, 'PANDORA PARADOXXX', '15', 15.0, 'standard'],
	[1311, '躯樹の墓守', '14+', 14.9, 'dx'],
	[1394, "World's end loneliness", '14+', 14.9, 'dx'],
	[1612, 'Latent Kingdom', '14+', 14.9, 'dx'],
	[1662, 'raputa', '14+', 14.9, 'dx'],
	[1753, '宙天', '14+', 14.9, 'dx'],
	[22, 'In Chaos', '14+', 14.8, 'standard'],
	[227, 'Garakuta Doll Play', '14+', 14.8, 'standard'],
	[456, 'Glorious Crown', '14+', 14.8, 'standard'],
	[571, 'Our Wrenally', '14+', 14.8, 'standard'],
	[643, 'Excalibur ～Revived resolution～', '14+', 14.8, 'standard'],
	[746, 'larva', '14+', 14.8, 'standard'],
	[773, 'SILENT BLUE', '14+', 14.8, 'standard'],
	[779, '怒槌', '14+', 14.8, 'standard'],
	[812, 'Alea jacta est!', '14+', 14.8, 'standard'],
	[825, '雷切-RAIKIRI-', '14+', 14.8, 'standard'],
	[384, 'VERTeX', '14+', 14.7, 'standard'],
	[496, 'AMAZING MIGHTYYYY!!!!', '14+', 14.7, 'standard'],
	[844, 'End Time', '14+', 14.7, 'standard'],
	[1026, 'TEmPTaTiON', '14+', 14.7, 'dx'],
	[1106, 'Valsqotch', '14+', 14.7, 'dx'],
	[1165, 'Regulus', '14+', 14.7, 'dx'],
	[1235, 'VIIIbit Explorer', '14+', 14.7, 'dx'],
	[1364, 'Lia=Fail', '14+', 14.7, 'dx'],
	[1374, 'GIGANTØMAKHIA', '14+', 14.7, 'dx']
];

function hashPlayerId(playerId: string): number {
	return playerId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

// Grade label -> rate code + display color. Ordered best-first. S and below
// are not shown in the distribution, so the pool stops at S.
const GRADE_META: { label: string; code: string; color: string }[] = [
	{ label: 'SSS+', code: 'sssp', color: '#fbbf24' },
	{ label: 'SSS', code: 'sss', color: '#fcd34d' },
	{ label: 'SS+', code: 'ssp', color: '#a3e635' },
	{ label: 'SS', code: 'ss', color: '#84cc16' },
	{ label: 'S+', code: 'sp', color: '#22d3ee' },
	{ label: 'S', code: 's', color: '#38bdf8' }
];

// Deterministically derive a 0-1 pseudo-random value from (seed, index).
function rand(seed: number, index: number): number {
	const x = Math.sin(seed * 9301 + index * 49297) * 233280;
	return x - Math.floor(x);
}

// Generate the full play history (~4 charts per song in the pool) so the
// quality / grade stats aggregate over a realistic volume, not just B50.
function buildAllScores(seed: number): PlayerScore[] {
	const scores: PlayerScore[] = [];
	let idx = 0;
	for (const [id, title, level, constant, type] of SONG_POOL) {
		// Each song contributes a few recorded charts; the first one is the
		// "best" play used for B50, the rest are weaker repeats/other diffs.
		const chartsPerSong = 3 + Math.floor(rand(seed, idx) * 3); // 3-5
		for (let c = 0; c < chartsPerSong; c++) {
			const r = rand(seed, idx * 10 + c);
			// Achievement: best chart 100.5-101, others 98-100.5 (so grade stays S+ and up).
			const achievements = c === 0 ? 100.5 + r * 0.5 : 98 + r * 2.5;
			const gradeIndex = achievements >= 100.5 ? 0 : achievements >= 100 ? 1 : achievements >= 99.5 ? 2 : achievements >= 99 ? 3 : achievements >= 98.5 ? 4 : 5;
			const grade = GRADE_META[Math.min(gradeIndex, GRADE_META.length - 1)];
			// fc/fs more likely on the best chart.
			const fcRoll = rand(seed, idx * 20 + c + 1);
			const fsRoll = rand(seed, idx * 30 + c + 2);
			const fc: FCType =
				c === 0 && fcRoll > 0.85 ? 'ap' : c === 0 && fcRoll > 0.6 ? 'fcp' : fcRoll > 0.75 ? 'fc' : null;
			const fs: FSType =
				c === 0 && fsRoll > 0.9 ? 'fsd' : fsRoll > 0.8 ? 'fsp' : fsRoll > 0.6 ? 'fs' : null;
			const dxRating = Math.round(constant * (achievements / 100) * 22);
			scores.push({
				id,
				title,
				difficulty: level,
				constant,
				achievements,
				grade: grade.label,
				rating: c === 0 ? dxRating : Math.round(dxRating * 0.6),
				dxScore: 2000 + Math.floor(r * 600),
				type,
				fc,
				fs,
				dxStar: c === 0 ? 5 : 3 + Math.floor(r * 3),
				timestamp: new Date().toISOString()
			});
			idx += 1;
		}
	}
	// Sort best-first so B50 featured = head.
	return scores.sort((a, b) => b.rating - a.rating);
}

const GRADE_ORDER = GRADE_META.map((g) => g.code);

function buildGradeDistribution(scores: PlayerScore[]): GradeBucket[] {
	const counts = new Map<string, number>();
	for (const score of scores) {
		const key = score.grade.toLowerCase();
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}
	return GRADE_ORDER.filter((key) => counts.has(key)).map((key) => ({
		name: GRADE_META.find((g) => g.code === key)?.label ?? key.toUpperCase(),
		count: counts.get(key) ?? 0,
		color: GRADE_META.find((g) => g.code === key)?.color ?? '#94a3b8'
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

function buildHeatmap(seed: number): { total: number; weeks: SyncWeek[] } {
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
			const wave = (week * 3 + day * 5 + seed) % 11;
			const count = wave < 3 ? 0 : Math.min(18, wave + (seed % 5));
			total += count;
			days.push({ date: date.toISOString().slice(0, 10), count });
		}
		weeks.push({ days });
	}
	return { total, weeks };
}

// Deterministic Rating-over-time trend for demo profiles. Generates ~16 weekly
// points leading up to the current rating, so the chart looks like growth.
function buildRatingTrend(seed: number, finalRating: number): RatingTrendPoint[] {
	const points = 16;
	const startRating = Math.max(14000, finalRating - 600 - (seed % 400));
	const step = (finalRating - startRating) / (points - 1);
	const today = new Date();

	const trend: RatingTrendPoint[] = [];
	for (let i = 0; i < points; i++) {
		// Small per-point wobble so it's not a dead-straight line.
		const wobble = ((seed + i * 13) % 11) - 5;
		const total = Math.round(startRating + step * i + wobble);
		const oldB35 = Math.round(total * (0.68 + ((seed + i) % 7) / 100));
		const date = new Date(today);
		date.setDate(today.getDate() - (points - 1 - i) * 7);
		trend.push({
			total,
			oldB35,
			newB15: total - oldB35,
			date: date.toISOString().slice(0, 10)
		});
	}
	// Pin the last point to the exact final rating.
	trend[points - 1].total = finalRating;
	trend[points - 1].oldB35 = Math.round(finalRating * 0.68);
	trend[points - 1].newB15 = finalRating - trend[points - 1].oldB35;
	return trend;
}

export async function fetchMaimaiProfile(playerId: string): Promise<PlayerResult> {
	const normalized = playerId.trim().toLowerCase();
	if (!normalized) {
		return {
			success: false,
			error: { type: 'NOT_FOUND', message: '请输入玩家 ID' }
		};
	}

	const seed = hashPlayerId(normalized);
	const allScores = buildAllScores(seed);
	const featured = allScores.slice(0, 6);
	const b50Count = Math.min(50, 35 + (seed % 16));
	const gradeDistribution = buildGradeDistribution(allScores);
	const quality = computeQuality(allScores);

	const rating = 15000 + (seed % 850);
	const oldB35 = Math.round(rating * (0.68 + (seed % 7) / 100));
	const newB15 = rating - oldB35;
	const heatmap = buildHeatmap(seed);
	const ratingTrend = buildRatingTrend(seed, rating);

	const profile: PlayerProfile = {
		identity: {
			name: normalized === 'amatsuka' ? 'Amatsuka' : `DX 玩家 ${normalized.toUpperCase()}`,
			friendCode: normalized,
			avatarUrl: '/favicon.svg',
			trophy: seed % 2 === 0 ? 'maimai DX 玩家' : null,
			courseRank: 18 + (seed % 4), // 十段 ~ 神殿
			classRank: seed % 4, // 白 ~ 紫
			star: 200 + (seed % 120),
			rating,
			lastSync: new Date().toISOString()
		},
		rating: { total: rating, oldB35, newB15 },
		ratingTrend,
		scores: featured,
		b50Count,
		totalScoreCount: allScores.length,
		quality,
		gradeDistribution,
		heatmap
	};

	return { success: true, data: profile };
}
