// Centralized API configuration pointing to live Railway production by default with local override support
export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  'https://ai-powered-business-operations-saas-production.up.railway.app';
