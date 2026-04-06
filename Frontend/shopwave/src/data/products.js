// API base URL
export const API_BASE = process.env.REACT_APP_API_URL || 'https://amshine-backend.onrender.com/api';

// Helper to get image URL
export const getImageUrl = (images) => {
  if (!images || images.length === 0) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80';
  const img = images[0];
  if (img.startsWith('http')) return img;
  return `${API_BASE.replace('/api', '')}${img}`;
};

// Empty array as fallback
export const dummyProducts = [];
export const categories = [];
export default dummyProducts;
