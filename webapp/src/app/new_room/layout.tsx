const NewRoomLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="new-room-layout">
      <header>
        <h2>New Room Layout</h2>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default NewRoomLayout;
