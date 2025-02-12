echo $(pwd)

rm -rf .env

if [ ! -d ".env" ]; then
    python3 -m venv .env
fi

source .env/bin/activate

pip install fastapi uvicorn sentence-transformers haystack ollama-haystack

echo "Freezing requirements.txt"

pip freeze > requirements.txt

