export default function ComingSoonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Hide the navbar by not including it - this layout overrides the parent's navbar */}
      <style>{`
        nav.fixed { display: none !important; }
      `}</style>
      {children}
    </>
  );
}
