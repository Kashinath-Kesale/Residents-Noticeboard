# GoBasera - Residents Noticeboard 2.0

This is a full-stack application built for the GoBasera interview process. It extends a basic noticeboard by adding features for resident engagement, including comments and reactions, and is built with a production-ready mindset.

---

## 🚀 Live Demo

* **Frontend (Vercel):** [residents-noticeboard-sigma.vercel.app](https://residents-noticeboard-sigma.vercel.app)
* **Backend (Render):** [residents-noticeboard.onrender.com](https://residents-noticeboard.onrender.com)
* **API Docs (Swagger):** [residents-noticeboard.onrender.com/docs](https://residents-noticeboard.onrender.com/docs)

---

## ✨ Features

* **Announcements:** Create and view announcements.
* **Comments:** Add and view paginated comments for each announcement.
* **Reactions:** Add or remove reactions (👍, 👎, ❤️) to announcements.
* **Engagement Analytics:** The main list displays comment and reaction counts.
* **Real-time Updates:** The UI polls the server every 5 seconds for new data.
* **Production-Ready API:**
    * **Caching:** ETag support to reduce bandwidth.
    * **Idempotency:** Protection against duplicate reaction requests.
    * **Security:** Includes `helmet`, rate limiting, and strict DTO validation.
    * **API Docs:** Interactive documentation via Swagger.

---

## 🛠️ Tech Stack

* **Backend:** NestJS, TypeScript
* **Frontend:** React, TypeScript, Vite
* **Styling:** CSS Modules
* **Deployment:** Render (Backend), Vercel (Frontend)

---

## ⚙️ Local Development Setup

### Prerequisites
* Node.js (v18 or later)
* npm

### Backend
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run start:dev
    ```
    The API will be available at `http://localhost:3000`.

### Frontend
1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

---

## 🔑 Environment Variables

The following environment variables are required for a successful deployment.

### Backend (on Render)
* `FRONTEND_URL`: The full URL of the deployed frontend (e.g., `https://residents-noticeboard-sigma.vercel.app`).

### Frontend (on Vercel)
* `VITE_API_URL`: The base URL of the deployed backend API (e.g., `https://residents-noticeboard.onrender.com/announcements`).

---

## API Endpoints

### Get All Announcements
* **Endpoint:** `GET /announcements`
* **Description:** Retrieves all announcements with engagement counts. Supports ETag caching.

### Add a Comment
* **Endpoint:** `POST /announcements/:id/comments`
* **Description:** Adds a new comment to a specific announcement.
* **Sample Payload:**
    ```json
    {
      "authorName": "Jane Doe",
      "text": "Thanks for the update!"
    }
    ```

### Add a Reaction
* **Endpoint:** `POST /announcements/:id/reactions`
* **Description:** Adds or updates a user's reaction to an announcement.
* **Headers:**
    * `x-user-id`: (string, required) - A unique identifier for the user.
    * `idempotency-key`: (string, optional) - A UUID to prevent duplicate requests.
* **Sample Payload:**
    ```json
    {
      "type": "up"
    }
    ```
