import type { Metadata } from 'next';
import { Tajawal, Cairo } from 'next/font/google';
import './globals.css';
import PixelScripts from '@/components/PixelScripts';
import { supabase } from '@/lib/supabaseClient';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-tajawal',
});

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  title: 'American Box | التقييم الصحي الشامل',
  description: 'اكتشف احتياجات جسمك الحقيقية مع التقييم الصحي الشامل من American Box',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch tracking pixels globally
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .single();

  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${cairo.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                try {
                  var originalDefineProperty = Object.defineProperty;
                  Object.defineProperty = function(obj, prop, descriptor) {
                    if (prop === 'fetch' && (obj === window || obj === globalThis)) {
                      if (descriptor.get && !descriptor.set) {
                        var originalGet = descriptor.get;
                        var currentFetch;
                        var isSet = false;
                        descriptor.get = function() { return isSet ? currentFetch : originalGet.call(obj); };
                        descriptor.set = function(newFetch) { currentFetch = newFetch; isSet = true; };
                      } else if ('value' in descriptor && !descriptor.writable) {
                        descriptor.writable = true;
                      }
                      descriptor.configurable = true;
                    }
                    return originalDefineProperty(obj, prop, descriptor);
                  };
                } catch (e) {
                  console.warn('Could not patch Object.defineProperty', e);
                }
              }
            `,
          }}
        />
      </head>
      <body className="font-cairo bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <PixelScripts 
          metaPixel={settings?.meta_pixel || null}
          tiktokPixel={settings?.tiktok_pixel || null}
          gaPixel={settings?.ga_pixel || null}
        />
        {children}
      </body>
    </html>
  );
}
