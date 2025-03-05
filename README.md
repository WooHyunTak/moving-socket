## Moving Service Web Socket Server

# 🗨️ 실시간 채팅 서버 (Socket.io + Express)

이 프로젝트는 `socket.io`와 `express`를 사용하여 실시간 채팅을 지원하는 서버를 구축하는 프로젝트입니다.  
사용자 로그인 시 `userId`와 `socketId`를 매핑하여 특정 사용자에게 독립적인 메시지 전송이 가능합니다.

## 🚀 기술 스택

- **Node.js** - 서버 환경
- **Express** - 백엔드 프레임워크
- **Socket.io** - 실시간 양방향 통신

## 📌 주요 기능

- ✅ **사용자 로그인 시 `userId`와 `socketId` 매핑**
- ✅ **특정 사용자에게 개별 메시지 전송**
- ✅ **전체 사용자에게 브로드캐스트 메시지 전송**
- ✅ **사용자가 접속 종료 시 `socketId` 해제**

## 프로젝트 실행
```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```
