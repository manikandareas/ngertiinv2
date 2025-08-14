import { useEffect, useMemo, useState } from "react";
import { Input } from "~/components/ui/input";

export type AccessCodeFieldProps = {
  value?: string;
  onChange?: (value: string, normalized?: string) => void;
  onEnter?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  minLength?: number;
};

// Uppercase and strip spaces, dashes, underscores
function normalize(code: string) {
  return (code ?? "").replace(/[\s\-_]/g, "").toUpperCase();
}

export function AccessCodeField({
  value = "",
  onChange,
  onEnter,
  autoFocus,
  placeholder = "Enter access code",
  minLength = 4,
}: AccessCodeFieldProps) {
  const [raw, setRaw] = useState(value);

  useEffect(() => {
    setRaw(value);
  }, [value]);

  const normalized = useMemo(() => normalize(raw), [raw]);
  const isValid = normalized.length >= minLength;

  return (
    <div className="space-y-2">
      <Input
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={raw}
        onChange={(e) => {
          const next = e.target.value.toUpperCase();
          setRaw(next);
          onChange?.(next, normalize(next));
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onEnter?.();
          }
        }}
      />
      <div className="text-xs text-muted-foreground">
        Normalized: <span className="font-mono tracking-wider">{normalized}</span>
      </div>
      {!isValid && (
        <div className="text-xs text-destructive">Code must be at least {minLength} characters.</div>
      )}
    </div>
  );
}

export { normalize };
