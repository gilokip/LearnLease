# UniLease

University Laptop Lease Management System — full-stack platform for students, admins, inventory managers, and finance teams.

---

## Prerequisites

- [Node.js](https://nodejs.org) v18+
- [MySQL](https://www.mysql.com) 8.0+

---

## Clone the Repository

```bash
git clone https://github.com/gilokip/unilease.git
cd unilease
```

---

## Database Setup

Create the database and import the schema file included in the repo:

```bash
mysql -u root -p -e "CREATE DATABASE unilease;"
mysql -u root -p unilease < unilease.sql
```

---

## Backend

```bash
cd unilease-backend
```

Copy the environment file and fill in your database credentials:

```bash
cp .env.example .env
```

```env
PORT=3001
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=unilease

JWT_SECRET=your_secret_key_min_32_characters
```

Install dependencies and start the server:

```bash
npm install
node server.js
```

The API will be running at `http://localhost:3001`.

---

## Frontend

Open a new terminal tab:

```bash
cd unilease-frontend
cp .env.example .env
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## User Roles

| Role | What they do |
|------|-------------|
| Student | Browse devices, apply for leases, track payments |
| Admin | Approve applications, manage students and reports |
| Inventory | Manage devices and maintenance |
| Finance | Record payments, run billing, view invoices |
