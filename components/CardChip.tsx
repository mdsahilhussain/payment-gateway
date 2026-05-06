export function CardChip() {
    return (
      <svg
        viewBox="0 0 56 44"
        xmlns="http://www.w3.org/2000/svg"
        className="card-chip"
        aria-hidden
      >
        <defs>
          <linearGradient id="chipGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d4a72c" />
            <stop offset="50%" stopColor="#f7d774" />
            <stop offset="100%" stopColor="#a07820" />
          </linearGradient>
        </defs>
        <rect
          x="0.5"
          y="0.5"
          width="55"
          height="43"
          rx="6"
          fill="url(#chipGrad)"
          stroke="#8a6620"
          strokeWidth="0.6"
        />
        {/* contact pads */}
        <path
          d="M 8 8 V 36 M 18 8 V 36 M 28 8 V 36 M 38 8 V 36 M 48 8 V 36"
          stroke="#8a6620"
          strokeWidth="0.5"
          fill="none"
        />
        <path
          d="M 0 14 H 56 M 0 22 H 56 M 0 30 H 56"
          stroke="#8a6620"
          strokeWidth="0.5"
          fill="none"
        />
        <rect
          x="14"
          y="14"
          width="28"
          height="16"
          rx="2"
          fill="none"
          stroke="#8a6620"
          strokeWidth="0.7"
        />
      </svg>
    );
  }