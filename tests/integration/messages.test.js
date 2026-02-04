const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../backend/models/User');
const Message = require('../../backend/models/Message');

// Mock data
const userOne = {
    name: 'User One',
    email: 'user1@example.com',
    password: 'password123'
};

const userTwo = {
    name: 'User Two',
    email: 'user2@example.com',
    password: 'password123'
};

let tokenOne, tokenTwo;
let userIdOne, userIdTwo;

describe('Messaging API', () => {
    beforeEach(async () => {
        // Clear DB
        await User.deleteMany({});
        await Message.deleteMany({});

        // Create users
        const res1 = await request(app).post('/api/auth/register').send(userOne);
        tokenOne = res1.body.user.token;
        userIdOne = res1.body.user.id;

        const res2 = await request(app).post('/api/auth/register').send(userTwo);
        tokenTwo = res2.body.user.token;
        userIdTwo = res2.body.user.id;
    });

    test('should send a message', async () => {
        const res = await request(app)
            .post('/api/messages')
            .set('Authorization', `Bearer ${tokenOne}`)
            .send({
                receiverId: userIdTwo,
                content: 'Hello User Two'
            });

        expect(res.status).toBe(201);
        expect(res.body.content).toBe('Hello User Two');
        expect(res.body.sender.id || res.body.sender._id || res.body.sender).toBe(userIdOne);
        expect(res.body.receiver.id || res.body.receiver._id || res.body.receiver).toBe(userIdTwo);

        // Check DB
        const msg = await Message.findById(res.body._id);
        expect(msg).not.toBeNull();
        expect(msg.content).toBe('Hello User Two');
    });

    test('should retrieve conversation messages', async () => {
        // Send message from 1 to 2
        await request(app)
            .post('/api/messages')
            .set('Authorization', `Bearer ${tokenOne}`)
            .send({ receiverId: userIdTwo, content: 'Hi from 1' });

        // Send message from 2 to 1
        await request(app)
            .post('/api/messages')
            .set('Authorization', `Bearer ${tokenTwo}`)
            .send({ receiverId: userIdOne, content: 'Hello back' });

        // Get messages as User 1
        const res = await request(app)
            .get(`/api/messages/${userIdTwo}`)
            .set('Authorization', `Bearer ${tokenOne}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0].content).toBe('Hi from 1');
        expect(res.body[1].content).toBe('Hello back');
    });

    test('should get conversations list', async () => {
        // 1 talks to 2
        await request(app)
            .post('/api/messages')
            .set('Authorization', `Bearer ${tokenOne}`)
            .send({ receiverId: userIdTwo, content: 'First msg' });

        const res = await request(app)
            .get('/api/messages/conversations')
            .set('Authorization', `Bearer ${tokenOne}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].partner.id || res.body[0].partner._id).toBe(userIdTwo);
        expect(res.body[0].lastMessage.content).toBe('First msg');
    });

    test('should mark messages as read', async () => {
        // 1 sends to 2
        const msgRes = await request(app)
            .post('/api/messages')
            .set('Authorization', `Bearer ${tokenOne}`)
            .send({ receiverId: userIdTwo, content: 'Unread msg' });

        // Check unread
        let msg = await Message.findById(msgRes.body._id);
        expect(msg.read).toBe(false);

        // 2 reads it
        const res = await request(app)
            .put(`/api/messages/${userIdOne}/read`)
            .set('Authorization', `Bearer ${tokenTwo}`);

        expect(res.status).toBe(200);

        // Check DB
        msg = await Message.findById(msgRes.body._id);
        expect(msg.read).toBe(true);
    });
});
