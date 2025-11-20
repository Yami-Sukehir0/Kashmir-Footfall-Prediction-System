# Kashmir Tourism Node.js Server

Express backend acting as API gateway between React frontend and Python ML service.

## Setup

```bash
cd server
npm install
```

## Environment

Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

## Run

```bash
npm run dev
```

Server will run on http://localhost:3001

## Features

- API Gateway to Python ML service
- MongoDB for prediction history
- Resource calculation endpoints
- CORS enabled for React frontend
