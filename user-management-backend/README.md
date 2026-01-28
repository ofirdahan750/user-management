# User Management Backend API

Simple Node.js + Express backend API for user management application.

## Features

- User Registration
- User Login with JWT tokens
- Email Verification (mock)
- Password Reset (mock)
- Profile Management
- Token Refresh

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
```

## Running Locally

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/request-password-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/refresh-token` - Refresh access token

### User
- `GET /api/user/account-info` - Get account info (requires auth)
- `GET /api/user/profile` - Get user profile (requires auth)
- `PUT /api/user/profile` - Update user profile (requires auth)

## Email Verification (Mock)

Since there's no real email service, verification tokens are printed to the console:

1. Register a new user
2. Check the backend console for the verification token
3. Use the token in the URL: `/verify?token=TOKEN&email=EMAIL`
4. Or use the "Resend verification" button on the verify page

## Deploying to Koyeb

1. **Create account** at https://app.koyeb.com/

2. **Create new app**:
   - Click "Create App"
   - Connect your Git repository (or use Koyeb CLI)
   - Or use "Docker" option

3. **Environment Variables**:
   - Set `PORT` (Koyeb will set this automatically)
   - Set `JWT_SECRET` to a secure random string
   - Set `JWT_REFRESH_SECRET` to a secure random string

4. **Build Settings**:
   - Build Command: `npm install`
   - Run Command: `npm start`

5. **Deploy**:
   - Koyeb will automatically deploy on push to main branch

## Important Notes

- **In-memory storage**: Data is stored in memory and will be lost on restart
- **Mock email**: Verification and reset tokens are logged to console
- **Production**: For production, use a real database (MongoDB, PostgreSQL, etc.)
- **Security**: Change JWT secrets in production!

## Example Requests

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "profile": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "test@example.com",
    "password": "Test1234"
  }'
```

### Get Profile (with token)
```bash
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Token Usage

After login, use the token in Authorization header:
```
Authorization: Bearer <token>
```
