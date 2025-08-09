import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
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
