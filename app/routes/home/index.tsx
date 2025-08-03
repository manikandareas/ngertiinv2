import React from "react";
import { Button } from "~/components/ui/3d-button";
import { Input } from "~/components/ui/input";

export default function HomePage() {
	return (
		<div className="mx-auto w-full max-w-6xl px-6 py-20 xl:px-0 space-y-6">
			<h1 className="text-3xl font-bold">Your Quizzes</h1>
			<div className="flex items-center gap-4">
				<Button size={"sm"}>Create Quiz</Button>
				<Input placeholder="Search for quizzes" className="max-w-xs" />
			</div>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				<div className="aspect-video rounded-md bg-muted" />
				<div className="aspect-video rounded-md bg-muted" />
				<div className="aspect-video rounded-md bg-muted" />
			</div>
		</div>
	);
}
