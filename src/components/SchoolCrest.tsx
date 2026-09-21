export function SchoolCrest({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Alphason International School crest"
    >
      <path
        d="M60 2 L114 18 V70 C114 104 92 126 60 138 C28 126 6 104 6 70 V18 Z"
        fill="#3d8bc4"
      />
      <circle cx="60" cy="58" r="38" fill="white" />
      <path
        d="M45 46 C45 38 50 32 55 30 C52 34 51 40 53 46 L53 66 L45 66 Z"
        fill="#3d8bc4"
      />
      <path
        d="M75 46 C75 38 70 32 65 30 C68 34 69 40 67 46 L67 66 L75 66 Z"
        fill="#3d8bc4"
      />
      <rect x="42" y="66" width="36" height="20" rx="2" fill="#3d8bc4" />
      <g stroke="#3d8bc4" strokeWidth="1.4" fill="none">
        <path d="M40 92 h40 M40 96 h40 M40 100 h40 M40 104 h40" />
      </g>
      <path d="M40 90 v16 M80 90 v16 M60 88 v18" stroke="#3d8bc4" strokeWidth="1.6" />
      <text
        x="60"
        y="126"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill="white"
        fontFamily="Arial, sans-serif"
      >
        GOD IS OUR PRIORITY
      </text>
    </svg>
  );
}
