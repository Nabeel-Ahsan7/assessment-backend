# NebsIT Assessment API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [API Endpoints](#api-endpoints)
   - [Notices](#notices-api)
   - [Departments](#departments-api)
   - [Employees](#employees-api)
7. [Data Models](#data-models)
8. [Status Codes](#status-codes)

---

## Overview

The NebsIT Assessment API is a RESTful API for managing employee notices, departments, and employees. It supports CRUD operations, file uploads, filtering, pagination, and search functionality.

**Version:** 1.0.0  
**API Style:** REST  
**Data Format:** JSON  

---

## Base URL

```
http://localhost:5000/api
```

**Production:** Update with your production URL when deployed.

---

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

> **Note:** In production, implement JWT or OAuth2 authentication for secure access.

---

## Response Format

All API responses follow a consistent JSON structure:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "errors": ["Validation error 1", "Validation error 2"]
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request (Validation Error) |
| 404  | Resource Not Found |
| 500  | Internal Server Error |

### Common Error Responses

**400 - Validation Error**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Title is required",
    "At least one notice type is required"
  ]
}
```

**404 - Not Found**
```json
{
  "success": false,
  "message": "Notice not found"
}
```

**500 - Server Error**
```json
{
  "success": false,
  "message": "Error fetching notices",
  "error": "Database connection failed"
}
```

---

## API Endpoints

## Notices API

### 1. Get All Notices (with Pagination & Filters)

Retrieve a paginated list of notices with optional filtering and search.

**Endpoint:** `GET /api/notices`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number for pagination |
| limit | integer | No | 10 | Number of items per page |
| status | integer | No | - | Filter by status (0=Draft, 1=Published) |
| target | integer | No | - | Filter by target (0=Individual, 1=Department) |
| department_id | string | No | - | Filter by department ID (MongoDB ObjectId) |
| employee_id | string | No | - | Filter by employee ID (MongoDB ObjectId) |
| published_date | string | No | - | Filter by published date (YYYY-MM-DD) |
| publishStatus | string | No | - | Filter by publish status ('published', 'unpublished') |
| search | string | No | - | Search in title, notice_body, employee name, or employee code |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "6584f3c8a1b2c3d4e5f6g7h8",
      "title": "Annual Company Meeting 2024",
      "type": ["General", "Company-wide"],
      "published_date": "2024-12-25T00:00:00.000Z",
      "target": 1,
      "department_id": {
        "_id": "6584f3c8a1b2c3d4e5f6g7h9",
        "name": "All Departments"
      },
      "employee_id": null,
      "notice_body": "All employees are required to attend the annual company meeting...",
      "attachments": ["/uploads/1234567890-meeting-agenda.pdf"],
      "status": 1,
      "createdAt": "2024-12-20T10:30:00.000Z",
      "updatedAt": "2024-12-20T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

**Example Requests:**

```bash
# Get all notices (first page, 10 items)
GET /api/notices

# Get page 2 with 20 items per page
GET /api/notices?page=2&limit=20

# Get only published notices
GET /api/notices?status=1

# Get notices for a specific department
GET /api/notices?department_id=6584f3c8a1b2c3d4e5f6g7h9

# Search for notices containing "meeting"
GET /api/notices?search=meeting

# Get unpublished notices (future publish date)
GET /api/notices?publishStatus=unpublished

# Combined filters: published notices for IT department
GET /api/notices?status=1&target=1&department_id=6584f3c8a1b2c3d4e5f6g7h9
```

---

### 2. Get Single Notice by ID

Retrieve detailed information about a specific notice.

**Endpoint:** `GET /api/notices/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Notice ID (MongoDB ObjectId) |

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "6584f3c8a1b2c3d4e5f6g7h8",
    "title": "IT Department System Maintenance",
    "type": ["System", "IT"],
    "published_date": "2024-12-24T00:00:00.000Z",
    "target": 0,
    "department_id": null,
    "employee_id": {
      "_id": "6584f3c8a1b2c3d4e5f6g7ha",
      "employee_code": "EMP001",
      "name": "John Doe"
    },
    "notice_body": "Scheduled system maintenance will occur...",
    "attachments": ["/uploads/1234567890-maintenance-schedule.pdf"],
    "status": 1,
    "createdAt": "2024-12-20T10:30:00.000Z",
    "updatedAt": "2024-12-20T10:30:00.000Z"
  }
}
```

**Example Request:**

```bash
GET /api/notices/6584f3c8a1b2c3d4e5f6g7h8
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Notice not found"
}
```

---

### 3. Create New Notice

Create a new notice with validation.

**Endpoint:** `POST /api/notices`

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "New Security Policy Update",
  "type": ["Policy", "Security"],
  "published_date": "2024-12-25",
  "target": 1,
  "department_id": "6584f3c8a1b2c3d4e5f6g7h9",
  "notice_body": "All employees must complete security training by end of month...",
  "attachments": ["/uploads/1234567890-security-policy.pdf"],
  "status": 1
}
```

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes | Notice title |
| type | array[string] | Yes | Array of notice types (at least one required) |
| published_date | string | No | Publish date (ISO 8601 format or YYYY-MM-DD) |
| target | integer | Yes | 0 = Individual, 1 = Department |
| employee_id | string | Conditional | Required if target = 0 |
| department_id | string | Conditional | Required if target = 1 |
| notice_body | string | Yes | Notice content/message |
| attachments | array[string] | No | Array of file URLs (from upload endpoint) |
| status | integer | Yes | 0 = Draft, 1 = Published |

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "_id": "6584f3c8a1b2c3d4e5f6g7h8",
    "title": "New Security Policy Update",
    "type": ["Policy", "Security"],
    "published_date": "2024-12-25T00:00:00.000Z",
    "target": 1,
    "department_id": {
      "_id": "6584f3c8a1b2c3d4e5f6g7h9",
      "name": "IT Department"
    },
    "employee_id": null,
    "notice_body": "All employees must complete security training...",
    "attachments": ["/uploads/1234567890-security-policy.pdf"],
    "status": 1,
    "createdAt": "2024-12-23T10:30:00.000Z",
    "updatedAt": "2024-12-23T10:30:00.000Z"
  },
  "message": "Notice created successfully"
}
```

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/notices \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Holiday Notice",
    "type": ["General"],
    "published_date": "2024-12-25",
    "target": 1,
    "department_id": "6584f3c8a1b2c3d4e5f6g7h9",
    "notice_body": "Office will be closed on December 25th",
    "status": 1
  }'
```

