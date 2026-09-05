import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'QueSuite CMMS | Maintenance workspace',
  description:
    'Track assets and move maintenance work from request to closure.',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
