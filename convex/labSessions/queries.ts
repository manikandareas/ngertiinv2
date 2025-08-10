import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { assertLabOwner } from "../utils/ownership";

export const listByLabPaginated = query({
	args: {
		labId: v.id("labs"),
		status: v.optional(
			v.array(
				v.union(
					v.literal("in_progress"),
					v.literal("completed"),
					v.literal("timeout"),
					v.literal("abandoned"),
				),
			),
		),
		paginationOpts: paginationOptsValidator,
	},
	handler: async (ctx, args) => {
		await assertLabOwner(ctx, args.labId);

		const page = await ctx.db
			.query("labSessions")
			.withIndex("by_last_activity")
			.order("desc")
			.filter((q) => q.eq(q.field("labId"), args.labId))
			.filter((q) => {
				const sts = args.status ?? [];
				if (sts.length === 0) return true;
				if (sts.length === 1) return q.eq(q.field("status"), sts[0]);
				return q.or(...sts.map((s) => q.eq(q.field("status"), s)));
			})
			.paginate(args.paginationOpts);

		const enriched = await Promise.all(
			page.page.map(async (s) => {
				const user = await ctx.db.get(s.userId);
				return {
					...s,
					user: user
						? {
								name: (user as Doc<"users">).name ?? "",
								email: (user as Doc<"users">).email ?? "",
								avatarUrl: (user as Doc<"users">).image ?? "",
							}
						: { name: "", email: "", avatarUrl: "" },
				} as Doc<"labSessions"> & {
					user: { name: string; email: string; avatarUrl: string };
				};
			}),
		);

		return {
			page: enriched,
			isDone: page.isDone,
			continueCursor: page.continueCursor ?? "",
		} as {
			page: (Doc<"labSessions"> & {
				user: { name: string; email: string; avatarUrl: string };
			})[];
			isDone: boolean;
			continueCursor: string;
		};
	},
});

export const recentByLabPaginated = query({
	args: {
		labId: v.id("labs"),
		paginationOpts: paginationOptsValidator,
	},
	handler: async (ctx, args) => {
		await assertLabOwner(ctx, args.labId);

		const page = await ctx.db
			.query("labSessions")
			.withIndex("by_last_activity")
			.order("desc")
			.filter((q) => q.eq(q.field("labId"), args.labId))
			.paginate(args.paginationOpts);

		const enriched = await Promise.all(
			page.page.map(async (s) => {
				const user = await ctx.db.get(s.userId);
				return {
					...s,
					user: user
						? {
								name: (user as Doc<"users">).name ?? "",
								email: (user as Doc<"users">).email ?? "",
								avatarUrl: (user as Doc<"users">).image ?? "",
							}
						: { name: "", email: "", avatarUrl: "" },
				} as Doc<"labSessions"> & {
					user: { name: string; email: string; avatarUrl: string };
				};
			}),
		);

		return {
			page: enriched,
			isDone: page.isDone,
			continueCursor: page.continueCursor ?? "",
		} as {
			page: (Doc<"labSessions"> & {
				user: { name: string; email: string; avatarUrl: string };
			})[];
			isDone: boolean;
			continueCursor: string;
		};
	},
});

export const statusDistribution = query({
	args: {
		labId: v.id("labs"),
		windowDays: v.optional(v.number()),
	},
	handler: async (ctx, { labId, windowDays }) => {
		await assertLabOwner(ctx, labId);

		const now = Date.now();
		const days =
			typeof windowDays === "number" && windowDays > 0 ? windowDays : 7;
		const windowStart = now - days * 24 * 60 * 60 * 1000;

		const all = await ctx.db
			.query("labSessions")
			.withIndex("by_lab_status", (q) => q.eq("labId", labId))
			.collect();

		const inWindow = all.filter(
			(s) =>
				(s.startedAt ?? 0) >= windowStart ||
				(s.completedAt ?? 0) >= windowStart ||
				(s.lastActivity ?? 0) >= windowStart,
		);

		const counts = {
			in_progress: 0,
			completed: 0,
			timeout: 0,
			abandoned: 0,
		} as Record<"in_progress" | "completed" | "timeout" | "abandoned", number>;

		for (const s of inWindow) counts[s.status]++;

		return counts;
	},
});

