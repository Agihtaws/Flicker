# ⚡ Flicker - Reflex Arena

![Flicker Game Screenshot - Placeholder for a cool game image]
(https://via.placeholder.com/1200x600?text=Flicker+Game+Screenshot)

## 🚀 Project Overview

**Flicker** is a fast-paced, engaging browser game developed for the **Avalanche GameLoop: High Score! hackathon**. The core objective is to test players' reflexes and accuracy across various challenging game modes, all while competing for the top spot on global leaderboards.

The project is built as a full-stack application, featuring a dynamic React frontend and a robust Node.js/Express backend with MongoDB for data persistence. It incorporates modern web technologies to deliver a smooth, responsive, and visually appealing gaming experience.

## ✨ Features

*   **Responsive UI:** Seamless experience across desktop and mobile devices.
*   **Multiple Game Modes:**
    *   **Standard:** Classic mode, score as high as possible in 60 seconds.
    *   **Time Attack:** Intense mode, maximize score in a shorter 30-second burst.
    *   **Precision:** Penalizes missed clicks, demanding high accuracy.
*   **Player Authentication:** Secure registration and login system.
*   **Global Leaderboards:** Compete with other players across all game modes.
*   **Dynamic Difficulty & Visuals:** Game difficulty scales with level, and background visuals change dynamically.
*   **Power-ups:** Collect in-game bonuses (Points, Score Multiplier) to boost your score. (Removed 'Time' power-up for consistent timer challenge).
*   **Programmatic Sound Effects:** Engaging audio feedback for hits, power-ups, level-ups, and game events (generated with Web Audio API).
*   **Real-time Effects:** Particle explosions, floating score texts, screen shake, and animated background bubbles enhance gameplay.

## 🛠️ Technologies Used

**Frontend:**
*   **React.js:** JavaScript library for building user interfaces.
*   **React Spring:** Physics-based animation library for smooth UI transitions.
*   **Axios:** Promise-based HTTP client for API requests.
*   **Web Audio API:** For programmatic sound generation.

**Backend:**
*   **Node.js:** JavaScript runtime environment.
*   **Express.js:** Web framework for Node.js to build RESTful APIs.
*   **MongoDB:** NoSQL database for storing player data and scores.
*   **Mongoose:** MongoDB object data modeling (ODM) for Node.js.
*   **JSON Web Tokens (JWT):** For secure user authentication.
*   **Bcrypt.js:** For password hashing.
*   **CORS:** Middleware for enabling Cross-Origin Resource Sharing.

**Deployment:**
*   **Render:** Cloud platform for deploying web services and static sites.

## ⚙️ Local Setup and Installation

To run Flicker locally, follow these steps:

### Prerequisites

*   **Node.js (v18 or higher) & npm:** [Download Node.js](https://nodejs.org/)
*   **MongoDB:** [Install MongoDB Community Server](https://www.mongodb.com/try/download/community) or set up a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster.

### Clone the Repository

First, clone the repository and navigate into the project folder:

```bash
git clone https://github.com/Agihtaws/Flicker
cd Flicker
```

### Backend Setup

1.  **Navigate to the backend directory:**
   
    ```bash
    cd backend
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Create a `.env` file:**
    In the `backend` directory, create a file named `.env` and add your MongoDB URI and JWT Secret.
    ```env
    MONGODB_URI=
    JWT_SECRET=
    NODE_ENV=development
    FRONTEND_URL=http://localhost:3000
    PORT=5000
    ```
    *   **Note:** If you are using a local MongoDB instance, your `MONGODB_URI` might be `mongodb://localhost:27017/flicker-db`.
5.  **Start the backend server:**
    ```bash
    npm run dev
    ```
    The server should start on `http://localhost:5000`. You can test the health check at `http://localhost:5000/api/health`.

### Frontend Setup

1.  **Navigate to the frontend directory:** (Open a new terminal tab/window)
   
    ```bash
    cd frontend
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Create a `.env.local` file:**
    In the `frontend` directory, create a file named `.env.local` to specify your local backend API URL.
    ```env
    REACT_APP_API_URL=http://localhost:5000/api
    ```
5.  **Start the frontend development server:**
    ```bash
    npm start
    ```
    The frontend should open in your browser at `http://localhost:3000`.

## ☁️ Deployment

Both the frontend and backend of Flicker are deployed on **Render**.

*   **Backend Live URL:** `https://flicker-backend-492n.onrender.com`
*   **Frontend Live URL:** `https://flicker-frontend-t6yr.onrender.com`

During deployment, ensure the `REACT_APP_API_URL` environment variable for the frontend points to the live backend URL, and the `FRONTEND_URL` environment variable for the backend points to the live frontend URL.

## 👤 Author

*   **Swathiga Ganesh**

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.
