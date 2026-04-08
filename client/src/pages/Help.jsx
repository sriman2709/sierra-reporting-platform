/**
 * Help.jsx — Full in-app help centre at /help
 * Searchable across all modules, glossary, and Sierra AI prompt library.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HELP_CONTENT, HELP_SECTIONS, GLOSSARY } from '../components/helpContent';

const TABS = ['Modules', 'Sierra AI', 'Glossary'];

// ── Module card (expandable) ───────────────────────────────────────────────
function ModuleCard({ path, query }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const c = HELP_CONTENT[path];
  if (!c) return null;

  // Filter by search query
  if (query) {
    const q = query.toLowerCase();
    const matches =
      c.label.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.tips?.some(t => t.toLowerCase().includes(q)) ||
      c.ai_examples?.some(e => e.toLowerCase().includes(q)) ||
      c.tabs?.some(t => t.toLowerCase().includes(q));
    if (!matches) return null;
  }

  return (
    <div style={{
      background: '#fff', border: `1.5px solid ${expanded ? c.color : '#e2e8f0'}`,
      borderRadius: 12, overflow: 'hidden',
      boxShadow: expanded ? `0 4px 20px ${c.color}22` : '0 1px 4px rgba(0,0,0,0.06)',
      transition: 'all 0.18s',
    }}>
      {/* Card header — always visible */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', background: 'none', border: 'none',
          padding: '16px 20px', cursor: 'pointer', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 14,
        }}
      >
        <span style={{
          fontSize: 24, width: 44, height: 44,
          background: c.color + '15', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, border: `1px solid ${c.color}30`,
        }}>{c.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{c.label}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, lineHeight: 1.4 }}>
            {c.summary.slice(0, 90)}{c.summary.length > 90 ? '…' : ''}
          </div>
        </div>
        <div style={{
          color: expanded ? c.color : '#94a3b8',
          fontSize: 18, flexShrink: 0,
          transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s',
        }}>⌄</div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${c.color}20`, padding: '16px 20px 20px' }}>

          {/* Full summary */}
          <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.65, marginBottom: 16 }}>
            {c.summary}
          </p>

          {/* Tabs */}
          {c.tabs?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 8 }}>Tabs</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {c.tabs.map((tab, i) => (
                  <span key={i} style={{
                    background: '#f1f5f9', border: '1px solid #e2e8f0',
                    borderRadius: 6, padding: '3px 10px',
                    fontSize: 12, color: '#334155', fontWeight: 500,
                  }}>{tab}</span>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {c.tips?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 8 }}>💡 Tips</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {c.tips.map((tip, i) => (
                  <div key={i} style={{
                    background: '#fffbeb', border: '1px solid #fde68a',
                    borderRadius: 8, padding: '9px 12px',
                    fontSize: 12, color: '#78350f', lineHeight: 1.55,
                    display: 'flex', gap: 8,
                  }}>
                    <span style={{ flexShrink: 0 }}>→</span><span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI examples */}
          {c.ai_examples?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 8 }}>◈ Ask Sierra Intelligence</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {c.ai_examples.map((q, i) => (
                  <div key={i} style={{
                    background: '#eff6ff', border: '1px solid #bfdbfe',
                    borderRadius: 7, padding: '7px 12px',
                    fontSize: 12, color: '#1d4ed8', lineHeight: 1.5,
                    display: 'flex', gap: 8,
                  }}>
                    <span style={{ color: '#3b82f6', flexShrink: 0 }}>›</span>
                    <span>"{q}"</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => navigate(path)}
            style={{
              background: c.color, color: '#fff', border: 'none',
              borderRadius: 8, padding: '8px 18px', fontSize: 12,
              fontWeight: 700, cursor: 'pointer',
            }}
          >Open {c.label} →</button>
        </div>
      )}
    </div>
  );
}

// ── AI prompt library ──────────────────────────────────────────────────────
const AI_PROMPTS = [
  { category: 'Cross-Domain Risk', prompts: [
    'What are our biggest operational risks across all domains this month?',
    'Which departments are over budget AND have critical asset failures?',
    'What is the full cost picture for Public Works — budget, assets, fleet, and staff?',
    'Show me all HIGH-severity alerts across every module.',
  ]},
  { category: 'Financial Health', prompts: [
    'Which funds are over budget or critically low on available balance?',
    'Show me budget vs actuals by department for the current fiscal year.',
    'What is our current cash position and upcoming debt service payments?',
    'Run a sensitivity analysis — what happens if revenue drops 10%?',
  ]},
  { category: 'Grants & Compliance', prompts: [
    'Which grants are over-burning their budget this quarter?',
    'Show me compliance posture for all federal grants.',
    'Which subrecipients are high risk and what findings do they have?',
    'Which grant-funded programs are not meeting their performance targets?',
  ]},
  { category: 'Procurement & Vendors', prompts: [
    'Which contracts are expiring in the next 60 days?',
    'Which vendors have the highest risk scores?',
    'How much AP is 90+ days overdue and which vendors are responsible?',
    'Are any of our active vendors on the debarment watchlist?',
  ]},
  { category: 'Operations', prompts: [
    'Which assets have a critical condition rating and open emergency work orders?',
    'Which vehicles are out of service or have overdue inspections?',
    'Which inventory items are out of stock across all warehouses?',
    'Which capital projects are delayed or have change orders above 10%?',
  ]},
  { category: 'Workforce', prompts: [
    'What is our vacancy rate and which departments have the most unfilled positions?',
    'How many FTEs are grant-funded and which grants are they charged to?',
    'What is total payroll cost by fund — General Fund vs grants?',
    'Which departments have the highest turnover rates this year?',
  ]},
];

function PromptLibrary() {
  const navigate = useNavigate();
  return (
    <div>
      {AI_PROMPTS.map((cat, i) => (
        <div key={i} style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: '#1d4ed8',
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: 8, padding: '6px 12px', marginBottom: 10,
            display: 'inline-block',
          }}>{cat.category}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {cat.prompts.map((p, j) => (
              <div
                key={j}
                onClick={() => navigate('/ai')}
                style={{
                  background: '#fff', border: '1.5px solid #e2e8f0',
                  borderRadius: 8, padding: '10px 14px',
                  fontSize: 13, color: '#334155', lineHeight: 1.5,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'all 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.background = '#f0f7ff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; }}
              >
                <span style={{ color: '#3b82f6', fontSize: 16, flexShrink: 0 }}>◈</span>
                <span>"{p}"</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>
        Click any prompt to open Sierra Intelligence
      </p>
    </div>
  );
}

// ── Glossary ───────────────────────────────────────────────────────────────
function GlossaryTab({ query }) {
  const filtered = query
    ? GLOSSARY.filter(g =>
        g.term.toLowerCase().includes(query.toLowerCase()) ||
        g.def.toLowerCase().includes(query.toLowerCase())
      )
    : GLOSSARY;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 10 }}>
        {filtered.map((g, i) => (
          <div key={i} style={{
            background: '#fff', border: '1.5px solid #e2e8f0',
            borderRadius: 10, padding: '12px 16px',
          }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 4 }}>{g.term}</div>
            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>{g.def}</div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40, fontSize: 14 }}>
          No glossary terms match "{query}"
        </div>
      )}
    </div>
  );
}

// ── Main Help page ─────────────────────────────────────────────────────────
export default function Help() {
  const [activeTab, setActiveTab] = useState('Modules');
  const [query, setQuery]         = useState('');

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 48 }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b, #334155)',
        borderRadius: 14, padding: '28px 32px', marginBottom: 28, color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <span style={{ fontSize: 32 }}>❓</span>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Sierra Help Centre</h1>
            <p style={{ margin: '4px 0 0', opacity: 0.75, fontSize: 13 }}>
              Guides, tips, and Sierra AI prompt library for all 14 modules
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            fontSize: 16, color: '#94a3b8',
          }}>🔍</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search modules, tips, glossary terms…"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)',
              borderRadius: 10, padding: '11px 14px 11px 42px',
              color: '#fff', fontSize: 14, outline: 'none',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer', fontSize: 16,
              }}
            >✕</button>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#f1f5f9', borderRadius: 10, padding: 4 }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '9px 16px', borderRadius: 8, border: 'none',
              background: activeTab === tab ? '#fff' : 'transparent',
              color: activeTab === tab ? '#0f172a' : '#64748b',
              fontWeight: activeTab === tab ? 700 : 500,
              fontSize: 13, cursor: 'pointer',
              boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}
          >{tab}</button>
        ))}
      </div>

      {/* Modules tab */}
      {activeTab === 'Modules' && (
        <div>
          {HELP_SECTIONS.map(section => {
            // Check if any module in this section matches the search
            const visibleItems = section.items.filter(path => {
              if (!query) return true;
              const c = HELP_CONTENT[path];
              if (!c) return false;
              const q = query.toLowerCase();
              return c.label.toLowerCase().includes(q) ||
                c.summary.toLowerCase().includes(q) ||
                c.tips?.some(t => t.toLowerCase().includes(q)) ||
                c.ai_examples?.some(e => e.toLowerCase().includes(q));
            });
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.heading} style={{ marginBottom: 28 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: 0.8,
                  textTransform: 'uppercase', color: '#94a3b8',
                  marginBottom: 12, paddingLeft: 2,
                }}>{section.heading}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {section.items.map(path => (
                    <ModuleCard key={path} path={path} query={query} />
                  ))}
                </div>
              </div>
            );
          })}
          {query && HELP_SECTIONS.every(s =>
            s.items.every(p => {
              const c = HELP_CONTENT[p];
              if (!c) return true;
              const q = query.toLowerCase();
              return !(c.label.toLowerCase().includes(q) ||
                c.summary.toLowerCase().includes(q) ||
                c.tips?.some(t => t.toLowerCase().includes(q)) ||
                c.ai_examples?.some(e => e.toLowerCase().includes(q)));
            })
          ) && (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: 48, fontSize: 14 }}>
              No modules match "{query}" — try the Glossary tab
            </div>
          )}
        </div>
      )}

      {/* Sierra AI tab */}
      {activeTab === 'Sierra AI' && (
        <div>
          <div style={{
            background: '#eff6ff', border: '1.5px solid #bfdbfe',
            borderRadius: 12, padding: '16px 20px', marginBottom: 24,
            fontSize: 13, color: '#1d4ed8', lineHeight: 1.6,
          }}>
            <strong>Sierra Intelligence</strong> has live access to all 14 modules via 46 data tools.
            After every answer it generates 3 context-aware follow-up suggestions.
            Click any prompt below to open Sierra Intelligence with it ready to send.
          </div>
          <PromptLibrary />
        </div>
      )}

      {/* Glossary tab */}
      {activeTab === 'Glossary' && <GlossaryTab query={query} />}
    </div>
  );
}
