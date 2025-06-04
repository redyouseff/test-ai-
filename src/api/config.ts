const API_BASE_URL = 'https://care-insight-api-9ed25d3ea3ea.herokuapp.com';

export const getApiUrl = (path: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
};

export const getWebsocketUrl = (): string => {
  return API_BASE_URL.replace('http', 'ws');
}; 