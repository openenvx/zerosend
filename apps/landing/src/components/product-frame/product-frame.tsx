export function ProductFrame() {
  return (
    <div className="relative overflow-hidden rounded-lg p-3 sm:p-4 md:rounded-xl md:p-8 lg:p-10">
      <div aria-hidden className="bg-plate-warm absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 12% 0%, rgba(255,255,255,0.5), transparent 58%), radial-gradient(80% 70% at 92% 100%, rgba(0,0,0,0.3), transparent 55%)',
          }}
        />
      </div>

      <div className="bg-ink-black shadow-browser relative z-10 overflow-hidden rounded-md md:rounded-lg">
        <div className="border-marketing-divider-bold flex h-9 items-center border-b px-4 select-none md:px-5 lg:h-12">
          <span aria-hidden className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-white/20 md:size-2" />
            <span className="size-1.5 rounded-full bg-white/20 md:size-2" />
            <span className="size-1.5 rounded-full bg-white/20 md:size-2" />
          </span>
        </div>

        <div className="w-full">
          <img
            alt="Zerosend email editor"
            className="block h-auto w-full"
            src="/hero-img.png"
          />
        </div>
      </div>
    </div>
  );
}
