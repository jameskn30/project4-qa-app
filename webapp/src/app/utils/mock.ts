import { Message } from '@/app/components/ChatWindow';
import { QuestionItem } from '@/app/components/QuestionList';

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

export const generateRandomMessages = (count: number): Message[] => {
    return Array.from({ length: count }, () => ({
        username: randomUsernames[Math.floor(Math.random() * randomUsernames.length)],
        content: randomMessages[Math.floor(Math.random() * randomMessages.length)],
        flag: randomFlags[Math.floor(Math.random() * randomFlags.length)],
    }));
};

export const generateRandomQuestions = (count: number): QuestionItem[] => {
    const words = [
        "What", "is", "the", "purpose", "of", "this", "app", "How", "do", "I", "use", "chat", "feature", "Can", "upvote", "questions", "Why", "does", "it", "work", "like", "that", "Explain", "more", "about", "functionality", "Is", "there", "any", "documentation", "available"
    ];
    return Array.from({ length: count }, (_, i) => {
        const length = Math.floor(Math.random() * (30 - 10 + 1)) + 10;
        let question = "";
        for (let j = 0; j < length; j++) {
            question += words[Math.floor(Math.random() * words.length)] + " ";
        }
        return {
            id: i + 1,
            content: question.trim() + "?",
            votes: Math.floor(Math.random() * 100)
        };
    });
};
