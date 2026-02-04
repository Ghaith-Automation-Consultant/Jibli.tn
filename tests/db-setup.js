const mongoose = require('mongoose');

beforeAll(async () => {
    // Connect to a test database
    const url = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jibli_test';
    await mongoose.connect(url);
});

afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});
