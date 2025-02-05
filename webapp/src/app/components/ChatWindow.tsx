const Message = ({ username, content, flag }: { username: string; content: string; flag: string }) => {
  return (
    <div className="mb-1 p-1 text-sm flex items-center hover:bg-slate-200 hover:cursor-pointer">
      <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center mr-2">
        {username.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <strong className="text-purple-700">{username}</strong> <span className="ml-1">{flag}</span> <span className="text-gray-700">{content}</span>
      </div>
    </div>
  );
};

const ChatWindow = () => {
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

  const messages = Array.from({ length: 20 }, () => ({
    username: randomUsernames[Math.floor(Math.random() * randomUsernames.length)],
    content: randomMessages[Math.floor(Math.random() * randomMessages.length)],
    flag: randomFlags[Math.floor(Math.random() * randomFlags.length)],
  }));

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-white">
      <div className="flex-1 overflow-y-auto flex flex-col">
        {messages.map((msg, index) => (
          <Message key={index} username={msg.username} content={msg.content} flag={msg.flag} />
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