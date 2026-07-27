import { Router, Request, Response } from "express";

export function createV1Router(): Router {
	const router = Router();

	router.get("/", (_request: Request, response: Response) => {
		response.status(200).json({
			message: "GCT Core API v1",
		});
	});

	return router;
}
