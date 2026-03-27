import { Link } from 'react-router-dom';
import { Car, Wrench, ClipboardList } from 'lucide-react';
import logo from '../assets/final-logo.svg';
import audiLogo from '../assets/audi-logo-svg.svg';
import fordLogo from '../assets/ford-logo-svg.svg';
import lexusLogo from '../assets/lexus-logo-svg.svg';
import mercedesLogo from '../assets/mercedes-benz-logo-svg.svg';
import porscheLogo from '../assets/porsche-logo-svg.svg';
import seatLogo from '../assets/seat-logo-svg.svg';
import vwLogo from '../assets/vw-logo-svg.svg';

const brandLogos = [
  { src: audiLogo, alt: 'Audi' },
  { src: fordLogo, alt: 'Ford' },
  { src: lexusLogo, alt: 'Lexus' },
  { src: mercedesLogo, alt: 'Mercedes-Benz' },
  { src: porscheLogo, alt: 'Porsche' },
  { src: seatLogo, alt: 'Seat' },
  { src: vwLogo, alt: 'Volkswagen' },
];

const features = [
  {
    icon: Car,
    title: 'Track your fleet',
    desc: 'Add multiple vehicles with make, model, year, plate, VIN, and mileage.',
  },
  {
    icon: Wrench,
    title: 'Service reminders',
    desc: 'Mileage-based reminders so you never miss an oil change or inspection.',
  },
  {
    icon: ClipboardList,
    title: 'Full history',
    desc: 'Log every service and repair with date and mileage. Always accessible.',
  },
];

export function LandingPage() {
  return (
    <div className="h-screen bg-background text-white flex flex-col overflow-hidden">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full shrink-0">
        <img src={logo} alt="autolog" className="h-7 invert" />
        <div className="flex items-center gap-6">
          <Link
            to="/login"
            className="text-sm text-text-secondary hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-lg transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-between px-6 pb-6 max-w-6xl mx-auto w-full">
        <div className="flex flex-col items-center text-center pt-8">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-text-secondary mb-6 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
            Vehicle management, simplified
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-4 max-w-2xl">
            Know your cars, <span className="text-brand">inside and out.</span>
          </h1>

          <p className="text-base text-text-secondary max-w-md leading-relaxed">
            Track mileage, service history, and maintenance for all your vehicles — in one clean,
            fast dashboard.
          </p>

          <div className="flex flex-col items-center gap-3 mt-8">
            <div className="flex items-center gap-7">
              {brandLogos.map((brand) => (
                <img
                  key={brand.alt}
                  src={brand.src}
                  alt={brand.alt}
                  className="h-5 invert opacity-30 hover:opacity-60 transition-opacity"
                />
              ))}
            </div>
            <p className="text-xs text-text-muted tracking-wide">
              Compatible with every major make and model
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/register"
            className="bg-brand hover:bg-brand-hover text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
          >
            Create free account
          </Link>
          <Link
            to="/login"
            className="text-text-secondary hover:text-white transition-colors text-sm flex items-center gap-1"
          >
            Sign in <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white/3 border border-white/10 rounded-2xl p-5 hover:bg-white/6 transition-colors"
            >
              <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center text-brand mb-3">
                <f.icon size={16} />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-text-secondary text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/10 py-4 px-6 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <img src={logo} alt="autolog" className="h-4 invert opacity-50" />
          <p className="text-text-muted text-xs">© {new Date().getFullYear()} autolog</p>
        </div>
      </footer>
    </div>
  );
}
