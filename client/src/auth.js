export const getUser  = () => JSON.parse(localStorage.getItem('user') || 'null');
export const getToken = () => localStorage.getItem('token');
export const isLoggedIn = () => !!getToken();

export function login(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
