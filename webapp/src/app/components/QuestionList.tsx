import { FaAngleUp } from "react-icons/fa6";

const Question = ({ order, text }: { order: number; text: string }) => {
    return (
        <div className="flex items-center justify-between p-2 bg-green-100 rounded-lg shadow mb-4 border border-green-300">
            <span className="text-lg font-bold text-green-700">{order}</span>
            <span className="flex-1 mx-4 text-gray-700">{text}</span>
            <button className="p-1 text-black rounded text-sm">
                <FaAngleUp className="bg-green-500 p-1 text-white" size={20}/>
                up
            </button>
        </div>
    );
};

export type QuestionItem = {
    content: string
}

interface QuestionListProps {
    questions: QuestionItem[]

}

const QuestionList = ({questions}: QuestionListProps ) => {

    return (
        <div className="p-4 overflow-y-auto h-full flex flex-col gap-2">
            <p className="text-lg text-center font-bold">Questions</p>
            {questions.map((question, index) => (
                <Question key={index} order={index + 1} text={question.content} />
            ))}
        </div>
    );
};

export default QuestionList;