import "./globals.css";

export const metadata = {
  title: "Trimly — Short links, big reach",
  description: "Trimly turns long, unwieldy links into short URLs in seconds.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
