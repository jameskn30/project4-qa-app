
# Project Name

## 1. Project statement

For livestreamer, live instructor, followers can chat to ask questions, problem is there are too many asking the same time, their questions are not answered, 

Fix: use LLM to group these answers and let users upvote the questions that is most relevant to them. Instructor can choose to answer with most relevant questions, or randomly. 

App should be easy to start, paste link and users can join,

subscription with $10/month or so will enable a room of 500+ people

Make it modern, fast, reliable, beautiful app.

## 2. Tech stack
Next.js
LLM agent: haystack
Docker
Groq API
Firebase : user auth, db 

## Frontend setup

1. Start next.js 
npx create-next-app@latest

2. add vitest framework (https://nextjs.org/docs/app/building-your-application/testing/vitest)
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths
add vitest.config.mts

3. 


