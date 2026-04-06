// src/components/landing/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#1b1a18] px-[5%] pt-16 pb-8 text-white">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-11 mb-11">
        <div>
          <div className="font-display text-2xl font-black mb-3">Furr<span className="text-primary">Ever</span> 🐾</div>
          <p className="text-sm text-white/50 leading-relaxed mb-5 max-w-[200px]">Connecting loving families with pets who need forever homes.</p>
          <a href={process.env.NEXT_PUBLIC_APK_URL || '#'}
             className="inline-flex items-center gap-2 bg-white/8 border border-white/12 rounded-xl px-4 py-2 text-sm font-bold hover:bg-primary hover:border-primary hover:text-[#1b1a18] transition-all duration-200">
            📱 <span>Download APK</span>
          </a>
        </div>
        {[
          { title:'Navigate', links:[['/', 'Home'],['  /about','About'],[ '/contact','Contact'],['/admin-login','Admin']] },
          { title:'Support',  links:[['#','Help Center'],['#','Adoption Guide'],['#','Pet Care Tips'],['#','Report Issue']] },
          { title:'Legal',    links:[['/privacy','Privacy Policy'],['#','Terms of Service'],['#','GDPR/CCPA'],['#','Cookies']] },
        ].map(col => (
          <div key={col.title}>
            <div className="font-bold text-sm mb-4">{col.title}</div>
            <ul className="space-y-2.5">
              {col.links.map(([href,label]) => (
                <li key={label}><Link href={href.trim()} className="text-sm text-white/50 hover:text-primary transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between flex-wrap gap-3 border-t border-white/8 pt-6">
        <span className="text-xs text-white/30">© 2026 FurrEver. Made with ❤️ for pets.</span>
        <div className="flex gap-2.5">
          {['🐦','📸','👥'].map((e,i) => (
            <div key={i} className="w-8 h-8 bg-white/8 rounded-lg flex items-center justify-center text-sm hover:bg-primary hover:text-[#1b1a18] transition-all duration-200 cursor-none">{e}</div>
          ))}
        </div>
      </div>
    </footer>
  );
}
