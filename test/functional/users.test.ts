import { User } from '@src/models/user';

describe('Users functional tests', () => {
  beforeAll(async () => await User.deleteMany({}));

  describe('When creating a new user', () => {
    it('should sucessfully create a new user', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@email.com',
        password: '1234',
      };

      const response = await global.testeRequest.post('/users').send(newUser);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining(newUser));
    });

    it('Should return 422 when there is a validation error', async () => {
      const newUser = {
        email: 'john@email.com',
        password: '1234',
      };
      const response = await global.testeRequest.post('/users').send(newUser);
      expect(response.status).toBe(422);
       expect(response.body).toEqual({
        code: 422,
        error: 'User validation failed: name: Path `name` is required.',
      });
       
    });


  
    it('Should return 409 when the email already exists', async () => {
      
      const newUser = {
        name: 'John Doe',
        email: 'john@email.com',
        password: '1234',
      };

      await global.testeRequest.post('/users').send(newUser);
      const response = await global.testeRequest.post('/users').send(newUser);
      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        code: 409,
        error: 'User validation failed: email: already exists in the database.',
      });
    });

  });
});
