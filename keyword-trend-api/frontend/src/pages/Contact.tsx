import { useState } from 'react';
import { Seo } from '../components/Seo';
import { Breadcrumbs, PageContainer } from '../components/Breadcrumbs';
import { CONTACT_EMAIL, CONTACT_PHONE } from '../lib/site';

type Status = 'idle' | 'submitting' | 'sent' | 'error';

export default function Contact() {
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    // Open the user's mail client with a prefilled message.
    const subject = encodeURIComponent(form.subject || 'LeanForge inquiry');
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    );
    const href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    try {
      window.location.href = href;
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <Seo
        title="Contact"
        description="Contact the LeanForge team. Email hello@developer312.com or use the form to send us a message about keywords, API, partnerships, or anything else."
        path="/contact"
      />
      <Breadcrumbs items={[{ label: 'Contact' }]} />
      <PageContainer>
        <section className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-white/50 text-sm sm:text-base">
            Questions, partnerships, or feedback — we read everything.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          <div className="glass-card p-6 space-y-3">
            <h2 className="text-lg font-bold">Direct</h2>
            <div className="text-sm space-y-2 text-white/60">
              <p>
                <span className="text-white/40 block text-xs uppercase tracking-wider mb-1">
                  Email
                </span>
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p>
                <span className="text-white/40 block text-xs uppercase tracking-wider mb-1">
                  Phone
                </span>
                <a href={`tel:${CONTACT_PHONE.replace(/[^\d+]/g, '')}`} className="hover:underline">
                  {CONTACT_PHONE}
                </a>
              </p>
              <p>
                <span className="text-white/40 block text-xs uppercase tracking-wider mb-1">
                  Operator
                </span>
                Developer312, a subsidiary of NIGHT LITE USA LLC
              </p>
            </div>
          </div>

          <form
            onSubmit={onSubmit}
            className="glass-card p-6 space-y-3"
            aria-label="Contact form"
          >
            <h2 className="text-lg font-bold">Send a message</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs space-y-1">
                <span className="text-white/60">Name</span>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none text-sm"
                />
              </label>
              <label className="text-xs space-y-1">
                <span className="text-white/60">Email</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none text-sm"
                />
              </label>
            </div>
            <label className="text-xs space-y-1 block">
              <span className="text-white/60">Subject</span>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none text-sm"
              />
            </label>
            <label className="text-xs space-y-1 block">
              <span className="text-white/60">Message</span>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none text-sm resize-y"
              />
            </label>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="btn-primary justify-center disabled:opacity-50"
            >
              {status === 'submitting' ? 'Opening email…' : 'Send'}
            </button>
            {status === 'sent' && (
              <p className="text-xs text-brand-green">
                Your email client should be opening. If not, copy the address above.
              </p>
            )}
            {status === 'error' && (
              <p className="text-xs text-brand-red">
                Something went wrong. Email us directly at {CONTACT_EMAIL}.
              </p>
            )}
          </form>
        </section>
      </PageContainer>
    </>
  );
}
