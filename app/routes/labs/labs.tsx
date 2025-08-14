import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { JoystickIcon, Plus } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { JoinLabModal } from "~/features/labs/join/join-lab-modal";
import { Button, buttonVariants } from "~/components/ui/3d-button";
import { Input } from "~/components/ui/input";
import { LabsItem } from "~/features/home/components/labs-item";
import { LabsSkeleton } from "~/features/home/components/labs-skeleton";

export function meta() {
	return [
		{ title: "Labs | Ngerti.In" },
		{ name: "description", content: "Welcome to Ngerti.In!" },
	];
}

export default function LabsPage() {
    const [joinOpen, setJoinOpen] = useState(false);
	const { data: labs, isPending } = useQuery(
		convexQuery(api.labs.queries.getUserLabs, {}),
	);
	return (
		<div className="mx-auto w-full max-w-6xl px-6 py-20 xl:px-0 space-y-6">
			<h1 className="text-3xl font-bold">Your Labs</h1>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Link to={"/labs/new"} className={buttonVariants({ size: "sm" })}>
						Create new <Plus size={16} />
					</Link>
					<span className="text-muted-foreground text-sm font-medium">/</span>
					<Button size={"sm"} variant={"ai"} onClick={() => setJoinOpen(true)}>
						Join with code <JoystickIcon size={16} />
					</Button>
				</div>
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
			<JoinLabModal open={joinOpen} onOpenChange={setJoinOpen} />
		</div>
	);
}
