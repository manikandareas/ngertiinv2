import { useEffect, useMemo, useRef } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export function QuestionsSearch({
  matchedCount,
  totalCount,
  isSearchActive,
  className,
}: {
  matchedCount: number;
  totalCount: number;
  isSearchActive: boolean;
  className?: string;
}) {
  const [q, setQ] = useQueryState("q", parseAsString);
  const inputRef = useRef<HTMLInputElement>(null);

  const value = q ?? "";
  const showingText = useMemo(() => {
    return isSearchActive
      ? `Showing ${matchedCount} of ${totalCount} questions`
      : `${totalCount} questions`;
  }, [isSearchActive, matchedCount, totalCount]);

  function clear() {
    setQ(null);
    inputRef.current?.focus();
  }

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      // Ignore if typing in an input/textarea/select or if modifier keys are pressed
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isTyping =
        tag === "input" || tag === "textarea" || tag === "select" || e.isComposing;
      if (isTyping) return;
      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, []);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setQ(e.currentTarget.value || null)}
          placeholder="Search questions (/ to focus, Esc to clear)"
          aria-label="Search questions"
          onKeyDown={(e) => {
            if (e.key === "Escape" && value) {
              e.preventDefault();
              clear();
            }
          }}
        />
        {value ? (
          <Button variant="secondary" onClick={clear}>
            Clear
          </Button>
        ) : null}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{showingText}</span>
      </div>
      {isSearchActive && matchedCount === 0 ? (
        <div className="text-sm text-muted-foreground border rounded-md p-3">
          No matches for ‘{value}’.{' '}
          <Button size="sm" variant="link" className="px-1" onClick={clear}>
            Clear
          </Button>
        </div>
      ) : null}
    </div>
  );
}
