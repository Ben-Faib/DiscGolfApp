/**
 * Event images utility - Frontend-only image mapping for events
 * Since images are not stored in the backend, we map event IDs to park backgrounds
 */

// Park/nature background images from Unsplash (free for commercial use)
const PARK_IMAGES = [
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', // Dense forest path
  'https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=800', // Misty forest
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800', // Sunlit forest
  'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800', // Fall forest colors
  'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800', // Sunny open park
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', // Mountain valley
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800', // Rolling hills
  'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800', // Lake with trees
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800', // Mountain lake scenic
  'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800', // Forest sunbeams
];

/**
 * Get a consistent image for an event based on its ID
 * Uses modulo to cycle through available images
 */
export function getEventImage(eventId: number): string {
  const index = (eventId - 1) % PARK_IMAGES.length;
  return PARK_IMAGES[index >= 0 ? index : 0];
}

/**
 * Get image by event name (for cases where we only have the name)
 * Creates a hash from the name for consistent assignment
 */
export function getEventImageByName(eventName: string): string {
  let hash = 0;
  for (let i = 0; i < eventName.length; i++) {
    const char = eventName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % PARK_IMAGES.length;
  return PARK_IMAGES[index];
}

export { PARK_IMAGES };

