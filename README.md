Blog Platform
A modern, interactive blogging platform built with Django and Next.js, where users can create, and engage with posts in a vibrant community.

🚀 Overview
Blog Platform is a dynamic web application designed to empower users to express themselves through blog posts, engage with others’ content, and build a personalized online presence. Powered by Django for a robust backend and Next.js with TypeScript for a fast, type-safe frontend, this platform offers a seamless user experience with secure JWT-based authentication.

Note: This project is under active development and not yet fully complete. Contributions and feedback are welcome!


✨ Key Features

User Authentication: Secure login and registration using JSON Web Tokens (JWT) to protect user interactions.
Post Creation & Interaction: Authenticated users can create posts, comment on others’ posts, and express emotions (e.g., like, love, or custom reactions).
Social Engagement: View and collect posts from other users to curate personal collections.
Profile Customization: Edit usernames, update profile images, and personalize your profile.
Responsive Design: Built with Next.js for a fast, mobile-friendly interface.
Work in Progress: Exciting features like advanced post filtering, real-time notifications, and more are in development!


🛠️ Tech Stack



Component
Technology



Backend
Django (Python), Django REST Framework


Frontend
Next.js (React), TypeScript


Authentication
JSON Web Tokens (JWT)


Database
PostgreSQL (SQLite for development)


Styling
Tailwind CSS


Version Control
Git, GitHub



📸 Screenshots


# Home Page
<img width="884" alt="Screenshot 2025-04-19 224308" src="https://github.com/user-attachments/assets/e8d803d2-fe46-4900-82de-27bb7eafd1d5" />











# Create New Post
<img width="929" alt="image" src="https://github.com/user-attachments/assets/7a714084-7900-47aa-b78c-1bce78a8300a" />


















# User Profile
<img width="928" alt="image" src="https://github.com/user-attachments/assets/97b85af1-42e9-4f09-af26-f66dff6b6606" />









# 🏁 Getting Started
Follow these steps to set up and run the project locally.
Prerequisites

Python 3.8+
Node.js 16+
PostgreSQL (or SQLite for development)
Git

Installation

Clone the Repository
git clone https://github.com/Sudhir4500/blog-platform.git
cd blog-platform


Backend Setup (Django)
# Navigate to backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the Django server
python manage.py runserver


Frontend Setup (Next.js)
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev


Environment Variables

Create a .env file in the backend directory:SECRET_KEY=your-django-secret-key
DATABASE_URL=postgres://user:password@localhost:5432/blog_platform
JWT_SECRET=your-jwt-secret


Create a .env.local file in the frontend directory:NEXT_PUBLIC_API_URL=http://localhost:8000/api




Access the Platform

Backend API: http://localhost:8000/api
Frontend: http://localhost:3000




📚 API Endpoints
Here are some key API endpoints (base URL: http://localhost:8000/api):



Method
Endpoint
Description



POST
/auth/register
Register a new user


POST
/auth/login
Login and receive JWT token


GET
/posts
Retrieve all posts


POST
/posts
Create a new post (authenticated)


POST
/posts/:id/comments
Add a comment to a post


PATCH
/users/profile
Update username or profile image



Full API documentation will be added soon!




Fork the repository.
Create a new branch (git checkout -b feature/your-feature).
Commit your changes (git commit -m 'Add your feature').
Push to the branch (git push origin feature/your-feature).
Open a Pull Request.

Please read our Contributing Guidelines for more details.

📝 To-Do

 Implement real-time notifications for comments and reactions
 Add post filtering by tags or categories
 Enhance emotion reactions with custom emojis
 Improve SEO with Next.js metadata
 Add unit and integration tests


🌟 Why This Project?
This platform combines the simplicity of blogging with the interactivity of social media. By leveraging Django’s robust backend and Next.js’s performant frontend, it offers a scalable foundation for a modern blogging experience. Whether you’re a developer looking to contribute or a user eager to share your stories, this platform is for you!

📬 Contact

Author: Sudhir Sharma
GitHub: Sudhir4500


⚖️ License
This project is licensed under the MIT License. See the LICENSE file for details.
