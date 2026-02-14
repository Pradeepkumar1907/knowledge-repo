# Web Based Knowledge Repository System

## Project Objective
A simple web application that allows users to store, view, search, and manage knowledge content such as notes, articles, and tutorials using a web browser.

## Technology Stack
- **Frontend**: React.js
- **Backend**: Node.js + Express
- **Database**: MongoDB

## Setup Instructions

### Backend
1. Open a terminal in the `backend` folder.
2. Run `npm install` (if not already done).
3. Run `npm start`.
   - Server runs on `http://localhost:5000`.
   - Ensure MongoDB is running.

### Frontend
1. Open a terminal in the `frontend` folder.
2. Run `npm install` (if not already done).
3. Run `npm start`.
   - App runs on `http://localhost:3000`.

## User Roles
- **Admin**: Can Login, Add, Edit, Delete, View, Search knowledge.
- **User**: Can Register, Login, View, Search knowledge.

## APIs
- `POST /register`: Register new user.
- `POST /login`: Login user.
- `POST /knowledge/add`: Add knowledge.
- `GET /knowledge/all`: View all.
- `GET /knowledge/search?query=`: Search.
- `PUT /knowledge/update/:id`: Update.
- `DELETE /knowledge/delete/:id`: Delete.
