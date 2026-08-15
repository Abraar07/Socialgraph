import "./globals.css";

export const metadata = {
  title: "SocialGraph",
  description: "Discover people and build meaningful connections",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}