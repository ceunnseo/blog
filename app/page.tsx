import ThreeHero from "@/components/ThreeHero";

export default function Home() {
  return (
    <>
      {/* Three.js Hero Section */}
      <ThreeHero />

      {/* Content Section - appears after scrolling */}
      <main
        id="content-section"
        className="relative z-20 mt-[200vh] min-h-screen flex flex-col justify-center items-center px-12 py-20 opacity-0 translate-y-10 transition-all duration-800"
      >
        <div className="max-w-4xl text-center text-white">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Creative Developer & Designer
          </h1>
          <p className="text-lg opacity-80 leading-relaxed mb-4">
            안녕하세요. 저는{" "}
            <span className="inline-block px-2 py-1 bg-white/10 rounded font-medium">
              CEUNNSEO
            </span>
            입니다. 인터랙티브 웹 경험과 창의적인 디지털 솔루션을 만듭니다.
          </p>
          <p className="text-lg opacity-80 leading-relaxed mb-4">
            Three.js, WebGL, 그리고 최신 웹 기술을 활용하여 사용자에게 기억에
            남는 경험을 제공합니다.
          </p>
          <p className="text-lg opacity-80 leading-relaxed">
            스크롤을 통해 여정을 함께해주셔서 감사합니다.
          </p>
        </div>
      </main>
    </>
  );
}
