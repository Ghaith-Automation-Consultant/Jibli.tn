const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../backend/models/User');
const Message = require('../../backend/models/Message');

// Mock data
const userOne = {
    name: 'User One',
    email: 'user1@example.com',
    password: 'Test@123456789'
};

const userTwo = {
    name: 'User Two',
    email: 'user2@example.com',
    password: 'Test@123456789'
};

let cookiesOne, cookiesTwo;
let userIdOne, userIdTwo;

describe('Messaging API', () => {
    beforeEach(async () => {
        // Clear DB
        await User.deleteMany({});
        await Message.deleteMany({});

        // Create users
        const res1 = await request(app).post('/api/auth/register').send(userOne);
        userIdOne = res1.body.user?.id || res1.body.user?._id || (await User.findOne({ email: userOne.email }))._id;

        const res2 = await request(app).post('/api/auth/register').send(userTwo);
        userIdTwo = res2.body.user?.id || res2.body.user?._id || (await User.findOne({ email: userTwo.email }))._id;

        // Login to get cookies
        const loginRes1 = await request(app).post('/api/auth/login').send({ email: userOne.email, password: userOne.password });
        cookiesOne = loginRes1.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');

        const loginRes2 = await request(app).post('/api/auth/login').send({ email: userTwo.email, password: userTwo.password });
        cookiesTwo = loginRes2.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
    });

    test('should send a message', async () => {
        const res = await request(app)
            .post('/api/messages')
            .set('Cookie', cookiesOne)
            .send({
                receiverId: userIdTwo,
                content: 'Hello User Two'
            });

        expect(res.status).toBe(201);
        expect(res.body.content).toBe('Hello User Two');
        expect(String(res.body.sender.id || res.body.sender._id || res.body.sender)).toBe(String(userIdOne));
        expect(String(res.body.receiver.id || res.body.receiver._id || res.body.receiver)).toBe(String(userIdTwo));

        // Check DB
        const msg = await Message.findById(res.body._id);
        expect(msg).not.toBeNull();
        expect(msg.content).toBe('Hello User Two');
    });

    test('should retrieve conversation messages', async () => {
        // Send message from 1 to 2
        await request(app)
            .post('/api/messages')
            .set('Cookie', cookiesOne)
            .send({ receiverId: userIdTwo, content: 'Hi from 1' });

        // Send message from 2 to 1
        await request(app)
            .post('/api/messages')
            .set('Cookie', cookiesTwo)
            .send({ receiverId: userIdOne, content: 'Hello back' });

        // Get messages as User 1
        const res = await request(app)
            .get(`/api/messages/${userIdTwo}`)
            .set('Cookie', cookiesOne);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0].content).toBe('Hi from 1');
        expect(res.body[1].content).toBe('Hello back');
    });

    test('should get conversations list', async () => {
        // 1 talks to 2
        await request(app)
            .post('/api/messages')
            .set('Cookie', cookiesOne)
            .send({ receiverId: userIdTwo, content: 'First msg' });

        const res = await request(app)
            .get('/api/messages/conversations')
            .set('Cookie', cookiesOne);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(String(res.body[0].partner.id || res.body[0].partner._id)).toBe(String(userIdTwo));
        expect(res.body[0].lastMessage.content).toBe('First msg');
    });

    test('should mark messages as read', async () => {
        // 1 sends to 2
        const msgRes = await request(app)
            .post('/api/messages')
            .set('Cookie', cookiesOne)
            .send({ receiverId: userIdTwo, content: 'Unread msg' });

        // Check unread
        let msg = await Message.findById(msgRes.body._id);
        expect(msg.read).toBe(false);

        // 2 reads it
        const res = await request(app)
            .put(`/api/messages/${userIdOne}/read`)
            .set('Cookie', cookiesTwo);

        expect(res.status).toBe(200);

        // Check DB
        msg = await Message.findById(msgRes.body._id);
        expect(msg.read).toBe(true);
    });
});
