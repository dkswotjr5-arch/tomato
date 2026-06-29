import "./globals.css";

export const metadata = {
  title: "토마토광장",
  description: "좋아요 대신 토마토를 던져라!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}