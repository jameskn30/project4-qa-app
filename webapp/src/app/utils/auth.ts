import { createClient } from '@/utils/supabase/component';

const supabase = createClient();

export const login = async (formData: FormData) => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return {
            success: false,
            error: error
        }
    }

    return {
        success: true,
        error: null
    }
};

export const signout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        return {
            success: false,
            error: error
        }
    }

    return {
        success: true,
        error: null
    }
};

export const signup = async (formData: FormData) => {
    const fullname = formData.get('fullname') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signUp(
        {
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullname
                }
            }
        },
    );

    if (error) {
        console.log('sign up error ')
        console.error(error)
        return {
            success: false,
            error: error
        }
    }

    return {
        success: true,
        error: null
    }

};