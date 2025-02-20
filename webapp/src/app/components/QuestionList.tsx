import { FaAngleUp } from "react-icons/fa6";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export type QuestionItem = {
    uuid: string
    rephrase: string
    upvotes: number
}

interface QuestionProps {
    order: number
    question: QuestionItem
    isHost: boolean
    handleUpvote: (uuid: string) => void
}

const Question = ({ question, order, isHost, handleUpvote }: QuestionProps) => {
    return (
        <div className="flex p-2 gap-2">
            {
                isHost && (
                    <div className="flex flex-col justify-center gap-2">
                        <Button variant="destructive">Remove</Button>
                    </div>
                )
            }

            <div className="rounded-lg shadow-lg border bg-yellow-300 flex-1 justify-center items-center flex p-3">
                <span className="text-lg font-bold text-slate-700">{order}</span>
                <span className="flex-1 mx-4 text-gray-700">{question.rephrase}</span>

            </div>
            <button className="p-1 text-black rounded-md text-sm items-center flex flex-col border border-slate-100" onClick={() => handleUpvote(question.uuid)}>
                <FaAngleUp className="bg-green-500 p-1 text-white w-full rounded-md" size={20} />
                <p>{question.upvotes}</p>
                <p>Upvote</p>
            </button>
        </div>
    );
};

interface QuestionListProps {
    questions: QuestionItem[]
    loadingQuestions: boolean
    hostMessage: string
    roundNumber: number
    isHost: boolean
    handleGroupQuestions: () => void
    handleClearQuestion: () => void
    handleUpvote: (uuid: string) => void
    handleRestartRound: () => void
    handleCloseRoom: () => void
}

const QuestionList = ({ questions, loadingQuestions, roundNumber, hostMessage, isHost, handleGroupQuestions, handleClearQuestion, handleUpvote, handleRestartRound, handleCloseRoom }: QuestionListProps) => {
    const sortedQuestions = [...questions].sort((a, b) => b.upvotes - a.upvotes);

    return (
        <div className="p-4 overflow-y-auto h-full flex flex-col gap-2">
            <p className="text-lg text-center font-bold">Questions round {roundNumber}</p>
            {/* <Button onClick={handleGroupQuestions} className='bg-blue-500 text-white hover:bg-blue-700 font-bold'><FaRegComments /> Group questions</Button>
            <Button onClick={handleClearQuestion} className='bg-yellow-500 text-white hover:bg-yellow-700 font-bold'><FaTrashCan /> Clear questions</Button>
            <Button onClick={handleRestartRound} className='bg-red-500 text-white hover:bg-red-700 font-bold flex'> <FaArrowRotateRight /> Restart round</Button>
            <Button onClick={handleCloseRoom} className='bg-red-500 text-white hover:bg-red-700 font-bold flex'> Test button Close room</Button> */}
            <div className="flex flex-col gap-2 border-t-2 border-slate-100 mt-2 pt-4">
                {hostMessage && hostMessage.length > 0 && <p className="flex w-full text-red-500"> {hostMessage}</p>}

                {loadingQuestions ?
                    <Spinner />
                    : <>
                        {sortedQuestions.map((question, index) => (
                            <Question key={index} order={index + 1} question={question} handleUpvote={handleUpvote} isHost={isHost} />
                        ))}
                    </>}
            </div>
        </div>
    );
};

export default QuestionList;