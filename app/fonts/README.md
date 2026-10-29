# Local fonts

These font files are bundled with the app so builds and visitors do not need
Google Fonts network access. `app/layout.tsx` loads each family once through
`next/font/local`, retaining the existing CSS variables and weight choices.

| Family | Included weights | License |
| --- | --- | --- |
| Geist | Variable 100–900 | `Geist-OFL.txt` |
| Geist Mono | Variable 100–900 | `GeistMono-OFL.txt` |
| Anton | 400 | `Anton-OFL.txt` |
| Barlow Condensed | 400, 500, 600, 700, 800 | `BarlowCondensed-OFL.txt` |
| Dancing Script | Variable file; loaded at 500–600 | `DancingScript-OFL.txt` |

Geist, Geist Mono, Anton and Dancing Script were imported from the existing Nexus
standalone portfolio assets, with their bundled SIL Open Font License notices.
Upstream projects are identified in those notices. Barlow Condensed's five TTF
files and OFL notice came from the official
[Google Fonts repository](https://github.com/google/fonts/tree/main/ofl/barlowcondensed).

The TTF files were converted to WOFF2 with FontTools without subsetting or changing
the glyph designs. Validation compared the Unicode maps, glyph order, declared
weights and variable axes before and after conversion, including accented
characters used by the five site languages. Conversion is a preparation step;
the app has no font-conversion dependency at build time or runtime.
