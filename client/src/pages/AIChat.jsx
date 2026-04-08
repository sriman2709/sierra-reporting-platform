import { useState, useRef, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const API_URL = '/api/ai/query';
const token   = () => localStorage.getItem('token');

const COLORS = ['#2563eb','#16a34a','#dc2626','#d97706','#7c3aed','#0891b2'];

// ── Suggested opening prompts — covers all 14 domains ─────────────────────
const SUGGESTED = [
  // Finance & Grants
  'Which grants are at risk of expiring in the next 90 days?',
  'Show me compliance posture and burn rate for all grants.',
  'Which funds are over budget or critically low on available balance?',
  'Run a budget variance analysis by department.',
  // Procurement & Treasury
  'Which contracts are expiring in the next 60 days?',
  'Which vendors have the highest risk scores?',
  'What is the AP aging situation — how much is overdue?',
  'Show me our current cash position and upcoming debt service payments.',
  // Operations
  'Which capital projects are delayed or at risk?',
  'Show me assets with critical condition ratings and open emergency work orders.',
  'Which inventory items are out of stock or critically low across all warehouses?',
  // Workforce & Fleet
  'What is our vacancy rate and how many positions are unfilled?',
  'Which vehicles are out of service or overdue for inspection?',
  'What is fleet fuel cost by department this fiscal year?',
  // Cross-domain
  'What are our biggest operational risks across all domains this month?',
  'Show me the full cost picture for Public Works — budget, assets, fleet, and staff.',
  'How much are we spending on grant-funded employees?',
  'Which departments are over budget AND have critical asset failures?',
];

// Rotate SUGGESTED — show 8 at a time, starting from a random offset
const INITIAL_SHOWN = (() => {
  const start = Math.floor(Math.random() * (SUGGESTED.length - 8));
  return SUGGESTED.slice(start, start + 8);
})();

// ── Chart renderer ─────────────────────────────────────────────────────────
function ChartBlock({ chart }) {
  if (!chart || chart.type === 'none') return null;
  const { type, title, data, xKey, yKeys } = chart;
  return (
    <div style={{ marginTop: 16, background: '#f8fafc', borderRadius: 10, padding: '16px 8px' }}>
      <p style={{ fontWeight: 600, fontSize: 13, color: '#334155', marginBottom: 10, paddingLeft: 8 }}>{title}</p>
      <ResponsiveContainer width="100%" height={260}>
        {type === 'bar' ? (
          <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={xKey} tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 10 }} width={60} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            {(yKeys || []).map((k, i) => (
              <Bar key={k} dataKey={k} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={xKey} tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 10 }} width={60} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            {(yKeys || []).map((k, i) => (
              <Line key={k} type="monotone" dataKey={k} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        ) : type === 'pie' ? (
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {(data || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12 }} />
          </PieChart>
        ) : <div />}
      </ResponsiveContainer>
    </div>
  );
}

// ── Follow-up suggestion chips ─────────────────────────────────────────────
function FollowUps({ followUps, onAsk, disabled }) {
  if (!followUps?.length) return null;
  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed #e2e8f0' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: 0.8, marginBottom: 6, textTransform: 'uppercase' }}>
        Continue exploring ↓
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {followUps.map((q, i) => (
          <button
            key={i}
            onClick={() => !disabled && onAsk(q)}
            disabled={disabled}
            style={{
              background: disabled ? '#f8fafc' : '#f0f7ff',
              border: `1px solid ${disabled ? '#e2e8f0' : '#bfdbfe'}`,
              borderRadius: 8, padding: '7px 12px',
              fontSize: 12, color: disabled ? '#94a3b8' : '#1d4ed8',
              cursor: disabled ? 'not-allowed' : 'pointer',
              textAlign: 'left', fontWeight: 500,
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
            onMouseEnter={e => {
              if (!disabled) {
                e.currentTarget.style.background = '#dbeafe';
                e.currentTarget.style.borderColor = '#93c5fd';
              }
            }}
            onMouseLeave={e => {
              if (!disabled) {
                e.currentTarget.style.background = '#f0f7ff';
                e.currentTarget.style.borderColor = '#bfdbfe';
              }
            }}
          >
            <span style={{ color: '#3b82f6', flexShrink: 0, fontSize: 11 }}>›</span>
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Message bubble ─────────────────────────────────────────────────────────
function Message({ msg, onAsk, isLatestAssistant, loading }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      gap: 10,
      marginBottom: 18,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
        background: isUser ? '#2563eb' : '#1e293b',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, color: '#fff', fontWeight: 700,
      }}>
        {isUser ? '👤' : '✦'}
      </div>

      <div style={{ maxWidth: '78%' }}>
        <div style={{
          background: isUser ? '#2563eb' : '#fff',
          color: isUser ? '#fff' : '#1e293b',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          padding: '12px 16px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          lineHeight: 1.6,
          fontSize: 14,
        }}>
          {msg.content}
          {msg.chart && <ChartBlock chart={msg.chart} />}
          {/* Show follow-ups only on latest assistant message and when not loading */}
          {!isUser && isLatestAssistant && !loading && msg.follow_ups?.length > 0 && (
            <FollowUps followUps={msg.follow_ups} onAsk={onAsk} disabled={loading} />
          )}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 18 }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: '#1e293b',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, color: '#fff',
      }}>✦</div>
      <div style={{
        background: '#fff', borderRadius: '18px 18px 18px 4px',
        padding: '14px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%', background: '#94a3b8',
            animation: 'bounce 1.2s infinite',
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Main AIChat ─────────────────────────────────────────────────────────────
export default function AIChat() {
  const [messages, setMessages] = useState([{
    role:       'assistant',
    content:    'Hello! I\'m Sierra Intelligence — your AI analyst for the full platform. I have live access to all 14 modules: Grants, Funds, Finance, Procurement, Treasury, Subawards, Outcomes, Audit, Capital Projects, Assets, Inventory, HR, Fleet, and Forecasting — all from SAP HANA Cloud. Ask me anything across any domain.',
    chart:      null,
    follow_ups: [],
  }]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(question) {
    const q = (question || input).trim();
    if (!q || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q, chart: null, follow_ups: [] }]);
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setMessages(prev => [...prev, {
        role:       'assistant',
        content:    data.answer,
        chart:      data.chart?.type !== 'none' ? data.chart : null,
        follow_ups: data.follow_ups || [],
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role:       'assistant',
        content:    `Sorry, I ran into an error: ${err.message}`,
        chart:      null,
        follow_ups: [],
      }]);
    } finally {
      setLoading(false);
    }
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  // Index of the latest assistant message (for follow-up placement)
  const latestAssistantIdx = messages.reduce(
    (last, m, i) => m.role === 'assistant' ? i : last, -1
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#1e293b 0%,#2563eb 100%)',
        borderRadius: 12, padding: '18px 24px', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
        }}>✦</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: 18, fontWeight: 700 }}>Sierra Intelligence</h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
            AI Analyst · Live SAP HANA Cloud data · 14 modules · Powered by Sierra AI
          </p>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.12)', borderRadius: 8,
          padding: '6px 14px', fontSize: 11, color: 'rgba(255,255,255,0.85)',
          fontWeight: 600,
        }}>
          46 tools · All domains
        </div>
      </div>

      {/* Opening suggested prompts (only before first user message) */}
      {messages.length === 1 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, color: '#64748b', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Try asking across any domain…
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {INITIAL_SHOWN.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                style={{
                  background: '#f1f5f9', border: '1px solid #e2e8f0',
                  borderRadius: 20, padding: '6px 14px',
                  fontSize: 12, color: '#334155', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.target.style.background = '#e0e7ff'; e.target.style.borderColor = '#6366f1'; }}
                onMouseLeave={e => { e.target.style.background = '#f1f5f9'; e.target.style.borderColor = '#e2e8f0'; }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message thread */}
      <div style={{
        flex: 1, overflowY: 'auto', paddingRight: 4,
        scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent',
      }}>
        {messages.map((m, i) => (
          <Message
            key={i}
            msg={m}
            onAsk={send}
            isLatestAssistant={i === latestAssistantIdx}
            loading={loading}
          />
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{
        marginTop: 12, display: 'flex', gap: 10, alignItems: 'flex-end',
        background: '#fff', borderRadius: 14, padding: '10px 12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Ask anything about grants, funds, procurement, assets, HR, fleet, treasury, outcomes…"
          rows={1}
          disabled={loading}
          style={{
            flex: 1, border: 'none', outline: 'none', resize: 'none',
            fontSize: 14, lineHeight: 1.5, color: '#1e293b',
            background: 'transparent', fontFamily: 'inherit',
            maxHeight: 120, overflowY: 'auto',
          }}
          onInput={e => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          style={{
            width: 38, height: 38, borderRadius: 10,
            background: loading || !input.trim() ? '#e2e8f0' : '#2563eb',
            border: 'none', cursor: loading || !input.trim() ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: loading || !input.trim() ? '#94a3b8' : '#fff',
            fontSize: 16, flexShrink: 0, transition: 'all 0.15s',
          }}
        >➤</button>
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
        Enter to send · Shift+Enter for new line · Follow-up suggestions appear after each answer
      </p>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
