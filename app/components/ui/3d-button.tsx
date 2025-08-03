import { IconLoader2, type TablerIcon } from "@tabler/icons-react";
import { cva, type VariantProps } from "class-variance-authority";
import { type MotionProps, motion } from "motion/react";
import React, { Fragment } from "react";
import { cn } from "~/lib/utils";

const TABLER_ICON_STYLE = 14;
const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border font-semibold text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				ai: "border-indigo-700 border-b-4 border-b-indigo-600 bg-indigo-500 text-white shadow-md hover:bg-indigo-600",
				default:
					"border-blue-700 border-b-4 border-b-blue-600 bg-blue-500 text-primary-foreground shadow-md hover:bg-blue-600",
				destructive:
					"border-red-600 border-red-700 border-b-4 bg-red-500 text-destructive-foreground shadow-md hover:bg-red-600",
				outline:
					"border border-neutral-300 border-b-4 border-b-neutral-200 bg-white hover:bg-neutral-100",
				outline_destructive:
					"border border-red-600 border-b-4 border-b-red-500 bg-white text-red-500 hover:bg-red-50",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost: "hover:bg-accent hover:text-accent-foreground",
				ghost_destructive: "bg-transparent text-red-500 hover:bg-red-100",
				link: "text-primary underline-offset-4 hover:underline",
				solid: "bg-zinc-800 text-white hover:bg-zinc-700",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-9 rounded-lg px-3",
				lg: "h-11 rounded-xl px-8",
				xs: "h-8 rounded-md px-4 text-sm",
				icon: "h-10 w-10 border-transparent border-b",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

type MotionButtonPropsType = React.ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants> &
	MotionProps;

export interface ButtonProps extends MotionButtonPropsType {
	asChild?: boolean;
	supportIcon?: TablerIcon;
	leadingIcon?: TablerIcon;
	isLoading?: boolean;
	stretch?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			size,
			children,
			stretch = false,
			supportIcon,
			leadingIcon,
			isLoading = false,
			asChild = false,
			...props
		},
		ref,
	) => {
		const SupportIconRender = supportIcon ?? React.Fragment;
		const LeadingIconRender = leadingIcon ?? React.Fragment;
		return (
			<motion.button
				className={cn(
					buttonVariants({ variant, size, className }),
					stretch && "w-full",
				)}
				ref={ref}
				{...props}
			>
				{isLoading ? (
					<IconLoader2 className="animate-spin" size={TABLER_ICON_STYLE} />
				) : (
					<Fragment />
				)}
				{!isLoading && supportIcon && (
					<SupportIconRender size={TABLER_ICON_STYLE} />
				)}
				{children}
				{leadingIcon && <LeadingIconRender size={TABLER_ICON_STYLE} />}
			</motion.button>
		);
	},
);
Button.displayName = "Button";

export interface ButtonGroupProps
	extends React.HTMLAttributes<HTMLDivElement> {}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
	({ className, ...props }, ref) => {
		return (
			<div
				className={cn(
					"button-group flex w-fit flex-row divide-x overflow-hidden rounded-lg border",
					"*:rounded-none *:border-none",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);

ButtonGroup.displayName = "ButtonGroup";

export { Button, buttonVariants };
