import { io } from "socket.io-client";
const socket = io("https://multiplayerwordgame.onrender.com");
export default socket;
