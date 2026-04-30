// components/PortalGrid.tsx
export default function PortalGrid() {
  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:4000';
  const buildSsoUrl = (clientId: string, redirectUri: string) => {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
    });

    return `/sso/authorize?${params.toString()}`;
  };

  const portals = [
    { href: 'https://taskulu.com/', text: 'سامانه مدیریت پروژه' },
    { href: 'https://bpms.hugco.ir:8182/', text: 'مدیریت فرآیند' },
    { href: 'https://atlas.tordilla.ir', text: 'سامانه منابع انسانی' },
    { href: 'https://mail.tordilla.ir:2096/', text: 'سامانه ایمیل' },
    { href: 'https://www.tordilla.ir/', text: 'وب سایت ترددیلا' },
    { href: 'http://desk.palizco.net/', text: 'سامانه پشتیبانی' },
    { href: buildSsoUrl('suggestion', `${portalUrl}/suggestion`), text: 'سامانه پیشنهادات' },
    { href: '/video', text: 'محتواهای آموزشی' },
    { href: 'https://forms.tordilla.ir', text: 'سامانه فرم‌های سازمانی' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      {portals.map(({ href, text }, index) => (
        <a
          key={href}
          href={href}
          target={href.startsWith('/') ? undefined : '_blank'}
          rel="noopener noreferrer"
          className="text-black bg-gray-200 py-5 px-4 text-center rounded-lg 
                    hover:bg-green-600 hover:text-white hover:shadow-lg
                    transition-all duration-300 ease-in-out 
                    transform hover:-translate-y-1
                    animate-fadeInUp"
          style={{
            animationDelay: `${index * 100}ms`,
            opacity: 0,
            animationFillMode: 'forwards'
          }}
        >
          {text}
        </a>
      ))}
    </div>
  );
}
