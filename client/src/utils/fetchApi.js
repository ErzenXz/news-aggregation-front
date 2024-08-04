import { useUserStore } from '@/store/user';

export const fetchApi = async (url, options = {}) => {
  const baseUrl = import.meta.env.VITE_API_URL; // Use the main API URL

  const userStore = useUserStore();
  const token = userStore.token || localStorage.getItem('token');

  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${baseUrl}${url}`, {
      ...options,
      headers,
      credentials: 'include', // Include credentials if needed
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('response', response);
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};
