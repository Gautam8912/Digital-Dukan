export function EmptyState({ emoji, title, subtitle, action, children, compact }) {
  return (
    <div className={`empty-state ${compact ? 'empty-compact' : ''}`}>
      {emoji && <div className="empty-emoji">{emoji}</div>}
      {title && <h3 className="empty-title">{title}</h3>}
      {subtitle && <p className="empty-sub">{subtitle}</p>}
      {children}
      {action && (
        <button className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}
