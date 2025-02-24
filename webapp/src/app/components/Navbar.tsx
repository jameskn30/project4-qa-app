'use client'

import { useParams } from 'next/navigation'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { FaBars } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { DoorOpen, LayoutDashboard, Router } from 'lucide-react';
import {useRouter } from 'next/navigation'


interface NavbarProps {
  onLeave: () => void
}

const Navbar = ({ onLeave }: NavbarProps) => {
  const params = useParams<{ roomId: string }>()

  const roomId = params?.roomId ? decodeURIComponent(params.roomId) : null
  const router = useRouter()

  return (
    <div className="sticky z-10 bg-transparent w-full backdrop-blur-sm">
      <nav className="flex flex-wrap justify-between items-center px-5 py-1">

        <div className="flex p-1 space-2 items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={70} height={30} className="transition-transform duration-300 ease-in-out transform hover:scale-125 hover:cursor-pointer" />
          <p className="text-2xl font-bold bg-yellow-300 rotate-2">Donask!</p>
          <p className="text-sm hidden lg:block"> Give the best Q&A experience to your audience </p>
        </div>

        <div className="hidden lg:flex gap-3">
          <ul className="flex space-x-4 ">
            <li>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                <LayoutDashboard />
                Dashboard
              </Button>
            </li>
            <li>
              <Button onClick={onLeave} variant="outline">
                <DoorOpen />
                Leave room
              </Button>
            </li>
            <li>
              <Button variant="outline" >
                Login
              </Button>
            </li>
            <li>
              <Button variant="outline" className="bg-gradient-to-r from-purple-600 via-purpl-700 to-red-600 text-white hover:bg-gradient-to-r hover:from-green-400 hover:via-blue-500 hover:to-purple-600 hover:text-white">
                Sign Up
              </Button>
            </li>
          </ul>
        </div>

        <div className="lg:hidden">
          <Popover>
            <PopoverTrigger asChild>
              <Button className="p-2">
                <FaBars />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="flex flex-col gap-2">
                <span className="bg-white rounded-lg p-2">
                  Room: {roomId}
                </span>
                <div className="mx-4 border border-slate-100"></div>
                <Button >
                  Login
                </Button>
                <Button className="bg-gradient-to-r from-purple-600 via-purpl-700 to-red-600 text-white hover:bg-gradient-to-r hover:from-green-400 hover:via-blue-500 hover:to-purple-600">
                  Sign Up
                </Button>
                <Button onClick={onLeave}>
                  Leave
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </nav>
    </div>
  )
}

export default Navbar;