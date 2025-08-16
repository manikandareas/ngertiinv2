import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { AlertTriangleIcon, LoaderIcon } from "lucide-react";

export function SubmitDialog({
	open,
	onOpenChange,
	unansweredOrders,
	onGotoFirstUnanswered,
	onConfirmSubmit,
	isSubmitting,
	errorMessage,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	unansweredOrders: number[];
	onGotoFirstUnanswered: () => void;
	onConfirmSubmit: () => Promise<void>;
	isSubmitting: boolean;
	errorMessage?: string;
}) {
	const hasUnanswered = unansweredOrders.length > 0;
	const displayedOrders = unansweredOrders.slice(0, 10);
	const remainingCount = Math.max(0, unansweredOrders.length - 10);

	const handleConfirmSubmit = async () => {
		try {
			await onConfirmSubmit();
		} catch (error) {
			// Error handling is done in parent component
			console.error("Submit failed:", error);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Kirim jawaban?</DialogTitle>
					<DialogDescription>
						Setelah dikirim, Anda tidak dapat mengubah jawaban lagi.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{hasUnanswered ? (
						<div className="space-y-3">
							<div className="flex items-center gap-2 text-amber-600">
								<AlertTriangleIcon className="size-4" />
								<span className="text-sm font-medium">
									Masih ada {unansweredOrders.length} soal belum terjawab
								</span>
							</div>
							
							<div className="space-y-2">
								<p className="text-xs text-muted-foreground">Soal yang belum dijawab:</p>
								<div className="flex flex-wrap gap-1">
									{displayedOrders.map((order) => (
										<Badge key={order} variant="outline" className="text-xs">
											#{order}
										</Badge>
									))}
									{remainingCount > 0 && (
										<Badge variant="outline" className="text-xs">
											+{remainingCount} lainnya
										</Badge>
									)}
								</div>
							</div>
						</div>
					) : (
						<div className="text-sm text-emerald-600">
							✓ Semua soal sudah terjawab. Lanjut kirim?
						</div>
					)}

					{errorMessage && (
						<div className="rounded-md border border-red-200 bg-red-50 p-3">
							<div className="flex items-center gap-2 text-red-600">
								<AlertTriangleIcon className="size-4" />
								<span className="text-sm font-medium">Gagal mengirim</span>
							</div>
							<p className="mt-1 text-xs text-red-600">{errorMessage}</p>
						</div>
					)}
				</div>

				<DialogFooter className="gap-2">
					{hasUnanswered && (
						<Button
							variant="outline"
							onClick={() => {
								onGotoFirstUnanswered();
								onOpenChange(false);
							}}
							disabled={isSubmitting}
							className="flex-1"
						>
							Ke soal pertama yang belum dijawab
						</Button>
					)}
					
					<Button
						onClick={handleConfirmSubmit}
						disabled={isSubmitting}
						className="flex-1"
					>
						{isSubmitting ? (
							<>
								<LoaderIcon className="mr-2 size-4 animate-spin" />
								Mengirim...
							</>
						) : (
							"Kirim jawaban"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
