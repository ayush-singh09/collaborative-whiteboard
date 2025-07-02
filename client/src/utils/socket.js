import { io } from "socket.io-client";

const socket = io("http://localhost:3002"); // replace with server URL in prod

export default socket;