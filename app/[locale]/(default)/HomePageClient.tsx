'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BorderBeam } from '@/components/magicui/border-beam';
import { Particles } from '@/components/magicui/particles';
import { CoolMode } from '@/components/magicui/cool-mode';
import { ConfettiButton } from '@/components/magicui/confetti';
import { BlurFade } from '@/components/magicui/blur-fade';
import { useTheme } from 'next-themes';
import HairColorChangerBlock from '@/components/blocks/hair-color-changer';
import { Icon } from '@/components/icon';

const features = [
  {
    icon: <Icon name="RiSparkling2Line" className="w-6 h-6" />,
    title: 'Try Before You Dye',
    description: 'Skip the hair dye regret. See exactly how any color looks on you before making a permanent change. No more "oops" moments or expensive color corrections – discover what truly suits you first.',
  },
  {
    icon: <Icon name="RiHeartLine" className="w-6 h-6" />,
    title: 'No Damage, No Drama',
    description: 'Love to switch hair colors but worry about damage? Virtual try-ons mean endless makeovers with zero harm to your hair. It\'s all the fun of a new color, without the bleach and breakage.',
  },
  {
    icon: <Icon name="RiStarLine" className="w-6 h-6" />,
    title: 'For Every Occasion',
    description: 'Find the perfect hair color for that upcoming wedding, party or festival. Go dark and sleek for a formal event, or test a vibrant neon for a fun night out – all online, effortlessly. Match your hair to your outfit or the season (rich auburn for fall, anyone?) without a trip to the salon.',
  },
  {
    icon: <Icon name="RiFlashlightLine" className="w-6 h-6" />,
    title: 'Social Media Ready',
    description: 'Impress your followers and friends with fresh looks – #NewHairDontCare. Our tool helps you create share-worthy transformations in a snap. Try a trendy shade you\'ve seen on Instagram and share your virtual makeover to get opinions from friends (or just rack up the likes)!',
  },
];

const keyFeatures = [
  {
    title: 'Realistic Results',
    description: 'Powered by advanced AI, the color application looks natural. The tool analyzes your photo to detect hair and blend new hues with your lighting and hair texture, so the outcome looks like a real photo, not a sloppy filter. From shiny brunettes to multi-tonal pastels, colors render true-to-life.',
    icon: <Icon name="RiCheckboxCircleLine" className="w-6 h-6 text-primary" />,
  },
  {
    title: 'Endless Shades',
    description: 'Explore a wide range of shades – from classic colors (blonde, brown, black, auburn) to trendy fashion colors (rose gold, purple, teal, you name it!). We even offer a Custom Color option where you can fine-tune and create your own shade or try exotic hues via text prompt. Your imagination is the limit.',
    icon: <Icon name="RiPaletteLine" className="w-6 h-6 text-primary" />,
  },
  {
    title: 'Instant Makeover',
    description: 'No waiting around. In just a few seconds, the AI applies your chosen color to your hair. It\'s practically real-time - faster (and cheaper) than any salon test strand! This means you can try multiple looks in minutes.',
    icon: <Icon name="RiTimeLine" className="w-6 h-6 text-primary" />,
  },
  {
    title: 'Easy & Accessible: No tech skills required',
    description: 'The interface is simple: upload a photo and tap on colors to preview. It\'s entirely web-based, so there\'s nothing to install. Whether you\'re on a phone, tablet, or laptop, you can experiment anywhere, anytime.',
    icon: <Icon name="RiSmartphoneLine" className="w-6 h-6 text-primary" />,
  },
  {
    title: 'Keep Your Style',
    description: 'Our tool only changes the hair color, not your hairstyle. Curls stay curly, and updos stay intact – we just recolor them. Your friends might think you actually dyed your hair in the photo! This focus on color (while preserving all other details) gives a realistic preview of you with a new shade, so you can truly gauge the look.',
    icon: <Icon name="RiBrushLine" className="w-6 h-6 text-primary" />,
  },
  {
    title: 'Private & Secure',
    description: 'We respect your privacy. Your photos aren\'t saved or shared, so you can feel safe uploading your favorite selfies. (Pro tip: use a high-quality, well-lit photo for the best result - good lighting helps the AI create even more realistic changes.)',
    icon: <Icon name="RiLockLine" className="w-6 h-6 text-primary" />,
  },
];

