import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServices } from '@/lib/admin/services';
import { AdminShell } from '@/components/admin/layout/admin-shell';
import Link from 'next/link';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const { designs } = createServices(supabase);

  let statusCounts = { draft: 0, staged: 0, published: 0, archived: 0 };
  let recentDesigns: Awaited<ReturnType<typeof designs.list>>['data'] = [];

  try {
    [statusCounts, { data: recentDesigns }] = await Promise.all([
      designs.getStatusCounts(),
      designs.list(undefined, { page: 1, pageSize: 5 }),
    ]);
  } catch {
    // Tables may not exist yet if migrations haven't run
  }

  const totalDesigns = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <AdminShell>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-display text-ink-950">
          Dashboard
        </h1>
        <p className="font-body text-sm text-ink-500 mt-1">
          SyntaxPress Command Center — design pipeline overview
        </p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatusCard label="Total Designs" value={totalDesigns} />
        <StatusCard label="Drafts" value={statusCounts.draft} accent />
        <StatusCard label="Staged" value={statusCounts.staged} />
        <StatusCard label="Published" value={statusCounts.published} />
      </div>

      <div className="h-px bg-ink-200 mb-8" />

      {/* Recent designs */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl tracking-display text-ink-950">
          Recent Designs
        </h2>
        <Link
          href="/admin/designs"
          className="font-mono text-2xs uppercase tracking-widest text-ink-400 hover:text-press transition-colors"
        >
          View All &rarr;
        </Link>
      </div>

      {recentDesigns.length === 0 ? (
        <div className="bg-paper border border-ink-200 px-6 py-12 text-center">
          <p className="font-display text-lg text-ink-400 italic mb-3">
            No designs yet
          </p>
          <Link href="/admin/designs" className="btn-press text-xs">
            Create Your First Design
          </Link>
        </div>
      ) : (
        <div className="bg-paper border border-ink-200">
          {recentDesigns.map((design, i) => (
            <Link
              key={design.id}
              href={`/admin/designs/${design.id}`}
              className={`flex items-center justify-between px-5 py-4
                hover:bg-ink-50 transition-colors
                ${i > 0 ? 'border-t border-ink-100' : ''}`}
            >
              <div>
                <span className="font-display text-base tracking-display text-ink-900">
                  {design.title}
                </span>
                <span className="font-mono text-2xs text-ink-400 ml-3">
                  /{design.slug}
                </span>
              </div>
              <StatusBadge status={design.status} />
            </Link>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-10">
        <h2 className="font-display text-xl tracking-display text-ink-950 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            href="/admin/designs?action=new"
            title="New Design"
            description="Upload a design and generate platform listings"
          />
          <QuickAction
            href="/admin/designs?status=staged"
            title="Review Staged"
            description="Designs ready for platform upload"
          />
          <QuickAction
            href="/"
            title="View Storefront"
            description="See your live store"
            external
          />
        </div>
      </div>
    </AdminShell>
  );
}

function StatusCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className={`border px-5 py-4 ${accent ? 'border-press/30 bg-press/5' : 'border-ink-200 bg-paper'}`}>
      <p className="font-mono text-2xs uppercase tracking-widest text-ink-400 mb-1">
        {label}
      </p>
      <p className={`font-display text-3xl tracking-display ${accent ? 'text-press' : 'text-ink-950'}`}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-ink-200 text-ink-600',
    staged: 'bg-amber-100 text-amber-700',
    published: 'bg-emerald-100 text-emerald-700',
    archived: 'bg-ink-100 text-ink-400',
  };

  return (
    <span
      className={`font-mono text-2xs uppercase tracking-widest px-2 py-1 ${colors[status] ?? colors.draft}`}
    >
      {status}
    </span>
  );
}

function QuickAction({
  href,
  title,
  description,
  external,
}: {
  href: string;
  title: string;
  description: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      className="border border-ink-200 bg-paper px-5 py-4 group
        hover:border-ink-400 transition-colors"
    >
      <h3 className="font-mono text-xs uppercase tracking-widest text-ink-800
        group-hover:text-press transition-colors mb-1">
        {title}
        {external && <span className="ml-1 text-ink-300">↗</span>}
      </h3>
      <p className="font-body text-sm text-ink-500">{description}</p>
    </Link>
  );
}
