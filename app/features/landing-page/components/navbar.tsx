import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { Authenticated, Unauthenticated } from "convex/react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
	MobileNav,
	MobileNavHeader,
	MobileNavMenu,
	MobileNavToggle,
	NavBody,
	NavbarButton,
	Navbar as NavbarComp,
	NavbarLogo,
	NavItems,
} from "~/components/ui/resizable-navbar";
import SigninModal from "~/features/auth/components/signin-modal";

export function Navbar() {
	const { data: user } = useQuery(convexQuery(api.auth.getCurrentUser, {}));
	const navItems = [
		{
			name: "Home",
			link: "/home",
		},
		{
			name: "About",
			link: "#about",
		},
		{
			name: "How it works?",
			link: "#how-it-works",
		},
	];

	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	return (
		<NavbarComp className="mx-auto max-w-6xl">
			{/* Desktop Navigation */}
			<NavBody className="py-4">
				<NavbarLogo />
				<NavItems items={navItems} />
				<div className="flex items-center gap-4">
					<Unauthenticated>
						<SigninModal>
							<NavbarButton variant="secondary">Login</NavbarButton>
						</SigninModal>
						<NavbarButton variant="primary">Book a call</NavbarButton>
					</Unauthenticated>
					<Authenticated>
						<Avatar className="size-10">
							<AvatarFallback>{user?.name?.[0]}</AvatarFallback>
							<AvatarImage src={user?.image} />
						</Avatar>
					</Authenticated>
				</div>
			</NavBody>

			{/* Mobile Navigation */}
			<MobileNav>
				<MobileNavHeader>
					<NavbarLogo />
					<MobileNavToggle
						isOpen={isMobileMenuOpen}
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					/>
				</MobileNavHeader>

				<MobileNavMenu
					isOpen={isMobileMenuOpen}
					onClose={() => setIsMobileMenuOpen(false)}
				>
					{navItems.map((item, idx) => (
						<a
							className="relative text-neutral-600 dark:text-neutral-300"
							href={item.link}
							key={`mobile-link-${idx.toString()}`}
							onClick={() => setIsMobileMenuOpen(false)}
						>
							<span className="block">{item.name}</span>
						</a>
					))}
					<div className="flex w-full flex-col gap-4">
						{/* <SignedOut> */}
						<NavbarButton
							className="w-full"
							onClick={() => setIsMobileMenuOpen(false)}
							variant="primary"
						>
							Login
						</NavbarButton>
						<NavbarButton
							className="w-full"
							onClick={() => setIsMobileMenuOpen(false)}
							variant="primary"
						>
							Book a call
						</NavbarButton>
						{/* </SignedOut> */}
						{/* <SignedIn>
              <Button size={'xs'} variant={'solid'}>
                <Ticket />
                Feedback
              </Button>
              <UserButton />
            </SignedIn> */}
					</div>
				</MobileNavMenu>
			</MobileNav>
		</NavbarComp>
	);
}
