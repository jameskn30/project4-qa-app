'use client'

import Link from 'next/link'
import clsx from 'clsx'
import { useRoomContext } from '@/app/room/[roomId]/RoomContext'
import { useParams } from 'next/navigation'

interface ButtonLinkProp extends React.LinkHTMLAttributes<HTMLLinkElement> {
  children: React.ReactNode | null
  href: string
}

const ButtonLink = ({ children, href, className, ...props }: ButtonLinkProp) => {
  return (
    <Link href={href} className={clsx('bg-white hover:bg-slate-200 rounded-lg p-2', className)} {...props}>
      {children}
    </Link>
  )
}

interface NavbarProps {}

const Navbar = ({ }: NavbarProps) => {
  const { command, setCommand } = useRoomContext()
  const params = useParams<{ roomId: string }>()

  const roomId = params?.roomId ? decodeURIComponent(params.roomId) : null

  const handleOnLeave = () => {
    setCommand("leave")
  }

  return (
    <div className="sticky z-10 bg-transparent">
      <nav className="flex justify-between items-center px-5 py-1">
        <div className="flex space-x-4 cl border border-slate-300 p-1 bg-white rounded-xl shadow-md hover:shadow-lg items-center">
          <ButtonLink href="/">
            <div className="flex items-center gap-2">
              <p className="text-sm">LOGO</p>
              <p className="max-w-40 text-sm">app description</p>
            </div>
          </ButtonLink>
        </div>

        <ul className="flex gap-2 cl border border-slate-300 py-2 px-1 bg-white rounded-xl shadow-md hover:shadow-lg">
          <li>
            <span className="bg-white rounded-lg p-2">
              Room {roomId}
            </span>
          </li>

          <li>
            <ButtonLink href="#" onClick={handleOnLeave}>
              Leave
            </ButtonLink>
          </li>
        </ul>

        <div className='flex gap-3'>
          <ul className="flex space-x-4 cl border border-slate-300 py-2 px-1 bg-white rounded-xl shadow-md hover:shadow-lg">
            <li>
              <ButtonLink href="#section2">
                Login
              </ButtonLink>
            </li>
            <li>
              <ButtonLink href="#section3" className="bg-gradient-to-r from-purple-600 via-purpl-700 to-red-600 text-white">
                Sign Up
              </ButtonLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  )
}

export default Navbar;