// components/PortalGrid.tsx
export default function PortalGrid() {
  const portals = [
    { href: 'https://taskulu.com/...', text: 'سامانه مدیریت پروژه' },
    { href: 'https://bpms.hugco.ir:8182/...', text: 'مدیریت فرآیند' },
    { href: 'https://atlas.tordilla.ir', text: 'سامانه منابع انسانی' },
    { href: 'https://mail.tordilla.ir:2096/...', text: 'سامانه ایمیل' },
    { href: 'https://www.tordillafood.com/', text: 'وب سایت ترددیلا' },
    { href: 'http://desk.palizco.net/', text: 'سامانه پشتیبانی' },
    { href: '/suggestion', text: 'سامانه پیشنهادات' },
    { href: '/video', text: 'محتواهای آموزشی' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      {portals.map(({ href, text }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          className="text-black bg-gray-200 py-5 px-4 text-center rounded-lg hover:bg-green-600 transition-colors"
        >
          {text}
        </a>
      ))}
    </div>
  );
}
