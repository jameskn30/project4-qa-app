import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export const updateSession = async (request: NextRequest) => {
    let supabaseResponse = NextResponse.next({
        request
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies:{
                getAll() {
                    return request.cookies.getAll()
                  },
                setAll(cookieToSet){

                    cookieToSet.forEach(({name, value, options}) => request.cookies.set(name,value))

                    supabaseResponse = NextResponse.next({request})

                    cookieToSet.forEach(({name, value, options}) => 
                        supabaseResponse.cookies.set(name,value,options)
                    )
                }
            }
        }
    )

    const {data: {user}} = await supabase.auth.getUser()
    console.log('middleware')
    console.log(user)

    if (!user && !request.nextUrl.pathname.startsWith('/')){
        //if user not authenticated and not on welcome page, redirect to welcome page  
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}