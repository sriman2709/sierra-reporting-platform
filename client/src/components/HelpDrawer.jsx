/**
 * HelpDrawer.jsx — Contextual slide-over help panel.
 * Appears from the right when the ? button is clicked in the top bar.
 * Content is driven by the current route via helpContent.js.
 */
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HELP_CONTENT } from './helpContent';

export default function HelpDrawer({ open, onClose }) {
  const { pathname } = useLocation();
  const navigate     = useNavigate();

  // Find the best matching help entry for the current path
  const content = HELP_CONTENT[pathname] || HELP_CONTENT['/'];

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.35)',
          zIndex: 1000,
          animation: 'fadeIn 0.15s ease',
        }}
      />

      {/* Drawer panel */}
      <div style={{
        position:   'fixed',
        top:        0,
        right:      0,
        bottom:     0,
        width:      420,
        maxWidth:   '95vw',
        background: '#fff',
        zIndex:     1001,
        display:    'flex',
        flexDirection: 'column',
        boxShadow:  '-4px 0 32px rgba(0,0,0,0.18)',
        animation:  'slideInRight 0.2s ease',
      }}>

        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${content.color}ee, ${content.color})`,
          padding: '20px 20px 16px',
          color: '#fff',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                fontSize: 28, width: 48, height: 48,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 10, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>{content.icon}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{content.label}</div>
                <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>Help & Guidance</div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)', border: 'none',
                color: '#fff', borderRadius: 8, width: 32, height: 32,
                cursor: 'pointer', fontSize: 16, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </div>
          <p style={{ margin: '12px 0 0', fontSize: 13, opacity: 0.9, lineHeight: 1.55 }}>
            {content.summary}
          </p>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

          {/* Tabs in this module */}
          {content.tabs?.length > 0 && (
            <Section title="Tabs in this module">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {content.tabs.map((tab, i) => (
                  <span key={i} style={{
                    background: '#f1f5f9', border: '1px solid #e2e8f0',
                    borderRadius: 6, padding: '4px 10px',
                    fontSize: 12, color: '#334155', fontWeight: 500,
                  }}>{tab}</span>
                ))}
              </div>
            </Section>
          )}

          {/* Tips */}
          {content.tips?.length > 0 && (
            <Section title="💡 Tips for this module">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {content.tips.map((tip, i) => (
                  <div key={i} style={{
                    background: '#fffbeb', border: '1px solid #fde68a',
                    borderRadius: 8, padding: '10px 12px',
                    fontSize: 13, color: '#78350f', lineHeight: 1.55,
                    display: 'flex', gap: 8,
                  }}>
                    <span style={{ flexShrink: 0, marginTop: 1 }}>→</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Ask Sierra Intelligence */}
          {content.ai_examples?.length > 0 && (
            <Section title="◈ Try asking Sierra Intelligence">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {content.ai_examples.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { navigate('/ai'); onClose(); }}
                    style={{
                      background: '#eff6ff', border: '1px solid #bfdbfe',
                      borderRadius: 8, padding: '9px 12px',
                      fontSize: 12, color: '#1d4ed8', fontWeight: 500,
                      cursor: 'pointer', textAlign: 'left',
                      lineHeight: 1.5, transition: 'all 0.12s',
                      display: 'flex', alignItems: 'flex-start', gap: 8,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; }}
                  >
                    <span style={{ color: '#3b82f6', flexShrink: 0 }}>›</span>
                    <span>"{q}"</span>
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
                Click any prompt to open Sierra Intelligence
              </p>
            </Section>
          )}

          {/* Full docs link */}
          <div style={{
            marginTop: 8, background: '#f8fafc',
            border: '1px solid #e2e8f0', borderRadius: 10,
            padding: '14px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
              Need more detail?
            </div>
            <button
              onClick={() => { navigate('/help'); onClose(); }}
              style={{
                background: content.color, color: '#fff',
                border: 'none', borderRadius: 8,
                padding: '8px 20px', fontSize: 12, fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Open Full Help Centre →
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn     { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 0.7,
        textTransform: 'uppercase', color: '#94a3b8',
        marginBottom: 10,
      }}>{title}</div>
      {children}
    </div>
  );
}
