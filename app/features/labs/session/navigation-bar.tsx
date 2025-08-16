import type React from "react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";

export function NavigationBar({
	canPrev,
	canNext,
	onPrev,
	onNext,
	onSubmit,
	submitting,
	reviewPanel,
}: {
	canPrev: boolean;
	canNext: boolean;
	onPrev: () => void;
	onNext: () => void;
	onSubmit: () => void | Promise<void>;
	submitting?: boolean;
	reviewPanel?: React.ReactNode;
}) {
	const [open, setOpen] = useState(false);
	return (
		<div className="flex items-center justify-between gap-2">
			<div className="flex items-center gap-2">
				<Button variant="outline" onClick={onPrev} disabled={!canPrev || submitting} aria-disabled={submitting}>
					Previous
				</Button>
				<Button variant="outline" onClick={onNext} disabled={!canNext || submitting} aria-disabled={submitting}>
					Next
				</Button>
			</div>
			<div className="flex items-center gap-2">
				{reviewPanel ? (
					<Dialog open={open} onOpenChange={setOpen}>
						<DialogTrigger asChild>
							<Button variant="secondary" disabled={submitting} aria-disabled={submitting}>
								Review
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-2xl">
							<DialogHeader>
								<DialogTitle>Review Questions</DialogTitle>
							</DialogHeader>
							<div className="pt-2">{reviewPanel}</div>
						</DialogContent>
					</Dialog>
				) : null}
				<Button onClick={onSubmit} disabled={submitting}>
					{submitting ? "Submitting..." : "Submit"}
				</Button>
			</div>
		</div>
	);
}
