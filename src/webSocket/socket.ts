import { Server } from "socket.io";

interface SocketIo {
  userId: string;
  message?: string;
}

interface WebRTCMessage {
  type: string;
  targetId: number;
  sdp?: RTCSessionDescription;
  candidate?: RTCIceCandidate;
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

    // 로그아웃 시, 사용자 정보 삭제
    socket.on("user_logout", (userId) => {
      delete userSockets[userId];
      console.log(`User ${userId} logged out at ${new Date().toISOString()}`);
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
    socket.on("check_user_status", (userId, callback) => {
      console.log("check_user_status", userId);
      const socketId = userSockets[userId];
      console.log("socketId", socketId);
      const status = socketId ? true : false;
      callback(status);

      //변경전 코드 -> 새로운 이밴트를 클라이언트에서 수신을 해야 함
      // const socketId = userSockets[userId];
      // if (socketId) {
      //   socket.emit("user_status", true);
      // } else {
      //   socket.emit("user_status", false);
      // }
    });

    //대화 상대에게 입력중임을 알리는 함수
    socket.on("onchange_message", ({ targetId, status }) => {
      const socketId = userSockets[targetId];
      if (socketId) {
        io.to(socketId).emit("onchange_message", status);
      }
    });

    socket.on("webrtc_offer", ({ targetId, fromId, sdp }) => {
      const targetSocketId = userSockets[targetId];

      if (targetSocketId) {
        io.to(targetSocketId).emit("webrtc_offer", {
          sdp,
          fromId: fromId, // 발신자의 실제 ID를 전달
        });
      }
    });

    socket.on("webrtc_answer", ({ targetId, fromId, sdp }) => {
      const targetSocketId = userSockets[targetId];
      if (targetSocketId) {
        io.to(targetSocketId).emit("webrtc_answer", {
          sdp,
          fromId: fromId, // 발신자의 실제 ID를 전달
        });
      }
    });

    socket.on("webrtc_ice", ({ targetId, fromId, candidate }) => {
      const targetSocketId = userSockets[targetId];
      if (targetSocketId) {
        io.to(targetSocketId).emit("webrtc_ice", {
          candidate,
          fromId: fromId, // 발신자의 실제 ID를 전달
        });
      }
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

    // 소켓 연결 종료 시 인터벌 정리
    socket.on("disconnect", () => {
      clearInterval(checkInterval);
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
  });
}
