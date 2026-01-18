# Troubleshooting Guide - Cannot Lodge Complaints

## Quick Checks

### 1. Is the Backend Running?

Check if you see this in the terminal:
```
* Running on http://127.0.0.1:5000
```

If not, start it:
```powershell
cd C:\Users\ALPANA\Desktop\RINL\backend
.\venv\Scripts\Activate.ps1
python app.py
```

### 2. Is the Frontend Running?

Check if you see:
```
Compiled successfully!
Local: http://localhost:3000
```

If not, start it:
```powershell
cd C:\Users\ALPANA\Desktop\RINL\frontend
npm start
```

### 3. Are You Logged In?

- Check if you see your name in the dashboard header
- If not, go to http://localhost:3000/login and login again

### 4. Check Browser Console

Open browser DevTools (F12) and check:
- Console tab for JavaScript errors
- Network tab to see API requests

---

## Common Issues and Solutions

### Issue 1: "Network Error" or "Failed to submit complaint"

**Cause:** Backend is not running or CORS issue

**Solution:**
1. Make sure backend is running on port 5000
2. Check terminal for error messages
3. Restart backend:
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   python app.py
   ```

### Issue 2: "Unauthorized" or 401 Error

**Cause:** Token expired or not logged in

**Solution:**
1. Logout and login again
2. Check if token is in localStorage:
   - Open DevTools → Application → Local Storage
   - Look for "token" key
3. If missing, login again

### Issue 3: Database Connection Error

**Cause:** PostgreSQL not running or wrong credentials

**Solution:**
1. Start PostgreSQL service
2. Check database exists:
   ```sql
   \l  -- list databases
   ```
3. Update `.env` file with correct password:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/complaint_bridge
   ```

### Issue 4: "Cannot upload image"

**Cause:** File size too large or wrong format

**Solution:**
1. Use images smaller than 16MB
2. Use formats: JPG, PNG, GIF
3. Image is optional - try without image first

### Issue 5: Form Fields Not Filled

**Cause:** Missing required fields

**Solution:**
- Make sure to fill:
  - Title (required)
  - Category (required)
  - Description (required)
  - Location (optional)
  - Image (optional)

---

## Step-by-Step Debugging

### Step 1: Test Backend API

Run the test script:
```powershell
cd C:\Users\ALPANA\Desktop\RINL\backend
.\venv\Scripts\Activate.ps1
python test_api.py
```

This will test:
- ✓ Backend is running
- ✓ Login works
- ✓ Create complaint works
- ✓ Get complaints works

### Step 2: Check Database

```powershell
# Connect to PostgreSQL
psql -U postgres -d complaint_bridge

# Check if tables exist
\dt

# Check if there are any complaints
SELECT * FROM complaints;

# Check users
SELECT id, name, email, role FROM users;
```

### Step 3: Check Browser Network Tab

1. Open DevTools (F12) → Network tab
2. Try to submit a complaint
3. Look for the request to `http://localhost:5000/api/complaints`
4. Check:
   - Status code (should be 201)
   - Response (should show success message)
   - Request payload (should have title, description, category)

### Step 4: Check Backend Terminal

When you submit a complaint, you should see:
```
Creating complaint for user: {'id': 1, 'email': '...', 'role': 'user'}
Complaint data - Title: ..., Category: ...
Complaint created successfully with ID: 1
```

If you see errors, read the error message carefully.

---

## Manual Test via Browser Console

Open browser console (F12) and paste:

```javascript
// Get current token
const token = localStorage.getItem('token');
console.log('Token:', token ? 'Found' : 'Missing');

// Test create complaint
fetch('http://localhost:5000/api/complaints', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: (() => {
    const formData = new FormData();
    formData.append('title', 'Test Complaint');
    formData.append('description', 'Testing complaint submission');
    formData.append('category', 'water');
    formData.append('location', 'Test Location');
    return formData;
  })()
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

---

## Database Password Issue?

If you get "password authentication failed":

1. Find your PostgreSQL password
2. Update backend/.env:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/complaint_bridge
   ```
3. Restart backend

---

## Still Not Working?

### Collect Information:

1. **Backend Terminal Output:**
   - Copy any error messages

2. **Browser Console Errors:**
   - Take screenshot of Console tab
   - Take screenshot of Network tab (failed request)

3. **What You See:**
   - Describe what happens when you click "Submit Complaint"
   - Any error messages shown?

4. **Test Results:**
   - Run `python test_api.py` and share output

### Create Fresh Database:

```sql
-- Connect to postgres
psql -U postgres

-- Drop and recreate
DROP DATABASE IF EXISTS complaint_bridge;
CREATE DATABASE complaint_bridge;

-- Exit
\q
```

Then restart backend - it will recreate tables.

---

## Quick Reset

If everything is broken, reset completely:

```powershell
# Stop both servers (Ctrl+C in each terminal)

# Backend
cd C:\Users\ALPANA\Desktop\RINL\backend
Remove-Item -Recurse -Force venv
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Recreate database
# (Use PostgreSQL to drop and create complaint_bridge)

# Start backend
python app.py

# In new terminal - Frontend
cd C:\Users\ALPANA\Desktop\RINL\frontend
Remove-Item -Recurse -Force node_modules
npm install
npm start
```

---

## Contact Information

If issue persists, provide:
1. Error messages from backend terminal
2. Error messages from browser console
3. Output of `python test_api.py`
4. PostgreSQL version
5. Python version
6. Node version
