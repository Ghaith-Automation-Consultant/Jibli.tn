const db = require('./db');
const fs = require('fs');
const path = require('path');

jest.mock('fs');

describe('Database Utilities', () => {
    const mockData = {
        trips: [
            { id: 1, from: 'Paris', to: 'Tunis' },
            { id: 2, from: 'Lyon', to: 'Tunis' }
        ],
        requests: [
            { id: 1, item: 'Médicaments', location: 'Tunis' }
        ],
        users: []
    };

    beforeEach(() => {
        jest.clearAllMocks();
        fs.readFileSync.mockReturnValue(JSON.stringify(mockData));
        fs.writeFileSync.mockImplementation(() => { });
    });

    describe('getAll', () => {
        test('should return all items from collection', () => {
            const trips = db.getAll('trips');

            expect(trips).toEqual(mockData.trips);
            expect(trips).toHaveLength(2);
        });

        test('should return empty array for empty collection', () => {
            const users = db.getAll('users');

            expect(users).toEqual([]);
        });
    });

    describe('add', () => {
        test('should add new item with auto-generated id', () => {
            const newTrip = { from: 'Marseille', to: 'Tunis' };

            const result = db.add('trips', newTrip);

            expect(result).toHaveProperty('id');
            expect(result.from).toBe('Marseille');
            expect(result.to).toBe('Tunis');
            expect(fs.writeFileSync).toHaveBeenCalled();
        });

        test('should generate unique id based on timestamp', () => {
            const item1 = db.add('trips', { from: 'Paris', to: 'Tunis' });
            const item2 = db.add('trips', { from: 'Lyon', to: 'Tunis' });

            expect(item1.id).toBeDefined();
            expect(item2.id).toBeDefined();
            // IDs should be different (timestamp-based)
            expect(item1.id).not.toBe(item2.id);
        });
    });

    describe('update', () => {
        test('should update existing item', () => {
            const updates = { from: 'Updated Paris' };

            const result = db.update('trips', 1, updates);

            expect(result).toBeDefined();
            expect(result.from).toBe('Updated Paris');
            expect(result.to).toBe('Tunis'); // Unchanged field
            expect(fs.writeFileSync).toHaveBeenCalled();
        });

        test('should return null if item not found', () => {
            const result = db.update('trips', 999, { from: 'Test' });

            expect(result).toBeNull();
            expect(fs.writeFileSync).not.toHaveBeenCalled();
        });

        test('should merge updates with existing data', () => {
            const updates = { maxWeight: 15 };

            const result = db.update('trips', 1, updates);

            expect(result.from).toBe('Paris'); // Original data preserved
            expect(result.maxWeight).toBe(15); // New field added
        });
    });

    describe('remove', () => {
        test('should remove existing item', () => {
            const result = db.remove('trips', 1);

            expect(result).toBe(true);
            expect(fs.writeFileSync).toHaveBeenCalled();
        });

        test('should return false if item not found', () => {
            const result = db.remove('trips', 999);

            expect(result).toBe(false);
            expect(fs.writeFileSync).not.toHaveBeenCalled();
        });
    });
});
