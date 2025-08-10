import { Activity, FileText, Settings } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function QuickActions({
	onNavigateTab,
}: {
	onNavigateTab?: (tab: "settings" | "questions" | "monitoring") => void;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Quick actions</CardTitle>
			</CardHeader>
			<CardContent className="grid grid-cols-1 gap-2">
				<Button
					variant="outline"
					className="justify-start gap-2"
					onClick={() => onNavigateTab?.("settings")}
				>
					{" "}
					<Settings size={16} /> Go to Settings
				</Button>
				<Button
					variant="outline"
					className="justify-start gap-2"
					onClick={() => onNavigateTab?.("questions")}
				>
					{" "}
					<FileText size={16} /> Manage Questions
				</Button>
				<Button
					variant="outline"
					className="justify-start gap-2"
					onClick={() => onNavigateTab?.("monitoring")}
				>
					{" "}
					<Activity size={16} /> Live Monitoring
				</Button>
			</CardContent>
		</Card>
	);
}
