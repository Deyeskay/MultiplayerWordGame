import { v4 as uuidv4 } from 'uuid';

export function getOrCreateUUID() {
  let id = localStorage.getItem("playerUUID");
  if (!id) {
    id = uuidv4();
    localStorage.setItem("playerUUID", id);
  }
  return id;
}
