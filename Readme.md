# 🚗 VISAL Vehicle Booking System

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)
![Flask](https://img.shields.io/badge/Backend-Flask-000000?logo=flask)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)

A full-stack vehicle booking management system for staff vehicle requests and admin approvals with secure JWT authentication and email notifications.

**Windows-Only Setup**: This project is configured specifically for Windows environments.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [Testing](#-testing)
- [Future Improvements](#-future-improvements)
- [License](#-license)

---

## ✨ Features

### 👤 Staff Features
- Secure JWT-based login
- Submit vehicle booking requests
- View personal booking history and status
- Real-time booking status updates

### 🛠 Admin Features
- Approve or decline booking requests
- Add comments to decisions
- View all bookings and schedule conflicts
- Register new staff accounts
- Access reports and analytics (coming soon)

### 🔐 Security & Notifications
- Role-based access control (Staff/Admin)
- JWT authentication with protected routes
- Automatic email notifications for approvals/declines
- Daily summary emails for late bookings
- In-app notification system

---

## 🧱 Tech Stack

### Frontend
- **React** with Vite
- **React Router** for navigation
- **Lucide Icons** and custom CSS
- **Tailwind CSS** for styling

### Backend
- **Flask** with SQLAlchemy
- **Flask-JWT-Extended** for authentication
- **Flask-Mail** for email notifications
- **PostgreSQL** database

### Development Tools
- **Pytest** for backend testing
- **Vitest** for frontend testing
- **Alembic** for database migrations

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+ (Windows)
- Node.js 18+ (Windows)
- PostgreSQL (Windows)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/georgeacquahjunior/visal_vehicle_booking_system.git
   cd visal_vehicle_booking_system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   # Configure .env file (see backend/backend_documentation.md)
   python run.py
   ```

3. **Frontend Setup** (in new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://127.0.0.1:5173
   - Backend API: http://127.0.0.1:5000

### Test Credentials
See `frontend/frontend_ui_update.md` for test admin and staff accounts.

---

## 📚 Documentation

For detailed information, refer to the dedicated documentation files:

- **[Frontend Documentation](frontend/frontend_ui_update.md)**: UI components, pages, navigation, and user flows
- **[Backend Documentation](backend/backend_documentation.md)**: API endpoints, models, services, and configuration

These files contain comprehensive guides for development, API usage, and project maintenance.

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
.\venv\Scripts\Activate.ps1
python run_tests.py
# Or: python -m pytest --cov=app --cov-report=html
```

### Frontend Tests
```bash
cd frontend
npm run test
```

---

## 🔮 Future Improvements

- Automatic booking conflict detection
- Enhanced admin dashboard analytics
- Mobile-responsive design improvements
- Docker containerization

---

## 📜 License

No license file is currently attached.

Until a license is added, this project is:

**All Rights Reserved**

---

## 👨‍💻 Author

Developed as a comprehensive vehicle booking system for efficient fleet management and approval workflows.

---

