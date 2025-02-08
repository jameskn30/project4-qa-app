import React from 'react';

const Loading = () => {
  const GIF = [
    "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeW9oZHBsY2QxNHpmM213Zm96bTBkN2lxMXljcmluMHFidzhmbjB5ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/BAnl0HDW9PDONr5hm6/giphy.gif",
    "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWFwc2Zmcno2ZWg2cmF6dTU1YWt4ZWhrZnF2OHVmYmgxNzBzMGd0dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/tMqK6aXiwushxQUeMz/giphy.gif",
    "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2FrcG41cnAwa21hcXBhNnZyZ2phc2s2aThzam9sa3lhZXRnNGY3YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/lWY7KIoUckm8iCjY79/giphy.gif"
  ];
  const randomGif = GIF[Math.floor(Math.random() * GIF.length)];

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <img src={randomGif} width="200" height="200" alt="Loading" />
      <div className="mt-4 text-xl text-gray-700">Hang tight! Joining room...</div>
    </div>
  );
}

export default Loading;