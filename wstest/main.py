import asyncio
import websockets
import sys
import random

async def send_message(uri, message_to_send = 5, wait_before_joining = 5 ):
    await asyncio.sleep(wait_before_joining)

    async with websockets.connect(uri) as websocket:
        for i in range(message_to_send):
            try:
                await websocket.send(" hello world, load testing right now ")
                print(f"Message sent, {i}/{message_to_send}")
                wait_before_sending_next =random.randint(3, 5)
                await asyncio.sleep(wait_before_sending_next)
            except Exception as e:
                print("Error: ", e)
                break
        
        websocket.close()
    sys.exit(0)

async def main():
    uri = "ws://localhost:8000/join/1"
    tasks = []

    for i in range(5):
        wait_before_joining = random.randint(2, 10)
        message_to_send = random.randint(5,20)
        tasks.append(send_message(uri, message_to_send, wait_before_joining))

    await asyncio.gather(*tasks)
        
if __name__ == "__main__":
    asyncio.run(main())
