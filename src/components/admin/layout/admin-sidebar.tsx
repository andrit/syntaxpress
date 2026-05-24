import Link from 'next/link';
import { logoutAction } from '@/lib/admin/services/auth.actions';
import { AuthenticatedUser } from '@/lib/admin/services';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: '◻' },
  { label: 'Designs', path: '/admin/designs', icon: '◈' },
  // Future phases:
  // { label: 'Social', path: '/admin/social', icon: '◎' },
  // { label: 'Email', path: '/admin/email', icon: '◇' },
  // { label: 'Analytics', path: '/admin/analytics', icon: '◫' },
];

export function AdminSidebar({
  user,
  currentPath,
}: {
  user: AuthenticatedUser;
  currentPath: string;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-ink-950 flex flex-col z-30">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-ink-800">
        <Link href="/admin/dashboard" className="group">
          <span className="font-display text-lg tracking-display text-paper group-hover:text-press transition-colors">
            Syntax<span className="text-press group-hover:text-paper transition-colors">Press</span>
          </span>
          <span className="block font-mono text-2xs uppercase tracking-widest text-ink-500 mt-0.5">
            Command Center
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPath.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded
                font-mono text-xs uppercase tracking-widest transition-colors
                ${isActive
                  ? 'bg-press text-paper'
                  : 'text-ink-400 hover:text-paper hover:bg-ink-800'
                }`}
            >
              <span className="text-sm">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Storefront link */}
      <div className="px-3 py-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded
            font-mono text-xs uppercase tracking-widest
            text-ink-500 hover:text-paper hover:bg-ink-800 transition-colors"
        >
          <span className="text-sm">↗</span>
          View Storefront
        </a>
      </div>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-ink-800">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="font-mono text-2xs text-ink-400 truncate">
              {user.email}
            </p>
            <p className="font-mono text-2xs uppercase tracking-widest text-ink-600 mt-0.5">
              {user.role}
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="font-mono text-2xs uppercase tracking-widest
                text-ink-500 hover:text-press transition-colors ml-2"
              title="Sign out"
            >
              ✕
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
