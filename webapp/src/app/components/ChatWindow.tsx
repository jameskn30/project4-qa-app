const Message = ({ username, content }: { username: string; content: string }) => {
  return (
    <div className="mb-4 p-2 bg-white rounded shadow bg-green-100">
      <strong className="text-green-700">{username}:</strong> <span className="text-gray-700">{content}</span>
    </div>
  );
};

const ChatWindow = () => {
  const messages = Array.from({ length: 20 }, (_, i) => ({
    username: `User${i + 1}`,
    content: `This is message number ${i + 1}`,
  }));

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <Message key={index} username={msg.username} content={msg.content} />
        ))}
      </div>
      <div className="border-t border-gray-300"></div>
      <div className="p-4 border-t border-gray-300 flex bg-green-200">
        <input
          type="text"
          className="flex-1 p-2 border border-gray-300 rounded-l"
          placeholder="Type your message..."
        />
        <button className="p-2 bg-green-500 text-white rounded-r">Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;