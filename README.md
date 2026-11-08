# Connectify – Social Media Web Application

Connectify is a full-stack social media web application developed as part of the CodeAlpha Full Stack Development Internship.

The platform allows users to create accounts, manage profiles, publish posts with images, interact with other users, like posts, and share comments.

## Features

### Authentication
- User registration
- User login
- Password hashing
- JWT-based authentication
- Protected API routes

### User Profiles
- View user profiles
- Update profile information
- Upload profile avatars
- Search for users
- Follow and unfollow users
- Display follower and following counts

### Posts
- Create text and image posts
- Upload post images
- View the latest posts in the feed
- View individual user posts
- Edit own posts
- Delete own posts
- Like and unlike posts

### Comments
- Add comments to posts
- View post comments
- Delete comments

### Security
- Password hashing with bcryptjs
- JWT authentication
- Helmet security headers
- Rate limiting
- Protected routes
- File upload validation

## Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla JS)

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcryptjs
- Multer

### Security and Tools
- Helmet
- express-rate-limit
- Postman
- MongoDB Atlas
- Visual Studio Code
- Git and GitHub

## Project Structure

```text
Connectify/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── index.html
    ├── login.html
    ├── register.html
    ├── profile.html
    ├── add-post.html
    ├── css/
    │   └── style.css
    └── js/
        ├── config.js
        ├── auth.js
        ├── app.js
        ├── profile.js
        └── add-post.js
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/Connectify.git
```

### 2. Open the Project

```bash
cd Connectify
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Use the actual environment variable names defined in your backend.

### 5. Start the Backend

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

### 6. Run the Frontend

Open `frontend/index.html` in your browser or use the VS Code Live Server extension.

## Database

Connectify uses MongoDB Atlas to store user accounts, posts, comments, and related application data.

## Image Uploads

Multer handles profile avatar and post image uploads. Uploaded files are stored in the backend uploads directory.

## Security

- Passwords are hashed using bcryptjs.
- JWT is used for authentication.
- Protected routes restrict unauthorized access.
- Helmet provides HTTP security headers.
- Rate limiting helps protect API endpoints.
- Environment variables are excluded from version control.

## Future Improvements

- Real-time messaging
- Notifications
- Direct messaging
- Post sharing and bookmarking
- Real-time updates
- Advanced user search

## Author

**Huzaifa Khan**

GitHub: https://github.com/YOUR-USERNAME

## License

This project is developed for educational and internship purposes.
