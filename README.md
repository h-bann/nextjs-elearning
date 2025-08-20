# E-Learning Platform

A full-stack e-learning platform built with Next.js, featuring course management, user authentication, progress tracking, and payment integration.

## Features

- **User Authentication**: Secure signup/signin with email verification
- **Course Management**: Create, edit, and publish courses with modules and lessons
- **Content Types**: Support for text, images, and videos in lessons
- **Progress Tracking**: Track student progress through courses
- **Role-Based Access**: Student and instructor roles with different permissions
- **Responsive Design**: Mobile-friendly interface
- **File Storage**: Integration with Digital Ocean Spaces for media storage

<div>
    <a href="https://www.loom.com/share/6073b5c980394f618dd0d912029fdf48">
      <p>User Sign Up - Watch Video</p>
    </a>
    <a href="https://www.loom.com/share/6073b5c980394f618dd0d912029fdf48">
      <img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/6073b5c980394f618dd0d912029fdf48-86650fe06e2ff2e5-full-play.gif">
    </a>
  </div>

<div>
    <a href="https://www.loom.com/share/380781a9e9b3406394dbe5b6a3d2d196">
      <p>Course Creation and Edit - Watch Video</p>
    </a>
    <a href="https://www.loom.com/share/380781a9e9b3406394dbe5b6a3d2d196">
      <img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/380781a9e9b3406394dbe5b6a3d2d196-68985fb38f540618-full-play.gif">
    </a>
  </div>

<div>
    <a href="https://www.loom.com/share/5f5dd99404a14492ba0c0558454edb49">
      <p>Course purchase and enrollment</p>
    </a>
    <a href="https://www.loom.com/share/5f5dd99404a14492ba0c0558454edb49">
      <img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/5f5dd99404a14492ba0c0558454edb49-3d90d99b2db6b08b-full-play.gif">
    </a>
  </div>

<div>
    <a href="https://www.loom.com/share/acc0e5d2cb8f4f5f8a6491515ed563f8">
      <p>User dashboard</p>
    </a>
    <a href="https://www.loom.com/share/acc0e5d2cb8f4f5f8a6491515ed563f8">
      <img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/acc0e5d2cb8f4f5f8a6491515ed563f8-9a2cd72313b592cd-full-play.gif">
    </a>
  </div>
## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL
- **Authentication**: JWT with httpOnly cookies
- **File Storage**: Digital Ocean Spaces (S3-compatible)
- **Email**: Nodemailer with SMTP

## Prerequisites

Before running this project, you will need:

- Node.js (version 18 or higher)
- MySQL database
- Digital Ocean Spaces account (or AWS S3)
- SMTP email service

## Installation

1. **Clone the repository**
   git clone <your-repo-url>
   cd nexjs-elearning

3. **Install dependencies**
   npm install

4. **Set up environment variables**
   Create .env.local file using .env.example as a guide.

5. **Set up the database**

   Create a MySQL database and run the following SQL schema:

   -- Users table
   CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     user_id VARCHAR(255) UNIQUE NOT NULL,
     role ENUM('user', 'instructor') DEFAULT 'user',
     username VARCHAR(255) NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     verified BOOLEAN DEFAULT FALSE,
     verification_token VARCHAR(255),
     verification_expiry DATETIME,
     entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Courses table
   CREATE TABLE courses (
     id INT AUTO_INCREMENT PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     description TEXT,
     price DECIMAL(10,2) NOT NULL,
     image_url VARCHAR(500),
     instructor_id INT NOT NULL,
     published VARCHAR(50),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (instructor_id) REFERENCES users(id)
   );

   -- Modules table
   CREATE TABLE modules (
     id INT AUTO_INCREMENT PRIMARY KEY,
     course_id INT NOT NULL,
     title VARCHAR(255) NOT NULL,
     order_index INT NOT NULL,
     FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
   );

   -- Lessons table
   CREATE TABLE lessons (
     id INT AUTO_INCREMENT PRIMARY KEY,
     module_id INT NOT NULL,
     title VARCHAR(255) NOT NULL,
     order_index INT NOT NULL,
     FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
   );

   -- Lesson content table
   CREATE TABLE lesson_content (
     id INT AUTO_INCREMENT PRIMARY KEY,
     lesson_id INT NOT NULL,
     content_type ENUM('TEXT', 'IMAGE', 'VIDEO') NOT NULL,
     value TEXT NOT NULL,
     FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
   );

   -- Enrollments table
   CREATE TABLE enrollments (
     id VARCHAR(255) PRIMARY KEY,
     user_id INT NOT NULL,
     course_id INT NOT NULL,
     price DECIMAL(10,2),
     transaction_id VARCHAR(255),
     status ENUM('ACTIVE', 'PAYMENT_PENDING', 'COMPLETED', 'FAILED') DEFAULT 'ACTIVE',
     progress INT DEFAULT 0,
     enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (user_id) REFERENCES users(id),
     FOREIGN KEY (course_id) REFERENCES courses(id)
   );

   -- Progress tracking table
   CREATE TABLE progress (
     id INT AUTO_INCREMENT PRIMARY KEY,
     user_id INT NOT NULL,
     course_id INT NOT NULL,
     module_id INT NOT NULL,
     lesson_id INT NOT NULL,
     completed BOOLEAN DEFAULT FALSE,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (user_id) REFERENCES users(id),
     FOREIGN KEY (course_id) REFERENCES courses(id),
     FOREIGN KEY (module_id) REFERENCES modules(id),
     FOREIGN KEY (lesson_id) REFERENCES lessons(id)
   );

6. **Run the development server**
   npm run dev

   The application will be available at [http://localhost:3000](http://localhost:3000)

## Usage

### Getting Started

1. **Create an account**: Visit `/auth/signup` to create a new account
2. **Verify your email**: Check your email for verification link
3. **Sign in**: Use your credentials to sign in at `/auth/signin`

### For Students

- Browse available courses at `/courses`
- Purchase and enroll in courses
- Track your learning progress
- Access course content and lessons

### For Instructors

- Create new courses from your dashboard
- Add modules and lessons to your courses
- Upload images and videos for lesson content
- Publish courses when ready
- Track student enrollment and progress

### Key Features Implementation

- **Authentication**: JWT tokens stored in httpOnly cookies
- **File Upload**: Integration with Digital Ocean Spaces
- **Email Verification**: SMTP-based email sending
- **Progress Tracking**: Granular lesson completion tracking
- **Course Management**: Drag-and-drop reordering, rich content support




