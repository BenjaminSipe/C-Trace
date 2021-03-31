let x = {
  swagger: "2.0",
  info: {
    description: "This is a C-Trace API Swagger doc. This documentation",
    version: "1.0.0",
    title: "Swagger C-Trace",
    contact: {
      email: "c.trace.contact@gmail.com",
    },
  },
  host: "localhost:3000",
  basePath: "/api",
  tags: [
    {
      name: "Authentication",
      description: "Token authentication for C-Trace",
    },
    {
      name: "Case",
      description: "Information for Positive or Probable COVID Cases",
    },
    {
      name: "Contact",
      description:
        "Information for Close Contacts of Positive or Probable COVID Cases",
    },
    {
      name: "Messaging",
      description: "Service for sending messaging services via email or SMS",
    },
  ],
  schemes: ["http"],
  paths: {
    "/auth": {
      get: {
        tags: ["Authentication"],
        summary: "Check if the user is authenticated",
        description: "",
        operationId: "checkAuth",
        consumes: ["application/json"],
        produces: ["application/json"],
        parameters: [],
        responses: {
          405: {
            description: "Invalid input",
          },
        },
        security: [
          {
            auth: ["write:auth", "read:auth"],
          },
        ],
      },
    },
    "/case/by/name/:name": {
      get: {
        tags: ["Case"],
      },
    },
    "/case": {
      get: {
        tags: ["Case"],
      },
      post: {
        tags: ["Case"],
      },
    },
    "/case/all": {
      get: {
        tags: ["Case"],
      },
    },
    "/contact": {
      get: {
        tags: ["Contact"],
      },
      post: {
        tags: ["Contact"],
        summary: "Save Form Data from covid Contact form.",
        description: "",
        consumes: "application/json",
        produces: "application/json",
        parameters: [
          {
            in: "body",
            name: "body",
            description: "Close Contact that needs to be saved to the Database",
            required: true,
            schema: {
              $ref: "#/definitions/CaseForm",
            },
          },
        ],
        responses: {
          405: {
            description: "Invalid input",
          },
        },
        security: [
          {
            petstore_auth: ["write:pets", "read:pets"],
          },
        ],
      },
    },
    "/contact/all": {
      get: {
        tags: ["Contact"],
      },
    },
    "/messaging/contact": {
      get: {
        tags: ["Contact", "Messaging"],
      },
    },
    "/messaging/case": {
      get: {
        tags: ["Case", "Messaging"],
      },
    },
    "/messaging/contact/all": {
      get: {
        tags: ["Contact", "Messaging"],
      },
    },
    "/messaging/case/all": {
      get: {
        tags: ["Case", "Messaging"],
      },
    },
    "/pet": {
      post: {
        tags: ["all"],
        summary: "Add a new pet to the store",
        description: "",
        operationId: "addPet",
        consumes: ["application/json", "application/xml"],
        produces: ["application/xml", "application/json"],
        parameters: [
          {
            in: "body",
            name: "body",
            description: "Pet object that needs to be added to the store",
            required: true,
            schema: {
              $ref: "#/definitions/Order",
            },
          },
        ],
        responses: {
          405: {
            description: "Invalid input",
          },
        },
        security: [
          {
            petstore_auth: ["write:pets", "read:pets"],
          },
        ],
      },
      put: {
        tags: ["all"],
        summary: "Update an existing pet",
        description: "",
        operationId: "updatePet",
        consumes: ["application/json", "application/xml"],
        produces: ["application/xml", "application/json"],
        parameters: [
          {
            in: "body",
            name: "body",
            description: "Pet object that needs to be added to the store",
            required: true,
            schema: {
              $ref: "#/definitions/Pet",
            },
          },
        ],
        responses: {
          400: {
            description: "Invalid ID supplied",
          },
          404: {
            description: "Pet not found",
          },
          405: {
            description: "Validation exception",
          },
        },
        security: [
          {
            petstore_auth: ["write:pets", "read:pets"],
          },
        ],
      },
    },
  },
  securityDefinitions: {
    petstore_auth: {
      type: "oauth2",
      authorizationUrl: "http://petstore.swagger.io/oauth/dialog",
      flow: "implicit",
      scopes: {
        "write:pets": "modify pets in your account",
        "read:pets": "read your pets",
      },
    },
    api_key: {
      type: "apiKey",
      name: "api_key",
      in: "header",
    },
  },
  definitions: {
    Order: {
      type: "object",
      properties: {
        id: {
          type: "integer",
          format: "int64",
        },
        petId: {
          type: "integer",
          format: "int64",
        },
        quantity: {
          type: "integer",
          format: "int32",
        },
        shipDate: {
          type: "string",
          format: "date-time",
        },
        status: {
          type: "string",
          description: "Order Status",
          enum: ["placed", "approved", "delivered"],
        },
        complete: {
          type: "boolean",
          default: false,
        },
      },
      xml: {
        name: "Order",
      },
    },
    CaseForm: {
      type: "object",
      properties: {
        name: {
          type: "string",
          default: "John Doe",
        },
        Address: {
          type: "string",
          default: "100 Opportunity Ave. Point Lookout Mo. 65726",
        },
        dob: {
          type: "string",
          format: "date",
          default: "2000-02-24",
        },
        doc: {
          type: "string",
          format: "date",
          default: "2021-02-24",
        },
        quarantineLocation: {
          type: "string",
          default: "On Campus",
        },
      },
      json: {
        name: "CaseForm",
      },
    },
    ContactForm: {
      type: "object",
      properties: {
        name: {
          type: "string",
          default: "John Doe",
        },
        Address: {
          type: "string",
          default: "100 Opportunity Ave. Point Lookout Mo. 65726",
        },
        DOB: {
          type: "string",
          format: "date",
          default: "2000-02-24",
        },
        DOCC: {
          type: "string",
          format: "date",
          default: "2021-02-24",
        },
        "Where To Quarantine": {
          type: "string",
          default: "On Campus",
        },
      },
      json: {
        name: "ContactForm",
      },
    },
  },
  externalDocs: {
    description: "Find out more about C-Trace",
    url: "localhost:3000",
  },
};
