import { motion } from "framer-motion";

type Size = "sm" | "md";

interface FormSwitchProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	label: string;
	icon?: React.ReactNode;
	size?: Size; // compact sizing
}

export function FormSwitch({
	checked,
	onChange,
	label,
	icon,
	size = "md",
}: FormSwitchProps) {
	const containerGap = size === "sm" ? "gap-2" : "gap-3";
	const containerPadding = size === "sm" ? "p-2.5" : "p-3";
	const containerRounded = size === "sm" ? "rounded-md" : "rounded-xl";

	const labelWeight = size === "sm" ? "font-medium text-sm" : "font-medium";
	const trackSize = size === "sm" ? "w-10 h-5" : "w-11 h-6";
	const knobSize =
		size === "sm" ? "w-4 h-4 top-0.5 left-0.5" : "w-5 h-5 top-0.5 left-0.5";
	const knobX = size === "sm" ? (checked ? 18 : 0) : checked ? 20 : 0;

	const handleToggle = () => onChange(!checked);
	const onKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
		if (e.key === " " || e.key === "Enter") {
			e.preventDefault();
			handleToggle();
		}
	};

	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			onClick={handleToggle}
			onKeyDown={onKeyDown}
			className={`flex items-center ${containerGap} ${containerPadding} ${containerRounded} border border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer w-full text-left`}
		>
			{icon && (
				<div
					className={`transition-colors duration-200 ${
						checked ? "text-blue-600" : "text-gray-400"
					} ${size === "sm" ? "text-sm" : ""}`}
					aria-hidden="true"
				>
					{icon}
				</div>
			)}
			<span
				className={`flex-1 ${labelWeight} transition-colors duration-200 ${
					checked ? "text-gray-900" : "text-gray-600"
				}`}
			>
				{label}
			</span>
			<div
				className={`relative ${trackSize} rounded-full transition-colors duration-200 ${
					checked ? "bg-blue-600" : "bg-gray-200"
				}`}
				aria-hidden="true"
			>
				<motion.div
					className={`absolute ${knobSize} bg-white rounded-full shadow-sm`}
					animate={{ x: knobX }}
					transition={{ type: "spring", stiffness: 500, damping: 30 }}
				/>
			</div>
		</button>
	);
}
