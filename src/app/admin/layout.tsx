import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Admin — SyntaxPress',
    template: '%s | SyntaxPress Admin',
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ink-50 font-body">
      {children}
    </div>
  );
}
