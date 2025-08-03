import {
	index,
	layout,
	type RouteConfig,
	route,
} from "@react-router/dev/routes";

export default [
	layout("routes/layout.tsx", [index("routes/landing-page.tsx")]),

	layout("routes/home/layout.tsx", [route("home", "routes/home/index.tsx")]),
] satisfies RouteConfig;
