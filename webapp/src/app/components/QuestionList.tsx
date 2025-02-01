import { FaAngleUp } from "react-icons/fa6";

const Question = ({ order, text }: { order: number; text: string }) => {
    return (
        <div className="flex items-center justify-between p-2 bg-green-100 rounded-lg shadow mb-4 border border-green-300">
            <span className="text-lg font-bold text-green-700">{order}</span>
            <span className="flex-1 mx-4 text-gray-700">{text}</span>
            <button className="p-1 bg-green-500 hover:bg-green-700 text-white rounded">
                <FaAngleUp />
                up
            </button>
        </div>
    );
};

const generateRandomQuestion = () => {
    const words = [
        "What", "is", "the", "purpose", "of", "this", "app", "How", "do", "I", "use", "chat", "feature", "Can", "upvote", "questions", "Why", "does", "it", "work", "like", "that", "Explain", "more", "about", "functionality", "Is", "there", "any", "documentation", "available"
    ];
    const length = Math.floor(Math.random() * (30 - 10 + 1)) + 10;
    let question = "";
    for (let i = 0; i < length; i++) {
        question += words[Math.floor(Math.random() * words.length)] + " ";
    }
    return question.trim() + "?";
};

const QuestionList = () => {
    const questions = Array.from({ length: 10 }, () => generateRandomQuestion());

    return (
        <div className="p-4 overflow-y-auto h-full">
            {questions.map((question, index) => (
                <Question key={index} order={index + 1} text={question} />
            ))}
        </div>
    );
};

export default QuestionList;