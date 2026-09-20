# Hero fonts

Alibaba PuHuiTi 3, self-hosted with `next/font/local` in `app/hero-font.ts`.
Downloaded from Alibaba's official font service:

`https://fonts.alibabadesign.com/AlibabaPuHuiTi-3/{name}/{name}.woff2`

Names: `AlibabaPuHuiTi-3-55-Regular`, `AlibabaPuHuiTi-3-65-Medium`,
`AlibabaPuHuiTi-3-75-SemiBold`.

Regular retains the full character set for editable Chinese input. Medium
contains ASCII and U+2192. SemiBold contains ASCII, U+2014 and the characters
in `TOKEN 制作的作品集`. Fixed-copy changes may require regenerating subsets.
Subsets were generated with fontTools `pyftsubset --flavor=woff2 --name-IDs=*`,
preserving original name metadata. Original full files can be downloaded from
the URLs above. CSS variable `--font-hero` is applied only within `#top`.
