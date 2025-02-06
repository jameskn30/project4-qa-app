import Message from '@/app/components/ChatWindow';

const randomMessages = [
    "Hello!",
    "How are you doing today?",
    "This is a short message.",
    "Here's a longer message to test the layout of the chat window. It should wrap around and display correctly.",
    "Another short one.",
    "This is yet another example of a longer message. We want to ensure that the chat window can handle messages of varying lengths without any issues.",
    "Short again.",
    "Testing with a medium-length message to see how it fits.",
    "A very long message to see how the chat window handles it. This message is intentionally verbose to test the overflow and wrapping behavior of the chat window component. It should display correctly and not break the layout.",
    "Final short message."
];

const randomUsernames = [
    "Alice",
    "Bob",
    "Charlie",
    "Dave",
    "Eve",
    "Frank",
    "Grace",
    "Hank",
    "Ivy",
    "Jack",
    "Kathy",
    "Leo",
    "Mona",
    "Nina",
    "Oscar",
    "Paul",
    "Quincy",
    "Rita",
    "Sam",
    "Tina"
];

const randomFlags = [
    "🇺🇸", "🇨🇦", "🇬🇧", "🇫🇷", "🇩🇪", "🇯🇵", "🇮🇳", "🇧🇷", "🇦🇺", "🇮🇹", "🇪🇸", "🇲🇽", "🇨🇳", "🇷🇺", "🇰🇷", "🇸🇪", "🇳🇱", "🇳🇴", "🇩🇰", "🇫🇮"
];


// export const genRandomMessages = (): Message[] => (Array.from({ length: 20 }, () => (
//     new Message(
//         randomUsernames[Math.floor(Math.random() * randomUsernames.length)],
//         randomMessages[Math.floor(Math.random() * randomMessages.length)],
//         randomFlags[Math.floor(Math.random() * randomFlags.length)],
//     )
// )));