import asyncio
import websockets
import random
import string

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

async def send_message(uri, messages_to_send):
    async with websockets.connect(uri) as websocket:
        try:
            sent_messages = set()
            for i in range(messages_to_send):
                wait_time = random.randint(1,5)
                message = messages[random.randint(0, len(messages)-1)]
                if message not in sent_messages:
                    sent_messages.add(message)
                await websocket.send(message)
                print(f"Message sent, {i+1}/{messages_to_send}")
                await asyncio.sleep(wait_time)
        except Exception as e:
            print("Error: ", e)
        finally:
            await websocket.close()

def gen_random_username(length: int = 2) -> str:
    adjectives = ["Quick", "Lazy", "Happy", "Sad", "Bright", "Dark", "Clever", "Brave"]
    nouns = ["Fox", "Dog", "Cat", "Mouse", "Bear", "Lion", "Tiger", "Wolf"]
    
    adjective = random.choice(adjectives)
    noun = random.choice(nouns)
    number = '_'.join(random.choices(string.digits, k=length))
    
    return f"{adjective} {noun} {number}"

async def main():
    base_uri = "ws://localhost:8000/join/test%20room%2010"
    tasks = []

    for i in range(10):
        messages_to_send = random.randint(1, 5)
        username = gen_random_username().replace(" ", "%20")
        uri = f"{base_uri}/{username}"
        print(uri)
        # await send_message(uri, messages_to_send)
        tasks.append(send_message(uri, messages_to_send))

    await asyncio.gather(*tasks)
        
if __name__ == "__main__":
    asyncio.run(main())
