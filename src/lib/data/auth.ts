//auth.ts
export const checkPermission = (allowedRoles: string[] = ["admin"]): boolean => {
  const userData = localStorage.getItem("user");
  if (!userData) return false;
  
  try {
    const user = JSON.parse(userData);
    return allowedRoles.includes(user.role);
  } catch {
    return false;
  }
};