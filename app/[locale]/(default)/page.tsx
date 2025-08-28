import { getLocale } from 'next-intl/server';
import HomePageClient from './HomePageClient';

export async function generateMetadata() {
  return {
    title: "AI Hair Color Changer – Try On Hair Colors Online for Free",
    description: "Experiment with hair colors risk-free using our AI hair color changer. Virtually try on dozens of hair shades online in seconds – free, easy, and ultra-realistic. Find your perfect hair color without any salon commitment!",
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_WEB_URL}`,
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  return <HomePageClient />;
}

