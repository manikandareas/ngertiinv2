import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { Plus } from "lucide-react";
import { Link } from "react-router";
import { buttonVariants } from "~/components/ui/3d-button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { LabsItem } from "~/features/home/components/labs-item";
import { LabsSkeleton } from "~/features/home/components/labs-skeleton";

export function meta() {
	return [
		{ title: "Labs | Ngerti.In" },
		{ name: "description", content: "Welcome to Ngerti.In!" },
	];
}

export default function LabsPage() {
	const { data: labs, isPending } = useQuery(
		convexQuery(api.labs.queries.getUserLabs, {}),
	);
	return (
		<div className="mx-auto w-full max-w-6xl px-6 py-20 xl:px-0 space-y-6">
			<h1 className="text-3xl font-bold">Your Labs</h1>
			<div className="flex items-center gap-4">
				<Link to={"/labs/new"} className={buttonVariants({ size: "sm" })}>
					Create new <Plus size={16} />
				</Link>
				<Input placeholder="Search for quizzes" className="max-w-xs" />
			</div>

			{isPending ? (
				<LabsSkeleton />
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{labs?.map((lab) => (
						<LabsItem key={lab._id} data={lab} />
					))}
				</div>
			)}
		</div>
	);
}
