# 🚗 VISAL Vehicle Booking System

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)
![Flask](https://img.shields.io/badge/Backend-Flask-000000?logo=flask)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)


A full-stack vehicle booking management system that allows staff to request vehicles and admins to approve or decline bookings through a secure, role-based workflow.

---

# 📌 Overview

The VISAL Vehicle Booking System eliminates manual coordination and spreadsheet-based tracking by centralizing:

- Staff vehicle request submission  
- Admin approval / decline workflow  
- Booking history tracking  
- Schedule visibility  
- Conflict reduction  
- Secure JWT authentication  

This system improves transparency, operational efficiency, and accountability in vehicle allocation.

---

# ✨ Features

## 👤 Staff Features

- Secure login using JWT
- Create booking requests
- View booking history
- Track booking status (Pending / Approved / Declined)

## 🛠 Admin Features

- View all pending bookings
- Approve bookings with comments
- Decline bookings with reasons
- View full booking history
- Monitor schedule conflicts

## 🔐 Security Features

- JWT-based authentication
- Role-based access control
- Protected backend routes
- Environment variable configuration
- Secure password handling
---
# 🧱 Tech Stack

## Frontend

- React
- Vite
- React Router
- CSS (component-scoped)

## Backend

- Flask
- Flask-SQLAlchemy
- Flask-Migrate
- Flask-JWT-Extended
- Flask-Mail

## Database

- PostgreSQL

## Testing & Tooling

- Pytest
- Vitest
- ESLint

---

# 📂 Project Structure

```
visal_vehicle_booking_system/
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── models/
│   │   └── extensions.py
│   ├── config.py
│   ├── run.py
|   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── public/
│   │   ├── assets/
│   │   ├── pages/
│   │   ├── components/
│   │   └── utils/
│   └── package.json
│
├── index.html
│
└── README.md
```

---

# 🚀 Getting Started

## ✅ Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL installed and running

---

## 1️⃣ Clone Repository

```bash
git clone <https://github.com/georgeacquahjunior/visal_vehicle_booking_system.git>
cd visal_vehicle_booking_system
```



## 2️⃣ Backend Setup

```bash
cd backend
python -m venv .venv
```

### Activate Virtual Environment

```bash
# Windows
.\.venv\Scripts\Activate.ps1

# macOS/Linux
source .venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

If you encounter missing module errors:

```bash
pip install Flask-Migrate Flask-JWT-Extended psycopg2-binary
```

---

### Create Environment Variables (`backend/.env`)

```env
SECRET_KEY=change-me
JWT_SECRET_KEY=change-me-too
JWT_ACCESS_TOKEN_EXPIRES_HOURS=8
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/vehicle_booking_db
```

---

### Run Backend Server

```bash
python run.py
```

Backend URL:

```
http://127.0.0.1:5000
```

---

## 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend URL:

```
http://127.0.0.1:5173
```

---

# 🔄 API Usage Examples

## 🔑 Login (JWT Issued)

```bash
curl -X POST http://127.0.0.1:5000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"staff_id\":\"101\",\"password\":\"your_password\"}"
```

Expected response:

```json
{
  "staff_id": "101",
  "role": "staff",
  "access_token": "your_jwt_token_here"
}
```

---

## 📅 Create Booking

```bash
curl -X POST http://127.0.0.1:5000/bookings/create_booking \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": 101,
    \"booking_date\": \"2026-02-20\",
    \"start_time\": \"09:00\",
    \"end_time\": \"11:00\",
    \"location\": \"Main Office\",
    \"purpose\": \"Client Visit\",
    \"notes\": \"Bring documents\"
  }"
```

---

## 📋 Get Staff Bookings

```bash
curl http://127.0.0.1:5000/bookings/staff/101
```

---

## 🛠 Admin: Get Pending Bookings

```bash
curl http://127.0.0.1:5000/bookings/pending
```

---

## ✅ Approve Booking

```bash
curl -X PATCH http://127.0.0.1:5000/bookings/12/approve \
  -H "Content-Type: application/json" \
  -d "{\"admin_comment\":\"Approved by admin\"}"
```

---

## ❌ Decline Booking

```bash
curl -X PATCH http://127.0.0.1:5000/bookings/12/decline \
  -H "Content-Type: application/json" \
  -d "{\"admin_comment\":\"Vehicle unavailable for selected time\"}"
```

---

# 🧪 Testing

## Backend

```bash
cd backend
pytest
```

## Frontend

```bash
cd frontend
npm run lint
npm run test
```


# 🔮 Future Improvements

- Automatic booking conflict detection
- Email notifications on approval/decline
- In‑app notifications: users receive bell alerts when bookings are approved or declined (accessible via sidebar)
- Admin dashboard analytics
- Deployment to Render / Railway
- Docker containerization

---

# 📜 License

No license file is currently attached.

Until a license is added, this project is:

**All Rights Reserved**

---

# 👨‍💻 Author

Developed as a full-stack vehicle booking system for structured approval workflows, secure authentication, and scalable architecture.

---

