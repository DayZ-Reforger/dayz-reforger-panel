const KEY = 'dayz-reforger-token';

export const tokenStore = {
  get() {
    return window.localStorage.getItem(KEY);
  },
  set(token: string) {
    window.localStorage.setItem(KEY, token);
  },
  clear() {
    window.localStorage.removeItem(KEY);
  }
};
