echo $(pwd)

cd ..

if [ ! -d ".env" ]; then
    python3 -m venv .env
fi

source .env/bin/activate

pip install websockets fastapi redis uvicorn

pip freeze > requirements.txt


