# ClipTube Backend

A YouTube-like video sharing platform backend built with Node.js, Express, and MongoDB.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT, bcrypt
- **File Upload:** Multer, Cloudinary
- **Others:** CORS, Cookie-parser

## Installation

```bash
# Install dependencies
npm install

# Create .env file with:
PORT=8000
MONGODB_URI=your_mongodb_uri
CORS_ORIGIN=http://localhost:5173
# Add Cloudinary and JWT secrets

# Run development server
npm run dev
```

## API Endpoints

| Route | Description |
|-------|-------------|
| `/api/v1/users` | User registration, login, profile |
| `/api/v1/videos` | Video CRUD operations |
| `/api/v1/comments` | Video comments |
| `/api/v1/likes` | Like videos/comments/tweets |
| `/api/v1/playlist` | Playlist management |
| `/api/v1/subscriptions` | Channel subscriptions |
| `/api/v1/tweets` | User tweets/posts |
| `/api/v1/dashboard` | Channel dashboard stats |

## Project Structure

```
src/
├── controllers/    # Route handlers
├── models/         # Mongoose schemas
├── routes/         # API routes
├── middlewares/    # Auth & file upload
├── utils/          # Helper functions
└── db/             # Database connection
```

## License

ISC 