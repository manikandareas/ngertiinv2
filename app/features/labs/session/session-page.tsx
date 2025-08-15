import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { CheckIcon, WifiOffIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { NavigationBar } from "./navigation-bar";
import { OptionsList } from "./options-list";
import { QuestionView } from "./question-view";
import { ResultPage } from "./result-page";
import { ReviewPanel } from "./review-panel";
import { SessionHeader } from "./session-header";
import { SubmitDialog } from "./submit-dialog";
import { useAnswerQueue } from "./use-answer-queue";

type Question = {
	_id: Id<"questions">;
	questionOrder: number;
	questionText: string;
	explanation?: string | null;
};
type Option = {
	_id: Id<"questionOptions">;
	optionOrder: number;
	optionText: string;
};
type AnswerMap = Record<string, Id<"questionOptions">>;
type OptionsByQuestion = Record<string, Option[]>;

export function SessionPage() {
	const params = useParams<{ labId: string; sessionId: string }>();
	const sessionId = (params.sessionId ?? "") as Id<"labSessions">;
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const qc = useQueryClient();

	const sessionQuery = convexQuery(api.sessions.queries.getSessionBundle, {
		sessionId,
	});
	const resultQuery = convexQuery(api.sessions.queries.getResultBundle, {
		sessionId,
	});
	const sessionBundleKey = sessionQuery.queryKey;
	const resultBundleKey = resultQuery.queryKey;

	const {
		data: bundle,
		isPending: loading,
		isError,
		error,
	} = useQuery(sessionQuery);

	const [activeOrder, setActiveOrder] = useState<number>(0);
	// Orders list (robust order navigation)
	const orders = useMemo(
		() =>
			(bundle?.questions ?? [])
				.map((q) => q.questionOrder)
				.sort((a, b) => a - b),
		[bundle?.questions],
	);
	useEffect(() => {
		const qParam = searchParams.get("q");
		const qNum = qParam != null ? Number(qParam) : NaN;
		if (!Number.isNaN(qNum) && orders.includes(qNum)) {
			setActiveOrder(qNum);
			return;
		}
		if (bundle?.session?.currentQuestionOrder != null) {
			setActiveOrder(bundle.session.currentQuestionOrder);
		} else if (orders.length > 0) {
			const first = orders[0] ?? 0;
			setActiveOrder(first);
		}
	}, [bundle?.session?.currentQuestionOrder, orders, searchParams]);

	// Sync active order to URL (?q=)
	useEffect(() => {
		const current = searchParams.get("q");
		const next = String(activeOrder);
		if (current !== next) setSearchParams({ q: next }, { replace: true });
	}, [activeOrder, searchParams, setSearchParams]);

	const totalQuestions = bundle?.session?.totalQuestions ?? 0;
	const questions: Question[] = (bundle?.questions ?? []) as Question[];
	const optionsByQuestion: OptionsByQuestion = (bundle?.optionsByQuestion ??
		{}) as OptionsByQuestion;
	const answers: AnswerMap = (bundle?.answers ?? {}) as AnswerMap;
	const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

	const answerQueue = useAnswerQueue({
		sessionId,
		sessionBundleKey,
		debounceMs: 400,
	});

	const setCurrentQuestionFn = api.labSessions.mutations.setCurrentQuestion;
	const { mutate: setCurrentQuestion } = useMutation({
		mutationFn: useConvexMutation(setCurrentQuestionFn),
	});

	const submitFn = api.labSessions.mutations.submit;
	const { mutate: submitSession, isPending: submitting } = useMutation({
		mutationFn: useConvexMutation(submitFn),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: sessionBundleKey });
			qc.invalidateQueries({ queryKey: resultBundleKey });
		},
	});

	const [submitOpen, setSubmitOpen] = useState(false);

	// Derived collections
	const unansweredOrders = useMemo(() => {
		const answeredSet = new Set(Object.keys(answers));
		return questions
			.filter((q) => !answeredSet.has(q._id))
			.map((q) => q.questionOrder)
			.sort((a, b) => a - b);
	}, [answers, questions]);

	// Navigation by order (callbacks defined before any conditional returns)
	const gotoOrder = useCallback(
		(order: number) => {
			// Snap to closest valid order from list
			if (orders.length === 0) return;
			const exists = orders.includes(order);
			const base = orders[0] ?? order;
			const nextOrder = exists
				? order
				: orders.reduce(
						(prev, curr) =>
							Math.abs(curr - order) < Math.abs(prev - order) ? curr : prev,
						base,
					);
			setActiveOrder(nextOrder);
			setCurrentQuestion({ sessionId, questionOrder: nextOrder });
		},
		[orders, sessionId, setCurrentQuestion],
	);

	const onPrev = useCallback(() => {
		const idx = orders.findIndex((o) => o === activeOrder);
		if (idx > 0) {
			const prev = orders[idx - 1];
			if (prev != null) gotoOrder(prev);
		}
	}, [activeOrder, orders, gotoOrder]);

	const onNext = useCallback(() => {
		const idx = orders.findIndex((o) => o === activeOrder);
		if (idx >= 0 && idx < orders.length - 1) {
			const next = orders[idx + 1];
			if (next != null) gotoOrder(next);
		}
	}, [activeOrder, orders, gotoOrder]);

	const handleSubmitClick = useCallback(async () => {
		await answerQueue.flushNow();
		if (unansweredOrders.length > 0) {
			setSubmitOpen(true);
		} else {
			submitSession({ sessionId });
		}
	}, [sessionId, submitSession, unansweredOrders, answerQueue.flushNow]);

	// Keyboard shortcuts: 1–9 to select, arrows to navigate, Ctrl/Cmd+Enter to submit
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			// ignore if focused on inputs or editable
			const target = e.target as HTMLElement | null;
			if (
				target &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					(target as HTMLElement).isContentEditable)
			) {
				return;
			}
			if (submitting) return;

			if (e.key === "ArrowLeft") {
				e.preventDefault();
				const idx = orders.findIndex((o) => o === activeOrder);
				if (idx > 0) {
					const prev = orders[idx - 1];
					if (prev != null) gotoOrder(prev);
				}
				return;
			}
			if (e.key === "ArrowRight") {
				e.preventDefault();
				const idx = orders.findIndex((o) => o === activeOrder);
				if (idx >= 0 && idx < orders.length - 1) {
					const next = orders[idx + 1];
					if (next != null) gotoOrder(next);
				}
				return;
			}
			if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				handleSubmitClick();
				return;
			}
			// number keys 1..9 map to optionOrder 0..8
			const num = Number(e.key);
			if (!Number.isNaN(num) && num >= 1 && num <= 9) {
				const q = questions.find((qq) => qq.questionOrder === activeOrder);
				if (!q) return;
				const opts = optionsByQuestion[q._id] ?? [];
				const opt = opts.find((o) => o.optionOrder === num - 1);
				if (opt) {
					e.preventDefault();
					answerQueue.setAnswer(q._id, opt._id);
				}
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [
		submitting,
		orders,
		activeOrder,
		gotoOrder,
		handleSubmitClick,
		questions,
		optionsByQuestion,
		answerQueue.setAnswer,
	]);

	// Guard and redirects
	if (isError) {
		return (
			<div className="mx-auto w-full max-w-4xl px-6 py-16">
				<Card className="p-8">
					<p className="text-red-600 font-medium">
						{(error as Error)?.message ?? "Failed to load session"}
					</p>
					<div className="mt-4">
						<Button onClick={() => navigate("/labs")}>Back to Labs</Button>
					</div>
				</Card>
			</div>
		);
	}

	if (loading || !bundle) {
		return (
			<div className="mx-auto w-full max-w-5xl px-6 py-8 space-y-6">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-48 w-full" />
				<div className="flex gap-2">
					<Skeleton className="h-9 w-24" />
					<Skeleton className="h-9 w-24" />
					<Skeleton className="h-9 w-24" />
				</div>
			</div>
		);
	}

	if (bundle.session.status !== "in_progress") {
		return <ResultPage sessionId={sessionId} />;
	}

	// Robustly resolve by order only
	const qDoc = questions.find((q) => q.questionOrder === activeOrder) ?? null;
	const serverSelectedOptionId = qDoc ? answers[qDoc._id] : undefined;
	// Use optimistic answer if available, fallback to server answer
	const selectedOptionId = qDoc
		? answerQueue.getAnswer(qDoc._id, serverSelectedOptionId)
		: undefined;

	const onSelectOption = (optionId: Id<"questionOptions">) => {
		if (!qDoc) return;
		// Optimistic update - no loading state
		answerQueue.setAnswer(qDoc._id, optionId);
	};

	const now = Date.now();
	const endTimePassed = Boolean(
		bundle.lab.endTime && now > (bundle.lab.endTime ?? 0),
	);
	const attemptsLeft =
		bundle.lab.maxAttempts != null
			? Math.max(
					(bundle.lab.maxAttempts ?? 0) - (bundle.session.attemptNumber ?? 0),
					0,
				)
			: undefined;

	return (
		<div className="mx-auto w-full max-w-5xl px-6 py-8 space-y-6">
			<SessionHeader
				title={bundle.lab.name}
				attemptNumber={bundle.session.attemptNumber}
				answered={answeredCount}
				total={totalQuestions}
			/>

			{endTimePassed ? (
				<div className="rounded-md border border-amber-200 bg-amber-50 text-amber-900 p-3 text-sm">
					Periode pengerjaan telah berakhir. Attempt ini dimulai sebelum end
					time dan masih dapat diselesaikan.
				</div>
			) : null}
			{attemptsLeft === 0 ? (
				<div className="rounded-md border border-blue-200 bg-blue-50 text-blue-900 p-3 text-sm">
					Batas attempt tercapai. Anda tidak dapat memulai attempt baru setelah
					ini.
				</div>
			) : null}

			{qDoc ? (
				<div className="space-y-4">
					<QuestionView order={qDoc.questionOrder} text={qDoc.questionText} />
					<OptionsList
						options={optionsByQuestion[qDoc._id] ?? []}
						selectedOptionId={selectedOptionId}
						onSelect={onSelectOption}
						disabled={submitting}
						hint={
							answerQueue.hasError ? (
								<span className="inline-flex items-center gap-1 text-amber-600">
									<WifiOffIcon className="size-3" /> Retrying...
								</span>
							) : answerQueue.isSyncing ? (
								<span className="text-muted-foreground">Syncing...</span>
							) : answerQueue.lastSavedAt &&
								Date.now() - answerQueue.lastSavedAt < 2000 ? (
								<span className="inline-flex items-center gap-1 text-emerald-600">
									<CheckIcon className="size-3" /> Saved
								</span>
							) : (
								<span>Press 1–9 to answer</span>
							)
						}
					/>
				</div>
			) : (
				<Card className="p-6">No question found.</Card>
			)}

			<NavigationBar
				canPrev={orders.findIndex((o) => o === activeOrder) > 0}
				canNext={(() => {
					const idx = orders.findIndex((o) => o === activeOrder);
					return idx >= 0 && idx < orders.length - 1;
				})()}
				onPrev={onPrev}
				onNext={onNext}
				onSubmit={handleSubmitClick}
				submitting={submitting}
				reviewPanel={
					<ReviewPanel
						total={totalQuestions}
						answeredOrders={questions
							.filter((q) => answers[q._id])
							.map((q) => q.questionOrder)}
						unansweredOrders={unansweredOrders}
						activeOrder={activeOrder}
						onJump={gotoOrder}
						orders={orders}
						disabled={submitting}
					/>
				}
			/>

			<SubmitDialog
				open={submitOpen}
				onOpenChange={setSubmitOpen}
				unansweredOrders={unansweredOrders}
				onGoto={(order) => gotoOrder(order)}
				onConfirmSubmit={async () => {
					await answerQueue.flushNow();
					setSubmitOpen(false);
					submitSession({ sessionId });
				}}
				disabled={submitting}
			/>
		</div>
	);
}
