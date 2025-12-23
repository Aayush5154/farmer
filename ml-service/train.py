# train.py
import os
import joblib
import pandas as pd
from sklearn.linear_model import SGDRegressor

MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "amount_model.pkl")
BUFFER_PATH = os.path.join(MODEL_DIR, "train_buffer.csv")

FEATURES = [
    "soilMoisture",
    "airTemp",
    "humidity",
    "soilTemp",
    "expectedAmount"
]

os.makedirs(MODEL_DIR, exist_ok=True)

# 🔥 ALWAYS USE SGD (NO RANDOM FOREST)
model = SGDRegressor(
    max_iter=1000,
    learning_rate="adaptive",
    eta0=0.01,
    random_state=42
)

def train_model(claims: list):
    if not claims:
        return 0

    df = pd.DataFrame(claims)

    df = df[FEATURES + ["approvedAmount"]]

    if os.path.exists(BUFFER_PATH):
        old_df = pd.read_csv(BUFFER_PATH)
        df = pd.concat([old_df, df], ignore_index=True)

    df.to_csv(BUFFER_PATH, index=False)

    X = df[FEATURES]
    y = df["approvedAmount"]

    model.partial_fit(X, y)

    joblib.dump(model, MODEL_PATH)

    print("✅ MODEL TRAINED & SAVED:", MODEL_PATH)

    return len(df)
