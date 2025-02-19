'use client'

import Link from 'next/link'
import clsx from 'clsx'
import { useParams } from 'next/navigation'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { FaBars } from 'react-icons/fa'
import { Button } from '@/components/ui/button'

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

interface NavbarProps {
  onLeave: () => void
}

const Navbar = ({ onLeave }: NavbarProps) => {
  const params = useParams<{ roomId: string }>()

  const roomId = params?.roomId ? decodeURIComponent(params.roomId) : null

  return (
    <div className="sticky z-10 bg-transparent w-full">
      <nav className="flex flex-wrap justify-between items-center px-5 py-1">
        <div className="flex space-x-4 border border-slate-300 p-1 bg-white rounded-xl shadow-md hover:shadow-lg items-center">
          <ButtonLink href="/">
            <div className="flex items-center gap-2">
              <p className="text-sm">LOGO</p>
              <p className="max-w-40 text-sm">app description</p>
            </div>
          </ButtonLink>
        </div>

        <div className="hidden lg:flex gap-2 border border-slate-300 px-1 bg-white rounded-xl shadow-md hover:shadow-lg">
          <span className="bg-white rounded-lg p-2 font-bold">
            Room: {roomId}
          </span>
          <ButtonLink href="#" onClick={onLeave}>
            Leave
          </ButtonLink>
        </div>

        <div className="hidden lg:flex gap-3">
          <ul className="flex space-x-4 border border-slate-300 py-2 px-1 bg-white rounded-xl shadow-md hover:shadow-lg">
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
                <ButtonLink href="#" onClick={onLeave}>
                  Leave
                </ButtonLink>
                <ButtonLink href="#section2">
                  Login
                </ButtonLink>
                <ButtonLink href="#section3" className="bg-gradient-to-r from-purple-600 via-purpl-700 to-red-600 text-white">
                  Sign Up
                </ButtonLink>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </nav>
    </div>
  )
}

export default Navbar;