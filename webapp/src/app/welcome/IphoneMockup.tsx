const generateRandomText = () => {
    const words = ["Lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua"];
    const length = Math.floor(Math.random() * 11) + 10; // Random length between 10 and 20
    return Array.from({ length }, () => words[Math.floor(Math.random() * words.length)]).join(" ");
}

const generateRandomQuestion = () => {
    const words = ["What", "is", "the", "meaning", "of", "life", "and", "why", "do", "we", "exist", "in", "this", "universe", "with", "so", "many", "mysteries", "to", "uncover"];
    const length = Math.floor(Math.random() * 11) + 10; // Random length between 10 and 20
    return Array.from({ length }, () => words[Math.floor(Math.random() * words.length)]).join(" ");
}
const IphoneMockup = () => {
    const questions = Array.from({ length: 5 }, generateRandomQuestion);
    const messages = Array.from({ length: 3 }, generateRandomText);
    
    return (
        <div className="p-5 rounded-lg shadow-lg text-center w-52 h-52 mt-32 flex justify-center items-center select-none bg-slate-300">
        {/* phone mocking frame */}
        <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[7px] rounded-[3.0rem] h-[600px] w-[300px] shadow-2xl ">
            {/* <div className="h-[32px] w-[10px] bg-gray-800 dark:bg-gray-800 absolute -start-[10px] top-[80px] rounded-sm"></div>
            <div className="h-[46px] w-[10px] bg-gray-800 dark:bg-gray-800 absolute -start-[10px] top-[124px] rounded-sm"></div>
            <div className="h-[46px] w-[10px] bg-gray-800 dark:bg-gray-800 absolute -start-[10px] top-[178px] rounded-sm"></div>
            <div className="h-[64px] w-[10px] bg-gray-800 dark:bg-gray-800 absolute -end-[10px] top-[142px] rounded-sm"></div> */}
            <div className="flex flex-col items-center rounded-[2.5rem] overflow-hidden w-[280px] h-[585px] bg-white dark:bg-gray-800  bg-gradient-to-t from-white to-blue-300">
                <div className="w-24 h-4 bg-black rounded-full m-2"/>
                {/* <p>notification mockup</p> */}
                <div className='flex bg-transparent w-full h-full flex-col'>
                    <div className="flex-1 p-2 overflow-y-auto text-xs" id="qa-container">
                        {/* QA section */}
                        {messages.map((message, index) => (
                            <div key={index} className="bg-white p-2 rounded-lg shadow mb-2 flex justify-between items-center">
                                <span>{message}</span>
                                <button className="ml-2 p-1 rounded-lg ">
                                    <div className="flex items-center flex-col gap-1 bg-white">
                                        <div>
                                            <FaThumbsUp size={20} className="bg-green-300 p-1 rounded-sm"/>
                                            <p>13</p>
                                        </div>
                                        <div>
                                            <FaThumbsDown size={20} className="bg-red-500 p-1 rounded-sm text-white"/>
                                            <p>1</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="absolute bottom-10 left-0 right-0 bg-slate-100 flex flex-col border-t border-gray" id='chat-container'>
                        {/* chat section */}
                        <div className="h-32 overflow-y-auto p-2 text-start text-xs">
                            {questions.map((question, index) => (
                                <div key={index} className="flex gap-2">
                                    <p className="font-bold">John</p>
                                    <p>{question}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-2 flex items-center mb-1" >
                            <input type="text" className="flex-1 p-1 border rounded-lg disabled:bg-white text-sm" placeholder="Type a message..." disabled value="How do I sign up?"/>
                            <div className="ml-2 p-2 bg-blue-500 text-white rounded-lg flex items-center">
                                <FaPaperPlane className="mr-1" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    )

}