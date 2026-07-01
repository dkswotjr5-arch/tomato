"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { subscribeAuth, handleRedirectResult } from "../lib/firebase";
import GameScreenshot from "./GameScreenshot";
import LoginModal from "./LoginModal";

/* ============================== 데이터 ============================== */

const STEPS = [
  {
    no: "01",
    ic: "✍️",
    title: "사연을 올린다",
    desc: "“내가 잘못한 걸까?” 판단이 서지 않는 일상의 딜레마를 광장에 제출하세요.",
    accent: "from-amber-400 to-orange-500",
  },
  {
    no: "02",
    ic: "🤖",
    title: "AI가 맞붙는다",
    desc: "AI 검사는 당신을 몰아세우고, AI 변호사는 당신을 변호합니다. 죄목까지 자동으로 생성돼요.",
    accent: "from-indigo-400 to-purple-500",
  },
  {
    no: "03",
    ic: "🍅",
    title: "광장이 판결한다",
    desc: "배심원단과 시민들이 실시간으로 유죄·무죄를 투표. 유죄가 확정되면 토마토 세례가 시작됩니다.",
    accent: "from-rose-400 to-red-500",
  },
];

const FEATURES = [
  { ic: "🤖", title: "AI 검사 vs 변호사", desc: "사연을 분석해 양측의 주장을 실시간으로 생성하는 자동 변론 시스템." },
  { ic: "🗳️", title: "실시간 배심원 투표", desc: "유죄냐 무죄냐, 광장에 모인 여론이 오늘의 판결을 가릅니다." },
  { ic: "🍅", title: "토마토 투척", desc: "좋아요는 없습니다. 유죄에겐 토마토, 억울함엔 응원 한 방을." },
  { ic: "🏘️", title: "아기자기 마을 생활", desc: "재판소·상점·정화소·고해소를 누비는 따뜻한 2D 광장." },
  { ic: "🎭", title: "캐릭터 커스터마이징", desc: "머리·의상·아이템으로 나만의 판사와 피고 캐릭터를 꾸며요." },
  { ic: "💰", title: "토마토·골드 경제", desc: "재판에 참여하고 보상을 모아 광장을 나만의 것으로." },
];

const CASES = [
  { title: "애인 휴대폰을 몰래 봤습니다", charge: "사생활침해죄", guilty: 61 },
  { title: "부모님 몰래 적금을 해지했습니다", charge: "횡령죄", guilty: 44 },
  { title: "친구를 결혼식에서 내쫓았습니다", charge: "인간관계파괴죄", guilty: 38 },
  { title: "리뷰를 별점 1점으로 남겼습니다", charge: "명예훼손죄", guilty: 52 },
  { title: "시험지를 몰래 봤습니다", charge: "부정행위방지법위반죄", guilty: 79 },
  { title: "층간소음을 위층에 항의했습니다", charge: "소음민원위반죄", guilty: 27 },
];

const HOOK_QUESTIONS = [
  "전 애인의 비밀을 말했습니다",
  "부모님을 요양원에 모셨습니다",
  "동생 용돈을 끊었습니다",
  "빌려준 돈을 독촉했습니다",
  "베란다에서 담배를 피웠습니다",
  "친구의 거짓말을 지적했습니다",
  "잃어버린 지갑을 안 돌려줬습니다",
  "회사 문제를 외부에 알렸습니다",
];

/* 떠다니는 토마토 장식 */
const FLOATERS = [
  { e: "🍅", top: "12%", left: "6%", size: "text-4xl", delay: "0s", rot: "-12deg" },
  { e: "⚖️", top: "22%", left: "88%", size: "text-3xl", delay: "1.1s", rot: "8deg" },
  { e: "🍅", top: "68%", left: "10%", size: "text-3xl", delay: "0.6s", rot: "10deg" },
  { e: "🥚", top: "74%", left: "82%", size: "text-3xl", delay: "1.6s", rot: "-6deg" },
  { e: "🍅", top: "44%", left: "94%", size: "text-2xl", delay: "0.3s", rot: "16deg" },
  { e: "👑", top: "8%", left: "60%", size: "text-2xl", delay: "2s", rot: "-8deg" },
];

/* ============================== 페이지 ============================== */

