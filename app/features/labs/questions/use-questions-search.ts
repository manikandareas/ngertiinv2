import { parseAsString, useQueryState } from "nuqs";
import { useDeferredValue, useMemo } from "react";
import type { HighlightRange } from "./match-highlighter";
import type { QuestionWithOptions } from "./questions-list";

// Normalize text for matching: lowercase + remove diacritics. Do not collapse whitespace here
// to keep highlight index mapping straightforward.
export function normalizeBasic(text: string): string {
	return (
		text
			.toLowerCase()
			.normalize("NFKD")
			// Remove combining marks
			.replace(/\p{Diacritic}/gu, "")
	);
}

// Build a diacritic-agnostic, lowercase representation with an index map back to original string
function normalizeWithMap(text: string): { normalized: string; map: number[] } {
	const map: number[] = [];
	let out = "";
	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		const expanded = ch.normalize("NFKD");
		for (let j = 0; j < expanded.length; j++) {
			const e = expanded[j];
			if (/\p{Diacritic}/u.test(e)) continue;
			out += e.toLowerCase();
			map.push(i);
		}
	}
	return { normalized: out, map };
}

export function splitTokens(q: string): string[] {
	return q
		.trim()
		.toLowerCase()
		.normalize("NFKD")
		.replace(/\p{Diacritic}/gu, "")
		.split(/\s+/)
		.filter(Boolean);
}

export function rangesForTokens(
	text: string,
	tokens: string[],
): HighlightRange[] {
	if (!text || tokens.length === 0) return [];
	const { normalized, map } = normalizeWithMap(text);
	const ranges: HighlightRange[] = [];
	for (const t of tokens) {
		if (!t) continue;
		let from = 0;
		while (true) {
			const idx = normalized.indexOf(t, from);
			if (idx === -1) break;
			const endIdx = idx + t.length - 1; // inclusive index in normalized
			const startOrig = map[idx] ?? 0;
			const endOrig = (map[endIdx] ?? startOrig) + 1; // slice end is exclusive
			ranges.push({ start: startOrig, end: endOrig });
			from = idx + 1;
		}
	}
	return ranges;
}

export function useQuestionsSearch(questions: QuestionWithOptions[]) {
	const [q] = useQueryState("q", parseAsString.withDefault(""));
	const deferredQ = useDeferredValue(q);
	const tokens = useMemo(() => splitTokens(deferredQ), [deferredQ]);

	const result = useMemo(() => {
		if (!tokens.length) {
			return {
				filtered: questions,
				isSearchActive: false,
				matchedCount: questions.length,
				totalCount: questions.length,
				query: q ?? "",
				getHighlights: (_text: string) => [] as HighlightRange[],
			} as const;
		}

		const filtered = questions.filter((question) => {
			const poolParts: string[] = [
				normalizeBasic(question.questionText ?? ""),
				normalizeBasic(question.explanation ?? ""),
				...question.options.map((o) => normalizeBasic(o.optionText ?? "")),
			];
			const pool = poolParts.join(" \n ");
			return tokens.every((t) => pool.includes(t));
		});

		const getHighlights = (text: string) => rangesForTokens(text ?? "", tokens);

		return {
			filtered,
			isSearchActive: true,
			matchedCount: filtered.length,
			totalCount: questions.length,
			query: q ?? "",
			getHighlights,
		} as const;
	}, [questions, tokens, q]);

	return result;
}
