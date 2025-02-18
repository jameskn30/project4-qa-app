import { FaAngleUp } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";


type QuestionItem = {
    uuid: string
    rephrase: string
    upvotes: number
    downvotes: number
}

interface QuestionProps {
    order: number
    question: QuestionItem
    handleUpvote: (uuid: string) => void
}

const Question = ({ question, order, handleUpvote }: QuestionProps) => {
    return (
        <div className="flex items-center justify-between p-2 bg-green-100 rounded-lg shadow mb-4 border border-green-300">
            <span className="text-lg font-bold text-green-700">{order}</span>
            <span className="flex-1 mx-4 text-gray-700">{question.rephrase}</span>
            <button className="p-1 text-black rounded text-sm" onClick={() => handleUpvote(question.uuid)}>
                <FaAngleUp className="bg-green-500 p-1 text-white" size={20} />
                {question.upvotes - question.downvotes}
            </button>
        </div>
    );
};

interface QuestionListProps {
    questions: QuestionItem[]
    loadingQuestions: boolean
    roundNumber: number
    handleGroupQuestions: () => void
    handleClearQuestion: () => void
    handleUpvote: () => void
}

const QuestionList = ({ questions, loadingQuestions, roundNumber, handleGroupQuestions, handleClearQuestion, handleUpvote }: QuestionListProps) => {

    return (
        <div className="p-4 overflow-y-auto h-full flex flex-col gap-2">
            <p className="text-lg text-center font-bold">Questions round {roundNumber}</p>
            <Button onClick={handleGroupQuestions} className='bg-yellow-500 text-white hover:bg-yellow-700 font-bold'>Group questions</Button>
            <Button onClick={handleClearQuestion} className='bg-red-500 text-white hover:bg-red-700 font-bold'>Clear questions</Button>
            <div className="flex flex-col gap-2 border-t-2 border-slate-100 mt-2 pt-4">
                {loadingQuestions ? <Spinner /> : <>
                    {questions.map((question, index) => (
                        <Question key={index} order={index + 1} question={question} handleUpvote={handleUpvote}/>
                    ))}
                </>}
            </div>
        </div>
    );
};

export default QuestionList;