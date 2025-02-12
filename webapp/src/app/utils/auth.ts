import { createClient } from '@/utils/supabase/component';

const supabase = createClient();

export const onLoginHandle = async (formData: FormData) => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return false;
    }

    return true;
};

export const onSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        return false;
    }
    return true;
};
