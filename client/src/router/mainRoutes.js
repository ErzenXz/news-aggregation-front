export const mainRoutes = [
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        {
          path: 'categories',
          name: 'Categories',
          component: () => import('@/views/Category/CategoriesView.vue'),
        },
        {
          path: 'for-you',
          name: 'ForYou',
          component: () => import('@/views/PersonalizedFeed/ForYouView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'news/:id',
          name: 'News',
          component: () => import('@/components/NewsPage/NewsView.vue'),
        },
        {
          path: 'category/:name',
          name: 'Category',
          component: () => import('@/views/Category/CategoryView.vue'),
          props: true,
        },
        {
          path: 'source/:id',
          name: 'Source',
          component: () => import('@/views/Source/SourceView.vue'),
        },
      ],
    },
  ];
  