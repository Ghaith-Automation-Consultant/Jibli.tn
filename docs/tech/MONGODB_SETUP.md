# MongoDB Setup Guide

I have refactored the backend to use **MongoDB** instead of the local JSON file.

## Prerequisites

Since MongoDB was not found in your system path, you need to install and start it:

1.  **Download & Install**: [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2.  **Start MongoDB**:
    *   Windows Service: It usually runs automatically after install.
    *   Manual: Run `"C:\Program Files\MongoDB\Server\X.X\bin\mongod.exe"`
3.  **Alternative (Cloud)**: Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) and update the `MONGO_URI` in `.env`.

## Configuration

Updated `.env` file (copied from `.env.example`):

```ini
MONGO_URI=mongodb://127.0.0.1:27017/jibli
JWT_SECRET=your_secret_key
PORT=3000
```

## Migration

Once MongoDB is running, migrate your old data from `backend/legacy/data.json`:

```bash
npm run seed
```

This will:
1.  Clear the database.
2.  Import Users, Trips, and Requests.
3.  Preserve relationships between them.

## Running the App

```bash
npm start
```

## Viewing Data with MongoDB Compass

To visually explore and manage your database:

1.  **Open MongoDB Compass** (installed with MongoDB).
2.  In the **URI** field, enter:
    ```
    mongodb://127.0.0.1:27017/jibli
    ```
3.  Click **Connect**.
4.  In the left sidebar, click on the **`jibli`** database.
5.  You will see your collections:
    *   `users`: Registered users
    *   `trips`: Travel listings
    *   `requests`: Delivery requests
6.  Click on any collection to see the JSON documents inside.
