// Predefined default avatar options for clients when no custom photo is provided
export const DEFAULT_AVATARS = [
  { id: 'fire', label: 'Flame', emoji: '🔥', gradient: 'from-amber-500 to-red-600' },
  { id: 'cherries', label: 'Cherries', emoji: '🍒', gradient: 'from-pink-500 to-rose-600' },
  { id: 'devil', label: 'Spicy', emoji: '😈', gradient: 'from-purple-600 to-indigo-700' },
  { id: 'cat', label: 'Feline', emoji: '🐆', gradient: 'from-orange-500 to-amber-600' },
  { id: 'bunny', label: 'Playful', emoji: '🐰', gradient: 'from-fuchsia-500 to-pink-600' },
  { id: 'gem', label: 'Diamond', emoji: '💎', gradient: 'from-cyan-500 to-blue-600' },
  { id: 'lips', label: 'Kiss', emoji: '💋', gradient: 'from-red-500 to-pink-700' },
  { id: 'sparkles', label: 'Glam', emoji: '✨', gradient: 'from-yellow-400 to-amber-600' },
  { id: 'peach', label: 'Juicy', emoji: '🍑', gradient: 'from-orange-400 to-rose-500' },
];

export function getAvatarById(id) {
  return DEFAULT_AVATARS.find(a => a.id === id) || DEFAULT_AVATARS[0];
}

