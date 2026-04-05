import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.18,
  baseRotation = 1.2,
  blurStrength = 1.5,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'bottom center+=10%',
  wordAnimationEnd = 'bottom center+=10%'
}) => {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className="inline-block word" key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { transformOrigin: '0% 50%', rotate: baseRotation },
        {
          ease: 'power1.out',
          rotate: 0,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top bottom-=8%',
            end: rotationEnd,
            scrub: 1.1,
          }
        }
      );

      const wordElements = el.querySelectorAll('.word');

      gsap.fromTo(
        wordElements,
        { opacity: baseOpacity, yPercent: 14, willChange: 'opacity, transform, filter' },
        {
          ease: 'power2.out',
          opacity: 1,
          yPercent: 0,
          stagger: 0.02,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top bottom-=12%',
            end: wordAnimationEnd,
            scrub: 1.2,
          }
        }
      );

      if (enableBlur) {
        gsap.fromTo(
          wordElements,
          { filter: `blur(${blurStrength}px)` },
          {
            ease: 'power1.out',
            filter: 'blur(0px)',
            stagger: 0.02,
            scrollTrigger: {
              trigger: el,
              scroller,
              start: 'top bottom-=12%',
              end: wordAnimationEnd,
              scrub: 1.2,
            }
          }
        );
      }
    }, el);

    return () => ctx.revert();
  }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength]);

  return (
    <h2 ref={containerRef} className={`my-5 ${containerClassName}`}>
      <p className={`text-[clamp(1.6rem,4vw,3rem)] leading-normal font-semibold ${textClassName}`}>{splitText}</p>
    </h2>
  );
};

export default ScrollReveal;
