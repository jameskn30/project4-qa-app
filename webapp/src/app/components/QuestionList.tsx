import { FaAngleUp } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FaExclamation, FaRegComments, FaArrowRotateRight, FaTrashCan } from "react-icons/fa6";

export type QuestionItem = {
    uuid: string
    rephrase: string
    upvotes: number
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
                {question.upvotes}
            </button>
        </div>
    );
};

interface QuestionListProps {
    questions: QuestionItem[]
    loadingQuestions: boolean
    hostMessage: string
    roundNumber: number
    handleGroupQuestions: () => void
    handleClearQuestion: () => void
    handleUpvote: (uuid: string) => void
    handleRestartRound: () => void
    handleCloseRoom: () => void
}

const QuestionList = ({ questions, loadingQuestions, roundNumber, hostMessage, handleGroupQuestions, handleClearQuestion, handleUpvote, handleRestartRound, handleCloseRoom }: QuestionListProps) => {
    const sortedQuestions = [...questions].sort((a, b) => b.upvotes - a.upvotes);

    return (
        <div className="p-4 overflow-y-auto h-full flex flex-col gap-2">
            <p className="text-lg text-center font-bold">Questions round {roundNumber}</p>
            <Button onClick={handleGroupQuestions} className='bg-blue-500 text-white hover:bg-blue-700 font-bold'><FaRegComments /> Group questions</Button>
            <Button onClick={handleClearQuestion} className='bg-yellow-500 text-white hover:bg-yellow-700 font-bold'><FaTrashCan /> Clear questions</Button>
            <Button onClick={handleRestartRound} className='bg-red-500 text-white hover:bg-red-700 font-bold flex'> <FaArrowRotateRight /> Restart round</Button>
            <Button onClick={handleCloseRoom} className='bg-red-500 text-white hover:bg-red-700 font-bold flex'> Test button Close room</Button>
            <div className="flex flex-col gap-2 border-t-2 border-slate-100 mt-2 pt-4">
                {hostMessage && hostMessage.length > 0 && <p className="flex w-full text-red-500"> {hostMessage}</p>}

                {loadingQuestions ?
                    <Spinner />
                    : <>
                        {sortedQuestions.map((question, index) => (
                            <Question key={index} order={index + 1} question={question} handleUpvote={handleUpvote} />
                        ))}
                    </>}
            </div>
        </div>
    );
};

export default QuestionList;