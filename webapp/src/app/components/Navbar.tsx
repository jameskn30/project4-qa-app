'use client'

import React from 'react'
import Link from 'next/link'
import clsx from 'clsx'

interface ButtonLinkProp extends React.LinkHTMLAttributes<HTMLLinkElement> {
  children: React.ReactNode
  href: string
}

const ButtonLink = ({ children, href, className, ...props }: ButtonLinkProp) => {
  return (
    <Link href={href} className={clsx('bg-white hover:bg-slate-200 rounded-lg p-2', className)} {...props}>
      {children}
    </Link>
  )
}

const Navbar = () => {
  return (
    <div className="sticky z-10  bg-transparent">
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
              Room ID: 123456
            </span>
          </li>

          <li>
            <ButtonLink href="/new_room">
              Join new room
            </ButtonLink>
          </li>
          <li>
            <ButtonLink href="#section3">
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