**Validation Error Response (400):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Title is required",
    "At least one notice type is required",
    "Notice body is required",
    "Department ID is required when target is Department"
  ]
}
```

---

### 4. Update Notice

Update an existing notice.

**Endpoint:** `PUT /api/notices/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Notice ID (MongoDB ObjectId) |

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

All fields are optional. Only include fields you want to update.

```json
{
  "title": "Updated Notice Title",
  "type": ["Updated", "Type"],
  "published_date": "2024-12-26",
  "target": 1,
  "department_id": "6584f3c8a1b2c3d4e5f6g7h9",
  "notice_body": "Updated notice content...",
  "attachments": ["/uploads/1234567890-new-file.pdf"],
  "status": 1
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "6584f3c8a1b2c3d4e5f6g7h8",
    "title": "Updated Notice Title",
    "type": ["Updated", "Type"],
    "published_date": "2024-12-26T00:00:00.000Z",
    "target": 1,
    "department_id": {
      "_id": "6584f3c8a1b2c3d4e5f6g7h9",
      "name": "IT Department"
    },
    "employee_id": null,
    "notice_body": "Updated notice content...",
    "attachments": ["/uploads/1234567890-new-file.pdf"],
    "status": 1,
    "createdAt": "2024-12-20T10:30:00.000Z",
    "updatedAt": "2024-12-23T11:45:00.000Z"
  },
  "message": "Notice updated successfully"
}
```

**Example Request:**

```bash
curl -X PUT http://localhost:5000/api/notices/6584f3c8a1b2c3d4e5f6g7h8 \
  -H "Content-Type: application/json" \
  -d '{
    "status": 0,
    "notice_body": "Updated content"
  }'
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Notice not found"
}
```

---

### 5. Delete Notice

Delete a notice and its associated attachments.

**Endpoint:** `DELETE /api/notices/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Notice ID (MongoDB ObjectId) |

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Notice deleted successfully"
}
```

**Example Request:**

