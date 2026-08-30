"use strict";
// src/docs/swaggerSetup.ts
// Dynamic Swagger UI Express middleware configuration powered by Zod OpenAPI Generator
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
var swagger_ui_express_1 = require("swagger-ui-express");
var openapiRegistry_1 = require("./openapiRegistry");
var setupSwagger = function (app) {
    // Generate the OpenAPI 3.0 document dynamically from Zod schemas
    var getDoc = function () { return (0, openapiRegistry_1.generateOpenApiDocument)(); };
    var customOptions = {
        customSiteTitle: "Lifeline API Documentation",
        customCss: "\n      .swagger-ui .topbar { background-color: #1a365d; }\n      .swagger-ui .topbar-wrapper img { content: url('https://placeholder.svg'); height: 36px; }\n      .swagger-ui .info .title { color: #1a365d; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }\n    ",
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            filter: true,
            tryItOutEnabled: true,
        },
    };
    // Serve raw JSON spec dynamically
    app.get("/api/docs.json", function (_req, res) {
        res.setHeader("Content-Type", "application/json");
        res.json(getDoc());
    });
    // Serve Swagger UI on /api/docs dynamically
    app.use("/api/docs", swagger_ui_express_1.default.serve, function (req, res, next) {
        swagger_ui_express_1.default.setup(getDoc(), customOptions)(req, res, next);
    });
    // Serve Swagger UI on /docs as convenient alias
    app.use("/docs", swagger_ui_express_1.default.serve, function (req, res, next) {
        swagger_ui_express_1.default.setup(getDoc(), customOptions)(req, res, next);
    });
    console.log("Swagger Docs dynamically generated from Zod and mounted at /api/docs and /docs");
};
exports.setupSwagger = setupSwagger;
exports.default = exports.setupSwagger;
