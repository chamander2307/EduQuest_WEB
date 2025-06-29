import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";

// URL websocket server của bạn
const SOCKET_URL = "http://localhost:8080/ws";
let stompClient = null;

export function connectSocket(onConnect, onError) {
  if (stompClient && stompClient.connected) {
    onConnect && onConnect(stompClient);
    return stompClient;
  }

  stompClient = new Client({
    // Sử dụng SockJS cho transport
    webSocketFactory: () => new SockJS(SOCKET_URL),
    debug: function (str) {
      // Bỏ comment nếu muốn log debug
      // console.log(str);
    },
    reconnectDelay: 5000,
    onConnect: () => {
      onConnect && onConnect(stompClient);
    },
    onStompError: (frame) => {
      onError && onError(frame);
    },
  });

  stompClient.activate(); // Thay cho .connect()
  return stompClient;
}

export function disconnectSocket() {
  if (stompClient && stompClient.active) {
    stompClient.deactivate();
  }
}
