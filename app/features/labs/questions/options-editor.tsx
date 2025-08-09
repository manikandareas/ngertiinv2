import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { MatchHighlighter } from "./match-highlighter";
import type { HighlightRange } from "./match-highlighter";

export type Option = Doc<"questionOptions">;

type QuestionWithOptions = Doc<"questions"> & { options: Option[] };
type LabBundle = { lab: Doc<"labs">; questions: QuestionWithOptions[] };

function SortableOption({
  option,
  isOwner,
  onTextBlur,
  onToggleCorrect,
  onDelete,
  getHighlights,
}: {
  option: Option;
  isOwner: boolean;
  onTextBlur: (id: Id<"questionOptions">, text: string) => void;
  onToggleCorrect: (id: Id<"questionOptions">, next: boolean) => void;
  onDelete: (id: Id<"questionOptions">) => void;
  getHighlights?: (text: string) => HighlightRange[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `o-${option._id}`, disabled: !isOwner || Boolean(getHighlights) });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  } as React.CSSProperties;

  return (
    <div ref={setNodeRef} style={style} className="p-2 border rounded-md bg-white">
      <div className="flex items-center gap-2">
        {isOwner && !getHighlights ? (
          <button type="button" className="cursor-grab text-muted-foreground" {...attributes} {...listeners} aria-label="Drag option">
            <GripVertical size={16} />
          </button>
        ) : (
          <div className="w-4" />
        )}
        <Checkbox
          checked={option.isCorrect}
          onCheckedChange={(v) => isOwner && onToggleCorrect(option._id, Boolean(v))}
          disabled={!isOwner}
        />
        <Input
          className="flex-1"
          defaultValue={option.optionText}
          onBlur={(e) => isOwner && onTextBlur(option._id, e.currentTarget.value)}
          disabled={!isOwner}
          placeholder="Option text"
        />
        {isOwner && (
          <Button size="sm" variant="ghost" onClick={() => onDelete(option._id)}>
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>
      {getHighlights && option.optionText ? (
        <div className="mt-1 text-xs text-muted-foreground">
          <MatchHighlighter text={option.optionText} ranges={getHighlights(option.optionText)} />
        </div>
      ) : null}
    </div>
  );
}

export function OptionsEditor({
  labId,
  isOwner,
  questionId,
  options,
  getHighlights,
}: {
  labId: Id<"labs">;
  isOwner: boolean;
  questionId: Id<"questions">;
  options: Option[];
  getHighlights?: (text: string) => HighlightRange[];
}) {
  const queryClient = useQueryClient();
  const labQ = useMemo(() => convexQuery(api.labs.queries.getLabWithQuestions, { labId }), [labId]);

  const [local, setLocal] = useState<Option[]>(options);
  useEffect(() => setLocal(options), [options]);
  const lastPrevRef = useRef<LabBundle | undefined>(undefined);

  const { mutate: updateOption } = useMutation({
    mutationFn: useConvexMutation(api.questionOptions.mutations.updateOption),
    onError: () => {
      toast.error("Failed to update option");
      queryClient.invalidateQueries({ queryKey: labQ.queryKey });
    },
    onSuccess: () => toast.success("Saved"),
  });

  const { mutate: deleteOption } = useMutation({
    mutationFn: useConvexMutation(api.questionOptions.mutations.deleteOption),
    onMutate: async (vars: { id: Id<"questionOptions"> }) => {
      const prev = queryClient.getQueryData<LabBundle>(labQ.queryKey);
      lastPrevRef.current = prev ?? undefined;
      if (prev) {
        const nextQs = prev.questions.map((q) =>
          q._id === questionId
            ? { ...q, options: q.options.filter((o) => o._id !== vars.id) }
            : q
        );
        queryClient.setQueryData(labQ.queryKey, { ...prev, questions: nextQs });
      }
      setLocal((curr) => curr.filter((o) => o._id !== vars.id));
    },
    onError: () => {
      if (lastPrevRef.current)
        queryClient.setQueryData(labQ.queryKey, lastPrevRef.current);
      toast.error("Failed to delete option");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: labQ.queryKey });
    },
  });

  const { mutate: createOption } = useMutation({
    mutationFn: useConvexMutation(api.questionOptions.mutations.createOption),
    onError: () => toast.error("Failed to add option"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: labQ.queryKey }),
  });

  const { mutate: reorderOptions, isPending } = useMutation({
    mutationFn: useConvexMutation(api.questionOptions.mutations.reorderOptions),
    onError: () => {
      if (lastPrevRef.current) queryClient.setQueryData(labQ.queryKey, lastPrevRef.current);
      toast.error("Failed to reorder options");
      setLocal(options);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: labQ.queryKey });
    },
  });

  function onTextBlur(id: Id<"questionOptions">, text: string) {
    if (!isOwner) return;
    const trimmed = text.trim();
    const curr = local.find((o) => o._id === id);
    if (!curr || curr.optionText === trimmed) return;
    updateOption({ id, optionText: trimmed });
  }

  function onToggleCorrect(id: Id<"questionOptions">, next: boolean) {
    if (!isOwner) return;
    updateOption({ id, isCorrect: next });
    setLocal((curr) => curr.map((o) => (o._id === id ? { ...o, isCorrect: next } : o)));
  }

  function onDelete(id: Id<"questionOptions">) {
    if (!isOwner) return;
    deleteOption({ id });
  }

  function handleDragEnd(e: DragEndEvent) {
    if (!isOwner || getHighlights) return;
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const aId = String(active.id);
    const oId = String(over.id);
    if (!aId.startsWith("o-") || !oId.startsWith("o-")) return;
    const aDocId = aId.slice(2) as Id<"questionOptions">;
    const oDocId = oId.slice(2) as Id<"questionOptions">;

    const fromIndex = local.findIndex((o) => o._id === aDocId);
    const toIndex = local.findIndex((o) => o._id === oDocId);
    if (fromIndex < 0 || toIndex < 0) return;

    const optimistic = arrayMove(local, fromIndex, toIndex);
    setLocal(optimistic);

    const prev = queryClient.getQueryData<LabBundle>(labQ.queryKey);
    lastPrevRef.current = prev ?? undefined;
    if (prev) {
      const nextQs = prev.questions.map((q) =>
        q._id === questionId ? { ...q, options: optimistic } : q
      );
      queryClient.setQueryData(labQ.queryKey, { ...prev, questions: nextQs });
    }

    reorderOptions({ questionId, orderedOptionIds: optimistic.map((o) => o._id) });
  }

  return (
    <div className="space-y-2">
      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext items={local.map((o) => `o-${o._id}`)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {local.map((opt) => (
              <SortableOption
                key={opt._id}
                option={opt}
                isOwner={isOwner}
                onTextBlur={onTextBlur}
                onToggleCorrect={onToggleCorrect}
                onDelete={onDelete}
                getHighlights={getHighlights}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {isOwner && (
        <div className="pt-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => createOption({ questionId, optionText: "New option", isCorrect: false })}
            disabled={isPending}
          >
            <Plus className="size-4 mr-1" /> Add option
          </Button>
        </div>
      )}
    </div>
  );
}
