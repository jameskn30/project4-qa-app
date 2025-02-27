const adjectives = [
  'Happy', 'Clever', 'Brave', 'Calm', 'Swift', 
  'Bright', 'Wild', 'Quiet', 'Fancy', 'Wise',
  'Green', 'Blue', 'Red', 'Gold', 'Silver',
  'Crisp', 'Fresh', 'Grand', 'Royal', 'Rapid'
];

const nouns = [
  'Tiger', 'Eagle', 'River', 'Cloud', 'Stone',
  'Flower', 'Forest', 'Ocean', 'Planet', 'Summit',
  'Dragon', 'Phoenix', 'Thunder', 'Mountain', 'Star',
  'Moon', 'Sun', 'Galaxy', 'Breeze', 'Diamond'
];

export const generateRandomRoomName = (): string => {
  // Select random adjective and noun
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)].toLocaleLowerCase();
  const noun = nouns[Math.floor(Math.random() * nouns.length)].toLowerCase();
  
  // Generate 2 random digits
  const digits = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  // Combine to create room name
  return `${adjective} ${noun} ${digits}`;
};
