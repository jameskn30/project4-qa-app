import asyncio
import websockets
import sys
import random

messages = [
    "How do I reset my password?",
    "I forgot my password, how can I recover it?",
    "What is the process to change my password?",
    "Can you help me with my account recovery?",
    "How do I update my profile information?",
    "I need to change my email address on my account.",
    "What are the store hours for the weekend?",
    "Is the store open on holidays?",
    "Can I return an item without a receipt?",
    "What is the return policy for online purchases?",
    "How do I track my order?",
    "My order hasn't arrived yet, what should I do?",
    "Can I change the shipping address for my order?",
    "How do I apply for a job at your company?",
    "Are there any job openings in the marketing department?",
    "What benefits do you offer to employees?",
    "How do I schedule an appointment?",
    "Can I reschedule my appointment online?",
    "What documents do I need to bring to my appointment?",
    "How do I cancel my subscription?",
    "What are the subscription plans available?",
    "Can I upgrade my subscription plan?",
    "How do I contact customer support?",
    "Is there a live chat option for customer support?",
    "What is the phone number for customer support?",
    "How do I download the mobile app?",
    "Is the mobile app available for both iOS and Android?",
    "How do I report a bug in the mobile app?",
    "Can I use the mobile app to make payments?",
    "What payment methods are accepted?",
    "How do I add a new payment method?",
    "Can I set up automatic payments?",
    "How do I delete my account?",
    "What happens to my data if I delete my account?",
    "Can I reactivate my account after deleting it?",
    "How do I change my notification settings?",
    "Can I turn off email notifications?",
    "How do I enable push notifications?",
    "What is the privacy policy of your company?",
    "How do you handle customer data?",
    "What security measures are in place to protect my information?"
]

async def send_message(uri, message_to_send = 5, wait_before_joining = 5 ):
    await asyncio.sleep(wait_before_joining)

    async with websockets.connect(uri) as websocket:
        for i in range(message_to_send):
            try:
                await websocket.send(messages[random.randint(0, len(messages)-1)])
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
