import { ArrowLeft, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router";
import { Button } from "~/components/ui/3d-button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { CreateAssessmentForm } from "~/features/home/components/new-form/create-assessment-form";

const predefinedTopics = [
	"Mathematics",
	"Science",
	"History",
	"Literature",
	"Geography",
	"Physics",
	"Chemistry",
	"Biology",
	"Computer Science",
	"Art",
	"Music",
	"Philosophy",
];

const difficultyOptions = [
	{ value: "elementary", label: "Elementary" },
	{ value: "middle", label: "Middle School" },
	{ value: "high", label: "High School" },
	{ value: "college", label: "College" },
];

const questionSizes = [5, 10, 20, 50];

export function meta() {
	return [
		{ title: "Create | Ngerti.In" },
		{ name: "description", content: "Welcome to Ngerti.In!" },
	];
}

export default function CreatePage() {
	// Context modal state
	const [isContextOpen, setIsContextOpen] = useState(false);
	const [contextMode, setContextMode] = useState<"file" | "url" | null>(null);
	const [contextUrl, setContextUrl] = useState("");
	const [contextFile, setContextFile] = useState<File | null>(null);
	const dropRef = useRef<HTMLButtonElement | null>(null);

	const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		const file = e.dataTransfer.files?.[0];
		if (file) setContextFile(file);
	};
	const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	return (
		<div className="mx-auto w-full max-w-6xl px-6 py-20 xl:px-0 space-y-6">
			<div className="flex items-center justify-between">
				<Link
					to={"/labs"}
					className="hover:underline text-sm inline-flex gap-2 items-center"
				>
					<ArrowLeft size={16} /> Back
				</Link>

				{/* Context input trigger */}
				<Dialog open={isContextOpen} onOpenChange={setIsContextOpen}>
					<DialogTrigger asChild>
						<Button className="h-8 px-3 text-sm" variant="outline">
							<Upload className="w-4 h-4" /> Add context
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Add context</DialogTitle>
						</DialogHeader>

						{/* Option selector */}
						<div className="grid grid-cols-2 gap-2">
							<button
								type="button"
								onClick={() => setContextMode("file")}
								className={`border rounded-md px-3 py-2 text-sm flex items-center justify-center gap-2 hover:border-gray-300 ${contextMode === "file" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"}`}
							>
								File
							</button>
							<button
								type="button"
								onClick={() => setContextMode("url")}
								className={`border rounded-md px-3 py-2 text-sm flex items-center justify-center gap-2 hover:border-gray-300 ${contextMode === "url" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"}`}
							>
								URL
							</button>
						</div>

						{/* File or URL content */}
						{contextMode === "file" && (
							<button
								type="button"
								ref={dropRef as React.RefObject<HTMLButtonElement>}
								onDrop={
									onDrop as unknown as React.DragEventHandler<HTMLButtonElement>
								}
								onDragOver={
									onDragOver as unknown as React.DragEventHandler<HTMLButtonElement>
								}
								className="mt-3 border-2 border-dashed rounded-md p-4 text-center text-sm hover:border-gray-300 border-gray-200 w-full"
							>
								<p className="text-gray-600">
									Drag & drop your file here, or click to select
								</p>
								<label className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm cursor-pointer hover:border-gray-300">
									<input
										type="file"
										className="hidden"
										onChange={(e) =>
											setContextFile(e.target.files?.[0] ?? null)
										}
									/>
									<Upload className="w-4 h-4" />
									Choose file
								</label>
								{contextFile && (
									<div className="mt-2 text-xs text-gray-700">
										Selected: {contextFile.name}
									</div>
								)}
							</button>
						)}

						{contextMode === "url" && (
							<div className="mt-3">
								<Label htmlFor="context-url" className="text-sm font-medium">
									URL
								</Label>
								<Input
									id="context-url"
									placeholder="https://example.com/source"
									value={contextUrl}
									onChange={(e) => setContextUrl(e.target.value)}
									className="mt-1"
								/>
							</div>
						)}

						<DialogFooter className="sm:justify-between">
							<Button
								variant="outline"
								size="sm"
								className="h-8"
								onClick={() => {
									setContextMode(null);
									setContextFile(null);
									setContextUrl("");
								}}
							>
								Reset
							</Button>
							<Button
								size="sm"
								className="h-8"
								onClick={() => setIsContextOpen(false)}
							>
								Save
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<CreateAssessmentForm
				difficultyOptions={difficultyOptions}
				predefinedTopics={predefinedTopics}
				predefinedSizes={questionSizes}
			/>
		</div>
	);
}
