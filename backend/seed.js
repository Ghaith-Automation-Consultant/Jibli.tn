const mongoose = require('mongoose');
const User = require('./models/User');
const Trip = require('./models/Trip');
const Request = require('./models/Request');
const Message = require('./models/Message');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/jibli')
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

const seedData = async () => {
    try {
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Trip.deleteMany({});
        await Request.deleteMany({});
        await Message.deleteMany({});

        console.log('Creating Users...');
        const hashedPassword = await bcrypt.hash('123456', 10);

        // Scenario 1: Voyageur Fréquent
        const userKarim = await User.create({
            name: 'Karim Voyageur',
            email: 'karim@test.com',
            password: hashedPassword,
            location: 'Lyon, France',
            avatar: 'https://ui-avatars.com/api/?name=Karim+V&background=0D9488&color=fff',
            isVerified: true
        });

        // Scenario 2: Expéditeur Urgent
        const userLeila = await User.create({
            name: 'Leila Urgent',
            email: 'leila@test.com',
            password: hashedPassword,
            location: 'Tunis, Tunisie',
            avatar: 'https://ui-avatars.com/api/?name=Leila+U&background=E11D48&color=fff'
        });

        // Scenario 3: Étudiant (Budget limité)
        const userSami = await User.create({
            name: 'Sami Etudiant',
            email: 'sami@test.com',
            password: hashedPassword,
            location: 'Paris, France',
            avatar: 'https://ui-avatars.com/api/?name=Sami+E&background=F59E0B&color=fff'
        });

        // Scenario 4: Standard / Casual
        const userAlice = await User.create({
            name: 'Alice Martin',
            email: 'alice@test.com',
            password: hashedPassword,
            location: 'Marseille, France',
            avatar: 'https://ui-avatars.com/api/?name=Alice+M&background=random'
        });

        console.log('Creating Trips...');
        await Trip.create([
            // Voyage Karim (Prochainement)
            {
                user: userKarim._id,
                from: 'Lyon',
                to: 'Tunis',
                departureDate: new Date(Date.now() + 86400000 * 5), // +5 days
                arrivalDate: new Date(Date.now() + 86400000 * 6),
                maxWeight: 23,
                size: 'L',
                priceType: 'paid',
                price: 15,
                status: 'active',
                description: 'Je rentre à Tunis pour les vacances, valise vide !'
            },
            // Voyage Karim (Retour)
            {
                user: userKarim._id,
                from: 'Tunis',
                to: 'Lyon',
                departureDate: new Date(Date.now() + 86400000 * 20), // +20 days
                arrivalDate: new Date(Date.now() + 86400000 * 21),
                maxWeight: 10,
                size: 'M',
                priceType: 'paid',
                price: 15,
                status: 'active'
            },
            // Voyage Sami (Gratuit / Solidarité)
            {
                user: userSami._id,
                from: 'Paris',
                to: 'Sfax',
                departureDate: new Date(Date.now() + 86400000 * 10),
                maxWeight: 5,
                size: 'S',
                priceType: 'free',
                status: 'active',
                description: 'Petit sac à dos seulement, je peux prendre des documents.'
            },
            // Voyage Alice (Passé)
            {
                user: userAlice._id,
                from: 'Marseille',
                to: 'Tunis',
                departureDate: new Date(Date.now() - 86400000 * 10),
                arrivalDate: new Date(Date.now() - 86400000 * 9),
                maxWeight: 20,
                priceType: 'paid',
                price: 10,
                status: 'completed'
            }
        ]);

        console.log('Creating Requests...');
        await Request.create([
            // Urgence Leila
            {
                user: userLeila._id,
                item: 'Médicaments Cardiaques',
                description: 'Médicaments pour mon père, introuvables ici. Ordonnance disponible.',
                location: 'Tunis',
                weight: 0.5,
                budget: 0,
                status: 'pending',
                isUrgent: true
            },
            // Demande Sami
            {
                user: userSami._id,
                item: 'Livres Scolaires',
                description: 'Manuels de prépa pour la rentrée.',
                location: 'Paris',
                weight: 3,
                budget: 0,
                status: 'pending'
            },
            // Demande Alice
            {
                user: userAlice._id,
                item: 'Parfum',
                description: 'Cadeau pour ma mère.',
                location: 'Marseille',
                weight: 0.5,
                budget: 10,
                status: 'pending'
            }
        ]);

        console.log('Creating Messages...');
        // Conversation Negotiation: Karim <-> Leila
        await Message.create([
            {
                sender: userLeila._id,
                receiver: userKarim._id,
                content: 'Bonjour Karim, j\'ai vu votre voyage pour Tunis. Pouvez-vous prendre des médicaments urgents ?',
                createdAt: new Date(Date.now() - 86400000),
                read: true
            },
            {
                sender: userKarim._id,
                receiver: userLeila._id,
                content: 'Bonjour Leila. Oui c\'est possible si vous avez l\'ordonnance.',
                createdAt: new Date(Date.now() - 80000000),
                read: true
            },
            {
                sender: userLeila._id,
                receiver: userKarim._id,
                content: 'Oui je l\'ai ! Je peux vous l\'envoyer par mail ?',
                createdAt: new Date(Date.now() - 70000000),
                read: false
            }
        ]);

        console.log('Data Seeding Completed Successfully!');
        console.log('Test Credentials:');
        console.log('Karim (Voyageur): karim@test.com / 123456');
        console.log('Leila (Urgent): leila@test.com / 123456');
        console.log('Sami (Etudiant): sami@test.com / 123456');
        console.log('Alice (Standard): alice@test.com / 123456');

        process.exit(0);
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
