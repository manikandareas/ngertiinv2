import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useCallback, useEffect, useRef, useState } from "react";

type QuestionId = Id<"questions">;
type OptionId = Id<"questionOptions">;
type SessionId = Id<"labSessions">;

interface QueuedAnswer {
	questionId: QuestionId;
	selectedOptionId: OptionId;
	timestamp: number;
}

interface AnswerQueueState {
	// Optimistic answers (immediately visible to user)
	optimisticAnswers: Record<string, OptionId>;
	// Pending queue (waiting to be flushed)
	pendingQueue: Record<string, QueuedAnswer>;
	// Sync status
	isSyncing: boolean;
	lastSavedAt: number | null;
	// Error state
	hasError: boolean;
	errorMessage?: string;
}

interface UseAnswerQueueOptions {
	sessionId: SessionId;
	sessionBundleKey: readonly unknown[];
	debounceMs?: number;
}

export function useAnswerQueue({
	sessionId,
	sessionBundleKey,
	debounceMs = 400,
}: UseAnswerQueueOptions) {
	const queryClient = useQueryClient();
	const debounceRef = useRef<NodeJS.Timeout | null>(null);
	const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const retryCountRef = useRef(0);

	const [state, setState] = useState<AnswerQueueState>({
		optimisticAnswers: {},
		pendingQueue: {},
		isSyncing: false,
		lastSavedAt: null,
		hasError: false,
	});

	const saveAnswerFn = api.userAnswers.mutations.saveAnswer;
	const { mutateAsync: saveAnswerMutation } = useMutation({
		mutationFn: useConvexMutation(saveAnswerFn),
	});

	// Flush pending answers to server
	const flush = useCallback(async () => {
		const currentQueue = { ...state.pendingQueue };
		const queueEntries = Object.values(currentQueue);

		if (queueEntries.length === 0) return;

		setState((prev) => ({
			...prev,
			isSyncing: true,
			hasError: false,
		}));

		try {
			// Process each queued answer
			const savePromises = queueEntries.map(
				({ questionId, selectedOptionId }) =>
					saveAnswerMutation({
						sessionId,
						questionId,
						selectedOptionId,
					}),
			);

			await Promise.all(savePromises);

			// Success: clear processed items from queue
			setState((prev) => ({
				...prev,
				pendingQueue: {},
				isSyncing: false,
				lastSavedAt: Date.now(),
				hasError: false,
			}));

			// Scoped invalidation only
			queryClient.invalidateQueries({ queryKey: sessionBundleKey });

			// Reset retry counter
			retryCountRef.current = 0;
		} catch (error) {
			console.error("Failed to save answers:", error);

			setState((prev) => ({
				...prev,
				isSyncing: false,
				hasError: true,
				errorMessage: error instanceof Error ? error.message : "Save failed",
			}));

			// Retry with exponential backoff
			const retryDelay = Math.min(1000 * 2 ** retryCountRef.current, 10000);
			retryCountRef.current++;

			if (retryCountRef.current <= 3) {
				retryTimeoutRef.current = setTimeout(() => {
					flush();
				}, retryDelay);
			}
		}
	}, [
		state.pendingQueue,
		sessionId,
		saveAnswerMutation,
		queryClient,
		sessionBundleKey,
	]);

	// Debounced flush
	const scheduleFlush = useCallback(() => {
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		debounceRef.current = setTimeout(() => {
			flush();
		}, debounceMs);
	}, [flush, debounceMs]);

	// Set answer optimistically
	const setAnswer = useCallback(
		(questionId: QuestionId, selectedOptionId: OptionId) => {
			const questionKey = questionId;

			setState((prev) => ({
				...prev,
				optimisticAnswers: {
					...prev.optimisticAnswers,
					[questionKey]: selectedOptionId,
				},
				pendingQueue: {
					...prev.pendingQueue,
					[questionKey]: {
						questionId,
						selectedOptionId,
						timestamp: Date.now(),
					},
				},
				hasError: false, // Clear any previous errors
			}));

			scheduleFlush();
		},
		[scheduleFlush],
	);

	// Force immediate flush (for navigation, submit, etc.)
	const flushNow = useCallback(async () => {
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
			debounceRef.current = null;
		}
		await flush();
	}, [flush]);

	// Get effective answer (optimistic or server)
	const getAnswer = useCallback(
		(questionId: QuestionId, serverAnswer?: OptionId): OptionId | undefined => {
			const questionKey = questionId;
			return state.optimisticAnswers[questionKey] ?? serverAnswer;
		},
		[state.optimisticAnswers],
	);

	// Check if question has pending changes
	const isPending = useCallback(
		(questionId: QuestionId): boolean => {
			const questionKey = questionId;
			return questionKey in state.pendingQueue;
		},
		[state.pendingQueue],
	);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
			if (retryTimeoutRef.current) {
				clearTimeout(retryTimeoutRef.current);
			}
		};
	}, []);

	// Flush on page visibility change, beforeunload
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === "hidden") {
				flushNow();
			}
		};

		const handleBeforeUnload = () => {
			flushNow();
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [flushNow]);

	return {
		setAnswer,
		getAnswer,
		isPending,
		flushNow,
		isSyncing: state.isSyncing,
		lastSavedAt: state.lastSavedAt,
		hasError: state.hasError,
		errorMessage: state.errorMessage,
		pendingCount: Object.keys(state.pendingQueue).length,
	};
}
