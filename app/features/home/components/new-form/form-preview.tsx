import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Clock, Target, Users } from "lucide-react";
import { Button } from "~/components/ui/3d-button";
import { CardContent } from "~/components/ui/card";

interface FormPreviewProps {
	assessmentName: string;
	topics: string[];
	difficulty: string;
	questionSize: number;
	role: string;
}

export function FormPreview({
	assessmentName,
	topics,
	difficulty,
	questionSize,
	role,
}: FormPreviewProps) {
	const getDifficultyColor = (diff: string) => {
		const colors = {
			elementary: "text-green-600 bg-green-50 border-green-200",
			middle: "text-blue-600 bg-blue-50 border-blue-200",
			high: "text-orange-600 bg-orange-50 border-orange-200",
			college: "text-red-600 bg-red-50 border-red-200",
		};
		return colors[diff as keyof typeof colors] || colors.elementary;
	};

	const getDifficultyLabel = (diff: string) => {
		const labels = {
			elementary: "Elementary",
			middle: "Middle School",
			high: "High School",
			college: "College",
		};
		return labels[diff as keyof typeof labels] || diff;
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
		>
			{/* Header */}
			<div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
				<div className="text-center">
					<motion.h2
						key={assessmentName}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="text-xl font-semibold text-gray-900 mb-2"
					>
						{assessmentName}
					</motion.h2>
					<p className="text-sm text-gray-600">
						Ready to test your knowledge? Let's begin!
					</p>
				</div>
			</div>

			<CardContent className="p-6 space-y-6">
				{/* Topics */}
				<div className="space-y-3">
					<div className="flex items-center gap-2 text-sm font-medium text-gray-700">
						<BookOpen className="w-4 h-4" />
						Topics
					</div>
					<motion.div className="flex flex-wrap gap-2" layout>
						<AnimatePresence>
							{topics.map((topic) => (
								<motion.div
									key={topic}
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.8 }}
									className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border"
								>
									{topic}
								</motion.div>
							))}
						</AnimatePresence>
					</motion.div>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm font-medium text-gray-700">
							<Target className="w-4 h-4" />
							Difficulty
						</div>
						<motion.div
							key={difficulty}
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(difficulty)}`}
						>
							{getDifficultyLabel(difficulty)}
						</motion.div>
					</div>

					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm font-medium text-gray-700">
							<Clock className="w-4 h-4" />
							Questions
						</div>
						<motion.div
							key={questionSize}
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							className="text-2xl font-bold text-gray-900"
						>
							{questionSize}
						</motion.div>
					</div>
				</div>

				{/* Role */}
				<div className="space-y-2">
					<div className="flex items-center gap-2 text-sm font-medium text-gray-700">
						<Users className="w-4 h-4" />
						Role
					</div>
					<motion.div
						key={role}
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						className="inline-flex px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200 capitalize"
					>
						{role}
					</motion.div>
				</div>

				{/* Action Button */}
				<Button className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-12 font-medium">
					Start Assessment →
				</Button>

				{/* Footer */}
				<div className="text-center space-y-2 pt-4 border-t border-gray-100">
					<p className="text-xs text-gray-400">This is a preview</p>
				</div>
			</CardContent>
		</motion.div>
	);
}
