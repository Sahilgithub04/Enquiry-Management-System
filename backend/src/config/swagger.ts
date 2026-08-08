import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'CloudBlitz Enquiry Management System API',
    version: '1.0.0',
    description: 'Full-stack REST API documentation for CloudBlitz CRM Enquiry Management System',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66b4f7a2...' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john@example.com' },
          role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'AGENT'], example: 'AGENT' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Enquiry: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66b4f8c1...' },
          customerName: { type: 'string', example: 'Alice Smith' },
          email: { type: 'string', example: 'alice@example.com' },
          phone: { type: 'string', example: '+1-555-0199' },
          message: { type: 'string', example: 'Interested in cloud deployment packages.' },
          status: { type: 'string', enum: ['NEW', 'IN_PROGRESS', 'CLOSED'], example: 'NEW' },
          assignedTo: { $ref: '#/components/schemas/User' },
          deletedAt: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          message: { type: 'string' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/health': {
      get: {
        summary: 'System Health Check',
        tags: ['Health'],
        security: [],
        responses: {
          200: {
            description: 'API is running',
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Auth'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', example: 'john@example.com' },
                  password: { type: 'string', example: 'password123' },
                  role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'AGENT'], example: 'AGENT' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login user & retrieve JWT token',
        tags: ['Auth'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@cloudblitz.com' },
                  password: { type: 'string', example: 'Admin@123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current user profile',
        tags: ['Auth'],
        responses: {
          200: { description: 'Current user profile' },
        },
      },
    },
    '/api/enquiries': {
      get: {
        summary: 'Get list of enquiries with search, filter, and pagination',
        tags: ['Enquiries'],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search term for name/email/phone' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['NEW', 'IN_PROGRESS', 'CLOSED'] } },
          { name: 'assignee', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: { description: 'Paginated enquiries list' },
        },
      },
      post: {
        summary: 'Create a new enquiry',
        tags: ['Enquiries'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['customerName', 'email', 'phone', 'message'],
                properties: {
                  customerName: { type: 'string', example: 'Jane Doe' },
                  email: { type: 'string', example: 'jane@example.com' },
                  phone: { type: 'string', example: '+1-555-0188' },
                  message: { type: 'string', example: 'Pricing query' },
                  status: { type: 'string', enum: ['NEW', 'IN_PROGRESS', 'CLOSED'], example: 'NEW' },
                  assignedTo: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Enquiry created' },
        },
      },
    },
    '/api/enquiries/{id}': {
      get: {
        summary: 'Get single enquiry details',
        tags: ['Enquiries'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Enquiry details' } },
      },
      put: {
        summary: 'Update enquiry details, status, or assignee',
        tags: ['Enquiries'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Enquiry updated' } },
      },
      delete: {
        summary: 'Soft-delete an enquiry',
        tags: ['Enquiries'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Enquiry soft-deleted' } },
      },
    },
    '/api/users': {
      get: {
        summary: 'Get all users (ADMIN only)',
        tags: ['User Management'],
        responses: { 200: { description: 'List of users' } },
      },
      post: {
        summary: 'Create new user (ADMIN only)',
        tags: ['User Management'],
        responses: { 201: { description: 'User created' } },
      },
    },
    '/api/users/{id}': {
      put: {
        summary: 'Update user details (ADMIN only)',
        tags: ['User Management'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'User updated' } },
      },
      delete: {
        summary: 'Delete user (ADMIN only)',
        tags: ['User Management'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'User deleted' } },
      },
    },
  },
};

export const setupSwagger = (app: Express): void => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('[Swagger] API documentation configured at /api/docs');
};
