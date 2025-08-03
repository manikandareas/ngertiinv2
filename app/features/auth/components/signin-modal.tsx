import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type z from "zod";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
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
import { signInSchema } from "~/features/auth/schema";
import { authClient } from "~/lib/auth-client";

type SignInFormData = z.infer<typeof signInSchema>;

export default function SigninModal(props: { children: React.ReactNode }) {
	const form = useForm<SignInFormData>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
			rememberMe: false,
		},
	});

	const onSubmit = async (data: SignInFormData) => {
		await authClient.signIn.email(
			{
				email: data.email,
				password: data.password,
				rememberMe: data.rememberMe,
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
			<DialogTrigger asChild>{props.children}</DialogTrigger>
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
						<DialogTitle className="sm:text-center">Welcome back</DialogTitle>
						<DialogDescription className="sm:text-center">
							Enter your credentials to login to your account.
						</DialogDescription>
					</DialogHeader>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
						<div className="space-y-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												placeholder="subha9.5roy350@gmail.com"
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
						<div className="flex justify-between gap-2">
							<FormField
								control={form.control}
								name="rememberMe"
								render={({ field }) => (
									<FormItem className="flex items-center gap-2 space-y-0">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
										<FormLabel className="text-muted-foreground font-normal">
											Remember me
										</FormLabel>
									</FormItem>
								)}
							/>
							<a
								className="text-sm underline hover:no-underline"
								href="/sign-up"
							>
								Forgot password?
							</a>
						</div>
						<Button
							type="submit"
							className="w-full"
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting ? "Signing in..." : "Sign in"}
						</Button>
					</form>
				</Form>

				<div className="before:bg-border after:bg-border flex items-center gap-3 before:h-px before:flex-1 after:h-px after:flex-1">
					<span className="text-muted-foreground text-xs">Or</span>
				</div>

				<Button variant="outline">Login with Google</Button>
			</DialogContent>
		</Dialog>
	);
}
