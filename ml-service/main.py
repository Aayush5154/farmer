# main.py
from fastapi import FastAPI
from pydantic import BaseModel
from predict import predict_amount

app = FastAPI()

class ClaimInput(BaseModel):
    cropType: str
    soilMoisture: float
    airTemp: float
    humidity: float
    soilTemp: float
    expectedAmount: float

@app.post("/predict")
def predict_claim(data: ClaimInput):
    amount = predict_amount(data.dict())
    return { "approvedAmount": amount }

@app.post("/train")
def train_model():
    import train
    return { "message": "Model retrained successfully" }
