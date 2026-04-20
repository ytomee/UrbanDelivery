import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] gap-2 animate-fade-in">
      {/* Hero icon */}
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: 'linear-gradient(135deg, var(--yale) 0%, var(--yale-light) 100%)',
          boxShadow: '0 4px 20px rgba(13, 59, 102, 0.2)',
        }}
      >
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 3L33 10.5V25.5L18 33L3 25.5V10.5L18 3Z" stroke="#FAF0CA" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M18 12V24M12 16L18 12L24 16" stroke="#FAF0CA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="18" cy="24" r="1.5" fill="#FAF0CA"/>
        </svg>
      </div>

      <h1
        className="text-4xl font-bold tracking-tight"
        style={{ color: 'var(--yale)', letterSpacing: '-0.03em' }}
      >
        UrbanDelivery
      </h1>
      <p className="text-muted text-base max-w-sm text-center mt-1" style={{ lineHeight: 1.5 }}>
        Sistema de gestão de entregas urbanas.
        <br />
        Organize clientes, moradas e zonas de entrega.
      </p>

      <Link
        href="/customers"
        className="btn btn-primary mt-6"
        style={{ height: 44, paddingInline: 28, fontSize: '0.9375rem' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M3.5 14.5C3.5 12 5.5 10 8 10S12.5 12 12.5 14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        Gerir Clientes
      </Link>

      {/* Decorative stats row */}
      <div className="flex items-center gap-8 mt-12 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
        {[
          { label: 'Clientes', icon: 'M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11z' },
          { label: 'Moradas', icon: 'M9 1.5l6.5 5.5v9.5h-4.5v-5h-4v5H2.5V7L9 1.5z' },
          { label: 'Zonas', icon: 'M9 1C5 1 2 4.5 2 8.5S9 17 9 17s7-4.5 7-8.5S13 1 9 1zm0 10a2.5 2.5 0 110-5 2.5 2.5 0 010 5z' },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-2 text-center">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--chiffon)' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d={item.icon} stroke="var(--yale)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--foreground-secondary)' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
