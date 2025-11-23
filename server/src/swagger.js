import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "FIFA Matches API", version: "1.0.0" },
  },
  apis: ["./src/routes/*.js"], // можно писать JSDoc в маршрутах
};

const swaggerSpec = swaggerJsdoc(options);

export default function (app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
