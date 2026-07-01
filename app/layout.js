import "./globals.css";

export const metadata = {
  title: "토마토광장 — 좋아요 대신 토마토를 던져라",
  description:
    "억울한 일상 사연을 올리면 AI 검사와 변호사가 맞붙고, 배심원단이 유죄·무죄를 가리는 AI 여론재판 게임. Google로 3초 만에 무료 시작.",
  keywords: ["토마토광장", "AI 재판", "여론재판", "게임", "토마토", "배심원"],
  openGraph: {
    title: "토마토광장 — 좋아요 대신 토마토를 던져라",
    description: "AI 검사와 변호사가 맞붙는 여론재판 게임. 유죄라면? 토마토가 날아갑니다 🍅",
    type: "website",
    locale: "ko_KR",
  },
};

export const viewport = {
  themeColor: "#12121f",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}