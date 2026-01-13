export default function BarChart({ data, height = 200 }) {
  if (!data || data.length === 0) return <div>No data</div>;

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div style={{ height: `${height}px`, display: 'flex', alignItems: 'flex-end', gap: '1rem', paddingBottom: '20px' }}>
      {data.map((item, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '100%', 
            backgroundColor: item.color || 'var(--color-accent)', 
            height: `${(item.value / maxValue) * (height - 40)}px`,
            borderRadius: '4px 4px 0 0',
            opacity: 0.9,
            transition: 'height 0.3s'
          }} title={`${item.label}: ${item.value}`}></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
