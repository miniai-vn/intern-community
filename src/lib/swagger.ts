export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Intern Community Hub API",
    version: "1.0.0",
    description: "REST API for browsing, submitting, and moderating mini-app modules.",
  },
  servers: [{ url: "/api", description: "Local dev" }],
  components: {
    securitySchemes: {
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: "next-auth.session-token",
        description: "NextAuth session cookie (sign in via GitHub OAuth first)",
      },
    },
    schemas: {
      Author: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string", nullable: true },
          image: { type: "string", nullable: true },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          slug: { type: "string" },
        },
      },
      Module: {
        type: "object",
        properties: {
          id: { type: "string" },
          slug: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          repoUrl: { type: "string", format: "uri" },
          demoUrl: { type: "string", format: "uri", nullable: true },
          status: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED"] },
          feedback: { type: "string", nullable: true },
          voteCount: { type: "integer" },
          categoryId: { type: "string" },
          authorId: { type: "string" },
          category: { $ref: "#/components/schemas/Category" },
          author: { $ref: "#/components/schemas/Author" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      PaginatedModules: {
        type: "object",
        properties: {
          items: { type: "array", items: { $ref: "#/components/schemas/Module" } },
          nextCursor: { type: "string", nullable: true },
        },
      },
      SubmitModuleInput: {
        type: "object",
        required: ["name", "description", "categoryId", "repoUrl"],
        properties: {
          name: { type: "string", minLength: 3, maxLength: 60 },
          description: { type: "string", minLength: 20, maxLength: 500 },
          categoryId: { type: "string", description: "Must be a valid CUID" },
          repoUrl: {
            type: "string",
            format: "uri",
            description: "Must be a https://github.com/ URL",
          },
          demoUrl: { type: "string", format: "uri", nullable: true },
        },
      },
      AdminReviewInput: {
        type: "object",
        required: ["status"],
        properties: {
          status: { type: "string", enum: ["APPROVED", "REJECTED"] },
          feedback: { type: "string", maxLength: 500 },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/modules": {
      get: {
        summary: "List approved modules",
        description: "Returns a paginated list of approved modules, sorted by vote count.",
        tags: ["Modules"],
        parameters: [
          {
            name: "q",
            in: "query",
            description: "Search by name or description",
            schema: { type: "string" },
          },
          {
            name: "category",
            in: "query",
            description: "Filter by category slug",
            schema: { type: "string" },
          },
          {
            name: "cursor",
            in: "query",
            description: "Pagination cursor (module ID)",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Paginated list of modules",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedModules" },
              },
            },
          },
        },
      },
      post: {
        summary: "Submit a new module",
        description: "Authenticated users can submit a module. It starts as PENDING until an admin reviews it.",
        tags: ["Modules"],
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SubmitModuleInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Module created",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Module" } },
            },
          },
          401: {
            description: "Not authenticated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          422: {
            description: "Validation error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/modules/{id}": {
      get: {
        summary: "Get a single module",
        tags: ["Modules"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Module found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Module" } } },
          },
          404: {
            description: "Not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
      patch: {
        summary: "Approve or reject a module (admin only)",
        tags: ["Modules"],
        security: [{ sessionCookie: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminReviewInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Module updated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Module" } } },
          },
          403: {
            description: "Forbidden — admin only",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          422: {
            description: "Validation error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
      delete: {
        summary: "Delete a module",
        description: "The author or an admin can delete the module.",
        tags: ["Modules"],
        security: [{ sessionCookie: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          204: { description: "Deleted" },
          401: {
            description: "Not authenticated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          403: {
            description: "Forbidden",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          404: {
            description: "Not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/votes": {
      post: {
        summary: "Toggle vote on a module",
        description: "Adds or removes the authenticated user's vote. Rate limited to 10 votes per minute.",
        tags: ["Votes"],
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["moduleId"],
                properties: {
                  moduleId: { type: "string", description: "ID of the module to vote on" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Vote toggled",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    voted: { type: "boolean", description: "true = voted, false = un-voted" },
                  },
                },
              },
            },
          },
          400: {
            description: "Missing moduleId",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          401: {
            description: "Not authenticated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          429: {
            description: "Rate limit exceeded",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
  },
};