```bash
curl -X DELETE http://localhost:5000/api/notices/6584f3c8a1b2c3d4e5f6g7h8
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Notice not found"
}
```

---

### 6. Upload Files

Upload files for notice attachments (images, documents).

**Endpoint:** `POST /api/notices/upload`

**Request Headers:**

```
Content-Type: multipart/form-data
```

**Request Body:**

Form-data with file field named `files` (supports multiple files)

**Supported File Types:**
- Images: jpeg, jpg, png, gif
- Documents: pdf, doc, docx, xls, xlsx

**File Size Limit:** 10MB per file  
**Max Files:** 5 files per upload

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    "/uploads/1703334567890-1234567890-document.pdf",
    "/uploads/1703334567891-9876543210-image.jpg"
  ],
  "message": "Files uploaded successfully"
}
```

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/notices/upload \
  -F "files=@/path/to/document.pdf" \
  -F "files=@/path/to/image.jpg"
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "No files uploaded"
}
```

**Error Response (Invalid File Type):**

```json
{
  "success": false,
  "message": "Error uploading files",
  "error": "Invalid file type. Only images and documents are allowed."
}
```

---

## Departments API

### 1. Get All Departments

Retrieve all departments sorted by name.

**Endpoint:** `GET /api/departments`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "6584f3c8a1b2c3d4e5f6g7h9",
      "name": "IT Department",
      "createdAt": "2024-12-01T08:00:00.000Z",
      "updatedAt": "2024-12-01T08:00:00.000Z"
    },
    {
      "_id": "6584f3c8a1b2c3d4e5f6g7ha",
      "name": "HR Department",
      "createdAt": "2024-12-01T08:00:00.000Z",
      "updatedAt": "2024-12-01T08:00:00.000Z"
    }
  ]
}
```

**Example Request:**

```bash
GET /api/departments
```

---

### 2. Get Single Department by ID

Retrieve a specific department by ID.

**Endpoint:** `GET /api/departments/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Department ID (MongoDB ObjectId) |

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "6584f3c8a1b2c3d4e5f6g7h9",
    "name": "IT Department",
    "createdAt": "2024-12-01T08:00:00.000Z",
    "updatedAt": "2024-12-01T08:00:00.000Z"
  }
}
```

**Example Request:**

```bash
GET /api/departments/6584f3c8a1b2c3d4e5f6g7h9
```

---

### 3. Create Department

Create a new department.

**Endpoint:** `POST /api/departments`

**Request Body:**

```json
{
  "name": "Finance Department"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "_id": "6584f3c8a1b2c3d4e5f6g7hb",
    "name": "Finance Department",
    "createdAt": "2024-12-23T10:30:00.000Z",
    "updatedAt": "2024-12-23T10:30:00.000Z"
  },
  "message": "Department created successfully"
}
```

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/departments \
  -H "Content-Type: application/json" \
  -d '{"name": "Finance Department"}'
```

---

## Employees API

### 1. Get All Employees (with Filters)

Retrieve all employees with optional filtering and search.

**Endpoint:** `GET /api/employees`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| department_id | string | No | Filter by department ID (MongoDB ObjectId) |
| search | string | No | Search in employee_code or name |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "6584f3c8a1b2c3d4e5f6g7hc",
      "employee_code": "EMP001",
      "name": "John Doe",
      "department_id": {
        "_id": "6584f3c8a1b2c3d4e5f6g7h9",
        "name": "IT Department"
      },
      "createdAt": "2024-12-01T08:00:00.000Z",
      "updatedAt": "2024-12-01T08:00:00.000Z"
    }
  ]
}
```

**Example Requests:**

```bash
# Get all employees
GET /api/employees

# Get employees in IT department
GET /api/employees?department_id=6584f3c8a1b2c3d4e5f6g7h9

