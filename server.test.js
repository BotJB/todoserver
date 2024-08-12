const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('./server'); // Adjust the path to your server file

// Mock the todoSchema model
const todoSchema = require('./models/todoSchema'); // Adjust the path to your model file
jest.mock('./models/todoSchema');

beforeAll(async () => {
  // Connect to the database before running tests
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  // Disconnect from the database and close the server after running tests
  await mongoose.disconnect();
  server.close();
});

afterEach(() => {
  jest.clearAllTimers();
});

describe('GET /', () => {
  it('should return a 200 status and a message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'This is the get request');
  });
});

describe('GET /todos/:email', () => {
  it('should return a 200 status and todos for a specific user', async () => {
    const mockTodos = [
      { _id: '1', title: 'Test Todo 1', email: 'test@example.com', progress: 50, data: '2023-10-01' },
      { _id: '2', title: 'Test Todo 2', email: 'test@example.com', progress: 75, data: '2023-10-02' },
    ];

    todoSchema.find.mockResolvedValue(mockTodos);

    const res = await request(app).get('/todos/test@example.com');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('todos');
    expect(res.body.todos).toEqual(mockTodos);
  });

  it('should return a 200 status and an empty array if no todos are found', async () => {
    todoSchema.find.mockResolvedValue([]);

    const res = await request(app).get('/todos/nonexistent@example.com');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('todos');
    expect(res.body.todos).toEqual([]);
  });
});