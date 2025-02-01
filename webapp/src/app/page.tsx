const Question = ({ order, text }: { order: number; text: string }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded shadow mb-4">
      <span className="text-lg font-bold">{order}</span>
      <span className="flex-1 mx-4">{text}</span>
      <button className="p-2 bg-green-500 text-white rounded">Upvote</button>
    </div>
  );
};

const QuestionList = () => {
  const questions = [
    "What is the purpose of this app?",
    "How do I use the chat feature?",
    "Can I upvote questions?",
  ];

  return (
    <div className="p-4">
      {questions.map((question, index) => (
        <Question key={index} order={index + 1} text={question} />
      ))}
    </div>
  );
};

const ChatComponent = () => {
  return (
    <div className="flex-1 bg-red-200 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {/* Messages will go here */}
        <div className="mb-4 p-2 bg-white rounded shadow">Hello!</div>
        <div className="mb-4 p-2 bg-white rounded shadow">How are you?</div>
        {/* Add more messages as needed */}
      </div>
      <div className="p-4 border-t border-gray-300 flex">
        <input
          type="text"
          className="flex-1 p-2 border border-gray-300 rounded-l"
          placeholder="Type your message..."
        />
        <button className="p-2 bg-blue-500 text-white rounded-r">Send</button>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <div className="flex h-screen" data-testid="container">
      <div className="flex-1 bg-blue-200">
        <QuestionList />
      </div>
      <div className="flex-1 bg-red-200">
        <ChatComponent />
      </div>
    </div>
  );
}
