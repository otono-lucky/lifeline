// src/docs/swaggerSetup.ts
// Dynamic Swagger UI Express middleware configuration powered by Zod OpenAPI Generator

import { Express, Request, Response, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import { generateOpenApiDocument } from "./openapiRegistry";

export const setupSwagger = (app: Express): void => {
  // Generate the OpenAPI 3.0 document dynamically from Zod schemas
  const getDoc = () => generateOpenApiDocument();

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

  // Serve raw JSON spec dynamically
  app.get("/api/docs.json", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.json(getDoc());
  });

  // Serve Swagger UI on /api/docs dynamically
  app.use(
    "/api/docs",
    swaggerUi.serve,
    (req: Request, res: Response, next: NextFunction) => {
      swaggerUi.setup(getDoc(), customOptions)(req, res, next);
    },
  );

  // Serve Swagger UI on /docs as convenient alias
  app.use(
    "/docs",
    swaggerUi.serve,
    (req: Request, res: Response, next: NextFunction) => {
      swaggerUi.setup(getDoc(), customOptions)(req, res, next);
    },
  );

  console.log("Swagger Docs dynamically generated from Zod and mounted at /api/docs and /docs");
};

export default setupSwagger;
