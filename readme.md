# Personalized Culinary Experiences using ML

### Clone the Repository
```bash
git clone <repository-url>

cd <repository-directory>
```

## Setting Up the FastAPI Server

### Modify main.py

- Open main.py in a text editor and change the file_path value for Emotion_Food_Mapping.csv file to match the location on your local system.

### Navigate to the Server Directory
```bash
cd server
```

### Create a Virtual Environment
```bash
python -m venv venv
```

### Activate the Virtual Environment
```bash
.\venv\Scripts\activate
```

### Install Required Packages
```bash
pip install -r requirements.txt
```

### Start the FastAPI Server
```bash
uvicorn main:app --reload
```


## Starting the React Client

### Navigate to the Emotion Recognition Directory
```bash
cd emotion-recognition
```

### Install Dependencies
```bash
npm install
```

### Start the React Application
```bash
npm start
```


## Accessing the Application
- Once both servers are running, you can access your application in a web browser:

- **API Server:** `http://localhost:8000`

- **React Application:** `http://localhost:3000`

![HLD](https://github.com/user-attachments/assets/7fc45a55-882a-4217-a91f-7a1303080a1b)

