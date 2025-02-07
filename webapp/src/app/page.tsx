import QuestionList from '@/app/components/QuestionList';
import ChatWindow from '@/app/components/ChatWindow';
import Navbar from '@/app/components/Navbar';

export default function Home() {
  
  return (
    <div className="flex flex-col h-screen" data-testid="container">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:flex lg:flex-1">
        </div>
        <div className="flex-1 overflow-y-auto">
          <QuestionList />
        </div>
        <div className="flex-1 border-s-2">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}
