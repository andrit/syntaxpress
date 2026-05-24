import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServices } from '@/lib/admin/services';
import { AdminShell } from '@/components/admin/layout/admin-shell';
import type { DesignStatus } from '@/lib/admin/repositories';

export const metadata = { title: 'Designs' };

export default async function DesignsPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string; page?: string };
}) {
  const supabase = createServerSupabaseClient();
  const { designs } = createServices(supabase);

  const page = parseInt(searchParams.page ?? '1', 10);
  const status = searchParams.status as DesignStatus | undefined;
  const search = searchParams.search;

  let result = {
    data: [] as Awaited<ReturnType<typeof designs.list>>['data'],
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  };

  try {
    result = await designs.list(
      { status, search },
      { page, pageSize: 20 }
    );
  } catch {
    // Tables may not exist yet
  }

  const statuses: { value: string | undefined; label: string }[] = [
    { value: undefined, label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'staged', label: 'Staged' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ];

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl tracking-display text-ink-950">
            Designs
          </h1>
          <p className="font-body text-sm text-ink-500 mt-1">
            {result.total} {result.total === 1 ? 'design' : 'designs'} total
          </p>
        </div>
        <Link href="/admin/designs/new" className="btn-press">
          + New Design
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-6 mb-6">
        {/* Status filter */}
        <div className="flex gap-1">
          {statuses.map((s) => {
            const isActive = status === s.value || (!status && !s.value);
            const href = s.value
              ? `/admin/designs?status=${s.value}`
              : '/admin/designs';

            return (
              <Link
                key={s.label}
                href={href}
                className={`px-3 py-1.5 font-mono text-2xs uppercase tracking-widest transition-colors
                  ${isActive
                    ? 'bg-ink-950 text-paper'
                    : 'text-ink-400 hover:text-ink-800'
                  }`}
              >
                {s.label}
              </Link>
            );
          })}
        </div>

        {/* Search */}
        <form className="flex-1 max-w-xs">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search designs..."
            className="w-full border border-ink-300 bg-paper px-3 py-1.5
              font-mono text-xs text-ink-900 placeholder:text-ink-300
              focus:outline-none focus:border-ink-800 transition-colors"
          />
        </form>
      </div>

      <div className="h-px bg-ink-200 mb-6" />

      {/* Table */}
      {result.data.length === 0 ? (
        <div className="bg-paper border border-ink-200 px-6 py-16 text-center">
          <p className="font-display text-lg text-ink-400 italic mb-3">
            {search
              ? `No designs matching "${search}"`
              : status
                ? `No ${status} designs`
                : 'No designs yet'}
          </p>
          {!search && !status && (
            <Link href="/admin/designs/new" className="btn-press text-xs">
              Create Your First Design
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="bg-paper border border-ink-200">
            {/* Header row */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-ink-200 bg-ink-50">
              <div className="col-span-4 mono-label">Title</div>
              <div className="col-span-2 mono-label">Collection</div>
              <div className="col-span-2 mono-label">Status</div>
              <div className="col-span-2 mono-label">Tags</div>
              <div className="col-span-2 mono-label text-right">Created</div>
            </div>

            {/* Rows */}
            {result.data.map((design, i) => (
              <Link
                key={design.id}
                href={`/admin/designs/${design.id}`}
                className={`grid grid-cols-12 gap-4 px-5 py-4 items-center
                  hover:bg-ink-50 transition-colors
                  ${i > 0 ? 'border-t border-ink-100' : ''}`}
              >
                <div className="col-span-12 md:col-span-4">
                  <span className="font-display text-base tracking-display text-ink-900">
                    {design.title}
                  </span>
                  <span className="block font-mono text-2xs text-ink-400 mt-0.5">
                    /{design.slug}
                  </span>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <span className="font-body text-sm text-ink-500">
                    {design.collection ?? '—'}
                  </span>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <StatusBadge status={design.status} />
                </div>
                <div className="hidden md:block col-span-2">
                  <span className="font-mono text-2xs text-ink-400">
                    {design.tags.length > 0
                      ? `${design.tags.length} tags`
                      : '—'}
                  </span>
                </div>
                <div className="hidden md:block col-span-2 text-right">
                  <span className="font-mono text-2xs text-ink-400">
                    {new Date(design.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {result.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="font-mono text-2xs text-ink-400 uppercase tracking-widest">
                Page {result.page} of {result.totalPages}
              </p>
              <div className="flex gap-2">
                {result.page > 1 && (
                  <Link
                    href={`/admin/designs?page=${result.page - 1}${status ? `&status=${status}` : ''}${search ? `&search=${search}` : ''}`}
                    className="btn-outline text-2xs py-1.5 px-3"
                  >
                    &larr; Prev
                  </Link>
                )}
                {result.page < result.totalPages && (
                  <Link
                    href={`/admin/designs?page=${result.page + 1}${status ? `&status=${status}` : ''}${search ? `&search=${search}` : ''}`}
                    className="btn-outline text-2xs py-1.5 px-3"
                  >
                    Next &rarr;
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </AdminShell>
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
      className={`inline-block font-mono text-2xs uppercase tracking-widest px-2 py-1 ${colors[status] ?? colors.draft}`}
    >
      {status}
    </span>
  );
}
