import { IconCategory } from "@tabler/icons-react";
import type { Doc } from "convex/_generated/dataModel";
import {
	ArrowRight,
	FileQuestion,
	FileText,
	GraduationCap,
	Signal,
	SignalHigh,
	SignalLow,
	SignalMedium,
	User,
} from "lucide-react";
import type React from "react";
import { Link } from "react-router";
import { buttonVariants } from "~/components/ui/3d-button";
import { Badge } from "~/components/ui/badge";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "~/components/ui/card";
import { getUrlPrefix } from "../utils";

type LabsItemProps = {
	data: Doc<"labs">;
};

export const LabsItem: React.FC<LabsItemProps> = (props) => {
	return (
		<Card className="border min-h-56">
			<CardHeader className="space-y-2 sm:space-y-3">
				<div className="flex items-start justify-between gap-3">
					<RoleBadge role={props.data.createdAsRole} />
					<DifficultyBadge difficulty={props.data.difficultyLevel} />
				</div>
			</CardHeader>
			<CardContent className="flex-1 grow flex flex-col justify-end gap-2">
				<h3 className="truncate text-base sm:text-lg font-semibold tracking-tight">
					{props.data.name}
				</h3>
				{props.data.description && (
					<p className="text-xs text-muted-foreground line-clamp-2">
						{props.data.description}
					</p>
				)}
			</CardContent>
			<CardFooter className="flex justify-between items-center">
				<div className="flex items-center gap-2">
					<p className="text-xs text-muted-foreground flex items-center gap-1">
						<FileText size={14} />
						{props.data.questionSize} Questions
					</p>
					<LabTopics topics={props.data.topics} />
				</div>
				<Link
					to={`/labs/${props.data._id}/${getUrlPrefix(props.data.createdAsRole)}/dashboard`}
					className={buttonVariants({ size: "sm" })}
				>
					<ArrowRight size={16} />
				</Link>
			</CardFooter>
		</Card>
	);
};

const RoleBadge = ({ role }: { role: "teacher" | "student" }) => {
	return (
		<Badge
			className={`text-xs font-medium ${
				role === "teacher"
					? "bg-amber-500 text-white"
					: "bg-gray-200 text-gray-700"
			}`}
		>
			{role === "teacher" ? <User /> : <GraduationCap />}
			{role === "teacher" ? "Teacher" : "Student"}
		</Badge>
	);
};

const DifficultyBadge = ({
	difficulty,
}: {
	difficulty: "elementary" | "middle" | "high" | "college";
}) => {
	const icon = {
		elementary: <SignalLow />,
		middle: <SignalMedium />,
		high: <SignalHigh />,
		college: <Signal />,
	};

	return (
		<Badge
			variant={"outline"}
			className={`text-xs font-semibold capitalize ${
				difficulty === "elementary"
					? "text-blue-500"
					: difficulty === "middle"
						? "text-green-500"
						: difficulty === "high"
							? "text-yellow-500"
							: "text-red-500"
			}`}
		>
			{icon[difficulty]}
			{difficulty}
		</Badge>
	);
};

const LabTopics = ({ topics }: { topics: string[] }) => {
	return (
		<p className="text-xs text-muted-foreground flex items-center gap-1">
			<IconCategory size={14} />
			{topics.slice(0, 2).join(", ")}
			{topics.length > 2 ? ` +` : ""}
		</p>
	);
};
