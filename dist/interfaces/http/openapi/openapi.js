"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOpenApiRouter = createOpenApiRouter;
const express_1 = require("express");
const index_1 = require("./index");
function createOpenApiRouter() {
    const router = (0, express_1.Router)();
    const document = (0, index_1.createOpenApiDocument)();
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
//# sourceMappingURL=openapi.js.map