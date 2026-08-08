import request from 'supertest';
import app from '../src/app';
import { User, UserRole } from '../src/models/User';
import { Enquiry, EnquiryStatus } from '../src/models/Enquiry';
import * as passwordUtil from '../src/utils/password';
import * as jwtUtil from '../src/utils/jwt';

// Mock Mongoose models for clean, fast unit/integration testing
jest.mock('../src/models/User');
jest.mock('../src/models/Enquiry');

describe('CloudBlitz API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. System Health Check', () => {
    it('GET /api/health - should return 200 with success message', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'CloudBlitz API is running',
      });
    });
  });

  describe('2. Authentication Routes', () => {
    it('POST /api/auth/register - should create user and return JWT token', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue({
        _id: 'user_123',
        name: 'John Doe',
        email: 'john@example.com',
        role: UserRole.AGENT,
      });

      const response = await request(app).post('/api/auth/register').send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'AGENT',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toEqual({
        id: 'user_123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'AGENT',
      });
    });

    it('POST /api/auth/login - should authenticate valid user credentials', async () => {
      const mockUser = {
        _id: 'user_123',
        name: 'Admin User',
        email: 'admin@cloudblitz.com',
        passwordHash: 'hashed_pass',
        role: UserRole.ADMIN,
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(passwordUtil, 'comparePassword').mockResolvedValue(true as never);

      const response = await request(app).post('/api/auth/login').send({
        email: 'admin@cloudblitz.com',
        password: 'Admin@123',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.role).toBe('ADMIN');
    });

    it('POST /api/auth/login - should fail with invalid credentials', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post('/api/auth/login').send({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('GET /api/auth/me - should return profile for authenticated user', async () => {
      const validToken = jwtUtil.generateToken({ userId: 'user_123', role: 'ADMIN' });
      (User.findById as jest.Mock).mockResolvedValue({
        id: 'user_123',
        name: 'Admin User',
        email: 'admin@cloudblitz.com',
        role: 'ADMIN',
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('admin@cloudblitz.com');
    });
  });

  describe('3. Enquiry Management Routes', () => {
    const agentToken = jwtUtil.generateToken({ userId: 'agent_1', role: UserRole.AGENT });

    it('POST /api/enquiries - should create new enquiry', async () => {
      const newEnquiryData = {
        _id: 'enq_1',
        customerName: 'Alice Smith',
        email: 'alice@example.com',
        phone: '+15550199',
        message: 'Requesting cloud demo',
        status: EnquiryStatus.NEW,
      };

      (Enquiry.create as jest.Mock).mockResolvedValue(newEnquiryData);
      (Enquiry.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          id: 'enq_1',
          customerName: 'Alice Smith',
          email: 'alice@example.com',
          phone: '+15550199',
          message: 'Requesting cloud demo',
          status: 'NEW',
        }),
      });

      const response = await request(app)
        .post('/api/enquiries')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          customerName: 'Alice Smith',
          email: 'alice@example.com',
          phone: '+15550199',
          message: 'Requesting cloud demo',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.customerName).toBe('Alice Smith');
    });

    it('GET /api/enquiries - should reject unauthenticated requests', async () => {
      const response = await request(app).get('/api/enquiries');
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('DELETE /api/enquiries/:id - soft delete enquiry', async () => {
      const mockEnquiryInstance: any = {
        _id: 'enq_1',
        deletedAt: null,
        save: jest.fn().mockResolvedValue(true),
      };

      (Enquiry.findOne as jest.Mock).mockResolvedValue(mockEnquiryInstance);

      const response = await request(app)
        .delete('/api/enquiries/enq_1')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockEnquiryInstance.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('4. User Management & Role Authorization Routes', () => {
    const adminToken = jwtUtil.generateToken({ userId: 'admin_1', role: UserRole.ADMIN });
    const agentToken = jwtUtil.generateToken({ userId: 'agent_1', role: UserRole.AGENT });

    it('GET /api/users - should allow ADMIN access', async () => {
      (User.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { id: 'admin_1', name: 'Admin', role: 'ADMIN' },
          { id: 'agent_1', name: 'Agent', role: 'AGENT' },
        ]),
      });

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('GET /api/users - should reject non-ADMIN user with 403 Forbidden', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
