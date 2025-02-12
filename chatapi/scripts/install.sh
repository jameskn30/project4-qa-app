echo $(pwd)

rm -rf .env

if [ ! -d ".env" ]; then
    python3 -m venv .env
fi


source .env/bin/activate

pip install websockets fastapi redis uvicorn 

echo "Freezing requirements.txt"

pip freeze > requirements.txt