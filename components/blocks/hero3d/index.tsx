'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Hero3D as Hero3DType } from '@/types/blocks/hero3d';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/icon';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export default function Hero3D({ hero3d }: { hero3d: Hero3DType }) {
  const t = useTranslations();
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoverCard, setHoverCard] = useState<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    setIsLoaded(true);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (hero3d.disabled) {
    return null;
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.3,
              filter: 'blur(1px)',
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Gradient overlay that follows mouse */}
      <div 
        className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent transition-all duration-500 ease-out"
        style={{
          backgroundPosition: `${mousePosition.x * 100}% ${mousePosition.y * 100}%`,
          opacity: isLoaded ? 1 : 0
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full min-h-screen px-6 md:px-16 lg:px-24 py-12 max-w-7xl mx-auto">
        {/* Left side (text content) */}
        <div className={`w-full md:w-5/12 text-center md:text-left transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {hero3d.announcement && (
            <div className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium text-primary bg-primary/10 rounded-full backdrop-blur-sm border border-primary/20">
              <Icon name="RiSparklingLine" className="w-4 h-4 mr-2" />
              <span>{hero3d.announcement.title}</span>
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary leading-tight">
            {hero3d.title}
          </h1>
          
          {hero3d.description && (
            <p className="max-w-lg mb-10 text-lg text-muted-foreground">
              {hero3d.description}
            </p>
          )}
          
          {hero3d.buttons && hero3d.buttons.length > 0 && (
            <div className="flex flex-wrap md:justify-start justify-center gap-4 mb-12 md:mb-0">
              {hero3d.buttons.map((button, index) => (
                <Button
                  key={index}
                  variant={button.variant || (index === 0 ? 'default' : 'outline')}
                  size={button.size || 'lg'}
                  className={cn(
                    index === 0 && 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30 hover:shadow-primary/50',
                    button.className
                  )}
                  asChild={button.type === 'link'}
                >
                  {button.type === 'link' ? (
                    <Link href={button.url || '#'} target={button.target}>
                      {button.title}
                      {button.icon && <Icon name={button.icon} className="w-5 h-5 ml-2" />}
                    </Link>
                  ) : (
                    <>
                      {button.title}
                      {button.icon && <Icon name={button.icon} className="w-5 h-5 ml-2" />}
                    </>
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Right side (3D visual element) */}
        <div className={`w-full md:w-7/12 mt-12 md:mt-0 transition-all duration-1000 delay-300 ease-out ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
          <div className="relative w-full h-full min-h-[400px] flex items-center justify-center perspective">
            {/* Background glow effects */}
            <div className="absolute w-full h-full">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
              <div className="absolute -bottom-40 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
            </div>

            {/* 3D Card Stack */}
            <div className="relative w-full max-w-2xl h-[400px] md:h-[500px]">
              {/* Main central card */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 md:w-80 aspect-[3/4] bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-md rounded-2xl border border-primary/30 p-6 flex items-center justify-center shadow-2xl shadow-primary/20 transform transition-all duration-500 hover:scale-105 z-30"
                style={{
                  transform: `translate(-50%, -50%) rotateY(${mousePosition.x * 10 - 5}deg) rotateX(${mousePosition.y * -10 + 5}deg)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 animate-gradient" />
                  <div className="absolute inset-0 opacity-50">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute rounded-full bg-primary/60"
                        style={{
                          width: `${Math.random() * 3 + 1}px`,
                          height: `${Math.random() * 3 + 1}px`,
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                          opacity: Math.random() * 0.7 + 0.3,
                          boxShadow: `0 0 8px 1px hsl(var(--primary) / 0.3)`,
                          animation: `twinkle ${Math.random() * 5 + 3}s ease-in-out infinite`,
                          animationDelay: `${Math.random() * 5}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="relative z-10 text-center transform transition-transform duration-500" style={{ transform: 'translateZ(20px)' }}>
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                    <Icon name="RiSparklingLine" className="w-12 h-12 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {hero3d.highlightText || t('hero.future_tech')}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {hero3d.tip || t('hero.innovation_leads_future')}
                  </p>
                </div>
              </div>

              {/* Dynamic floating cards from list */}
              {hero3d.list && hero3d.list.slice(0, 3).map((item, index) => {
                const positions = [
                  { top: '15%', right: '10%', animation: 'float-card1' },
                  { bottom: '15%', left: '10%', animation: 'float-card2' },
                  { bottom: '5%', right: '10%', animation: 'float-card3' }
                ];
                const position = positions[index];
                
                return (
                  <div
                    key={index}
                    className={`absolute w-48 md:w-56 aspect-[3/4] bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-md rounded-2xl border border-primary/30 p-4 flex items-center justify-center shadow-xl shadow-primary/20 transform transition-all duration-500 hover:scale-105 z-20 ${hoverCard === index ? 'scale-110' : ''}`}
                    style={{
                      ...position,
                      transform: `rotateY(${mousePosition.x * 15 - 5}deg) rotateX(${mousePosition.y * -10 + 5}deg)`,
                      transformStyle: 'preserve-3d',
                      animation: `${position.animation} ${10 + index * 2}s ease-in-out infinite`
                    }}
                    onMouseEnter={() => setHoverCard(index)}
                    onMouseLeave={() => setHoverCard(null)}
                  >
                    <div className="relative z-10 text-center transform transition-transform duration-500" style={{ transform: 'translateZ(15px)' }}>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shadow-md shadow-primary/30">
                        {item.src ? (
                          <Image
                            src={item.src}
                            alt={item.alt || `Card ${index + 1}`}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Icon name="RiImageLine" className="w-8 h-8 text-primary" />
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        {item.alt || `Item ${index + 1}`}
                      </h3>
                      <p className="text-muted-foreground text-xs">{t('hero.innovation_item')}</p>
                    </div>
                  </div>
                );
              })}

              {/* Floating particles */}
              <div className="absolute inset-0">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-primary/60"
                    style={{
                      width: `${Math.random() * 6 + 2}px`,
                      height: `${Math.random() * 6 + 2}px`,
                      top: `${Math.random() * 120}%`,
                      left: `${Math.random() * 120}%`,
                      opacity: Math.random() * 0.5 + 0.3,
                      boxShadow: `0 0 10px 2px hsl(var(--primary) / 0.4)`,
                      animation: `float-particle ${Math.random() * 15 + 10}s ease-in-out infinite`,
                      animationDelay: `${Math.random() * 5}s`
                    }}
                  />
                ))}
              </div>

              {/* Connecting lines */}
              <svg className="absolute inset-0 w-full h-full z-0 opacity-40" style={{ pointerEvents: 'none' }}>
                <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="hsl(var(--primary) / 0.4)" strokeWidth="1" strokeDasharray="5,5">
                  <animate attributeName="stroke-opacity" values="0.2;0.8;0.2" dur="4s" repeatCount="indefinite" />
                </line>
                <line x1="50%" y1="50%" x2="25%" y2="75%" stroke="hsl(var(--primary) / 0.4)" strokeWidth="1" strokeDasharray="5,5">
                  <animate attributeName="stroke-opacity" values="0.2;0.8;0.2" dur="5s" repeatCount="indefinite" />
                </line>
                <line x1="50%" y1="50%" x2="80%" y2="70%" stroke="hsl(var(--primary) / 0.4)" strokeWidth="1" strokeDasharray="5,5">
                  <animate attributeName="stroke-opacity" values="0.2;0.8;0.2" dur="4.5s" repeatCount="indefinite" />
                </line>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-br-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-primary/10 to-transparent rounded-tl-full blur-3xl" />

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
          100% { transform: translateY(0) rotate(360deg); }
        }
        @keyframes float-card1 {
          0%, 100% { transform: translateY(0) translateX(0) rotateY(0deg); }
          50% { transform: translateY(-15px) translateX(10px) rotateY(5deg); }
        }
        @keyframes float-card2 {
          0%, 100% { transform: translateY(0) translateX(0) rotateY(0deg); }
          50% { transform: translateY(15px) translateX(-10px) rotateY(-5deg); }
        }
        @keyframes float-card3 {
          0%, 100% { transform: translateY(0) translateX(0) rotateY(0deg); }
          50% { transform: translateY(-10px) translateX(15px) rotateY(8deg); }
        }
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-30px) translateX(20px); }
          50% { transform: translateY(0) translateX(40px); }
          75% { transform: translateY(30px) translateX(20px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 400% 400%;
          animation: gradient 15s ease infinite;
        }
        .bg-gradient-radial {
          background: radial-gradient(
            circle at 50% 50%,
            var(--tw-gradient-from),
            var(--tw-gradient-to) 70%
          );
        }
        .perspective {
          perspective: 1500px;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animate-pulse-slow {
          animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}