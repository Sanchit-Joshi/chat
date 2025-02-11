# Chat Application

This is a full-stack chat application built with Node.js, Express, MongoDB, and React. The application allows users to sign up, log in, and chat in real-time using WebSockets.

## Features

- User authentication (signup, login, logout)
- Real-time messaging with WebSockets
- Display online users
- Secure password hashing
- JWT-based authentication

## Technologies Used

- Backend: Node.js, Express, MongoDB, Mongoose, Socket.io, JWT, bcrypt
- Frontend: React, TypeScript, Context API
- Other: dotenv, cors

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

## Getting Started

Follow these steps to set up the project locally.

### 1. Clone the Repository

```sh
git clone https://github.com/your-username/chat-app.git
cd chat-app
```

### 2. Install Dependencies

Navigate to the backend and frontend directories and install the dependencies.

```sh
# Install backend dependencies
cd chat app backend
npm install

# Install frontend dependencies
cd ../chat app frontend
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the `chat app backend` directory and add the following environment variables:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 4. Start the Development Servers

Start the backend and frontend development servers.

```sh
# Start backend server
cd chat app backend
npm run dev

# Start frontend server
cd ../chat app frontend
npm start
```

### 5. Access the Application

Open your browser and navigate to `http://localhost:3000` to access the chat application.

## License

This project is licensed under the MIT License.
