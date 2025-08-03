import { httpRouter } from "convex/server";
import { createAuth } from "../app/lib/auth";
import { betterAuthComponent } from "./auth";

const http = httpRouter();

// { cors: true } is required for client side frameworks
betterAuthComponent.registerRoutes(http, createAuth, { cors: true });

export default http;
