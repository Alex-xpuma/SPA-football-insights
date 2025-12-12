import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "FIFA Matches API", version: "1.0.0", description: "REST API for FIFA match table" },
    components: {
      schemas: {
        Team: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1  },
            name: { type: "string", example: "Brazil"  }
          }
        },
        Match: {
          type: "object",
          properties: {
            id: { type: "integer", example: 10 },
            team_home: { type: "string", example: "Brazil" },
            team_away: { type: "string", example: "Argentina" },
            score_home: { type: "integer", example: 2 },
            score_away: { type: "integer", example: 1 },
            match_date: {
              type: "string",
              format: "date",
              example: "2025-06-14"
            }
          }
        },
        NewMatchRequest: {
          type: "object",
          required: ["team_home_id", "team_away_id", "match_date"],
          properties: {
            team_home_id: { type: "integer" },
            team_away_id: { type: "integer" },
            match_date: { type: "string", format: "date" },
            score_home: { type: "integer", nullable: true },
            score_away: { type: "integer", nullable: true }
          }
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Server error" }
          }
        }
      }
    }
  },
  servers: [
    { url: "http://localhost:5000/api", description: "Local server" }
  ],
  tags: [
    { name: "Matches", description: "Match operations" },
    { name: "Teams", description: "Team operations" }
  ],
  apis: ["./src/routes/*.js"], // можно писать JSDoc в маршрутах
};

const swaggerSpec = swaggerJsdoc(options);

export default function (app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
