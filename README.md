# Customer Management

A simple customer management project with a React frontend and an Express backend.

- Client: `client/` uses Vite + React.
- Server: `server/` uses Express, CORS, and an in-memory customer store initialized from `data.json`.

## Features

- List all customers
- Add new customers via a JSON API
- Delete customers by ID
- No database required; data is kept in memory and resets on server restart

## Local Setup

### Prerequisites

- Node.js 18+ installed
- npm available on your system path

### Start the server

1. Open a terminal.
2. Navigate to the server folder:

```bash
cd server
```

3. Install server dependencies:

```bash
npm install
```

4. Start the backend:

```bash
node server.js
```

5. The server listens on:

```text
http://localhost:5000
```

Available API routes:

- `GET /customers`
- `POST /customers`
- `DELETE /customers/:id`

### Start the client

1. Open a new terminal.
2. Navigate to the client folder:

```bash
cd client
```

3. Install client dependencies:

```bash
npm install
```

4. Start the frontend:

```bash
npm run dev
```

5. Open the URL shown in the terminal, typically:

```text
http://localhost:5173
```

## Notes

- The backend reads initial customer data from `server/data.json` on startup.
- Since customers are stored in memory, added or deleted records are not persisted after restarting the server.
