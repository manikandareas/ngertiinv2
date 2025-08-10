// convex/index.ts

import { MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { WorkflowManager } from "@convex-dev/workflow";
import { components } from "./_generated/api";

export const workflow = new WorkflowManager(components.workflow);

export const rateLimiter = new RateLimiter(components.rateLimiter, {
	// One global / singleton rate limit, using a "fixed window" algorithm.
	updateLabs: { kind: "fixed window", rate: 1, period: MINUTE },
	// A per-user limit, allowing one every ~6 seconds.
});
