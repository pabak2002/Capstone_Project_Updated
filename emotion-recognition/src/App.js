import React, { useRef, useEffect, useState } from "react";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import { drawMesh } from "./utilities";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [emotion, setEmotion] = useState("Neutral");
  const [recommendations, setRecommendations] = useState([]);
  const blazeface = require('@tensorflow-models/blazeface');

  // Load face detector model
  const runFaceDetectorModel = async () => {
    const model = await blazeface.load();
    console.log("Face Detection Model Loaded..");
    setInterval(() => {
      detect(model);
    }, 100);
  };

  const detect = async (net) => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const face = await net.estimateFaces(video);
      var socket = new WebSocket('ws://localhost:8000');
      var imageSrc = webcamRef.current.getScreenshot();
      var apiCall = {
        event: "localhost:subscribe",
        data: { image: imageSrc },
      };

      socket.onopen = () => socket.send(JSON.stringify(apiCall));
      socket.onmessage = function (event) {
        var pred_log = JSON.parse(event.data);
        document.getElementById("Angry").value = Math.round(pred_log['predictions']['angry'] * 100);
        document.getElementById("Neutral").value = Math.round(pred_log['predictions']['neutral'] * 100);
        document.getElementById("Happy").value = Math.round(pred_log['predictions']['happy'] * 100);
        document.getElementById("Fear").value = Math.round(pred_log['predictions']['fear'] * 100);
        document.getElementById("Surprise").value = Math.round(pred_log['predictions']['surprise'] * 100);
        document.getElementById("Sad").value = Math.round(pred_log['predictions']['sad'] * 100);
        document.getElementById("Disgust").value = Math.round(pred_log['predictions']['disgust'] * 100);

        setEmotion(pred_log['emotion']);
        setRecommendations(pred_log['recommendations']);

        const ctx = canvasRef.current.getContext("2d");
        requestAnimationFrame(() => { drawMesh(face, pred_log, ctx); });
      };
    }
  };

  useEffect(() => { runFaceDetectorModel(); }, []);

  return (
    <div className="App">
      <div className="container">
        {/* Left Side: Webcam Section */}
        <div className="video-section">
          <div className="webcam-container">
            <Webcam
              ref={webcamRef}
              className="webcam"
            />
            <canvas ref={canvasRef} className="canvas" />
          </div>
        </div>

        {/* Right Side: Mood and Cuisine Section */}
        <div className="content-section">
          <h2 className="Prediction">Mood & Cuisine Suggestions</h2>

          {/* Emotion Progress Bars */}
          <div className="progress-container">
            <label htmlFor="Angry" style={{ color: 'red' }}>Angry</label>
            <progress id="Angry" value="0" max="100"></progress>

            <label htmlFor="Neutral" style={{ color: 'lightgreen' }}>Neutral</label>
            <progress id="Neutral" value="0" max="100"></progress>

            <label htmlFor="Happy" style={{ color: 'orange' }}>Happy</label>
            <progress id="Happy" value="0" max="100"></progress>

            <label htmlFor="Fear" style={{ color: 'lightblue' }}>Fear</label>
            <progress id="Fear" value="0" max="100"></progress>

            <label htmlFor="Surprise" style={{ color: 'yellow' }}>Surprised</label>
            <progress id="Surprise" value="0" max="100"></progress>

            <label htmlFor="Sad" style={{ color: 'gray' }}>Sad</label>
            <progress id="Sad" value="0" max="100"></progress>

            <label htmlFor="Disgust" style={{ color: 'pink' }}>Disgusted</label>
            <progress id="Disgust" value="0" max="100"></progress>
          </div>

          {/* Display Predicted Emotion */}
          <input
            id="emotion_text"
            name="emotion_text"
            value={emotion}
            readOnly
          />

          {/* Recommended Cuisines */}
          <textarea
            id="recommended_foods"
            value={recommendations.join(", ")}
            readOnly
            rows="4"
          />

          {/* Refresh Button */}
          <button onClick={() => window.location.reload()}>Refresh</button>
        </div>
      </div>
    </div>
  );
}

export default App;
