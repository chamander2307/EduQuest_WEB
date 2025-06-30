import { jwtDecode } from "jwt-decode";

export function getUserIdFromToken() {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token); 
    return Number(decoded.sub);
  } catch {
    return null;
  }
}