export default function Landing() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // 리다이렉트 로그인 복귀 처리 → 성공 시 게임으로
    handleRedirectResult().then((result) => {
      if (result && result.user) router.replace("/game");
    });
    const unsub = subscribeAuth((u) => setUser(u));
    return () => unsub();
  }, [router]);

  // CTA: 이미 로그인 상태면 바로 게임으로, 아니면 로그인 모달
  const startGame = useCallback(() => {
    if (user) router.push("/game");
    else setModalOpen(true);
  }, [user, router]);

  const onLoginSuccess = useCallback(() => {
    setModalOpen(false);
    router.push("/game");
  }, [router]);

  const ctaLabel = user ? "게임 계속하기 →" : "🍅 지금 재판 시작하기";

  return (
    <div className="landing-root relative min-h-screen bg-[#12121f] text-white">
      {/* 배경 글로우 레이어 (자체적으로 clip → 가로 스크롤/스티키 헤더 영향 없음) */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full bg-tomato/20 blur-[130px]" />
        <div className="absolute top-1/3 -right-40 h-[460px] w-[460px] rounded-full bg-indigo-600/20 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-amber-500/10 blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      <Nav ctaLabel={user ? "게임 계속하기" : "시작하기"} onStart={startGame} />

      <Hero ctaLabel={ctaLabel} onStart={startGame} />

      <HookBand />

      <HowItWorks />

      <Features />

      <Cases onStart={startGame} />

      <FinalCTA loggedIn={!!user} onStart={startGame} />

      <Footer />

      <LoginModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={onLoginSuccess} />
    </div>
  );
}

/* ============================== 네비게이션 ============================== */

function Nav({ ctaLabel, onStart }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#12121f]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#top" className="flex items-center gap-2 font-black tracking-tight">
          <span className="text-2xl">🍅</span>
          <span className="text-lg">토마토광장</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
          <a href="#how" className="transition hover:text-white">이용방법</a>
          <a href="#features" className="transition hover:text-white">특징</a>
          <a href="#cases" className="transition hover:text-white">오늘의 재판</a>
        </nav>
        <button
          onClick={onStart}
          className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 transition hover:bg-white/20"
        >
          {ctaLabel}
        </button>
      </div>
    </header>
  );
}

/* ============================== 히어로 ============================== */

