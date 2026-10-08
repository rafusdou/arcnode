export default function PageHeader({ eyebrow, title, sub, actions }) {
  return (
    <header className="page-header">
      <div className="page-header-inner">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </header>
  );
}
