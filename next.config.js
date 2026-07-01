/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // 이 게임(app/game)은 initGame()에서 캔버스/DOM 리스너를 명령형으로 바인딩한다.
  // StrictMode의 개발 모드 이중 마운트는 요소 리스너를 중복 등록시켜(재판소 나가기 2중
  // 오버레이, 채팅 토글 상쇄 등) 프로덕션과 다르게 동작하므로 비활성화한다.
  reactStrictMode: false,
};

module.exports = nextConfig;
