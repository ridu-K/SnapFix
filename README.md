# Complaint Bridge Management System

A comprehensive web-based platform that enables citizens to report real-time public issues and allows authorities to efficiently assign, track, and resolve complaints. Built with Flask (Python) backend, PostgreSQL database, and React frontend.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Default Credentials](#default-credentials)
- [API Endpoints](#api-endpoints)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)

## ✨ Features

### For Citizens (Users)
- Register and create an account
- Submit complaints with title, description, category, location, and images
- Track complaint status in real-time
- View detailed complaint information and updates
- Monitor complaint history

### For Administrators
- Comprehensive analytics dashboard with charts and statistics
- View all complaints, users, and workers
- Assign complaints to workers
- Update complaint status and priority
- Manage user accounts
- Track system-wide metrics

### For Workers
- View assigned complaints
- Update complaint status (In Progress, Completed)
- Add updates and comments to complaints
- Track work history

### General Features
- Role-based access control (User, Admin, Worker)
- JWT-based authentication
- Image upload for complaints
- Real-time status tracking
- Responsive design for all devices
- Beautiful landing page
- Analytics with charts (Pie charts, Bar charts)

## 🛠️ Tech Stack

### Backend
- **Flask** - Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM for database operations
- **Flask-JWT-Extended** - JWT authentication
- **Flask-Bcrypt** - Password hashing
- **Flask-CORS** - Cross-origin resource sharing

### Frontend
- **React** - JavaScript library for UI
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Data visualization charts
- **Lucide React** - Icon library

## 📁 Project Structure

```
RINL/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example       # Environment variables template
│   └── uploads/           # Uploaded images storage
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── contexts/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── LandingPage.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── UserDashboard.js
    │   │   ├── AdminDashboard.js
    │   │   ├── WorkerDashboard.js
    │   │   ├── CreateComplaint.js
    │   │   └── ComplaintDetail.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Node.js 16+** - [Download](https://nodejs.org/)
- **PostgreSQL 12+** - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/downloads)

## 🚀 Installation

### Step 1: Clone or Navigate to the Project

```powershell
git clone https://github.com/ridu-K/SnapFix.git
```

### Step 2: Set Up PostgreSQL Database

1. Open PostgreSQL command line or pgAdmin
2. Create a new database:

```sql
CREATE DATABASE complaint_bridge;
```

3. Create a user (optional, or use default postgres user):

```sql
CREATE USER complaint_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE complaint_bridge TO complaint_user;
```

### Step 3: Set Up Backend

1. Navigate to backend folder:

```powershell
cd backend
```

2. Create a virtual environment:

```powershell
python -m venv venv
```

3. Activate the virtual environment:

```powershell
.\venv\Scripts\Activate
```

4. Install dependencies:

```powershell
pip install -r requirements.txt
```

5. Create `.env` file (copy from `.env.example`):

```powershell
Copy-Item .env.example .env
```

6. Edit `.env` file with your database credentials:

```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/complaint_bridge
JWT_SECRET_KEY=your-secret-key-change-in-production
GMAIL=xyz@gmail.com
APP_PASS=abcd abcd abcd abcd
API_KEY=GEMINI_API_KEY
```

### Step 4: Set Up Frontend

1. Open a new PowerShell window and navigate to frontend:

```powershell
cd frontend
```

2. Install dependencies:

```powershell
npm install
```

## 🗄️ Database Setup

The database tables will be created automatically when you first run the Flask application. The app will also create a default admin user.

## ▶️ Running the Application

### Start Backend Server

1. In the backend folder (with virtual environment activated):

```powershell
cd backend
.\venv\Scripts\Activate
python app.py
```

The backend will run on: `http://localhost:5000`

### Start Frontend Server

2. In a new PowerShell window:

```powershell
cd frontend
npm start
```

The frontend will open automatically at: `http://localhost:3000`

## 🔑 Default Credentials

After starting the backend for the first time, the following admin account is created:

**Admin Account:**
- Email: `admin@complaint.com`
- Password: `admin123`

**Test User Accounts:**
You need to register new users through the registration page.

## 📡 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Complaints
- `GET /api/complaints` - Get all complaints (filtered by role)
- `POST /api/complaints` - Create new complaint
- `GET /api/complaints/<id>` - Get complaint details
- `PUT /api/complaints/<id>` - Update complaint
- `DELETE /api/complaints/<id>` - Delete complaint (admin only)

### Admin
- `GET /api/analytics` - Get analytics data (admin only)
- `GET /api/workers` - Get all workers (admin only)
- `GET /api/users` - Get all users (admin only)

### Health Check
- `GET /api/health` - Check API status

## 👥 User Roles

### User (Citizen)
- Can submit complaints
- View own complaints
- Track complaint status

### Worker
- View assigned complaints
- Update complaint status
- Add updates to complaints

### Admin
- Full system access
- View analytics dashboard
- Manage all complaints
- Assign workers to complaints
- Manage users and workers

## 📸 Screenshots

### Landing Page
<img width="1891" height="989" alt="image" src="https://github.com/user-attachments/assets/179d0cf5-ee36-42b4-8f89-1f40d4b6c52c" />

Beautiful hero section with features showcase and call-to-action.

### User Dashboard
<img width="1892" height="894" alt="image" src="https://github.com/user-attachments/assets/426c417b-43e0-438a-a052-b1b1c42ae8a3" />

Shows all submitted complaints with status tracking and quick actions.

### Admin Dashboard
<img width="1896" height="991" alt="image" src="https://github.com/user-attachments/assets/6057b462-3229-4dc6-a69b-9aee7abd8db6" />

Comprehensive analytics with:
- Total complaints, users, and workers statistics
- Status distribution pie chart
- Category-wise complaints bar chart
- Recent complaints table
- User and worker management

### Complaint Detail
<img width="1894" height="996" alt="image" src="https://github.com/user-attachments/assets/8003754b-a424-4789-8acf-a56e8b9dc86c" />

Detailed view with:
- Complaint information
- Image preview
- Status updates timeline
- Worker assignment
- Contact information

## 📝 License

This project is created for educational purposes.

## 👨‍💻 Support

For issues or questions, please create an issue in the project repository.

## 🎉 Acknowledgments

- Flask documentation
- React documentation
- PostgreSQL documentation
- Recharts library
- Lucide icons

---

**Happy Coding! 🚀**
