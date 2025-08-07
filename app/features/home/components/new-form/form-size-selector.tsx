import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "~/components/ui/3d-button";
import { Input } from "~/components/ui/input";

type Size = "sm" | "md";

interface FormSizeSelectorProps {
	selectedSize: number;
	onSizeChange: (size: number) => void;
	predefinedSizes: number[];
	size?: Size; // compact sizing
}

export function FormSizeSelector({
	selectedSize,
	onSizeChange,
	predefinedSizes,
	size = "md",
}: FormSizeSelectorProps) {
	const [customSize, setCustomSize] = useState("");
	const [showCustom, setShowCustom] = useState(false);

	// Keep custom entries visible in the grid by extending the list with the selected size if needed
	const effectiveSizes = Array.from(
		new Set(
			selectedSize && !predefinedSizes.includes(selectedSize)
				? [...predefinedSizes, selectedSize]
				: predefinedSizes,
		),
	).sort((a, b) => a - b);

	const handleCustomSubmit = () => {
		const num = parseInt(customSize);
		if (num > 0) {
			onSizeChange(num);
			setCustomSize("");
			setShowCustom(false);
		}
	};

	const cardPadding = size === "sm" ? "px-3 py-2" : "p-4";
	const cardRounded = size === "sm" ? "rounded-md" : "rounded-xl";
	const gridGap = size === "sm" ? "gap-2" : "gap-3";
	const valueText = size === "sm" ? "text-lg" : "text-2xl";

	return (
		<div className={size === "sm" ? "space-y-3" : "space-y-4"}>
			<div className={`grid grid-cols-2 sm:grid-cols-4 ${gridGap}`}>
				{effectiveSizes.map((sizeVal) => (
					<motion.button
						key={sizeVal}
						type="button"
						onClick={() => onSizeChange(sizeVal)}
						className={`relative ${cardPadding} ${cardRounded} border transition-all duration-200 ${
							selectedSize === sizeVal
								? "border-blue-500 bg-blue-50"
								: "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
						}`}
						whileHover={{ scale: size === "sm" ? 1.01 : 1.02 }}
						whileTap={{ scale: size === "sm" ? 0.995 : 0.98 }}
					>
						<div
							className={`${valueText} font-bold ${
								selectedSize === sizeVal ? "text-blue-600" : "text-gray-700"
							}`}
						>
							{sizeVal}
						</div>
						<div
							className={`text-[10px] ${
								selectedSize === sizeVal ? "text-blue-500" : "text-gray-500"
							}`}
						>
							questions
						</div>
						{selectedSize === sizeVal && (
							<motion.div
								layoutId="selected-indicator"
								className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full"
							/>
						)}
					</motion.button>
				))}
			</div>

			<div
				className={`flex items-center ${size === "sm" ? "gap-1.5" : "gap-2"}`}
			>
				<button
					type="button"
					onClick={() => setShowCustom(!showCustom)}
					className={`${
						size === "sm"
							? "px-3 py-1.5 text-sm rounded-md"
							: "px-4 py-2 rounded-lg"
					} border transition-colors ${
						showCustom
							? "border-blue-500 bg-blue-50 text-blue-600"
							: "border-gray-200 text-gray-600 hover:border-gray-300"
					}`}
				>
					Custom
				</button>

				{showCustom && (
					<motion.div
						initial={{ opacity: 0, width: 0 }}
						animate={{ opacity: 1, width: "auto" }}
						className={`flex ${size === "sm" ? "gap-1.5" : "gap-2"}`}
					>
						<Input
							placeholder="Eg. 20"
							value={customSize}
							onChange={(e) => setCustomSize(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
							type="number"
							className={size === "sm" ? "w-24 h-8 text-sm" : "w-32"}
						/>
						<Button
							type="button"
							onClick={handleCustomSubmit}
							size="sm"
							className={size === "sm" ? "h-8 px-3" : ""}
						>
							Set
						</Button>
					</motion.div>
				)}
			</div>
		</div>
	);
}
