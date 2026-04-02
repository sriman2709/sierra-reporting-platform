const MAP = {
  ACTIVE:         'green',
  APPROVED:       'green',
  READY:          'green',
  ON_TRACK:       'green',
  EXPIRING:       'yellow',
  AT_RISK:        'yellow',
  IN_REMEDIATION: 'yellow',
  PENDING:        'yellow',
  INCOMPLETE:     'orange',
  NOT_READY:      'red',
  CLOSED:         'gray',
  INACTIVE:       'gray',
  EXCEEDED:       'blue',
  Y:              'green',
  N:              'gray',
};

export default function StatusBadge({ value }) {
  if (value == null || value === '') return <span className="badge badge-gray">—</span>;
  const key = String(value).toUpperCase().replace(/\s+/g, '_');
  const color = MAP[key] || 'blue';
  return <span className={`badge badge-${color}`}>{value}</span>;
}
