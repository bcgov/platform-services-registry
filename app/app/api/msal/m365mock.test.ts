import request from 'supertest';
import app from '../../../../localdev/m365mock/main';

describe('M365 Mock Server API Tests', () => {
  it('should return a welcome message on GET /', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Hello, M365 Mock Server!');
  });

  it('should return 404 for user photo on GET /v1.0/users/:email/photo/$value', async () => {
    const res = await request(app).get('/v1.0/users/test@example.com/photo/$value');
    expect(res.status).toBe(404);
    expect(res.text).toBe('');
  });

  it('should return a list of users on GET /v1.0/users', async () => {
    const res = await request(app).get('/v1.0/users');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('value');
    expect(Array.isArray(res.body.value)).toBe(true);
  });

  it('should return 404 for user photo on GET /v1.0/users/:email/photo/$value', async () => {
    const res = await request(app).get('/v1.0/users/test@example.com/photo/$value');
    expect(res.status).toBe(404);
    expect(res.text).toBe('');
  });

  it('should return a user object on GET /v1.0/users/:upn', async () => {
    const res = await request(app).get('/v1.0/users/admin.system@gov.bc.ca');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('userPrincipalName', 'admin.system@gov.bc.ca');
  });

  it('should return 200 and empty string for a non-existent user on GET /v1.0/users/:upn', async () => {
    const res = await request(app).get('/v1.0/users/nonexistent@gov.bc.ca');
    expect(res.status).toBe(200);
    expect(res.body).toEqual('');
  });
});
