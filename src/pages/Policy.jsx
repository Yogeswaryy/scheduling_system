import { POLICY } from '../lib/constants';
import { PageTitle } from '../components/ui';

export default function Policy() {
  return (
    <div className="page policy">
      <PageTitle searchPlaceholder="Ask about leave policy, eligibility or requirements…">{POLICY.title}</PageTitle>
      <article className="glass card policy-body">
        <p>
          <strong>Last updated: {POLICY.updated}</strong>
        </p>
        {POLICY.blocks.map((b, i) => (
          <section key={i}>
            {b.h && <h3 className="policy-h">{b.h}</h3>}
            {b.p && <p>{b.p}</p>}
            {b.list && (
              <ul>
                {b.list.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>
    </div>
  );
}
