echo $(pwd)

cd ..

if [ ! -d ".env" ]; then
    python3 -m venv .env
fi

source .env/bin/activate

pip install fastapi uvicorn sentence-transformers haystack ollama-haystack

pip freeze > requirements.txt

