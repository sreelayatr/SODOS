export function BrandLogo({ className = '' }) {
  return (
    <img
      className={`brand-logo ${className}`.trim()}
      src="/sudos-logo.jpg?v=3"
      alt="Sodos — The House of Premium"
    />
  );
}
