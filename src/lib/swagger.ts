import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Smart Q&A API — HR Knowledge Base",
      version: "1.0.0",
      description:
        "A RAG-powered API for answering HR policy questions using NVIDIA NIM and MongoDB.",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        AskRequest: {
          type: "object",
          required: ["question"],
          properties: {
            question: {
              type: "string",
              minLength: 3,
              maxLength: 500,
              description: "The HR policy question",
            },
          },
        },
        AskResponse: {
          type: "object",
          required: ["answer", "sources", "confidence"],
          properties: {
            answer: {
              type: "string",
              description: "The answer to the question",
            },
            sources: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Document IDs used as sources",
            },
            confidence: {
              type: "string",
              enum: ["high", "medium", "low"],
              description: "Confidence level of the answer",
            },
          },
        },
      },
    },
  },
  apis: ["./src/features/**/*.ts", "./src/app.ts"], // Look for JSDoc in feature files
};

export const swaggerSpec = swaggerJsdoc(options);
