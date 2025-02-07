'use client'

import React from 'react'
import Link from 'next/link'
import clsx from 'clsx'

// const Navbar = () => {
//   return (
//     <div className="flex items-center justify-between p-2 bg-green-500 text-gray-900 shadow">
//       <div className="flex-1 justify-start text-left flex">
//         <Link href="/" className="p-2 mx-2 bg-green-400 hover:bg-green-600 rounded flex items-center text-gray-900">About</Link>
//       </div>
//       <div className="flex-1 text-center">
//         <span className="text-xl font-bold">Logo</span>
//       </div>
//       <div className="flex-1 text-right flex justify-end">
//         <button className="p-2 mx-2 bg-green-400 hover:bg-green-600 rounded flex items-center text-gray-900">
//           <span>
//             <FaUser className="mr-2" />
//           </span>
//           User
//         </button>
//         <button className="p-2 mx-2 bg-green-400 hover:bg-green-600 rounded flex items-center text-gray-900">
//           <span>
//             <FaComment className="mr-2" />
//           </span>
//           Feedback
//         </button>
//       </div>
//     </div>
//   );
// };

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
          <nav className="flex justify-between items-center">
              <div className="flex space-x-4 cl border border-slate-300 p-3 bg-white rounded-xl shadow-md hover:shadow-lg items-center">
                  <ButtonLink href="/">
                      <div className="flex items-center gap-2">
                          <p className="text-sm">LOGO</p>
                          <p className="max-w-40 text-sm">app description</p>
                      </div>
                  </ButtonLink>
              </div>

              <ul className="flex gap-2 cl border border-slate-300 p-3 bg-white rounded-xl shadow-md hover:shadow-lg">
                  <li>
                      <ButtonLink href="#section1">
                          Products
                      </ButtonLink>

                  </li>

                  <li>
                      <ButtonLink href="#section2" >
                          Solutions
                      </ButtonLink>
                  </li>
                  <li>
                      <ButtonLink href="#section2">
                          Pricing
                      </ButtonLink>
                  </li>
                  <li>
                      <ButtonLink href="#section3">
                          About Us
                      </ButtonLink>
                  </li>
              </ul>

              <div className='flex gap-3'>

                  <ul className="flex space-x-4 cl border border-slate-300 p-3 bg-white rounded-xl shadow-md hover:shadow-lg">
                      <li>
                          <ButtonLink href="#section2">
                              Contact Sale
                          </ButtonLink>
                      </li>
                  </ul>

                  <ul className="flex space-x-4 cl border border-slate-300 p-3 bg-white rounded-xl shadow-md hover:shadow-lg">
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