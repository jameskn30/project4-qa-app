'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { FaBars } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { DoorOpen, LayoutDashboard, SquareUser, SquareUserRound } from 'lucide-react';
import { useRouter } from 'next/navigation'
import { UserData } from '@/utils/supabase/auth'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from '@/components/ui/spinner'

interface NavbarProps {
  onLeave?: (() => void) | null
  userData?: UserData | null
  signOut?: (() => void) | null
  login?: (() => void) | null
  loading: boolean
}

const Navbar = ({
  onLeave = null,
  userData,
  signOut = null,
  login = null,
  loading = false
}: NavbarProps) => {
  const params = useParams<{ roomId: string }>()

  const roomId = params?.roomId ? decodeURIComponent(params.roomId) : null
  const router = useRouter()

  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: userData?.username || '',
    password: '',
    username: userData?.username || '',
    email: userData?.email || ''
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile update logic here
    console.log('Profile update:', profileForm);
    setShowProfileDialog(false);
  };

  const ProfileButton = () => (
    <Button
      variant="outline"
      className="flex gap-2 items-center"
      onClick={() => setShowProfileDialog(true)}
    >
      <SquareUser />
      {userData?.username}
    </Button>
  );

  return (
    <div className="sticky z-10 bg-transparent w-full backdrop-blur-sm">
      <nav className="flex flex-wrap justify-between items-center px-5 py-1">

        <div className="flex p-1 space-2 items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={70} height={30} className="transition-transform duration-300 ease-in-out transform hover:scale-125 hover:cursor-pointer" />
          <p className="text-2xl font-bold bg-yellow-300 rotate-2">Donask!</p>
          <p className="text-sm hidden lg:block"> Q&A assistant</p>
        </div>

        <div className="hidden md:flex gap-3">
          <ul className="flex space-x-4 ">
            {
              loading && (
                <li>
                  <Spinner />
                </li>
              )
            }
            {userData && (
              <li>
                <ProfileButton />
              </li>
            )}
            {userData && (
              <>
                <li>
                  <Button variant="outline" onClick={() => router.push('/dashboard')}>
                    <LayoutDashboard />
                    Dashboard
                  </Button>
                </li>
                <li>
                  <Button variant="destructive" onClick={signOut ?? (() => { })}>
                    Sign out
                  </Button>
                </li>
              </>
            )}
            {onLeave && (
              <li>
                <Button onClick={onLeave} variant="outline">
                  <DoorOpen />
                  Leave room
                </Button>
              </li>
            )}
            {!userData && (
              <>
                <li>
                  <Button
                    variant="outline"
                    onClick={login ? login : () => { console.log('login') }}>
                    Login
                  </Button>
                </li>
                <li>
                  <Button
                    variant="outline"
                    className="bg-gradient-to-r from-purple-600 via-purpl-700 to-red-600 text-white hover:bg-gradient-to-r hover:from-green-400 hover:via-blue-500 hover:to-purple-600 hover:text-white"
                    onClick={signOut ? signOut : () => { console.log('sign out') }}
                  >
                    Sign Up
                  </Button>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="md:hidden " id="mobile-menu">
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

                <div className="flex flex-col w-full gap-2">
                  {userData && (
                    <Button className="w-full" variant="outline" onClick={() => router.push('/dashboard')}>
                      <LayoutDashboard className="mr-2" />
                      Dashboard
                    </Button>
                  )}
                  {onLeave && (
                    <Button className="w-full" onClick={onLeave} variant="outline">
                      <DoorOpen className="mr-2" />
                      Leave room
                    </Button>
                  )}
                  {userData === null && (
                    <>
                      <Button className="w-full" variant="outline" onClick={login ? login : () => { console.log('login') }}>
                        Login
                      </Button>
                      <Button className="w-full" variant="outline" onClick={signOut ? signOut : () => { console.log('sign out') }}>
                        Sign Up
                      </Button>
                    </>
                  )}
                  {userData && (
                    <>
                      <ProfileButton />
                      <Button
                        className="w-full"
                        variant="destructive"
                        onClick={signOut ?? (() => { })}
                      >
                        Sign out
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </nav>
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SquareUserRound className="h-6 w-6" />
              Profile Settings
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={userData?.email || ''}
                readOnly
                disabled
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentUsername">Username</Label>
              <Input
                id="currentUsername"
                value={userData?.username || ''}
                readOnly
                disabled
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Change password</Label>
              <Input
                id="password"
                type="password"
                value={profileForm.password}
                onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="destructive" onClick={() => setShowProfileDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Navbar;