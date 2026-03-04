# FIFA Match Management System

Full-stack application for managing FIFA matches with REST API, caching layer and AI prediction service.

## Tech Stack

Frontend:
- React
- Axios
- Docker

Backend:
- Node.js
- Express
- PostgreSQL
- Redis (caching layer)
- Swagger (API documentation)

Other:
- Docker & Docker Compose
- Separate AI microservice for match prediction

## Architecture

The project is divided into several services:

client/ – React frontend  
server/ – Node.js REST API  
bd/ – PostgreSQL configuration and scripts  
ai/ – AI microservice for match prediction  
Redis – caching frequently requested data  
docker-compose.yml – container orchestration  

Redis is used to cache frequently requested match data in order to improve performance and reduce database load.

## Features

### Match Management
- View all matches
- Filter matches by team
- Filter matches by country
- Add new matches
- Update matches
- Delete matches

### Team Management
- View all teams
- Add new teams

### AI Prediction
- Predict match results using a separate AI service

### API Documentation
Swagger available at:
`/api-docs


## Running the Project

### Option 1 – Docker (Recommended)
docker-compose up --build

### Option 2 – Manual Setup

Backend:
cd server
npm install
npm start

Frontend:
cd client
npm install
npm start

App runs on:
http://localhost:3000

## What I focused on

- Building a REST API with proper structure
- Implementing caching using Redis
- Separating services (AI microservice)
- Dockerizing full-stack application
- Clean project structure

