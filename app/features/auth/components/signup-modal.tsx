import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { signUpSchema } from "~/features/auth/schema";
import { authClient } from "~/lib/auth-client";

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignupModal({
	children,
}: {
	children: React.ReactNode;
}) {
	const form = useForm<SignUpFormData>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
	});

	const onSubmit = async (data: SignUpFormData) => {
		await authClient.signUp.email(
			{
				email: data.email,
				password: data.password,
				name: data.name,
			},
			{
				onRequest: (ctx) => {
					// show loading state
				},
				onSuccess: (ctx) => {
					console.log("success");
				},
				onError: (ctx) => {
					console.log(ctx.error);
				},
			},
		);
	};
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent>
				<div className="flex flex-col items-center gap-2">
					<div
						className="flex size-11 shrink-0 items-center justify-center rounded-full border"
						aria-hidden="true"
					>
						<img
							src="https://assets.aceternity.com/logo-dark.png"
							alt="logo"
							className="h-8 w-8 rounded-full"
						/>
					</div>
					<DialogHeader>
						<DialogTitle className="sm:text-center">
							Sign up to Ngerti.In
						</DialogTitle>
						<DialogDescription className="sm:text-center">
							We just need a few details to get you started.
						</DialogDescription>
					</DialogHeader>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
						<div className="space-y-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Full name</FormLabel>
										<FormControl>
											<Input
												placeholder="Subhadeep Roy"
												type="text"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												placeholder="jadingerti@gmail.com"
												type="email"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter your password"
												type="password"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<Button
							type="submit"
							className="w-full"
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting ? (
								"Signing up..."
							) : (
								<>
									Sign up
									<Loader className="mr-2 h-4 w-4 animate-spin" />
								</>
							)}
						</Button>
					</form>
				</Form>

				<div className="before:bg-border after:bg-border flex items-center gap-3 before:h-px before:flex-1 after:h-px after:flex-1">
					<span className="text-muted-foreground text-xs">Or</span>
				</div>

				<Button variant="outline">Continue with Google</Button>

				<p className="text-muted-foreground text-center text-xs">
					By signing up you agree to our{" "}
					<a
						className="underline hover:no-underline"
						href="/terms-and-conditions"
					>
						Terms
					</a>
					.
				</p>
			</DialogContent>
		</Dialog>
	);
}
