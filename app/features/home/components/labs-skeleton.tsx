import { Skeleton } from "~/components/ui/skeleton";

export const LabsSkeleton = () => {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			<Skeleton className="aspect-video rounded-md bg-muted" />
			<Skeleton className="aspect-video rounded-md bg-muted" />
			<Skeleton className="aspect-video rounded-md bg-muted" />
		</div>
	);
};
