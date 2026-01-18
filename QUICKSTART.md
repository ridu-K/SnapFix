# Quick Start Guide

## Running the Complaint Bridge Management System

### Prerequisites Check

Make sure you have installed:
- Python 3.8+ ✓
- Node.js 16+ ✓
- PostgreSQL 12+ ✓

### Step 1: Database Setup

Open PostgreSQL (pgAdmin or command line) and run:

```sql
CREATE DATABASE complaint_bridge;
```

### Step 2: Start Backend

Open PowerShell and run:

```powershell
# Navigate to backend folder
cd C:\Users\ALPANA\Desktop\RINL\backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create .env file
Copy-Item .env.example .env

# Edit .env file with your database password
# DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/complaint_bridge

# Start the server
python app.py
```

You should see: `Running on http://127.0.0.1:5000`

### Step 3: Start Frontend

Open a NEW PowerShell window and run:

```powershell
# Navigate to frontend folder
cd C:\Users\ALPANA\Desktop\RINL\frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm start
```

Browser will automatically open at: `http://localhost:3000`

### Step 4: Login

Use the default admin credentials:
- **Email:** admin@complaint.com
- **Password:** admin123

Or register a new account from the landing page.

## Common Commands

### Backend
```powershell
# Activate virtual environment
cd backend
.\venv\Scripts\Activate.ps1

# Start server
python app.py

# Deactivate virtual environment
deactivate
```

### Frontend
```powershell
# Start development server
npm start

# Build for production
npm run build
```

## Troubleshooting

### "Module not found" error in backend
```powershell
pip install -r requirements.txt
```

### "Port 5000 already in use"
```powershell
# Kill the process using port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
```

### "Cannot connect to database"
- Make sure PostgreSQL is running
- Check database credentials in `.env` file
- Verify database `complaint_bridge` exists

### Frontend won't start
```powershell
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

## URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

## Default Users

After first run, these accounts are available:

| Role  | Email                    | Password |
|-------|--------------------------|----------|
| Admin | admin@complaint.com      | admin123 |

Create more users by registering through the UI.

---

For detailed documentation, see [README.md](README.md)
