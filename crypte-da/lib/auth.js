// Gestion de la session utilisateur côté client
export const getUser = () => {
  if (typeof window === 'undefined') return null
  const data = sessionStorage.getItem('crypte_user')
  return data ? JSON.parse(data) : null
}

export const setUser = (user) => {
  sessionStorage.setItem('crypte_user', JSON.stringify(user))
}

export const logout = () => {
  sessionStorage.removeItem('crypte_user')
}
