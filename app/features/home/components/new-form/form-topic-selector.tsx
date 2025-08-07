import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/3d-button";
import { Input } from "~/components/ui/input";

type Density = "compact" | "comfortable";

interface FormTopicSelectorProps {
	selectedTopics: string[];
	onTopicsChange: (topics: string[]) => void;
	predefinedTopics: string[];
	density?: Density; // compact density
}

export function FormTopicSelector({
	selectedTopics,
	onTopicsChange,
	predefinedTopics,
	density = "comfortable",
}: FormTopicSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [customTopic, setCustomTopic] = useState("");

	const addTopic = (topic: string) => {
		if (!selectedTopics.includes(topic)) {
			onTopicsChange([...selectedTopics, topic]);
		}
		setIsOpen(false);
	};

	const removeTopic = (topic: string) => {
		onTopicsChange(selectedTopics.filter((t) => t !== topic));
	};

	const addCustomTopic = () => {
		if (customTopic.trim() && !selectedTopics.includes(customTopic.trim())) {
			onTopicsChange([...selectedTopics, customTopic.trim()]);
			setCustomTopic("");
		}
	};

	const availableTopics = predefinedTopics.filter(
		(topic) => !selectedTopics.includes(topic),
	);

	const wrapGap = density === "compact" ? "gap-1.5" : "gap-2";
	const chipPadding = density === "compact" ? "px-2.5 py-1" : "px-3 py-1.5";
	const chipRounded = density === "compact" ? "rounded-md" : "rounded-lg";
	const chipText = density === "compact" ? "text-xs" : "text-sm";
	const iconSize = density === "compact" ? "w-3 h-3" : "w-3.5 h-3.5";

	const triggerPadding = density === "compact" ? "px-3 py-2 h-9" : "p-3 h-11";
	const triggerRounded = density === "compact" ? "rounded-md" : "rounded-xl";
	const triggerGap = density === "compact" ? "mt-1.5" : "mt-2";
	const chevron = density === "compact" ? "w-3.5 h-3.5" : "w-4 h-4";
	const menuRounded = density === "compact" ? "rounded-md" : "rounded-xl";
	const itemPadding = density === "compact" ? "px-3 py-2 text-sm" : "px-4 py-3";

	return (
		<div className={density === "compact" ? "space-y-2" : "space-y-3"}>
			{/* Selected Topics */}
			<AnimatePresence>
				{selectedTopics.length > 0 && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className={`flex flex-wrap ${wrapGap}`}
					>
						{selectedTopics.map((topic) => (
							<motion.div
								key={topic}
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								className={`flex items-center gap-2 ${chipPadding} bg-blue-50 text-blue-700 ${chipRounded} border border-blue-200 ${chipText} font-medium`}
							>
								{topic}
								<button
									type="button"
									onClick={() => removeTopic(topic)}
									className="hover:text-blue-900 transition-colors"
								>
									<X className={iconSize} />
								</button>
							</motion.div>
						))}
					</motion.div>
				)}
			</AnimatePresence>

			{/* Topic Selector */}
			<div className="relative">
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className={`w-full flex items-center justify-between border border-gray-200 hover:border-gray-300 transition-colors ${triggerRounded} ${triggerPadding}`}
				>
					<span className="text-gray-600">Select topics</span>
					<ChevronDown
						className={`${chevron} text-gray-400 transition-transform ${
							isOpen ? "rotate-180" : ""
						}`}
					/>
				</button>

				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className={`absolute top-full left-0 right-0 ${triggerGap} bg-white border border-gray-200 ${menuRounded} shadow-lg z-10 overflow-hidden`}
						>
							<div className="max-h-48 overflow-y-auto">
								{availableTopics.map((topic) => (
									<button
										type="button"
										key={topic}
										onClick={() => addTopic(topic)}
										className={`w-full text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${itemPadding}`}
									>
										{topic}
									</button>
								))}
							</div>

							<div className="p-3 border-t border-gray-100 bg-gray-50">
								<div
									className={`flex ${density === "compact" ? "gap-1.5" : "gap-2"}`}
								>
									<Input
										placeholder="Add custom topic"
										value={customTopic}
										onChange={(e) => setCustomTopic(e.target.value)}
										onKeyPress={(e) => e.key === "Enter" && addCustomTopic()}
										className={`flex-1 ${density === "compact" ? "h-8 text-sm" : "h-9"}`}
									/>
									<Button
										onClick={addCustomTopic}
										size="sm"
										className={density === "compact" ? "h-8 px-3" : "h-9"}
									>
										<Plus
											className={
												density === "compact" ? "w-3.5 h-3.5" : "w-4 h-4"
											}
										/>
									</Button>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
