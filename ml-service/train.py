# train.py
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

os.makedirs("models", exist_ok=True)

# Example training data
data = pd.read_csv("data/claims.csv")

X = data[[
    "soilMoisture",
    "airTemp",
    "humidity",
    "soilTemp",
    "expectedAmount"
]]

y = data["approvedAmount"]

model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

model.fit(X, y)

joblib.dump(model, "models/amount_model.pkl")

print("✅ Model trained and saved")
