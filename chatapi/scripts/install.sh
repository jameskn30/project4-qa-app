echo $(pwd)

cd ..

if [ ! -d ".env" ]; then
    python3 -m venv .env
fi

source .env/bin/activate

pip install websockets fastapi redis uvicorn sentence-transformer haystack ollama-haystack

pip freeze > requirements.txt


