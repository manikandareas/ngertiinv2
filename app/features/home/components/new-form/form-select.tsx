import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

interface Option {
	value: string;
	label: string;
}

type Size = "sm" | "md";

interface FormSelectProps {
	options: Option[];
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	size?: Size; // compact sizing
}

export function FormSelect({
	options,
	value,
	onChange,
	placeholder = "Select option",
	size = "md",
}: FormSelectProps) {
	const [isOpen, setIsOpen] = useState(false);

	const selectedOption = options.find((option) => option.value === value);

	const triggerBase =
		"w-full flex items-center justify-between border border-gray-200 transition-colors bg-white";
	const triggerRounded = size === "sm" ? "rounded-md" : "rounded-xl";
	const triggerPadding = size === "sm" ? "px-3 py-2 h-9 text-sm" : "p-3 h-11";
	const labelColor = selectedOption ? "text-gray-900" : "text-gray-500";

	const menuBase =
		"absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-lg z-10 overflow-hidden";
	const menuRounded = size === "sm" ? "rounded-md" : "rounded-xl";
	const menuSpacing = size === "sm" ? "mt-1.5" : "mt-2";

	const itemBase =
		"w-full flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0";
	const itemPadding = size === "sm" ? "px-3 py-2 text-sm" : "px-4 py-3";
	const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className={`${triggerBase} ${triggerRounded} ${triggerPadding} hover:border-gray-300`}
			>
				<span className={labelColor}>
					{selectedOption ? selectedOption.label : placeholder}
				</span>
				<ChevronDown
					className={`${iconSize} text-gray-400 transition-transform ${
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
						className={`${menuBase} ${menuRounded} ${menuSpacing}`}
					>
						{options.map((option) => (
							<button
								type="button"
								key={option.value}
								onClick={() => {
									onChange(option.value);
									setIsOpen(false);
								}}
								className={`${itemBase} ${itemPadding}`}
							>
								<span>{option.label}</span>
								{value === option.value && (
									<Check className={`${iconSize} text-blue-600`} />
								)}
							</button>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
