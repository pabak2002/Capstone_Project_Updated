import json
import io
import base64
import asyncio
import pandas as pd
import random

from fastapi import FastAPI, WebSocket
import cv2
import numpy as np
from fer import FER

app = FastAPI()
detector = FER()

# Load the emotion-to-food mapping dataset
file_path = r"C:\\Users\\pabak\\Downloads\\Emotion_Food_Mapping.csv"
df_mapping = pd.read_csv(file_path)

def get_food_recommendations(emotion: str):
    """Get 10 random food recommendations based on detected emotion."""
    dishes = df_mapping[df_mapping["MOOD"] == emotion]["DISH CHOSEN"].values
    if len(dishes) == 0:
        return ["No recommendations available for this emotion."]
    
    dish_list = list(set(", ".join(dishes).split(", ")))
    return random.sample(dish_list, min(10, len(dish_list)))  # Return 10 random recommendations

@app.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            payload = await websocket.receive_text()
            payload = json.loads(payload)
            imageByt64 = payload['data']['image'].split(',')[1]
            
            # Decode and convert into image
            image = np.frombuffer(base64.b64decode(imageByt64), np.uint8)
            image = cv2.imdecode(image, cv2.IMREAD_COLOR)
            
            # Detect Emotion via TensorFlow model
            prediction = detector.detect_emotions(image)
            if not prediction:
                print("No face detected")  # Print to terminal
                await websocket.send_json({"error": "No face detected"})
                continue
            
            detected_emotion = max(prediction[0]['emotions'], key=prediction[0]['emotions'].get)
            detected_value = prediction[0]['emotions'][detected_emotion]
            print(f"Detected Emotion: {detected_emotion} ({detected_value})")  # Print emotion and value
            
            # Get food recommendations
            recommendations = get_food_recommendations(detected_emotion)
            print(f"Recommended Foods: {recommendations}")  # Print food recommendations in terminal
            
            response = {
                "predictions": prediction[0]['emotions'],
                "emotion": detected_emotion,
                "recommendations": recommendations
            }
            await websocket.send_json(response)
            
            # Wait for 10 seconds before detecting again
            await asyncio.sleep(10)
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await websocket.close()