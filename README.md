# NebsIT Assessment Backend API

Backend API for Notice Management System built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the root directory with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/NebsIT
```

3. Start MongoDB:
```bash
# Make sure MongoDB is running on your system
mongod
```

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Notices

#### Get All Notices (with pagination and filters)
```
GET /api/notices?page=1&limit=10&status=1&target=0&department_id=xxx&employee_id=xxx&published_date=2025-12-23&search=keyword
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (0=draft, 1=published)
- `target` - Filter by target (0=individual, 1=department)
- `department_id` - Filter by department ID
- `employee_id` - Filter by employee ID
- `published_date` - Filter by published date (YYYY-MM-DD)
- `search` - Search in title and notice_body

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

#### Get Single Notice
```
GET /api/notices/:id
```

#### Create Notice
```
POST /api/notices
Content-Type: application/json

{
  "title": "Important Notice",
  "type": ["Holiday", "Policy Update"],
  "published_date": "2025-12-25",
  "target": 0,
  "employee_id": "xxx",
  "department_id": null,
  "notice_body": "Notice content here...",
  "attachments": ["/uploads/file1.pdf"],
  "status": 1
}
```

**Validation Rules:**
- `title` - Required, non-empty string
- `type` - Required, array with at least one item
- `target` - Required, must be 0 (Individual) or 1 (Department)
- `employee_id` - Required when target=0
- `department_id` - Required when target=1
- `notice_body` - Required, non-empty string
- `status` - Required, must be 0 (Draft) or 1 (Published)

#### Update Notice
```
PUT /api/notices/:id
Content-Type: application/json

{
  "title": "Updated Notice",
  "status": 1,
  ...
}
```

#### Delete Notice
```
DELETE /api/notices/:id
```

#### Upload Files
```
POST /api/notices/upload
Content-Type: multipart/form-data

files: [file1, file2, ...]
```

**Response:**
```json
{
  "success": true,
  "data": ["/uploads/file1.pdf", "/uploads/file2.jpg"],
  "message": "Files uploaded successfully"
}
```

**Supported file types:** jpg, jpeg, png, gif, pdf, doc, docx, xls, xlsx
**Max file size:** 10MB per file
**Max files:** 5 files per request

### Departments

#### Get All Departments
```
GET /api/departments
```

#### Get Single Department
```
GET /api/departments/:id
```

#### Create Department
```
POST /api/departments
Content-Type: application/json

{
  "name": "Engineering"
}
```

### Employees

#### Get All Employees
```
GET /api/employees?department_id=xxx&search=keyword
```

**Query Parameters:**
- `department_id` - Filter by department ID
- `search` - Search in employee_code or name

#### Get Single Employee
```
GET /api/employees/:id
```

#### Create Employee
```
POST /api/employees
Content-Type: application/json

{
  "employee_code": "EMP001",
  "name": "John Doe",
  "department_id": "xxx"
}
```

## Database Schema

### Departments Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Employees Collection
```javascript
{
  _id: ObjectId,
  employee_code: String (required, unique),
  name: String (required),
  department_id: ObjectId (ref: Department, required),
  createdAt: Date,
  updatedAt: Date
}
```

### Notices Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  type: [String] (required, min 1 item),
  published_date: Date (default: null),
  target: Number (0 or 1, required),
  employee_id: ObjectId (ref: Employee, required if target=0),
  department_id: ObjectId (ref: Department, required if target=1),
  notice_body: String (required),
  attachments: [String],
  status: Number (0=draft, 1=published, required),
  createdAt: Date,
  updatedAt: Date
}
```

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

## File Storage

Uploaded files are stored in `notices/uploads/` directory with unique filenames:
- Format: `{timestamp}-{random}.{extension}`
- Example: `1703345678123-987654321.pdf`
- Access via: `http://localhost:5000/uploads/{filename}`

## Development

To add seed data for testing, you can use MongoDB Compass or the MongoDB shell to insert sample departments and employees.

## Testing

Use tools like Postman, Insomnia, or curl to test the API endpoints.

Example curl request:
```bash
curl -X GET "http://localhost:5000/api/notices?page=1&limit=10&status=1"
```
