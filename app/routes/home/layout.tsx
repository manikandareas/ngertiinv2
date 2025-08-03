import { Outlet } from "react-router";
import { Navbar } from "~/features/home/components/navbar";

export default function HomeLayout() {
	return (
		<div className="relative">
			<Navbar />
			<Outlet />
		</div>
	);
}
