import { Server } from "socket.io";

interface SocketIo {
  userId: number;
  message?: string;
}

export const userSockets: { [key: string]: string } = {};

// setupSocket 함수 정의 및 내보내기
export function setupSocket(io: Server) {
  io.on("connection", (socket) => {
    // 클라이언트로부터 유저 ID 등록 받기
    socket.on("register", ({ userId }: SocketIo) => {
      userSockets[userId] = socket.id;
      console.log(`User ${userId} registered with socket ID: ${socket.id}`);
    });

    // 특정 유저에게 메시지 전송 함수
    socket.on("sendToUser", ({ userId, message }: SocketIo) => {
      const socketId = userSockets[userId];
      if (socketId) {
        io.to(socketId).emit("message", { content: message });
      }
    });

    // 메시지 전송 함수
    socket.on("send_message", ({ targetId, message }) => {
      const socketId = userSockets[targetId];
      if (socketId) {
        io.to(socketId).emit("message", message);
      } else {
        socket.emit("message", "상대방이 로그아웃 상태 입니다.");
      }
    });

    // 유저 로그인 상태 확인 함수
    socket.on("check_user_status", (userId) => {
      const socketId = userSockets[userId];
      if (socketId) {
        socket.emit("user_status", true);
      } else {
        socket.emit("user_status", false);
      }
    });

    //대화 상대에게 입력중임을 알리는 함수
    socket.on("onchange_message", ({ targetId, status }) => {
      const socketId = userSockets[targetId];
      if (socketId) {
        io.to(socketId).emit("onchange_message", status);
      }
    });

    // 유저 연결 해제 시, 매핑 정보 삭제
    socket.on("user_disconnect", (userId) => {
      delete userSockets[userId];
      console.log(`User ${userId} disconnected`);
    });

    // 소켓 연결 해제 시, 매핑 정보 삭제
    socket.on("disconnect", () => {
      for (const [userId, id] of Object.entries(userSockets)) {
        if (id === socket.id) {
          delete userSockets[userId];
          console.log(
            `User ${userId} disconnected at ${new Date().toISOString()}`
          );
          break;
        }
      }
    });

    // 주기적으로 소켓 연결 상태 확인
    const checkInterval = setInterval(() => {
      for (const [userId, socketId] of Object.entries(userSockets)) {
        if (!io.sockets.sockets.get(socketId)) {
          delete userSockets[userId];
          console.log(`Cleaned up inactive user ${userId}`);
        }
      }
    }, 30000); // 30초마다 확인

    // 소켓 연결 종료 시 인터벌 정리
    socket.on("disconnect", () => {
      clearInterval(checkInterval);
    });
  });
}
