export function generateRandomUsername(): string {
    const adjectives = ["Quick", "Lazy", "Happy", "Sad", "Bright", "Dark", "Clever", "Brave"];
    const nouns = ["Fox", "Dog", "Cat", "Mouse", "Bear", "Lion", "Tiger", "Wolf"];
  
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumbers = Math.floor(100 + Math.random() * 900); // Generates a random number between 100 and 999
  
    return `${randomAdjective}_${randomNoun}_${randomNumbers}`;
  }