import { Outlet } from "react-router";
import { Navbar } from "~/features/landing-page/components/navbar";

export default function RootLayout() {
	return (
		<div className="relative">
			<Navbar />
			<Outlet />
		</div>
	);
}
