# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### 1. Authentication

#### Register User
```http
POST /api/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123",
  "role": "user"
}
```

**Response:**
```json
{
  "message": "User registered successfully"
}
```

#### Login
```http
POST /api/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### 2. Complaints

#### Get All Complaints
```http
GET /api/complaints
Authorization: Bearer <token>
```

Returns complaints based on user role:
- **Admin:** All complaints
- **Worker:** Assigned complaints
- **User:** Own complaints

**Response:**
```json
[
  {
    "id": 1,
    "title": "Road Damage",
    "description": "Large pothole on Main Street",
    "category": "accident",
    "status": "pending",
    "priority": "medium",
    "location": "Main Street, City",
    "image_url": "/uploads/image.jpg",
    "user_name": "John Doe",
    "worker_name": null,
    "created_at": "2025-01-15T10:30:00",
    "updated_at": "2025-01-15T10:30:00"
  }
]
```

#### Create Complaint
```http
POST /api/complaints
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `title` (required): String
- `description` (required): String
- `category` (required): String (accident, water, tree, electrical, infrastructure)
- `location` (optional): String
- `image` (optional): File

**Response:**
```json
{
  "message": "Complaint submitted successfully",
  "id": 1
}
```

#### Get Complaint Details
```http
GET /api/complaints/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "title": "Road Damage",
  "description": "Large pothole on Main Street",
  "category": "accident",
  "status": "pending",
  "priority": "medium",
  "location": "Main Street, City",
  "image_url": "/uploads/image.jpg",
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "user_phone": "1234567890",
  "worker_name": null,
  "created_at": "2025-01-15T10:30:00",
  "updated_at": "2025-01-15T10:30:00",
  "updates": [
    {
      "id": 1,
      "message": "Worker assigned to complaint",
      "updated_by": "Admin User",
      "created_at": "2025-01-15T11:00:00"
    }
  ]
}
```

#### Update Complaint
```http
PUT /api/complaints/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "in_progress",
  "priority": "high",
  "worker_id": 2,
  "message": "Status updated"
}
```

**Response:**
```json
{
  "message": "Complaint updated successfully"
}
```

#### Delete Complaint (Admin Only)
```http
DELETE /api/complaints/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Complaint deleted successfully"
}
```

---

### 3. Admin Endpoints

#### Get Analytics (Admin Only)
```http
GET /api/analytics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_complaints": 150,
  "total_users": 45,
  "total_workers": 10,
  "status_breakdown": {
    "pending": 30,
    "assigned": 20,
    "in_progress": 40,
    "completed": 55,
    "rejected": 5
  },
  "category_breakdown": {
    "accident": 30,
    "water": 25,
    "tree": 20,
    "electrical": 35,
    "infrastructure": 40
  },
  "priority_breakdown": {
    "low": 50,
    "medium": 70,
    "high": 30
  },
  "recent_complaints": [
    {
      "id": 150,
      "title": "Street Light Not Working",
      "category": "electrical",
      "status": "pending",
      "created_at": "2025-01-15T14:30:00"
    }
  ]
}
```

#### Get All Workers (Admin Only)
```http
GET /api/workers
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 2,
    "name": "Worker One",
    "email": "worker1@example.com",
    "phone": "9876543210",
    "assigned_complaints": 5
  }
]
```

#### Get All Users (Admin Only)
```http
GET /api/users
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "user",
    "created_at": "2025-01-10T09:00:00"
  }
]
```

---

### 4. Utility Endpoints

#### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy"
}
```

#### Get Uploaded File
```http
GET /uploads/:filename
```

Returns the uploaded image file.

---

## Status Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request |
| 401  | Unauthorized |
| 403  | Forbidden |
| 404  | Not Found |
| 500  | Internal Server Error |

---

## Complaint Categories

- `accident` - Road and vehicle accidents
- `water` - Water leakage and pipeline issues
- `tree` - Fallen trees and pole damage
- `electrical` - Electrical issues and power outages
- `infrastructure` - Broken infrastructure and public property

---

## Complaint Status

- `pending` - Newly submitted, awaiting assignment
- `assigned` - Assigned to a worker
- `in_progress` - Worker is actively resolving
- `completed` - Issue resolved
- `rejected` - Complaint rejected by admin

---

## Priority Levels

- `low` - Non-urgent issue
- `medium` - Standard priority (default)
- `high` - Urgent issue requiring immediate attention

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description"
}
```

Example errors:
- "Email already registered"
- "Invalid credentials"
- "Unauthorized"
- "Complaint not found"

---

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123","role":"user"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@complaint.com","password":"admin123"}'
```

### Get Complaints
```bash
curl -X GET http://localhost:5000/api/complaints \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

For more details, refer to the main [README.md](README.md)
