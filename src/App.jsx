import { useEffect, useRef } from 'react';
import Hero from './components/hero/Hero.jsx';
import Con1 from './components/con1/Con1.jsx';
import Brand from './components/brand/Brand.jsx';
import Card from './components/card/Card.jsx';
import Text from './components/text/Text.jsx';
import Play from './components/play/Play.jsx';
import Your from './components/your/Your.jsx';
import Color from './components/color/Color.jsx';
import Marquee from './components/marquee/Marquee.jsx';
import PreFooter from './components/prefooter/PreFooter.jsx';
import PreFooterBanner from './components/prefooter/PreFooterBanner.jsx';
import Footer from './components/footer/Footer.jsx';
import TopButton from './components/shared/TopButton.jsx';
import './App.css';

export default function App() {
    const stackRef = useRef(null);

    useEffect(() => {
        const sections = Array.from(stackRef.current.children);
        let frame = null;
        const update = () => {
            frame = null;
            sections.forEach((section, index) => {
                const next = sections[index + 1];
                const covered = next ? Math.max(0, Math.min(1, next.classList.contains('mood-transition') ? -next.getBoundingClientRect().top / (window.innerHeight * .75) : 1 - next.getBoundingClientRect().top / window.innerHeight)) : 0;
                section.style.setProperty('--stack-dim', covered * .32);
            });
        };
        const schedule = () => {
            if (frame === null) frame = requestAnimationFrame(update);
        };
        update();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
        };
    }, []);

    return <main id="main"><Hero /><Con1 /><div className="brand-card"><Brand /><div className="card-pin"><Card /></div></div><div ref={stackRef} className="text-play"><Text /><Play /><Your /><Color /><Marquee /></div><PreFooter /><PreFooterBanner /><Footer /><TopButton /></main>;
}
