/** Cropped decorative illustration from the user's approved visual reference.
 * UI labels and buttons remain real Next.js components, not part of the picture.
 */
export default function RoyalArtwork() {
  return (
    <div className="royal-art-stage relative isolate mx-auto h-[360px] w-full max-w-[640px] overflow-hidden sm:h-[440px] lg:h-[540px]" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_47%_58%,rgba(215,147,57,.14),transparent_68%)]" />
      <div className="absolute inset-[5%_0_2%] overflow-hidden [mask-image:radial-gradient(ellipse_at_center,#000_48%,transparent_78%)]">
        <img
          src="/royal/reference-crown.jpg"
          alt=""
          width="190"
          height="184"
          decoding="async"
          fetchPriority="high"
          className="royal-reference-art absolute inset-0 h-full w-full object-contain"
        />
      </div>
      <div className="royal-art-sheen pointer-events-none absolute inset-0" />
      <span className="absolute bottom-[11%] left-[12%] size-1 rounded-full bg-[#FFE9AD] shadow-[0_0_20px_7px_rgba(224,151,47,.58)]" />
      <span className="absolute right-[15%] top-[32%] size-1 rounded-full bg-[#FFE9AD] shadow-[0_0_17px_6px_rgba(224,151,47,.62)]" />
    </div>
  );
}
