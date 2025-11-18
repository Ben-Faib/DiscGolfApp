# Disc Golf App - API Endpoints Documentation

This document outlines all potential API endpoints needed for the Disc Golf App based on the UI implementation.

## Base URL
```
https://api.discgolfapp.com/v1
```

## Authentication

### POST /auth/login
Login a user and return authentication token.
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:** User object with auth token

### POST /auth/logout
Logout current user.
- **Headers:** Authorization token required

### GET /auth/me
Get current authenticated user information.
- **Headers:** Authorization token required
- **Response:** User object

---

## Users

### GET /users
Get all users (Admin only).
- **Headers:** Authorization token required
- **Query Params:**
  - `role` (optional): Filter by role
  - `page`, `limit`: Pagination
- **Response:** Array of User objects

### GET /users/:id
Get a specific user by ID.
- **Headers:** Authorization token required
- **Response:** User object

### PUT /users/:id/role
Update a user's role (Admin only).
- **Headers:** Authorization token required
- **Request Body:**
  ```json
  {
    "role": "player" | "organizer" | "head_organizer" | "admin"
  }
  ```
- **Response:** Updated User object

---

## Events

### GET /events
Get all approved events.
- **Query Params:**
  - `status`: Filter by status (upcoming, ongoing, completed)
  - `participant_id`: Filter events by participant
  - `organizer_id`: Filter events by organizer
  - `page`, `limit`: Pagination
- **Response:** Array of Event objects

### GET /events/:id
Get a specific event by ID.
- **Response:** Event object with full details

