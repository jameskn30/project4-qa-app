import { ArrowUpCircle, Check } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {Card} from '@/components/ui/card'

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
                        <Button className="bg-green-700 hover:bg-green-500 hover:text-black text-white"><Check/>Answered</Button>
                    </div>
                )
            }

            <div className="rounded-lg shadow-lg border bg-yellow-300 flex-1 justify-center items-center flex p-3">
                <span className="text-lg font-bold text-slate-700">{order}</span>
                <span className="flex-1 mx-4 text-gray-700">{question.rephrase}</span>

            </div>
            <button className="p-1 text-black rounded-md text-sm justify-center items-center flex flex-col hover:bg-slate-200"
                onClick={() => handleUpvote(question.uuid)}>
                <div className='flex items-center gap-2'>
                    <ArrowUpCircle className="text-green-700 w-auto rounded-full" size={25} />
                    <p>{question.upvotes}</p>
                </div>

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
        <Card className="p-4 flex flex-col gap-2 rounded-2xl h-full">
            <p className="text-lg text-center font-bold">Live question round {roundNumber}</p>
            <div className="flex overflow-y-auto h-full flex-col gap-2">

                {loadingQuestions ?
                    <Spinner size={'large'}/>
                    : <>
                        {sortedQuestions.map((question, index) => (
                            <Question key={index} order={index + 1} question={question} handleUpvote={handleUpvote} isHost={isHost} />
                        ))}
                    </>}
                {hostMessage && hostMessage.length > 0 && <p className="flex w-full text-center text-md">{hostMessage}</p>}
            </div>
        </Card>
    );
};

export default QuestionList;