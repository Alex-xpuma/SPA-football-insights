# Football Match Management System

Full-stack application for managing football matches, with a REST API, a Redis caching layer and a machine-learning prediction service.

## Tech Stack

Frontend: React, Axios

Backend: Node.js, Express, PostgreSQL, Redis (caching), Swagger (API docs)

AI service: Python, FastAPI, XGBoost, scikit-learn, pandas

Infrastructure: Docker, Docker Compose


## Architecture

| Service | Description |
| --- | --- |
| `client/` | React frontend |
| `server/` | Node.js REST API |
| `db` | PostgreSQL (Docker service) |
| `ai/` | FastAPI microservice that serves the prediction model |
| `redis` | Cache for frequently requested data |

The React client talks to the Node.js API, which calls the AI service over the internal Docker network.

## Screenshots

<img width="982" height="738" alt="Снимок экрана 2025-12-01 033310" src="https://github.com/user-attachments/assets/42f6c774-07ed-4337-ad44-5aaf7327b761" />

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


## AI Prediction Service

The `ai/` service predicts the outcome of a match (home win, draw, away win) with an XGBoost classifier.

### Data

Trained on 25,979 matches from the European Soccer Database (SQLite, seasons 2008–2016) https://www.kaggle.com/datasets/hugomathien/soccer. The dataset is not included in this repository.

### Features (7)

All features are computed only from matches played before the match being predicted, so there is no data leakage.

- `elo_home`, `elo_away`, `elo_diff`: Elo ratings (initial rating 1500, K = 20), updated after every match
- `home_recent_goals_avg`, `home_recent_conceded_avg`: average goals scored and conceded by the home team in its last 5 matches
- `away_recent_goals_avg`, `away_recent_conceded_avg`: the same for the away team

Teams with no history yet get 0 for the averages.

### Model

XGBoost multi-class classifier (`multi:softprob`, 3 classes: 0 = home win, 1 = draw, 2 = away win), 300 trees per class, learning rate 0.05, max depth 6.

### Evaluation

Time-based split: trained on matches before 2016-01-01 (24,349), tested on later matches (1,630).

| Metric | Value |
| --- | --- |
| Accuracy | 50.7% |
| Baseline (always predict a home win) | 44.2% |
| Recall: home win / draw / away win | 83% / 3% / 44% |

### Limitations

- The model almost never predicts a draw (recall 3%), which is typical for models based on goal averages and Elo.
- It only knows the teams and seasons in the training data (2008–2016); Elo ratings are not updated with current results.
- Predictions are meant as a demonstration of the ML pipeline, not as betting advice.

### API

```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"elo_home": 1620, "elo_away": 1540,
       "home_recent_goals_avg": 1.8, "home_recent_conceded_avg": 0.8,
       "away_recent_goals_avg": 1.2, "away_recent_conceded_avg": 1.4}'
```

Example response (probabilities are ordered home win, draw, away win):

```json
{ "prediction": 0, "probabilities": [0.52, 0.27, 0.21] }
```



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
- Training and serving an ML model (XGBoost) as a separate FastAPI microservice

