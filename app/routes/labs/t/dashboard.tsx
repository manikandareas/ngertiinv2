import { convexQuery } from "@convex-dev/react-query";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import { Activity, FileText, LayoutDashboard, Settings } from "lucide-react";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { SettingsTab } from "~/features/t/components/form-settings";
import type { Route } from "./+types/dashboard";

const tabs = [
	{ id: "overview", label: "Overview", icon: LayoutDashboard },
	{ id: "settings", label: "Settings", icon: Settings },
	{ id: "questions", label: "Questions", icon: FileText },
	{ id: "monitoring", label: "Live Monitoring", icon: Activity },
];

export default function LabsDashboard(props: Route.ComponentProps) {
	const { data: lab, isPending } = useQuery(
		convexQuery(api.labs.queries.getLabWithQuestions, {
			labId: props.params.lid as Id<"labs">,
		}),
	);

	if (isPending) {
		return <div>Loading...</div>;
	}
	return (
		<div className="mx-auto w-full max-w-6xl px-6 py-20 xl:px-0 space-y-6">
			<Tabs defaultValue="settings">
				<TabsList>
					{tabs.map((tab) => (
						<TabsTrigger
							className="inline-flex items-center gap-1.5"
							key={tab.id}
							value={tab.id}
						>
							<tab.icon size={16} />
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>
				<TabsContent value="overview">
					<p className="p-4 text-center text-xs text-muted-foreground">
						Overview
					</p>
				</TabsContent>
				<TabsContent value="settings">
					<Suspense fallback={<div>Loading...</div>}>
						<SettingsTab data={lab as Doc<"labs">} />
					</Suspense>
				</TabsContent>
				<TabsContent value="questions">
					<p className="p-4 text-center text-xs text-muted-foreground">
						Questions
					</p>
				</TabsContent>
				<TabsContent value="monitoring">
					<p className="p-4 text-center text-xs text-muted-foreground">
						Content for Tab 3
					</p>
				</TabsContent>
			</Tabs>
		</div>
	);
}
