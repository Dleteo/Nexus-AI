import CrownMark from "../ui/CrownMark";

/** Decorative artwork inspired by the Royal Black reference; no baked-in UI or fake metrics. */
export default function RoyalArtwork() {
  return (
    <div className="royal-art-stage relative isolate mx-auto h-[350px] w-full max-w-[580px] overflow-hidden sm:h-[440px] lg:h-[530px]" aria-hidden="true">
      <div className="royal-art-aura absolute inset-[12%_-8%_9%] rounded-full bg-[radial-gradient(ellipse,rgba(179,112,26,.18),transparent_66%)] blur-2xl" />
      <svg viewBox="0 0 580 530" className="absolute inset-0 h-full w-full overflow-visible" role="presentation" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="royal-glow"><stop stopColor="#F8DC9F" stopOpacity=".9"/><stop offset=".25" stopColor="#E9AA51" stopOpacity=".45"/><stop offset="1" stopColor="#C88C31" stopOpacity="0"/></radialGradient>
          <linearGradient id="royal-rock" x1="0" y1="0" x2=".6" y2="1"><stop stopColor="#3D3528"/><stop offset=".36" stopColor="#1B1A18"/><stop offset="1" stopColor="#050505"/></linearGradient>
          <linearGradient id="royal-gold-line" x1="0" y1="0" x2="1" y2=".5"><stop stopColor="#714017" stopOpacity=".0"/><stop offset=".25" stopColor="#ECA943"/><stop offset=".52" stopColor="#FFF1BD"/><stop offset=".8" stopColor="#C38B3C"/><stop offset="1" stopColor="#FAD888" stopOpacity=".1"/></linearGradient>
          <linearGradient id="royal-onyx" x1=".1" y1="0" x2=".8" y2="1"><stop stopColor="#51515A"/><stop offset=".1" stopColor="#151519"/><stop offset=".55" stopColor="#08080A"/><stop offset=".88" stopColor="#272221"/><stop offset="1" stopColor="#61492D"/></linearGradient>
          <linearGradient id="royal-sheen" x1="0" y1="0" x2="1" y2=".9"><stop stopColor="#FFF2CF" stopOpacity=".72"/><stop offset=".19" stopColor="#C69148" stopOpacity=".16"/><stop offset=".64" stopColor="#020202" stopOpacity="0"/><stop offset="1" stopColor="#F7D08A" stopOpacity=".65"/></linearGradient>
          <linearGradient id="royal-letter-gold" x1="0" y1="0" x2=".85" y2="1">
            <stop stopColor="#FFF6D7"/>
            <stop offset=".22" stopColor="#F9DA95"/>
            <stop offset=".54" stopColor="#C98B37"/>
            <stop offset=".77" stopColor="#F7C977"/>
            <stop offset="1" stopColor="#8F571F"/>
          </linearGradient>
          <filter id="royal-halo" x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="11"/></filter>
          <filter id="royal-gold-bloom" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5"/></filter>
          <filter id="royal-spark"><feGaussianBlur stdDeviation="1.5"/></filter>
        </defs>
        <ellipse cx="302" cy="376" rx="216" ry="90" fill="url(#royal-glow)" opacity=".33" />
        <path d="M0 462 53 426 91 446 155 390 209 422 284 370 346 419 415 381 493 442 550 405 580 449V530H0Z" fill="url(#royal-rock)" stroke="#9A6831" strokeOpacity=".24"/>
        <path d="m0 499 84-30 68 23 93-51 77 42 74-31 71 39 62-18 51 22v35H0Z" fill="#080808"/>
        <path d="m66 455 83-55 53 30 82-58 39 29 25 18" fill="none" stroke="#E7BC70" strokeOpacity=".15" strokeWidth="2" />
        <path d="M29 354C61 218 129 252 185 331S412 504 550 304" stroke="#DA9941" strokeOpacity=".23" strokeWidth="21" fill="none" filter="url(#royal-gold-bloom)"/>
        <path className="royal-art-light" d="M-6 329 C38 225 96 273 135 335 S283 438 413 413 S557 349 590 291" stroke="url(#royal-gold-line)" strokeWidth="5" fill="none"/>
        <path className="royal-art-light-alt" d="M-22 362 C75 265 125 313 218 392 S455 484 578 336" stroke="#FFE4A7" strokeOpacity=".58" strokeWidth="1.8" fill="none"/>
        <path d="M115 408 C188 449 329 463 492 405" fill="none" stroke="#F7CE83" strokeOpacity=".48" strokeWidth="7" filter="url(#royal-gold-bloom)"/>
        <rect x="180" y="178" width="230" height="244" rx="42" fill="#030304" stroke="#CBA169" strokeOpacity=".7" strokeWidth="2"/>
        <rect x="185" y="182" width="220" height="234" rx="39" fill="url(#royal-onyx)" stroke="#947345" strokeOpacity=".38" strokeWidth="1.5"/>
        <path d="M204 192H374C386 192 396 201 396 214V383" fill="none" stroke="#FFF0C8" strokeOpacity=".15" strokeWidth="1.4"/>
        <path d="M190 255 211 192 224 194 198 285Z" fill="#FFF0BC" opacity=".1"/>
        <path d="M366 408 395 318 402 384Q399 413 366 408Z" fill="#FFC976" opacity=".09"/>
        <path d="M193 376C228 306 281 399 327 350S393 323 409 382" fill="none" stroke="#BD8A3A" strokeOpacity=".15" strokeWidth="2"/>
        {/* Render the monogram as real SVG text. CSS background-clip can expose its
            gradient as a solid rectangle when shorthand declarations override it. */}
        <text x="295" y="355" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="164" fontWeight="700" fill="#E8A84F" filter="url(#royal-gold-bloom)" opacity=".48">N</text>
        <text
          className="royal-emblem-letter"
          x="295" y="355" textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="164" fontWeight="700"
          fill="url(#royal-letter-gold)"
          stroke="#694019" strokeWidth=".9" paintOrder="stroke"
        >N</text>
        <text x="295" y="355" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="164" fontWeight="700" fill="none" stroke="#FFE6AF" strokeWidth=".55" strokeOpacity=".34">N</text>
        <path d="M100 454 C180 425 260 463 361 447 S526 397 584 370" fill="none" stroke="#FFDDA0" strokeWidth="2" strokeOpacity=".78"/>
        <g fill="#FFD98F">
          <circle cx="77" cy="286" r="2.5"/><circle cx="109" cy="343" r="1.7"/><circle cx="454" cy="355" r="2"/><circle cx="494" cy="403" r="2.6"/><circle cx="533" cy="319" r="1.6"/><circle cx="47" cy="403" r="1.2"/><circle cx="434" cy="212" r="1.2"/><circle cx="161" cy="168" r="1.7"/><circle cx="480" cy="247" r="1.4"/>
        </g>
        <g fill="#F4C980" opacity=".7">
          <circle cx="114" cy="309" r="8" filter="url(#royal-spark)"/><circle cx="498" cy="371" r="7" filter="url(#royal-spark)"/><circle cx="370" cy="444" r="5" filter="url(#royal-spark)"/>
        </g>
      </svg>
      <div className="royal-art-crown absolute left-1/2 top-[5%] z-20 -translate-x-1/2 drop-shadow-[0_0_26px_rgba(252,195,106,.47)]">
        <CrownMark size={158} />
      </div>
      <span className="absolute bottom-[8%] left-[14%] size-1.5 rounded-full bg-[#FFE7A8] shadow-[0_0_22px_7px_rgba(229,164,57,.63)]" />
      <span className="absolute right-[13%] top-[34%] size-1 rounded-full bg-[#FFE7A8] shadow-[0_0_17px_5px_rgba(229,164,57,.63)]" />
    </div>
  );
}
