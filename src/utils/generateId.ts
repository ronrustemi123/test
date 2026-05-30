const STORAGE_KEY = "anon_user_id";

function generateId() {
  // modern browsers
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // fallback (works everywhere)
  return "anon_" + Date.now() + "_" + Math.random().toString(16).slice(2);
}

export function getAnonId(): string {
  let id = localStorage.getItem(STORAGE_KEY);

  if (!id) {
    id = generateId();
    localStorage.setItem(STORAGE_KEY, id);
  }

  return id;
}
