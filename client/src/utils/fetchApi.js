import { useUserStore } from '../store/user';

export const fetchApi = async (url, options = {}) => {
  const userStore = useUserStore();
  const token = userStore.token || localStorage.getItem('token');

  const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
    ...options,
    headers : {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': token ? `Bearer ${token}` : undefined,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

