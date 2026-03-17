import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full py-6 mt-auto border-t border-slate-200 bg-slate-50 relative z-10">
      <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} American Box. جميع الحقوق محفوظة.
        </p>
        <div className="flex gap-6">
          <Link href="/privacy" className="text-sm text-slate-500 hover:text-primary transition-colors">
            سياسة الخصوصية
          </Link>
          <Link href="/terms" className="text-sm text-slate-500 hover:text-primary transition-colors">
            الشروط والأحكام
          </Link>
        </div>
      </div>
    </footer>
  );
}
