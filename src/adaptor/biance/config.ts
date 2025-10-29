// 从 localStorage 读取 API Key 和 Secret，如果没有则返回默认值
export const getApiKey = (): string => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('apiKey') || 'RJKPkTREsqmT6kSYoKby6Liit2E4i8t6qGsac2IOwdT94PhwStZu5REt6cQdRd6j';
  }
  return 'RJKPkTREsqmT6kSYoKby6Liit2E4i8t6qGsac2IOwdT94PhwStZu5REt6cQdRd6j';
};

export const getApiSecret = (): string => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('apiSecret') || 'mofkW3kMibeLfY4JmQvS5qIbjTPXlVtQhbKh5MQKEIQoKmKJJQVxkWzi2LRQ97ch';
  }
  return 'mofkW3kMibeLfY4JmQvS5qIbjTPXlVtQhbKh5MQKEIQoKmKJJQVxkWzi2LRQ97ch';
};

// 为了向后兼容，导出默认值（已废弃，优先使用 getApiKey 和 getApiSecret）
export const API_KEY = getApiKey();
export const API_SECRET = getApiSecret();