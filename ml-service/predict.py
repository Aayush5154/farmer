# predict.py
import joblib
import os
import numpy as np

MODEL_PATH = "models/amount_model.pkl"
MAX_PAYOUT = 500000

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
        return None  # 🔒 graceful fallback (DO NOT crash service)

    features = np.array([[
        payload["soilMoisture"],
        payload["airTemp"],
        payload["humidity"],
        payload["soilTemp"],
        payload["expectedAmount"]
    ]])

    prediction = model.predict(features)[0]

    # ✅ SAFETY RULES
    prediction = float(prediction)
    prediction = max(0, prediction)                # no negative payout
    prediction = min(prediction, MAX_PAYOUT)       # cap at 5 lakh

    return round(prediction)
