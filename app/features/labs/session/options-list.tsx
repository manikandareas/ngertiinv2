import type React from "react";
import type { Id } from "convex/_generated/dataModel";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Card } from "~/components/ui/card";
import { Label } from "~/components/ui/label";

export type Option = {
  _id: Id<"questionOptions">;
  optionOrder: number;
  optionText: string;
};

export function OptionsList({
  options,
  selectedOptionId,
  onSelect,
  disabled,
  hint,
}: {
  options: Option[];
  selectedOptionId?: Id<"questionOptions">;
  onSelect: (id: Id<"questionOptions">) => void;
  disabled?: boolean;
  hint?: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="mb-2 text-xs text-muted-foreground">{hint}</div>
      <RadioGroup
        value={(selectedOptionId as string) ?? ""}
        onValueChange={(val) => onSelect(val as Id<"questionOptions">)}
        className="gap-2"
      >
        {options.map((opt) => {
          const idAttr = `opt-${String(opt._id)}`;
          return (
            <div
              key={opt._id}
              className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent/40 cursor-pointer"
            >
              <RadioGroupItem
                id={idAttr}
                value={opt._id as unknown as string}
                disabled={disabled}
                className="mt-0.5"
              />
              <Label htmlFor={idAttr} className="text-sm leading-relaxed">
                {opt.optionText}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </Card>
  );
}
