import Footer from '@/components/blocks/footer';
import Header from '@/components/blocks/header';
import { ReactNode } from 'react';
import { getLandingPage } from '@/services/page';
import Feedback from '@/components/feedback';
import LanguageSwitchReminder from '@/components/language-switch-reminder';

export default async function DefaultLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  return (
    <>
      <Header />
      <LanguageSwitchReminder />
      <main className="overflow-x-hidden">{children}</main>
      <Footer />
      {/* <Feedback socialLinks={page.footer?.social?.items} /> */}
    </>
  );
}
