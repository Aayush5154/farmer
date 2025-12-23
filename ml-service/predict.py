# predict.py
import joblib
import os
import numpy as np

MODEL_PATH = "models/amount_model.pkl"

_model = None  # lazy-loaded model


def get_model():
    global _model
    if _model is not None:
        return _model

    if not os.path.exists(MODEL_PATH):
        return None  # model not trained yet

    _model = joblib.load(MODEL_PATH)
    return _model


def predict_amount(payload: dict):
    model = get_model()

    if model is None:
        raise ValueError("Model not trained yet")

    features = np.array([[
        payload["soilMoisture"],
        payload["airTemp"],
        payload["humidity"],
        payload["soilTemp"],
        payload["expectedAmount"]
    ]])

    prediction = model.predict(features)[0]
    return round(float(prediction))
    