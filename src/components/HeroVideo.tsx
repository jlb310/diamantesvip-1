export function HeroVideo() {
  return (
    <section className="relative overflow-hidden flex items-center justify-center" style={{ height: '500px' }}>
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/video-top.mp4" type="video/mp4" />
      </video>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 z-[1]" />

      {/* Centered content */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-3xl md:text-5xl font-bold text-white font-serif italic tracking-wide mb-3 drop-shadow-lg">
          Diamantes Vip
        </h1>
        <p className="text-white/90 text-base md:text-lg font-light tracking-wider max-w-xl mx-auto drop-shadow-md">
          El directorio más exclusivo de acompañantes en Chile
        </p>
      </div>
    </section>
  )
}
