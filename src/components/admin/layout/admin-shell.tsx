import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServices } from '@/lib/admin/services';
import { AdminSidebar } from '@/components/admin/layout/admin-sidebar';

/**
 * Admin Shell — server component that wraps all authenticated admin pages.
 * Checks auth, renders sidebar, provides user context to children.
 *
 * Usage in any /admin/* page:
 *   <AdminShell>{children}</AdminShell>
 */
export async function AdminShell({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient();
  const { auth } = createServices(supabase);

  const user = await auth.getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  // Get current path for sidebar active state
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '/admin/dashboard';

  return (
    <div className="flex min-h-screen">
      <AdminSidebar user={user} currentPath={pathname} />

      {/* Main content — offset by sidebar width */}
      <main className="flex-1 ml-60">
        <div className="px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
