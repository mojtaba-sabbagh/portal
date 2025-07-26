// components/Navbar.tsx
'use client';
import { useEffect } from 'react';

const menus = [
  {
    title: 'سامانه‌های عمومی',
    items: [
      { text: 'سامانه مدیریت پروژه', href: 'https://taskulu.com/account/login?rdr=%2Fa%2Fproject%2F65cfc46856ad66333c97bd2f%2Ftasks' },
      { text: 'مدیریت فرآیند', href: 'https://bpms.hugco.ir:8182/sysworkflow/fa/modern/login/login' },
      { text: 'سامانه منابع انسانی', href: 'https://atlas.tordilla.ir' },
      { text: 'سامانه ایمیل', href: 'https://3002048066.cloudylink.com:2096/cpsess4050244868/3rdparty/roundcube/?_task=mail&_mbox=INBOX' },
      { text: 'وب سایت ترددیلا', href: 'https://www.tordillafood.com/' },
      { text: 'سامانه پشتیبانی', href: 'http://desk.palizco.net/' },
      { text: 'سامانه پیشنهادات', href: '/con/' },
    ],
  },
  {
    title: 'سامانه‌های مالیاتی',
    items: [
      { text: 'سامانه ارزش افزوده', href: 'https://www.e-vat.ir' },
      { text: 'سامانه سجام', href: 'https://www.sejam.ir' },
      { text: 'ثبت نام مودیان ارزش افزوده', href: 'https://www.e-vat.ir/' },
      { text: 'صورت معاملات فصلی', href: 'https://ttms11.tax.gov.ir/t10/UserPanel.aspx' },
      { text: 'سایت امور مالیاتی', href: 'https://www.intamedia.ir' },
    ],
  },
  {
    title: 'حسابرسی و مالیات',
    items: [
      { text: 'سامانه حسابرسی', href: 'https://www.audit.org.ir' },
      { text: 'مالیات حقوق و دستمزد', href: 'https://salary.tax.gov.ir' },
      { text: 'روزنامه رسمی ایران', href: 'https://www.rrk.ir' },
      { text: 'اظهارنامه عملکرد', href: 'https://return.tax.gov.ir' },
    ],
  },
  {
    title: 'تجارت و گمرک',
    items: [
      { text: 'سامانه جامع تجارت ایران', href: 'https://www.ntsw.ir' },
      { text: 'سامانه امور گمرکی', href: 'https://epl.irica.ir' },
      { text: 'حسابداری رسمی ایران', href: 'https://www.iacpa.ir' },
      { text: 'سامانه بهین یاب', href: 'https://behinyab.ir' },
    ],
  },
  {
    title: 'بازرگانی و تامین اجتماعی',
    items: [
      { text: 'اتاق بازرگانی', href: 'https://www.tccim.ir' },
      { text: 'پرداخت عوارض گمرکی', href: 'https://payment.irica.ir' },
      { text: 'سازمان تامین اجتماعی', href: 'https://samt.tamin.ir' },
      { text: 'پایگاه اشخاص حقوقی', href: 'https://ilenc.ssaa.ir' },
    ],
  },
  {
    title: 'سایر  سامانه‌ها',
    items: [
      { text: 'مالیات اجاره', href: 'https://estr.tax.gov.ir' },
      { text: 'ثبت شرکت‌ها', href: 'https://irsherkat.ssaa.ir' },
      { text: 'درگاه مجوزهای کشور', href: 'https://g4b.ir' },
      { text: 'سامانه جامع انبارها', href: 'https://www.nwms.ir' },
    ],
  },
];

export default function Navbar() {
  useEffect(() => {
    const menuToggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('menu');
    menuToggle?.addEventListener('click', () => {
      menu?.classList.toggle('hidden');
    });
  }, []);

  return (
    <nav className="bg-blue-600 text-white sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="text-2xl font-bold">سامانه‌ها</div>
          <button id="menu-toggle" className="md:hidden focus:outline-none" aria-label="باز کردن منو">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
        <ul id="menu" className="hidden md:flex md:items-center md:space-x-4 flex-wrap">
          {menus.map((menu, idx) => (
            <li key={idx} className="relative group">
              <button className="py-2 px-10 hover:bg-blue-700 focus:outline-none" aria-haspopup="true">{menu.title}</button>
              <ul className="absolute hidden group-hover:block bg-blue-600 text-white mt-2 rounded shadow-lg z-50">
                {menu.items.map((item, subIdx) => (
                  <li key={subIdx}>
                    <a href={item.href} target="_blank" className="block py-2 px-4 hover:bg-blue-700">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
