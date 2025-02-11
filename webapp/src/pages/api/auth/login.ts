'use server'

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const formData = await request.json()

  const data = {
    email: formData.email as string,
    password: formData.password as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 403 })
  }

  return new NextResponse(JSON.stringify({ message: 'Login successful' }), { status: 200 })
}
