# FairShare 💸

> A full-stack expense-splitting application that lets groups of friends track shared expenses and settle balances — built with **Java Spring Boot** and **React**.

[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=flat&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat&logo=render&logoColor=white)](https://render.com/)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)

**🔗 Live Demo: [fairshare-app-five.vercel.app](https://fairshare-app-five.vercel.app/)**

---

## ✨ Features

- 🔐 **User Authentication** — Register and log in with email & password (email as unique identifier)
- 👥 **Friends System** — Add friends by email; friendships are bidirectional and persist across sessions
- 💰 **Expense Tracking** — Log expenses with a description, amount, and friend selection from a dropdown
- 📊 **Live Balance Dashboard** — See your total balance, what you owe, and what you're owed in real time
- 🗃️ **Persistent Storage** — File-based H2 database ensures data survives server restarts
- 📱 **Mobile Responsive** — Fully usable on phones, tablets, and desktops

---

## 🏗️ Architecture

```
FairShare/
├── backend/                  # Spring Boot REST API (Java 17)
│   ├── src/main/java/com/saksham/splitr/
│   │   ├── controller/       # REST Controllers (User, Expense, Friend, Ping)
│   │   ├── model/            # JPA Entities (User, Expense, Friendship)
│   │   ├── repository/       # Spring Data JPA Repositories
│   │   └── service/          # Business Logic Services
│   ├── src/main/resources/
│   │   └── application.properties
│   └── Dockerfile            # Multi-stage Docker build for Render deployment
│
└── frontend/                 # React + Vite SPA
    ├── src/
    │   ├── App.jsx           # Main application component
    │   └── App.css           # Design system & styles
    └── vite.config.js
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Java 17** | Core language |
| **Spring Boot 3** | REST API framework |
| **Spring Data JPA** | ORM & database abstraction |
| **Hibernate** | JPA implementation |
| **H2 Database** | Embedded, file-based persistent database |
| **Maven** | Build & dependency management |
| **Docker** | Containerization for cloud deployment |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **Vanilla CSS** | Custom design system |

### DevOps
| Service | Purpose |
|---|---|
| **Render** | Backend hosting (Dockerized Spring Boot) |
| **Vercel** | Frontend hosting |
| **GitHub** | Source control & CI/CD trigger |

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+

### Run Locally

**1. Clone the repository**
```bash
git clone https://github.com/Saksham-Gupta-GH/FairShare.git
cd FairShare
```

**2. Start the Backend**
```bash
cd backend
mvn spring-boot:run
```
The API server will start on `http://localhost:8080`.

**3. Start the Frontend**
```bash
cd frontend
npm install
npm run dev
```
The React app will start on `http://localhost:5173`.

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/users/register` | Register a new user |
| `POST` | `/api/users/login` | Authenticate and log in |

**Register / Login Request Body:**
```json
{
  "username": "Saksham",
  "email": "saksham@example.com",
  "password": "yourpassword"
}
```

---

### Friends

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/friends/add` | Add a friend by email (bidirectional) |
| `GET` | `/api/friends/{email}` | Get all friends for a user |

**Add Friend Request Body:**
```json
{
  "requesterEmail": "saksham@example.com",
  "friendEmail": "friend@example.com"
}
```

---

### Expenses

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/expenses` | Create a new expense |
| `GET` | `/api/expenses/{email}` | Get all expenses for a user |

**Create Expense Request Body:**
```json
{
  "title": "Dinner at Dominos",
  "amount": 1200.00,
  "paidByEmail": "saksham@example.com",
  "splitWithEmail": "friend@example.com"
}
```

---

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/ping` | Health check endpoint |

---

## 🗄️ Database Schema

```
┌──────────────┐       ┌─────────────────┐       ┌───────────────────┐
│    users     │       │    expenses      │       │   friendships     │
├──────────────┤       ├─────────────────┤       ├───────────────────┤
│ id (PK)      │       │ id (PK)          │       │ id (PK)           │
│ email UNIQUE │       │ title            │       │ requester_email   │
│ username     │       │ amount           │       │ friend_email      │
│ password     │       │ paid_by_email    │       │ friend_username   │
└──────────────┘       │ split_with_email │       └───────────────────┘
                       │ created_at       │
                       └─────────────────┘
```

All tables are managed automatically by **Hibernate DDL auto-update**. The H2 database persists to a file on disk to survive server restarts.

---

## 🐳 Docker Deployment

The backend is containerized and deployed on Render. The `Dockerfile` uses a multi-stage build:

```bash
# Build image locally
cd backend
docker build -t fairshare-backend .

# Run container
docker run -p 8080:8080 fairshare-backend
```

---

## 🔮 Planned Improvements

- [ ] Group-based expenses (multiple members per bill)
- [ ] Debt simplification algorithm (minimize number of transactions)
- [ ] Settle Up flow with transaction history
- [ ] JWT-based stateless authentication
- [ ] Push notifications for new expense activity

---

## 👤 Author

**Saksham Gupta**
- GitHub: [@Saksham-Gupta-GH](https://github.com/Saksham-Gupta-GH)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
