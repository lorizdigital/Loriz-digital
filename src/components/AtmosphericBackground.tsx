export function AtmosphericBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
      <div className="atmos-blob atmos-blob-warm absolute -top-24 left-[6%] h-[26rem] w-[26rem] rounded-full" />
      <div className="atmos-blob atmos-blob-cool absolute right-[2%] top-[14%] h-[22rem] w-[22rem] rounded-full" />
    </div>
  );
}
