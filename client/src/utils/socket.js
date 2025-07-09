import { io } from 'socket.io-client';

const socket = io("https://multiplayerwordgame.onrender.com"); // Replace with your backend URL if different
export default socket;
