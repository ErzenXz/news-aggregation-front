import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchApi } from '@/utils/fetchApi';

export const useCategoryStore = defineStore('category', () => {
  const categories = ref([]);
  const selectedCategories = ref([]);
  const articles = ref({});
  const currentPage = ref({});
  const itemsPerPage = ref(10);
  const preferencesLoaded = ref(false); // Flag to indicate if preferences are loaded

  const fetchCategories = async () => {
    const now = new Date();
    const lastFetched = new Date(localStorage.getItem('lastFetchedCategories'));
    const cachedCategories = localStorage.getItem('categories');

    if (cachedCategories && now - lastFetched < 24 * 60 * 60 * 1000) {
      categories.value = JSON.parse(cachedCategories);
      console.log('Using cached categories:', categories.value);
    } else {
      try {
        const response = await fetchApi('/category/all');
        console.log('API response:', response);

        if (response && response.value && Array.isArray(response.value.Value)) {
          categories.value = response.value.Value.map((category) => ({
            id: category.Id,
            name: category.Name,
            description: category.Description,
            articles: category.Articles,
          }));
          localStorage.setItem('categories', JSON.stringify(categories.value));
          localStorage.setItem('lastFetchedCategories', now.toISOString());
          console.log('Categories fetched:', categories.value);
        } else {
          console.error('Unexpected data format for categories:', response);
        }
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    }
  };

  const fetchArticlesByCategory = async (categoryId, page = 1) => {
    try {
      const url = `/article/category?categoryId=${categoryId}&range=${itemsPerPage.value}&page=${page}`;
      const data = await fetchApi(url);

      if (Array.isArray(data)) {
        articles.value[categoryId] = data;
        currentPage.value[categoryId] = page;
      } else {
        console.error('Unexpected data format for articles:', data);
      }
    } catch (error) {
      console.error(`Failed to fetch articles for category ${categoryId}`, error);
    }
  };

  const savePreferencesToServer = async (preferences) => {
    try {
      await fetchApi('/preferences/add', {
        method: 'POST',
        body: JSON.stringify({ preferences }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Failed to save preferences', error);
    }
  };

  const setSelectedCategories = async (newCategories) => {
    selectedCategories.value = newCategories;
    await savePreferencesToServer(newCategories);
  };

  const initializeFromServer = async () => {
    try {
      if (!preferencesLoaded.value) {
        const data = await fetchApi('/user/view-preferences');
        if (data && Array.isArray(data)) {
          selectedCategories.value = data;
          preferencesLoaded.value = true; // Set flag after loading preferences
        } else {
          console.error('Unexpected data format for preferences:', data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user preferences', error);
    }
  };

  const addCategory = async (category) => {
    if (!selectedCategories.value.some((c) => c.id === category.id) && selectedCategories.value.length < 9) {
      selectedCategories.value.push(category);
      await setSelectedCategories(selectedCategories.value);
    }
  };

  const removeCategory = async (category) => {
    try {
      // Remove category from local state first
      selectedCategories.value = selectedCategories.value.filter((cat) => cat.id !== category.id);
  
      // Attempt to remove category from server
      const response = await fetchApi(`/preferences/remove/${category.id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error(`Failed to remove category, status: ${response.status}`);
      }
  
      // Update preferences on server
      await setSelectedCategories(selectedCategories.value);
    } catch (error) {
      console.error('Failed to remove category from preferences', error);
    }
  };
  

  const setPage = (categoryId, page) => {
    currentPage.value[categoryId] = page;
    fetchArticlesByCategory(categoryId, page);
  };

  return {
    categories,
    selectedCategories,
    articles,
    currentPage,
    itemsPerPage,
    fetchCategories,
    fetchArticlesByCategory,
    setSelectedCategories,
    initializeFromServer,
    addCategory,
    removeCategory,
    setPage,
  };
});
