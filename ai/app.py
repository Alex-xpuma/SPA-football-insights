from fastapi import FastAPI
from pydantic import BaseModel
import xgboost as xgb
import numpy as np
import os

MODEL_PATH = "/app/models/xgb_model.json"

#print("Base dir:", BASE_DIR)
#print("Models folder:", os.listdir(os.path.join(BASE_DIR, "models")))

# features in the same order as feature_cols in training
FEATURE_ORDER = ['elo_home', 'elo_away', 'elo_diff',
                 'home_recent_goals_avg', 'home_recent_conceded_avg',
                 'away_recent_goals_avg', 'away_recent_conceded_avg']

app = FastAPI()

# Load the XGBoost model from JSON
model = xgb.XGBClassifier()
model.load_model(MODEL_PATH) 

class PredictRequest(BaseModel):
    elo_home: float
    elo_away: float
    home_recent_goals_avg: float = 0.0
    home_recent_conceded_avg: float = 0.0
    away_recent_goals_avg: float = 0.0
    away_recent_conceded_avg: float = 0.0

@app.get("/")
def root():
    return {"message": "AI service running"}

@app.post("/predict")
def predict(req: PredictRequest):
    x = np.array([
        req.elo_home,
        req.elo_away,
        req.elo_home - req.elo_away,
        req.home_recent_goals_avg,
        req.home_recent_conceded_avg,
        req.away_recent_goals_avg,
        req.away_recent_conceded_avg
    ]).reshape(1, -1)

    pred = int(model.predict(x)[0])
    proba = model.predict_proba(x)[0].tolist()

    return {"prediction": pred, "probabilities": proba}