function Hero({ ctaLabel, onStart }) {
  return (
    <section id="top" className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 md:pt-24">
      {/* 떠다니는 장식 */}
      <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
        {FLOATERS.map((f, i) => (
          <span
            key={i}
            className={`absolute ${f.size} animate-float-y opacity-80`}
            style={{ top: f.top, left: f.left, animationDelay: f.delay, "--rot": f.rot }}
          >
            {f.e}
          </span>
        ))}
      </div>

      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        {/* 좌측 카피 */}
        <div className="relative z-10 text-center lg:text-left">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[13px] font-medium text-white/75">
            <span className="h-2 w-2 rounded-full bg-tomato animate-glow" />
            AI가 여는 여론재판 · 베타 오픈
          </span>

          <h1 className="animate-fade-up mt-6 text-[2.7rem] font-black leading-[1.08] tracking-tight sm:text-6xl" style={{ animationDelay: "0.06s" }}>
            좋아요 대신,
            <br />
            <span className="text-gradient-tomato">토마토를 던져라</span> 🍅
          </h1>

          <p className="animate-fade-up mx-auto mt-6 max-w-xl text-[15.5px] leading-relaxed text-white/65 lg:mx-0 sm:text-lg" style={{ animationDelay: "0.12s" }}>
            억울한 일상 사연을 올리면 <b className="text-white/90">AI 검사와 변호사</b>가 맞붙고,
            배심원단이 유죄·무죄를 가립니다. 유죄라면 준비하세요 —
            광장의 토마토가 날아갑니다.
          </p>

          <div className="animate-fade-up mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start" style={{ animationDelay: "0.18s" }}>
            <button
              onClick={onStart}
              className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-tomato-light to-tomato px-8 py-4 text-base font-bold text-white shadow-xl shadow-tomato/30 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-tomato/40 active:translate-y-0 sm:w-auto"
            >
              <span className="relative z-10">{ctaLabel}</span>
              <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
            </button>
            <a
              href="#how"
              className="w-full rounded-full border border-white/15 bg-white/5 px-8 py-4 text-center text-base font-semibold text-white/85 transition hover:bg-white/10 sm:w-auto"
            >
              게임 미리보기 →
            </a>
          </div>

          <p className="animate-fade-up mt-5 text-[13px] text-white/45" style={{ animationDelay: "0.24s" }}>
            Google로 3초 시작 · 완전 무료 · 설치 필요 없음
          </p>

          <div className="animate-fade-up mt-8 flex flex-wrap justify-center gap-2.5 lg:justify-start" style={{ animationDelay: "0.3s" }}>
            {["⚖️ AI 자동 변론", "🗳️ 실시간 배심원", "🏘️ 2D 광장 라이프"].map((t) => (
              <span key={t} className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12.5px] text-white/70">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* 우측 목업 */}
        <div className="animate-fade-in relative z-10" style={{ animationDelay: "0.25s" }}>
          <div className="relative mx-auto max-w-[440px]">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-tomato/25 via-transparent to-indigo-500/25 blur-2xl" />
            <div className="relative rounded-[1.6rem] border border-white/10 bg-white/5 p-2.5 shadow-2xl backdrop-blur-sm">
              {/* 브라우저 바 */}
              <div className="mb-2 flex items-center gap-1.5 px-2 py-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                <span className="ml-2 truncate rounded-md bg-black/30 px-2 py-0.5 text-[10px] text-white/40">
                  tomato-square.app / 재판소
                </span>
              </div>
              <GameScreenshot type="court" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================== 후킹 배너 (마퀴) ============================== */

function HookBand() {
  const items = [...HOOK_QUESTIONS, ...HOOK_QUESTIONS];
  return (
    <section className="relative border-y border-white/5 bg-white/[0.02] py-5">
      <div className="mb-3 text-center text-[13px] font-semibold uppercase tracking-widest text-white/35">
        당신의 판결은?
      </div>
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="flex w-max animate-marquee">
          {items.map((q, i) => (
            <span
              key={i}
              className="mr-4 flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm text-white/70"
            >
              <span className="text-tomato-light">“</span>
              {q}
              <span className="text-tomato-light">”</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================== 이용방법 ============================== */

function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-5 py-24">
      <SectionHeading
        eyebrow="HOW IT WORKS"
        title={<>단 세 걸음이면, <span className="text-gradient-tomato">재판이 열립니다</span></>}
        sub="복잡한 규칙은 없어요. 사연을 올리고, AI에게 맡기고, 광장의 판결을 지켜보세요."
      />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <div
            key={s.no}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
          >
            <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${s.accent} text-2xl shadow-lg`}>
              {s.ic}
            </div>
            <div className="absolute right-6 top-6 text-5xl font-black text-white/[0.06] transition group-hover:text-white/[0.1]">
              {s.no}
            </div>
            <h3 className="text-xl font-bold">{s.title}</h3>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-white/60">{s.desc}</p>
            {i < STEPS.length - 1 && (
              <span className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-2xl text-white/15 md:block">
                →
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================== 특징 ============================== */

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-24">
      <SectionHeading
        eyebrow="WHY TOMATO SQUARE"
        title={<>그냥 게임이 아니라, <span className="text-gradient-tomato">하나의 작은 사회</span></>}
        sub="AI 재판부터 마을 생활까지 — 토마토광장을 채우는 여섯 가지."
      />

      {/* 목업 2종 + 문구 */}
      <div className="mt-14 grid items-center gap-8 lg:grid-cols-2">
        <div className="order-2 lg:order-1 space-y-5">
          {FEATURES.slice(0, 3).map((f) => (
            <FeatureRow key={f.title} {...f} />
          ))}
        </div>
        <div className="order-1 lg:order-2">
          <MockFrame label="tomato-square.app / 광장">
            <GameScreenshot type="town" />
          </MockFrame>
        </div>
      </div>

      <div className="mt-10 grid items-center gap-8 lg:grid-cols-2">
        <div>
          <MockFrame label="tomato-square.app / 상점">
            <GameScreenshot type="shop" />
          </MockFrame>
        </div>
        <div className="space-y-5">
          {FEATURES.slice(3).map((f) => (
            <FeatureRow key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureRow({ ic, title, desc }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-white/15 hover:bg-white/[0.05]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-xl">
        {ic}
      </div>
      <div>
        <h4 className="font-bold">{title}</h4>
        <p className="mt-1 text-[13.5px] leading-relaxed text-white/55">{desc}</p>
      </div>
    </div>
  );
}

function MockFrame({ label, children }) {
  return (
    <div className="relative mx-auto max-w-[440px]">
      <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-tr from-indigo-500/20 via-transparent to-tomato/20 blur-2xl" />
      <div className="relative rounded-[1.5rem] border border-white/10 bg-white/5 p-2.5 shadow-2xl">
        <div className="mb-2 flex items-center gap-1.5 px-2 py-1">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          <span className="ml-2 truncate rounded-md bg-black/30 px-2 py-0.5 text-[10px] text-white/40">
            {label}
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ============================== 오늘의 재판 ============================== */

function Cases({ onStart }) {
  return (
    <section id="cases" className="mx-auto max-w-6xl px-5 py-24">
      <SectionHeading
        eyebrow="TODAY'S TRIALS"
        title={<>지금 광장에서 <span className="text-gradient-tomato">뜨거운 사연들</span></>}
        sub="누군가는 유죄, 누군가는 무죄. 당신이라면 어느 쪽에 토마토를 던지겠어요?"
      />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CASES.map((c) => (
          <CaseCard key={c.title} {...c} />
        ))}
      </div>
      <div className="mt-12 text-center">
        <button
          onClick={onStart}
          className="rounded-full bg-white/10 px-7 py-3.5 font-semibold ring-1 ring-white/15 transition hover:bg-white/20"
        >
          더 많은 사연 재판하러 가기 →
        </button>
      </div>
    </section>
  );
}

function CaseCard({ title, charge, guilty }) {
  const notGuilty = 100 - guilty;
  return (
    <div className="group flex flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 transition hover:-translate-y-1 hover:border-tomato/40">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-md bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-300">
          ⚖️ {charge}
        </span>
        <span className="text-[11px] text-white/35">재판 진행중</span>
      </div>
      <h3 className="text-[15.5px] font-bold leading-snug text-white/95">“{title}”</h3>

      <div className="mt-auto pt-5">
        <div className="mb-1.5 flex justify-between text-[12px] font-semibold">
          <span className="text-red-400">유죄 {guilty}%</span>
          <span className="text-green-400">무죄 {notGuilty}%</span>
        </div>
        <div className="flex h-2.5 overflow-hidden rounded-full bg-white/10">
          <div className="bg-gradient-to-r from-red-500 to-rose-500" style={{ width: `${guilty}%` }} />
          <div className="bg-gradient-to-r from-emerald-500 to-green-500" style={{ width: `${notGuilty}%` }} />
        </div>
      </div>
    </div>
  );
}

/* ============================== 마지막 CTA ============================== */

function FinalCTA({ loggedIn, onStart }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#241026] via-[#1a1330] to-[#101024] px-6 py-20 text-center">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-tomato/25 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 right-10 text-8xl opacity-10 animate-float-y">🍅</div>
        <div className="pointer-events-none absolute left-10 top-10 text-6xl opacity-10 animate-float-y" style={{ animationDelay: "1s" }}>⚖️</div>

        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl font-black leading-tight sm:text-5xl">
            오늘, <span className="text-gradient-tomato">첫 재판의 판사</span>가
            <br className="hidden sm:block" /> 되어보세요
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[15px] text-white/60">
            사연을 올리고, 판결하고, 토마토를 던지는 광장.
            지금 바로 Google 계정으로 입장하세요.
          </p>
          <button
            onClick={onStart}
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-tomato-light to-tomato px-9 py-4 text-lg font-bold shadow-xl shadow-tomato/30 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-tomato/40"
          >
            {loggedIn ? "게임 계속하기 →" : "🍅 무료로 시작하기"}
          </button>
          <p className="mt-4 text-[12.5px] text-white/40">가입 즉시 토마토 10개 · 골드 지급</p>
        </div>
      </div>
    </section>
  );
}

/* ============================== 푸터 ============================== */

function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-white/40 sm:flex-row">
        <div className="flex items-center gap-2 font-bold text-white/70">
          <span className="text-xl">🍅</span> 토마토광장
        </div>
        <p className="text-center">좋아요 대신 토마토를 던져라</p>
        <p>© 2026 토마토광장</p>
      </div>
    </footer>
  );
}

/* ============================== 공통 ============================== */

function SectionHeading({ eyebrow, title, sub }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="text-[12.5px] font-bold uppercase tracking-[0.2em] text-tomato-light/80">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">{title}</h2>
      <p className="mt-4 text-[15px] leading-relaxed text-white/55">{sub}</p>
    </div>
  );
}
