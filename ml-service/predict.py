# predict.py
import joblib
import os

MODEL_PATH = "models/amount_model.pkl"

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError("Model not found. Train first.")

model = joblib.load(MODEL_PATH)

def predict_amount(payload: dict):
    features = [[
        payload["soilMoisture"],
        payload["airTemp"],
        payload["humidity"],
        payload["soilTemp"],
        payload["expectedAmount"]
    ]]

    prediction = model.predict(features)[0]
    return round(float(prediction))