# Search for employee by name or code
GET /api/employees?search=john
```

---

### 2. Get Single Employee by ID

Retrieve a specific employee by ID.

**Endpoint:** `GET /api/employees/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Employee ID (MongoDB ObjectId) |

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "6584f3c8a1b2c3d4e5f6g7hc",
    "employee_code": "EMP001",
    "name": "John Doe",
    "department_id": {
      "_id": "6584f3c8a1b2c3d4e5f6g7h9",
      "name": "IT Department"
    },
    "createdAt": "2024-12-01T08:00:00.000Z",
    "updatedAt": "2024-12-01T08:00:00.000Z"
  }
}
```

---

### 3. Create Employee

Create a new employee.

**Endpoint:** `POST /api/employees`

**Request Body:**

```json
{
  "employee_code": "EMP005",
  "name": "Jane Smith",
  "department_id": "6584f3c8a1b2c3d4e5f6g7h9"
}
```

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| employee_code | string | Yes | Unique employee code |
| name | string | Yes | Employee full name |
| department_id | string | Yes | Department ID (MongoDB ObjectId) |

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "_id": "6584f3c8a1b2c3d4e5f6g7hd",
    "employee_code": "EMP005",
    "name": "Jane Smith",
    "department_id": {
      "_id": "6584f3c8a1b2c3d4e5f6g7h9",
      "name": "IT Department"
    },
    "createdAt": "2024-12-23T10:30:00.000Z",
    "updatedAt": "2024-12-23T10:30:00.000Z"
  },
  "message": "Employee created successfully"
}
```

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "employee_code": "EMP005",
    "name": "Jane Smith",
    "department_id": "6584f3c8a1b2c3d4e5f6g7h9"
  }'
```

**Error Response (Duplicate Code):**

```json
{
  "success": false,
  "message": "Employee code already exists"
}
```

---

## Data Models

### Notice Model

```javascript
{
  _id: ObjectId,
  title: String (required, trimmed),
  type: [String] (required, at least one),
  published_date: Date (nullable),
  target: Number (0=Individual, 1=Department),
  employee_id: ObjectId (required if target=0, references Employee),
  department_id: ObjectId (required if target=1, references Department),
  notice_body: String (required, trimmed),
  attachments: [String] (array of file URLs),
  status: Number (0=Draft, 1=Published),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

**Notice Types:**
- Warning / Disciplinary
- Performance Improvement
- Appreciation / Recognition
- Attendance / Leave Issue
- Payroll / Compensation
- Contract / Role Update
- Advisory / Personal Reminder

**Target Values:**
- `0` - Individual (notice for specific employee)
- `1` - Department (notice for entire department)

**Status Values:**
- `0` - Draft (not published)
- `1` - Published

**Publish Status Logic:**
- **Draft**: `status = 0`
- **Published**: `status = 1` AND (`published_date` is null OR `published_date <= today`)
- **Unpublished**: `status = 1` AND `published_date > today`

---

### Department Model

```javascript
{
  _id: ObjectId,
  name: String (required, trimmed, unique),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

---

### Employee Model

```javascript
{
  _id: ObjectId,
  employee_code: String (required, unique, trimmed),
  name: String (required, trimmed),
  department_id: ObjectId (required, references Department),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

---

## Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request or validation error |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error occurred |

---

## Best Practices

### 1. Pagination
Always use pagination for list endpoints to improve performance:
```
GET /api/notices?page=1&limit=20
```

### 2. Filtering
Combine multiple filters for precise queries:
```
GET /api/notices?status=1&target=1&department_id=xxx
```

### 3. Search
Use search to find notices by title, content, or employee:
```
GET /api/notices?search=meeting
```

### 4. File Uploads
1. First upload files using `/api/notices/upload`
2. Get the returned URLs
3. Include URLs in the `attachments` array when creating/updating notice

### 5. Error Handling
Always check the `success` field in responses and handle errors appropriately:
```javascript
if (response.success) {
  // Handle success
} else {
  // Handle error using response.message or response.errors
}
```

---

## Rate Limiting

Currently, there are no rate limits implemented. Consider implementing rate limiting in production:
- Recommended: 100 requests per minute per IP
- Use packages like `express-rate-limit`

---

## CORS

CORS is enabled for all origins. In production, restrict to specific domains:

```javascript
app.use(cors({
  origin: 'https://yourdomain.com'
}));
```

---

## Contact & Support

For API support or questions:
- Email: nabeelahsanofficial@gmail.com
- Documentation: http://localhost:5000/api-docs

---

## Changelog

### Version 1.0.0 (December 23, 2024)
- Initial API release
- Notice CRUD operations
- Department management
- Employee management
- File upload support
- Advanced filtering and search
- Pagination support

---

**Last Updated:** December 23, 2024  
**API Version:** 1.0.0
