
# Project Name

## 1. Project statement

For livestreamer, live instructor, followers can chat to ask questions, problem is there are too many asking the same time, their questions are not answered, 

Fix: use LLM to group these answers and let users upvote the questions that is most relevant to them. Instructor can choose to answer with most relevant questions, or randomly. 

App should be easy to start, paste link and users can join,

subscription with $10/month or so will enable a room of 500+ people

Make it modern, fast, reliable, beautiful app.

## 2. Tech stack
Next.js
LLM agent: haystack
Docker
Groq API
Firebase : user auth, db 
Redis PubSub

## 3. TOODs for backend, frontend is in README.md in those folders

## 4. Load test the system to make sure it works as intended

## 5. Running the Application

### Chat API Module

To run the Chat API module:

1. Navigate to the chat API directory:
    ```bash
    cd chatapi
    ```
2. Run the app in script.



The API will be running at `http://localhost:3000` by default.

### Web Application

To run the Web App module:

1. Navigate to the webapp directory:
    ```bash
    cd frontend/webapp
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables:
    - create new .env.local
    - Configure your Groq API key, Supabase credentials

CHATAPI_ENDPOINT=http://192.168.1.123:8000
LLM_API_ENDPOINT=http://0.0.0.0:8000

4. Start the development server:
    ```bash
    npm run dev
    ```

5. For production:
    ```bash
    npm run build
    npm start
    ```

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

The web application will be running at `http://localhost:3000` by default.

### Using Docker

You can also run the entire application using Docker Compose:

```bash
docker-compose up
```

This will start both the Chat API and Web Application in containers.



