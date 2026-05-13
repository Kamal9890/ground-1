import React from "react";
import authBackground from "../../assets/Login__img.jpeg";

type Props = {
  children: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  rightWidth?: number;
};

export default function AuthLayout({
  children,
  title,
  subtitle,
  rightWidth = 520,
}: Props) {
  return (
    <section className="h-screen w-full flex items-center justify-center bg-white overflow-hidden px-4">
      {/* Canvas */}
      <div className="relative w-full max-w-[1120px] rounded-4xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.12)]">

        {/* ===== BACKGROUND LAYERS ===== */}

        {/* Background image — hidden on mobile, visible on md+ */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden md:block"
          style={{
            backgroundImage: `url(${authBackground})`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        />

        {/* Mobile fallback background (solid/gradient, no image) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 block md:hidden bg-gray-50"
        />

        {/* Right metallic gloss — only on md+ since image is only on md+ */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-full w-[38%] hidden md:block"
          style={{
            background:
              "radial-gradient(120% 140% at 0% 50%, rgba(195,195,195,0.65) 0%, rgba(214,214,214,0.45) 36%, rgba(240,240,240,0.18) 72%, rgba(255,255,255,0) 90%), linear-gradient(180deg, rgba(185,185,185,0.45) 0%, rgba(210,210,210,0.32) 45%, rgba(255,255,255,0) 100%)",
            WebkitMaskImage:
              "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.08) 8%, rgba(0,0,0,0.35) 20%, rgba(0,0,0,1) 34%)",
            maskImage:
              "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.08) 8%, rgba(0,0,0,0.35) 20%, rgba(0,0,0,1) 34%)",
          }}
        />

        {/* ===== CONTENT ===== */}
        <div className="relative flex flex-col md:grid md:grid-cols-[1fr_auto] gap-8 p-4 md:p-8">

          {/* Illustration placeholder (left) — only on md+ */}
          <div className="hidden md:flex items-center justify-center pl-6">
            {/* <img src={loginimg} alt="illustration" className="h-full w-full object-contain select-none" draggable={false} /> */}
          </div>

          {/* Form card (right) */}
          <div
            className="bg-white/95 backdrop-blur-[2px] rounded-[16px] border border-black/10 shadow-[0_10px_28px_rgba(0,0,0,0.08)] px-6 py-7 md:px-8 w-full md:w-[var(--form-width)]"
            style={{ "--form-width": `${rightWidth}px` } as React.CSSProperties}
          >
            <div className="text-center mb-6">
              <h1 className="text-[22px] font-extrabold tracking-[-0.01em]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-[14px] text-[#777B7F]">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}