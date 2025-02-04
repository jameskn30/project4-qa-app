echo $(pwd)

cd .. 

source .env/bin/activate

pip install websockets fastapi redis uvicorn

pip freeze > requirements.txt