const steps = [
  {
    step: '1',
    title: 'Upload Your Photo',
    description: 'Choose a clear photo of yourself where your hair is visible. Straight-on selfies with good lighting work best.',
    icon: <Icon name="RiUpload2Line" className="w-8 h-8" />,
  },
  {
    step: '2',
    title: 'Choose a Color',
    description: 'Pick a shade from our color menu that you want to try. Browse categories or use the custom picker for an exact hue.',
    icon: <Icon name="RiPaletteLine" className="w-8 h-8" />,
  },
  {
    step: '3',
    title: 'Preview & Share',
    description: 'Voilà! In seconds, you\'ll see your hair magically recolored. Love the result? Download it or share it on social media!',
    icon: <Icon name="RiDownloadLine" className="w-8 h-8" />,
  },
];

const faqData = [
  {
    question: 'Is this really free to use?',
    answer: 'Yes – completely free! You can upload photos and try on as many hair colors as you want without paying. We want everyone to enjoy experimenting with their look. (In the future, we may offer optional premium features, but trying colors will stay free.)',
  },
  {
    question: 'Do I need to download an app or create an account?',
    answer: 'Nope. The hair color changer works entirely online in your web browser. No downloads, no sign-ups, no fuss. Just head to our website and start transforming your hair in photos. It works on mobile devices and computers alike.',
  },
  {
    question: 'How realistic are the results?',
    answer: 'Our tool uses advanced AI similar to the tech behind professional photo editors, so the results are very realistic. It maps the new color onto your hair while respecting lighting, shadows, and hair texture. That means if you have highlights or curls, those details show through the new color naturally. Many users say the edited photos look like they actually dyed their hair!',
  },
  {
    question: 'Can I try on any hair color?',
    answer: 'Pretty much! We offer a wide range of preset colors from natural tones to vivid fantasy colors. If you have something specific in mind, use our Custom Color feature or type a color prompt (for example, "rose gold" or "mint green"). The AI will generate that shade for you. So whether it\'s trending colors or a unique hue, you can likely see it.',
  },
  {
    question: 'Will the tool change my haircut or just the color?',
    answer: 'Just the color. Your hairstyle, length, and everything else remain the same in the photo – we\'re just digitally "dyeing" your hair. This way, the preview focuses on color alone. (If you do want to test new haircuts, stay tuned – we have a virtual hairstyle try-on tool as well!)',
  },
  {
    question: 'What types of photos work best?',
    answer: 'For best results, use a photo where your hair is clearly visible. It helps if the background contrasts with your hair and the lighting is even (natural daylight is great). Avoid heavily filtered pics or ones where your hair blends into the background. The AI can handle most scenarios, but clear photos will give the most photorealistic outcome. And don\'t worry – curly, straight, up or down, the tool works on all hair types and styles.',
  },
  {
    question: 'Is my photo safe?',
    answer: 'Absolutely. We do not store your photos permanently or share them. The image is processed to apply the color and then it\'s gone from our servers. Your privacy is important to us (no sneaky marketing uses or anything). You can experiment freely, knowing your selfies aren\'t going anywhere beyond this tool.',
  },
  {
    question: 'I found a color I love – how do I show my hairstylist?',
    answer: 'You can download the photo with your chosen color and bring it to your salon, or even share the photo with your hairstylist directly. Having a visual reference of the exact shade you liked (on you) can be super helpful for professionals to replicate that color in real life. It takes out the guesswork when you say "I want this hair color."',
  },
  {
    question: 'Who is this for?',
    answer: 'Anyone who\'s curious about a new hair color! Our core users are style-savvy individuals (especially young women) who love trying new looks on social media, college students on a budget who want a change, and anyone before a big event (think: "Should I go brunette for graduation?"). Even salons could use it to help clients decide. If you have ever thought about changing your hair, this tool is for you. It\'s like a magic mirror for hair experimentation 😊.',
  },
  {
    question: 'I\'m not very techy – is this hard to use?',
    answer: 'Not at all – we built it to be very user-friendly. If you can attach a photo to an email, you have all the skills needed. Just upload a photo and click on colors. There\'s no manual drawing or editing required. The AI does the complicated stuff, you just enjoy the results.',
  },
  {
    question: 'Does it work for guys or only long hair?',
    answer: 'It works for everyone! Short hair, long hair, any gender – as long as the hair is visible in the photo, the AI will recolor it. We\'ve seen awesome results on pixie cuts, buzz cuts (try our Buzz Cut filter for fun), and even beards. So feel free to try it on any hairstyle.',
  },
];

