import { createServerClient } from "@supabase/ssr";
import { url } from "inspector";
import { NextResponse, type NextRequest } from "next/server";

export const updateSession = async (request: NextRequest) => {
    let supabaseResponse = NextResponse.next({
        request
    })

    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookieToSet) {

                        cookieToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))

                        supabaseResponse = NextResponse.next({ request })

                        cookieToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    }
                }
            }
        )

        const { data: { user } } = await supabase.auth.getUser()

        if (!user && request.nextUrl.pathname !== '/' && !request.nextUrl.pathname.startsWith('/room') 
            && !request.nextUrl.pathname.startsWith("/api/chat")
            && !request.nextUrl.pathname.startsWith("/chatapi")
            && !request.nextUrl.pathname.startsWith("/experiment")
        
        ) {
            console.log('redirecting back to welcome page')
            //if user not authenticated and not on welcome page, redirect to welcome page  
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }

    } catch(error){
        console.error('error occured in middleware : ', error)
        return NextResponse.redirect('/error')
    } 

    return supabaseResponse
}