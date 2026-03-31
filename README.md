🚀 AccessHub
🔐 Overview

AccessHub is a JWT-based authentication and role-based authorization system built with Spring Boot.

It demonstrates secure user authentication, session handling, and controlled access to protected routes based on roles.

This project is designed to simulate real-world backend authentication systems used in production applications.

✨ Features

🔑 User Registration & Login

🔐 JWT Authentication (Stateless)


👥 Role-Based Access Control (RBAC)

USER

MODERATOR

ADMIN


🧾 Session State Display (Token-based)

🔍 Protected API Endpoints

🚪 Secure Logout Handling (Client-side token removal)

🛠️ Tech Stack

Backend: Spring Boot

Security: Spring Security + JWT

Database: MySQL

ORM: Hibernate / JPA

Build Tool: Maven

Frontend: HTML, CSS, JavaScript (for testing APIs)


📁 Project Structure

├── entity/

├── dto/

├── service/

├── service/impl/

├── controller/

└── security/



🔄 Authentication Flow

User registers with username, email, password, and roles

Password is encrypted using BCrypt

User logs in → receives JWT token

Token is sent in headers for every protected request

Spring Security validates token and grants access based on roles


🔐 API Endpoints

🔓 Public Routes

POST /api/auth/register

POST /api/auth/login

🔒 Protected Routes

GET /api/test/user → USER access

GET /api/test/mod → MODERATOR access

GET /api/test/admin → ADMIN access
