import { SetupServer } from '@src/server';
import supertest from 'supertest';

let server: SetupServer;

beforeAll(async () => {
  try {
    server = new SetupServer();
    await server.init();
    global.testeRequest = supertest(server.getApp());
  } catch (error) {
    console.log(error);
  }
});

afterAll(async () => await server.close());
