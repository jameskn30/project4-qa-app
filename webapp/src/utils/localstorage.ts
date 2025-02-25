// Store user session data
export const storeSessionData = (roomId: string, username: string, questionsLeft: number, upvotesLeft: number) => {
    const sessionData = {
        roomId,
        username,
        questionsLeft,
        upvotesLeft,
        lastConnected: new Date().getTime()
    };
    localStorage.setItem('qa-session', JSON.stringify(sessionData));
};

// Retrieve session data
export const getStoredSessionData = () => {
    const data = localStorage.getItem('qa-session');
    if (data) {
        const sessionData = JSON.parse(data);
        // Check if session is still valid (e.g., within last 24 hours)
        const now = new Date().getTime();
        const sessionAge = now - sessionData.lastConnected;
        if (sessionAge < 24 * 60 * 60 * 1000) { // 24 hours
            return sessionData;
        }
        removeSession()
    }
    return null;
};

export const removeSession =() => {
    localStorage.removeItem('qa-session');
}