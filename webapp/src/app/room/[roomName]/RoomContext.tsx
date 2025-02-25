'use client'
import React, { createContext, useState, useContext } from 'react'

interface RoomContextProps {
  command: string|null
  setCommand: (command: string|null) => void
}

export const RoomContext = createContext<RoomContextProps | undefined>(undefined)

export const RoomProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [command, setCommand] = useState<string|null>('')

  return (
    <RoomContext.Provider value={{ command, setCommand }}>
      {children}
    </RoomContext.Provider>
  )
}

export const useRoomContext = () => {
    const context = useContext(RoomContext)
    if (!context) {
        throw new Error('useRoomContext must be used within a RoomProvider')
    }
    return context
}
