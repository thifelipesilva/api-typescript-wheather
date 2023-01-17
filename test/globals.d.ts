declare namespace NodeJS {
  interface Global {
    testeRequest: import('supertest').SuperTest<import('supertest').Test>;
  }
}
