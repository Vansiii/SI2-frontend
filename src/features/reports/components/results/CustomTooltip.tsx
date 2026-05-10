import { formatTooltipValue } from '../../utils/chartHelpers';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  valueFormat?: 'number' | 'currency' | 'percentage';
}

export function CustomTooltip({
  active,
  payload,
  label,
  valueFormat
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      {label && (
        <p
          style={{
            color: '#333333',
            fontWeight: 600,
            marginBottom: '8px',
            fontSize: '14px'
          }}
        >
          {label}
        </p>
      )}
      {payload.map((entry, index) => (
        <p
          key={index}
          style={{
            color: entry.color || '#666666',
            padding: '4px 0',
            fontSize: '13px',
            margin: 0
          }}
        >
          <span style={{ fontWeight: 500 }}>{entry.name}:</span>{' '}
          <span style={{ fontWeight: 600 }}>
            {formatTooltipValue(entry.value, valueFormat)}
          </span>
        </p>
      ))}
    </div>
  );
}
