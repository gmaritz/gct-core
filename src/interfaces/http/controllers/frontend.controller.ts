import path from "path";

import ejs from "ejs";
import { Request, Response } from "express";

async function renderView(response: Response, viewName: string, locals: Record<string, unknown>): Promise<void> {
	const viewsRoot = path.join(process.cwd(), "src/interfaces/views");
	const viewPath = path.join(viewsRoot, `${viewName}.ejs`);
	const markup = await ejs.renderFile(viewPath, locals, { filename: viewPath, root: viewsRoot });
	response.render("layouts/main", {
		...locals,
		body: markup,
	});
}

export async function renderPlaceholderPage(request: Request, response: Response): Promise<void> {
	await renderView(response, "pages/placeholder", {
		title: "GCT Core",
		pageTitle: "Frontend Architecture Foundation",
		currentPath: request.path,
	});
}

export async function renderNotFoundPage(_request: Request, response: Response): Promise<void> {
	await renderView(response, "errors/404", {
		title: "Not Found",
		pageTitle: "Page unavailable",
	});
}
