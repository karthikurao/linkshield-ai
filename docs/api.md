# API Documentation

## Base URL
```
https://api.linkshield-ai.com/v1
```

## Authentication
All API requests require authentication using JWT Bearer token.

```
Authorization: Bearer <your_token>
```

## Endpoints

### URL Scanning
#### Scan a URL for phishing

**Request**
```http
POST /scan
Content-Type: application/json

{
  "url": "https://example.com/login",
  "scan_content": true
}
```

**Response**
```json
{
  "scan_id": "f7a8b4d1-c6e3-4529-8f21-59a83c5b2e11",
  "url": "https://example.com/login",
  "is_phishing": false,
  "confidence": 0.98,
  "scan_timestamp": "2025-06-07T15:30:45Z",
  "features": {
    "domain_age_days": 3652,
    "has_suspicious_tld": false,
    "ssl_valid": true,
    "contains_ip_address": false,
    "abnormal_url_length": false
  },
  "categories": [
    "legitimate",
    "business"
  ]
}
```

### User Management
#### Register a new user

**Request**
```http
POST /users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response**
```json
{
  "user_id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2025-06-07T14:28:35Z"
}
```

#### Login

**Request**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "user_id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Scan History
#### Get user scan history

**Request**
```http
GET /history
```

**Response**
```json
{
  "scans": [
    {
      "scan_id": "f7a8b4d1-c6e3-4529-8f21-59a83c5b2e11",
      "url": "https://example.com/login",
      "is_phishing": false,
      "confidence": 0.98,
      "scan_timestamp": "2025-06-07T15:30:45Z"
    },
    {
      "scan_id": "b3c4d5e6-f7g8-9012-hij3-456789klmn01",
      "url": "https://suspicious-site.example/login",
      "is_phishing": true,
      "confidence": 0.95,
      "scan_timestamp": "2025-06-07T14:22:33Z"
    }
  ],
  "total_count": 2,
  "page": 1,
  "per_page": 10
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "bad_request",
  "message": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "error": "unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "not_found",
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded. Try again in 60 seconds",
  "retry_after": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "internal_server_error",
  "message": "An unexpected error occurred"
}
```
