export default function RoomLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex flex-col h-screen">
        {children}
      </div>
    );
  }
  