### POST /events
Create a new event request.
- **Headers:** Authorization token required
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "location": "string",
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "numberOfHoles": number,
    "imageUrl": "string (optional)"
  }
  ```
- **Response:** Created Event object with "pending" status

### PUT /events/:id
Update an event (Head Organizer/Admin only).
- **Headers:** Authorization token required
- **Request Body:** Partial Event object
- **Response:** Updated Event object

### POST /events/:id/signup
Sign up for an event.
- **Headers:** Authorization token required
- **Request Body:**
  ```json
  {
    "groupId": "string (optional)"
  }
  ```
- **Response:** Updated Event object

### DELETE /events/:id/signup
Remove signup from an event.
- **Headers:** Authorization token required
- **Response:** Success message

### PUT /events/:id/approve
Approve an event request (Admin only).
- **Headers:** Authorization token required
- **Response:** Updated Event object

### PUT /events/:id/reject
Reject an event request (Admin only).
- **Headers:** Authorization token required
- **Response:** Updated Event object

---

## Groups

### GET /groups
Get all groups.
- **Query Params:**
  - `member_id`: Filter by member
  - `owner_id`: Filter by owner
  - `event_id`: Filter by event
  - `page`, `limit`: Pagination
- **Response:** Array of Group objects

### GET /groups/:id
Get a specific group by ID.
- **Response:** Group object with member details

### POST /groups
Create a new group.
- **Headers:** Authorization token required
- **Request Body:**
  ```json
  {
    "name": "string"
  }
  ```
- **Response:** Created Group object

### PUT /groups/:id
Update a group (Owner only).
- **Headers:** Authorization token required
- **Request Body:**
  ```json
  {
    "name": "string (optional)"
  }
  ```
- **Response:** Updated Group object

### POST /groups/:id/join
Request to join a group.
- **Headers:** Authorization token required
- **Response:** JoinRequest object

### DELETE /groups/:id/leave
Leave a group.
- **Headers:** Authorization token required
- **Response:** Success message

### DELETE /groups/:id/members/:memberId
Remove a member from group (Owner only).
- **Headers:** Authorization token required
- **Response:** Success message

### GET /groups/:id/join-requests
Get pending join requests for a group (Owner only).
- **Headers:** Authorization token required
- **Response:** Array of JoinRequest objects

### PUT /groups/:id/join-requests/:requestId
Accept or reject a join request (Owner only).
- **Headers:** Authorization token required
- **Request Body:**
  ```json
  {
    "status": "accepted" | "rejected"
  }
  ```
- **Response:** Updated JoinRequest object

### POST /groups/:id/rename-request
Request to rename a group (Organizer only).
- **Headers:** Authorization token required
- **Request Body:**
  ```json
  {
    "newName": "string"
  }
  ```
- **Response:** RenameRequest object

---

## Scorecards

### GET /scorecards
Get scorecards.
- **Headers:** Authorization token required
- **Query Params:**
  - `user_id`: Filter by user
  - `event_id`: Filter by event
  - `group_id`: Filter by group
  - `status`: Filter by status (draft, submitted, approved, rejected)
  - `page`, `limit`: Pagination
- **Response:** Array of Scorecard objects

### GET /scorecards/:id
Get a specific scorecard by ID.
- **Headers:** Authorization token required
- **Response:** Scorecard object

### POST /scorecards
Create a new scorecard.
- **Headers:** Authorization token required
- **Request Body:**
  ```json
  {
    "eventId": "string",
    "groupId": "string",
    "numberOfHoles": number
  }
  ```
- **Response:** Created Scorecard object with empty scores

### PUT /scorecards/:id
Update a scorecard (Owner only if draft/rejected).
- **Headers:** Authorization token required
- **Request Body:**
  ```json
  {
    "scores": [number],
    "totalScore": number,
    "status": "draft" | "submitted"
  }
  ```
- **Response:** Updated Scorecard object

### DELETE /scorecards/:id
Delete a scorecard (Owner only if draft).
- **Headers:** Authorization token required
- **Response:** Success message

### PUT /scorecards/:id/review
Review a scorecard (Organizer only).
- **Headers:** Authorization token required
- **Request Body:**
  ```json
  {
    "status": "approved" | "rejected",
    "notes": "string (required if rejected)"
  }
  ```
- **Response:** Updated Scorecard object

### GET /scorecards/pending
Get all pending scorecards for review (Organizer only).
- **Headers:** Authorization token required
- **Response:** Array of Scorecard objects

---

## Statistics

### GET /stats/users/:id
Get statistics for a specific user.
- **Headers:** Authorization token required
- **Query Params:**
  - `event_id` (optional): Get stats for specific event
- **Response:** PlayerStats object

### GET /stats/groups/:id
Get statistics for a specific group.
- **Headers:** Authorization token required
- **Query Params:**
  - `event_id` (optional): Get stats for specific event
- **Response:** GroupStats object

---

## Notifications

### GET /notifications
Get notifications for current user.
- **Headers:** Authorization token required
- **Query Params:**
  - `read`: Filter by read status (true/false)
  - `type`: Filter by notification type
  - `page`, `limit`: Pagination
- **Response:** Array of Notification objects

### PUT /notifications/:id/read
Mark a notification as read.
- **Headers:** Authorization token required
- **Response:** Updated Notification object

### PUT /notifications/read-all
Mark all notifications as read.
- **Headers:** Authorization token required
- **Response:** Success message

---

## Rename Requests

### GET /rename-requests
Get all rename requests (Head Organizer/Admin only).
- **Headers:** Authorization token required
- **Query Params:**
  - `status`: Filter by status (pending, approved, rejected)
- **Response:** Array of RenameRequest objects

### PUT /rename-requests/:id
Approve or reject a rename request (Head Organizer only).
- **Headers:** Authorization token required
- **Request Body:**
  ```json
  {
    "status": "approved" | "rejected"
  }
  ```
- **Response:** Updated RenameRequest object

---

## Data Models

### User
```typescript
{
  id: string;
  email: string;
  name: string;
  role: 'player' | 'organizer' | 'head_organizer' | 'admin';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Event
```typescript
{
  id: string;
  name: string;
  description: string;
  location: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  numberOfHoles: number;
  imageUrl?: string;
  organizers: string[]; // User IDs
  headOrganizers: string[]; // User IDs
  participants: string[]; // User IDs
  status: 'upcoming' | 'ongoing' | 'completed';
  createdBy: string; // User ID
  requestStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}
```

### Group
```typescript
{
  id: string;
  name: string;
  ownerId: string; // User ID
  members: string[]; // User IDs
  eventId?: string; // Optional, groups exist outside events
  createdAt: string;
  updatedAt: string;
}
```

### Scorecard
```typescript
{
  id: string;
  userId: string;
  eventId: string;
  groupId: string;
  scores: number[]; // Scores for each hole
  totalScore: number;
  submittedAt?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  reviewedBy?: string; // Organizer ID
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Notification
```typescript
{
  id: string;
  userId: string;
  type: 'invite' | 'join_request' | 'scorecard_review' | 'event_update' | 'group_update';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionData?: any;
}
```

### PlayerStats
```typescript
{
  userId: string;
  eventId?: string; // If undefined, it's aggregated stats
  averageScore: number;
  bestScore: number;
  worstScore: number;
  totalEvents: number;
  totalRounds: number;
  holesPlayed: number;
  averagePerHole: number;
}
```

### GroupStats
```typescript
{
  groupId: string;
  eventId?: string;
  averageScore: number;
  totalRounds: number;
  bestRound: number;
  members: string[]; // User IDs
}
```

---

## Error Responses

All endpoints should return consistent error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional details
  }
}
```

### Common Error Codes:
- `UNAUTHORIZED`: Missing or invalid authentication token
- `FORBIDDEN`: User doesn't have permission for this action
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Request validation failed
- `CONFLICT`: Action conflicts with current state
- `SERVER_ERROR`: Internal server error

### HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error

---

## Authentication & Authorization

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

### Role-Based Access Control

#### Player
- Can access own data
- Can join events and groups
- Can create and submit scorecards
- Can view stats

#### Organizer
- All Player permissions
- Can review scorecards for assigned events
- Can edit groups for assigned events
- Can request group renames

#### Head Organizer
- All Organizer permissions
- Can approve/reject group rename requests
- Can edit event details
- Can send notifications
- Can end events

#### Admin
- All Head Organizer permissions
- Can approve/reject event requests
- Can manage user roles
- Can access all data

---

## Pagination

List endpoints support pagination with query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Notes for Backend Team

1. **WebSocket Support**: Consider implementing WebSockets for real-time notifications
2. **Image Upload**: Need endpoint for uploading event images (possibly using S3 presigned URLs)
3. **Rate Limiting**: Implement rate limiting on all endpoints
4. **Caching**: Consider caching for stats and frequently accessed data
5. **Search**: May want to add search endpoints for events and users
6. **Batch Operations**: Consider batch endpoints for updating multiple scorecards
7. **Analytics**: May want additional endpoints for analytics and reporting
8. **Email Notifications**: Backend should send email notifications for important events

