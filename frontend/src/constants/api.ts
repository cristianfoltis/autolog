export const API_ROUTES = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    GOOGLE: '/auth/google',
  },
  VEHICLES: {
    LIST: '/vehicles',
    DETAIL: (id: string) => `/vehicles/${id}`,
  },
  LOV: {
    MAKES: '/lov/makes',
    MODELS: (makeId: number) => `/lov/models?makeId=${makeId}`,
  },
} as const;