export const activityTimeseries = query({
	args: {
		labId: v.id("labs"),
		days: v.optional(v.number()),
	},
	handler: async (ctx, { labId, days }) => {
		await assertLabOwner(ctx, labId);
		const now = Date.now();
		const totalDays = typeof days === "number" && days > 0 ? days : 7;
		const windowStart = now - totalDays * 24 * 60 * 60 * 1000;

		function ymd(ts: number) {
			const d = new Date(ts);
			const y = d.getUTCFullYear();
			const m = (d.getUTCMonth() + 1).toString().padStart(2, "0");
			const dd = d.getUTCDate().toString().padStart(2, "0");
			return `${y}-${m}-${dd}`;
		}

		const buckets = new Map<
			string,
			{
				sessionsStarted: number;
				sessionsCompleted: number;
				activeTouches: number;
			}
		>();
		// initialize buckets for each day
		for (let i = totalDays - 1; i >= 0; i--) {
			const d = new Date(now - i * 24 * 60 * 60 * 1000);
			const key = ymd(
				Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
			);
			buckets.set(key, {
				sessionsStarted: 0,
				sessionsCompleted: 0,
				activeTouches: 0,
			});
		}

		const all = await ctx.db
			.query("labSessions")
			.withIndex("by_lab_status", (q) => q.eq("labId", labId))
			.collect();

		for (const s of all) {
			if (typeof s.startedAt === "number" && s.startedAt >= windowStart) {
				const k = ymd(s.startedAt);
				const b = buckets.get(k);
				if (b) b.sessionsStarted++;
			}
			if (typeof s.completedAt === "number" && s.completedAt >= windowStart) {
				const k = ymd(s.completedAt);
				const b = buckets.get(k);
				if (b) b.sessionsCompleted++;
			}
			if (typeof s.lastActivity === "number" && s.lastActivity >= windowStart) {
				const k = ymd(s.lastActivity);
				const b = buckets.get(k);
				if (b) b.activeTouches++;
			}
		}

		return Array.from(buckets.entries()).map(([date, v]) => ({ date, ...v }));
	},
});

export const scoreHistogram = query({
	args: {
		labId: v.id("labs"),
		bucketSize: v.optional(v.number()),
		windowDays: v.optional(v.number()),
	},
	handler: async (ctx, { labId, bucketSize, windowDays }) => {
		await assertLabOwner(ctx, labId);
		const now = Date.now();
		const days =
			typeof windowDays === "number" && windowDays > 0 ? windowDays : 7;
		const windowStart = now - days * 24 * 60 * 60 * 1000;
		const size = bucketSize && bucketSize > 0 ? bucketSize : 10;

		// define buckets from 0..100
		const buckets = [] as { from: number; to: number; count: number }[];
		for (let f = 0; f < 100; f += size) {
			buckets.push({ from: f, to: Math.min(100, f + size), count: 0 });
		}

		const sessions = await ctx.db
			.query("labSessions")
			.withIndex("by_lab_status", (q) => q.eq("labId", labId))
			.collect();

		const completed = sessions.filter(
			(s) =>
				s.status === "completed" &&
				(s.completedAt ?? 0) >= windowStart &&
				Number.isFinite(s.totalScore ?? NaN),
		);

		for (const s of completed) {
			const score = Math.max(0, Math.min(100, Math.floor(s.totalScore)));
			const idx = Math.min(buckets.length - 1, Math.floor(score / size));
			buckets[idx].count++;
		}

		return { bucketSize: size, buckets };
	},
});

export const summaryByLab = query({
	args: { labId: v.id("labs") },
	handler: async (ctx, { labId }) => {
		await assertLabOwner(ctx, labId);

		const all = await ctx.db
			.query("labSessions")
			.withIndex("by_lab_status", (q) => q.eq("labId", labId))
			.collect();

		const counts = {
			in_progress: 0,
			completed: 0,
			timeout: 0,
			abandoned: 0,
		} as Record<"in_progress" | "completed" | "timeout" | "abandoned", number>;

		for (const s of all) counts[s.status]++;

		const total = all.length;
		const completed = counts.completed;
		const completionRate = total ? completed / total : 0;

		const avgScore = total
			? all.reduce((a, b) => a + (b.totalScore ?? 0), 0) / total
			: null;

		const avgAccuracy = total
			? all.reduce(
					(a, b) => a + (b.correctAnswers ?? 0) / (b.totalQuestions || 1),
					0,
				) / total
			: null;

		return {
			total,
			active: counts.in_progress,
			completed,
			timeout: counts.timeout,
			abandoned: counts.abandoned,
			completionRate,
			avgScore,
			avgAccuracy,
		};
	},
});
