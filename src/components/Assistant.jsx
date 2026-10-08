import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { askAssistant } from '../lib/calc';

const SUGGESTIONS = ['Who is off next week?', 'Which days are below minimum staffing?', 'Show high-impact requests'];

/** "How can I help you today?" — answers from the live leave data (no external AI call). */
export default function Assistant() {
  const { state } = useStore();
  const [q, setQ] = useState('');
  const [answer, setAnswer] = useState(null);

  const ask = (text) => {
    const t = (text ?? q).trim();
    if (!t) return;
    setQ(t);
    setAnswer({ q: t, ...askAssistant(state, t) });
  };

  return (
    <section className="assistant">
      <form
        className="ask"
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
      >
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="How can I help you today?" aria-label="Ask about your team's leave" />
        <button className="ask-go" type="submit" aria-label="Ask">
          <Send size={18} />
        </button>
      </form>
      <div className="chips">
        {SUGGESTIONS.map((s) => (
          <button key={s} className="chip" onClick={() => ask(s)}>
            {s}
          </button>
        ))}
      </div>
      {answer && (
        <div className="answer glass">
          <div className="answer-head">
            <strong>{answer.title}</strong>
            <button className="link-btn" onClick={() => setAnswer(null)}>
              Clear
            </button>
          </div>
          <ul>
            {answer.items.map((it, i) => (
              <li key={i}>{it.to ? <Link to={it.to}>{it.text}</Link> : it.text}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
