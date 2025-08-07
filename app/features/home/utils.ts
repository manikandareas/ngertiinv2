export const getUrlPrefix = (role: "teacher" | "student") => {
	return role === "teacher" ? "t" : "s";
};
