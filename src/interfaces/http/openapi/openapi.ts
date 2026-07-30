import { Router } from "express";

import { createOpenApiDocument } from "./index";

export function createOpenApiRouter(): Router {
	const router = Router();
	const document = createOpenApiDocument();

	router.get("/openapi.json", (_request, response) => {
		response.status(200).json(document);
	});

	router.get("/docs", (_request, response) => {
		response.type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>GCT Core API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '/openapi.json',
          dom_id: '#swagger-ui',
        });
      };
    </script>
  </body>
</html>`);
	});

	return router;
}
