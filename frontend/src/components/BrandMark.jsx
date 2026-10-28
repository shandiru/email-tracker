const BrandMark = ({ className = '' }) => (
  <span className={`brand-mark ${className}`} aria-hidden="true">
    <svg viewBox="0 0 40 40" fill="none" focusable="false">
      <rect x="1" y="1" width="38" height="38" rx="8" fill="currentColor" />
      <path d="M10 14.5h20v13H10v-13Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m10.8 15.5 9.2 7 9.2-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m11 26 6.4-5" stroke="#BFDBFE" strokeWidth="1.5" strokeLinecap="round" />
      <path d="m29 26-6.4-5" stroke="#BFDBFE" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </span>
);

export default BrandMark;
