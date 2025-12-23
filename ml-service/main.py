from fastapi import FastAPI, HTTPException
from train import train_model
from predict import predict_amount

app = FastAPI()

# ====================
# HEALTH CHECK
# ====================
@app.get("/")
def health_check():
    return {"status": "ML service running"}

# ====================
# PREDICT ENDPOINT
# ====================
@app.post("/predict")
def predict_endpoint(payload: dict):
    try:
        predicted = predict_amount(payload)
        return {"predicted_amount": predicted}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ====================
# TRAIN ENDPOINT
# ====================
@app.post("/train")
def train_endpoint(payload: dict):
    claims = payload.get("claims", [])

    print("🔥 /train CALLED")
    print("CLAIMS RECEIVED:", len(claims))

    if len(claims) < 3:
        return {
            "status": "skipped",
            "reason": "not enough data",
            "records": len(claims)
        }

    trained_count = train_model(claims)

    return {
        "status": "trained",
        "records": trained_count
    }
