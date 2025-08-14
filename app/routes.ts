import {
	index,
	layout,
	type RouteConfig,
	route,
} from "@react-router/dev/routes";

export default [
	layout("routes/layout.tsx", [index("routes/landing-page.tsx")]),

	layout("routes/labs/layout.tsx", [
		route("labs", "routes/labs/labs.tsx"),
		route("labs/:lid/t/dashboard", "routes/labs/t/dashboard.tsx"),
	]),

	route("labs/:lid/t/session/:sessionId", "routes/labs/session/t-session.tsx"),

	route("labs/new", "routes/labs/new.tsx"),

	route("sign-up", "routes/sign-up.tsx"),
] satisfies RouteConfig;
