import { ArrowRight, MoveRight, PhoneCall } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { Button, buttonVariants } from "~/components/ui/3d-button";
import { cn } from "~/lib/utils";

export function meta() {
	return [
		{ title: "Ngerti.In" },
		{ name: "description", content: "Welcome to Ngerti.In!" },
	];
}

export default function Home() {
	return (
		<div className="mx-auto w-full max-w-6xl px-6 py-20 xl:px-0">
			<div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
				<div className="flex flex-col gap-4">
					{/* <Badge variant="outline">We&apos;re live!</Badge> */}
					<WelcomeBadge />
					<div className="flex flex-col gap-4">
						<h1 className="max-w-lg text-left font-regular text-5xl tracking-tighter md:text-7xl">
							This is the start of something!
						</h1>
						<p className="max-w-md text-left text-muted-foreground text-xl leading-relaxed tracking-tight">
							Managing a small business today is already tough. Avoid further
							complications by ditching outdated, tedious trade methods. Our
							goal is to streamline SMB trade, making it easier and faster than
							ever.
						</p>
					</div>
					<div className="flex flex-row gap-4">
						<Button className="gap-4" size="lg" variant="outline">
							Jump on a call <PhoneCall className="h-4 w-4" />
						</Button>
						<Link
							className={buttonVariants({ size: "lg", className: "gap-4" })}
							to="/sign-up"
						>
							Sign up here <MoveRight className="h-4 w-4" />
						</Link>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-8">
					<div className="aspect-square rounded-md bg-muted" />
					<div className="row-span-2 rounded-md bg-muted" />
					<div className="aspect-square rounded-md bg-muted" />
				</div>
			</div>
		</div>
	);
}

const WelcomeBadge = () => {
	return (
		<motion.a
			animate={{ opacity: 1, y: 0 }}
			className={cn(
				"flex w-fit items-center space-x-2 rounded-full",
				"bg-primary/20 ring-1 ring-accent",
				"whitespace-pre px-2 py-1",
			)}
			href={"/"}
			initial={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.8, ease: "easeOut" }}
		>
			<div
				className={cn(
					"w-fit rounded-full bg-secondary px-2 py-0.5",
					"font-medium text-primary text-xs sm:text-sm",
					"text-center",
				)}
			>
				📣 Announcement
			</div>
			<p className="font-medium text-primary text-xs sm:text-sm">
				Introducing Ngerti.In
			</p>
			<ArrowRight className="ml-1 text-primary" size={12} />
		</motion.a>
	);
};
