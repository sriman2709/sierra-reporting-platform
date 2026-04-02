export default function SectionCard({ title, action, children }) {
  return (
    <div className="section-card">
      <div className="section-header">
        <h3>{title}</h3>
        {action && <div>{action}</div>}
      </div>
      <div className="section-body">{children}</div>
    </div>
  );
}
