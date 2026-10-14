export function BrandLogo({ className = '' }) {
  return (
    <img
      className={`brand-logo ${className}`.trim()}
      src="/sudos-logo-mark.png?v=5"
      alt="Sodos — The House of Premium"
    />
  );
}