export default function HomePageClient() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Particles */}
      <Particles
        className="absolute inset-0 -z-10"
        quantity={80}
        ease={80}
        color={theme === 'dark' ? '#ffffff' : '#f1a13a'}
        refresh
      />

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-6xl mx-auto">
            <div className="relative inline-block">
              <h1
                className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-orange-700 bg-clip-text text-transparent leading-tight">
                AI Hair Color Changer
              </h1>
              <BorderBeam className={'p-2'}
                          size={200}
                          duration={4}
                          delay={2}
                          colorFrom="#f1a13a"
                          colorTo="#ff6b35"
              />
            </div>

            <h2 className="text-2xl lg:text-3xl font-semibold mb-6 text-foreground/90">
              Try On Your Dream Hair Color Virtually for Free
            </h2>

            <p className="text-xl lg:text-2xl mb-8 text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Transform Your Look in 30 Seconds
            </p>

            <p className="text-lg mb-12 text-muted-foreground max-w-3xl mx-auto">
              Ever wondered how you’d look as a redhead or with pastel pink locks? Our AI hair color changer lets you
              find out instantly – no salon, no mess, no risk. Simply upload a selfie and try on dozens of hair colors
              virtually. It’s the ultimate way to experiment with your style before you commit. Why stick to one look?
              With our tool, you can be blonde, brunette, or bold blue – all in one day! Find a shade that matches your
              vibe and walk into your next salon appointment with confidence
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <CoolMode>
                <ConfettiButton
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-orange-500 hover:from-orange-500 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl"
                  options={{
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                  }}
                  onClick={() => {
                    document.getElementById('hair-color-changer')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Try It Now - Free!
                  <Icon name="RiSparkling2Line" className="ml-2 w-5 h-5" />
                </ConfettiButton>
              </CoolMode>

              {/*<Button*/}
              {/*  variant="outline"*/}
              {/*  size="lg"*/}
              {/*  className="px-8 py-4 text-lg font-semibold border-2 hover:bg-primary/10 transition-all duration-300"*/}
              {/*>*/}
              {/*  Watch Demo*/}
              {/*</Button>*/}
            </div>

            <div className="mt-6 flex flex-wrap text-sm text-muted-foreground  justify-center gap-4 items-center">
              <span>100% Free & Online</span>
              <span>•</span>
              <span>No Registration Required</span>
              <span>•</span>
              <span>Instant Results</span>
            </div>
          </div>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="relative py-12">
        <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
      </div>

      <HairColorChangerBlock></HairColorChangerBlock>

      <div className="border-t border-border/30"></div>

      {/* Benefits Section */}
      <BlurFade delay={0.25} inView>
        <section className="py-24   ">
          <div className="container mx-auto px-4">
            <BlurFade delay={0.35} inView>
              <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-center">
                  AI Hair Color Changer with Multiple Stylish Shades
                </h2>
                <p className="text-xl text-muted-foreground max-w-7xl mx-auto">
                  Join thousands of users who've found their perfect shade without a single drop of dye
                </p>
              </div>
            </BlurFade>

            <div className="grid grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <BlurFade key={index} delay={0.45 + index * 0.1} inView>
                  <div
                    className={`p-8 hover:bg-primary/5 transition-all duration-300 group ${
                      index === 0 ? 'border-r-0 md:border-r-2 border-b-2 border-border' :
                        index === 1 ? 'border-b-2 border-border' :
                          index === 2 ? 'border-r-0 md:border-r-2 border-border' :
                            ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors duration-300">
                        {feature.icon}
                      </div>
                      <div>
                        <h3
                          className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                </BlurFade>
              ))}
            </div>
          </div>
        </section>
      </BlurFade>

      {/* Gradient Divider */}
      <div className="relative">
        <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
      </div>

      {/* Key Features Section */}
      <BlurFade delay={0.25} inView>
        <section className="py-24">
          <div className="container mx-auto px-4">
            <BlurFade delay={0.35} inView>
              <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  Why You'll Love Our Virtual Hair Color Changer
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Our AI-powered tool is designed for ultra-realistic results and a fun, seamless user experience
                </p>
              </div>
            </BlurFade>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {keyFeatures.map((feature, index) => (
                <BlurFade key={index} delay={0.45 + index * 0.15} inView>
                  <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <BorderBeam
                      size={150}
                      duration={6}
                      delay={index * 2}
                      colorFrom="#f1a13a"
                      colorTo="#ff6b35"
                    />
                    <CardContent className="p-8">
                      <div className="mb-4">{feature.icon}</div>
                      <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </BlurFade>
              ))}
            </div>

            <BlurFade delay={1.2} inView>
              <div className="mt-16 text-center">
                <p className="text-sm text-muted-foreground mb-8">
                  <strong>100% Free & Online:</strong>
                  <p>
                    Experience all these benefits free of charge. Unlike salon
                    consultations or paid apps, our virtual hair color changer is free to use, anytime. It works in your web
                    browser (on mobile or desktop) – no downloads or installs needed.
                  </p>
                </p>
              </div>
            </BlurFade>
          </div>
        </section>
      </BlurFade>

      {/* Gradient Divider */}
      <div className="relative">
        <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
      </div>

      <BlurFade delay={0.25} inView>
        <section className="py-24" ref={containerRef}>
          <div className="container mx-auto px-4">
            <BlurFade delay={0.35} inView>
              <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  From Selfie to New Hair Color in 3 Steps
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  You don't need to be tech-savvy or spend hours editing. Using our AI hair color changer is as easy as
                  1-2-3
                </p>
              </div>
            </BlurFade>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto relative">
              {steps.map((step, index) => (
                <BlurFade key={index} delay={0.45 + index * 0.2} inView>
                  <div className="text-center relative"
                       ref={index === 0 ? step1Ref : index === 1 ? step2Ref : step3Ref}>
                    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 h-full">
                      <BorderBeam
                        size={150}
                        duration={6}
                        delay={index * 2}
                        colorFrom="#f1a13a"
                        colorTo="#ff6b35"
                      />
                      <CardContent className="p-8">
                        <div
                          className="w-16 h-16 bg-gradient-to-r from-primary to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                          {step.step}
                        </div>
                        <div className="text-primary mb-4 flex justify-center">
                          {step.icon}
                        </div>
                        <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </BlurFade>
              ))}
            </div>
          </div>
        </section>
      </BlurFade>

      {/* Gradient Divider */}
      <div className="relative">
        <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
      </div>

      {/* FAQ Section */}
      <BlurFade delay={0.25} inView>
        <section className="py-24">
          <div className="container mx-auto px-4">
            <BlurFade delay={0.35} inView>
              <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  Frequently Asked Questions
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Everything you need to know about our AI hair color changer
                </p>
              </div>
            </BlurFade>

            <BlurFade delay={0.5} inView>
              <div className="max-w-4xl mx-auto">
                <Accordion type="single" collapsible className="space-y-4">
                  {faqData.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}
                                   className="bg-card rounded-lg border overflow-hidden">
                      <AccordionTrigger className="px-6 text-left font-semibold hover:no-underline py-6">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-6 text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </BlurFade>
          </div>
        </section>
      </BlurFade>

      <div className="border-t border-border/30"></div>

      {/* Final CTA Section */}
      <BlurFade delay={0.25} inView>
        <section className="py-24 bg-gradient-to-r from-primary/10 via-orange-500/10 to-primary/10 text-center">
          <div className="max-w-4xl mx-auto">
            <BlurFade delay={0.35} inView>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Ready for Your Virtual Hair Makeover?
              </h2>
            </BlurFade>
            <BlurFade delay={0.45} inView>
              <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                You're just one click away from discovering your next hair color obsession. Whether you're planning a
                major change or just having fun with fantasies, our AI Hair Color Changer is the easiest way to reinvent
                yourself virtually. Join thousands of users who've found their perfect shade without a single drop of dye.
              </p>
            </BlurFade>

            <BlurFade delay={0.55} inView>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
                <ConfettiButton
                  size="lg"
                  className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-primary to-orange-500 hover:from-orange-500 hover:to-primary transition-all duration-300 shadow-xl hover:shadow-2xl"
                  options={{
                    particleCount: 150,
                    spread: 100,
                    origin: { y: 0.6 },
                    colors: ['#f1a13a', '#ff6b35', '#ff9a5a'],
                  }}
                  onClick={() => {
                    document.getElementById('hair-color-changer')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Try It Now - It's Free! ✨
                </ConfettiButton>
              </div>
            </BlurFade>
            <BlurFade delay={0.65} inView>
              <p className="text-sm text-muted-foreground">
                Upload a photo & see your new look! No signup required • Works on all devices • Instant results
              </p>
            </BlurFade>
          </div>
        </section>
      </BlurFade>
    </div>
  );
}