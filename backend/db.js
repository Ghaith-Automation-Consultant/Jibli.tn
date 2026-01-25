const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data.json');

function readData() {
    if (!fs.existsSync(dbPath)) {
        return { trips: [], requests: [] };
    }
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
}

function writeData(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 4));
}

const db = {
    getAll: (resource) => {
        const data = readData();
        return data[resource] || [];
    },
    add: (resource, item) => {
        const data = readData();
        if (!data[resource]) {
            data[resource] = [];
        }
        item.id = Date.now(); // Simple ID generation
        data[resource].unshift(item); // Add to beginning
        writeData(data);
        return item;
    },
    update: (resource, id, updates) => {
        const data = readData();
        if (!data[resource]) return null;

        const index = data[resource].findIndex(item => item.id == id);
        if (index === -1) return null;

        // Merge updates
        data[resource][index] = { ...data[resource][index], ...updates };
        writeData(data);
        return data[resource][index];
    },
    remove: (resource, id) => {
        const data = readData();
        if (!data[resource]) return false;

        const initialLength = data[resource].length;
        data[resource] = data[resource].filter(item => item.id != id);

        if (data[resource].length !== initialLength) {
            writeData(data);
            return true;
        }
        return false;
    }
};

module.exports = db;
