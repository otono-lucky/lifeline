// src/docs/swaggerSetup.ts
// Swagger UI express middleware configuration

import { Express, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swaggerSpec";

export const setupSwagger = (app: Express): void => {
  const customOptions: swaggerUi.SwaggerUiOptions = {
    customSiteTitle: "Lifeline API Documentation",
    customCss: `
      .swagger-ui .topbar { background-color: #1a365d; }
      .swagger-ui .topbar-wrapper img { content: url('https://placeholder.svg'); height: 36px; }
      .swagger-ui .info .title { color: #1a365d; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
    },
  };

  // Serve raw JSON spec
  app.get("/api/docs.json", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // Serve Swagger UI on /api/docs
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, customOptions));

  // Serve Swagger UI on /docs as convenient alias
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, customOptions));

  console.log("Swagger Docs mounted at /api/docs and /docs");
};

export default setupSwagger;
