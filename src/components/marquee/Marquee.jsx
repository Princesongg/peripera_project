import { useEffect, useRef, useState } from 'react';
import './Marquee.css';

const rows = [
    { id: '161:364', offset: -316, gap: 72, items: [['15', 'BE YOUR VIBE', '#ffa1b9'], ['19', 'FIND YOUR MOOD']] },
    { id: '161:363', offset: -774, gap: 82, items: [['22', 'NEW PERIPERA'], ['21', 'MOOD', '#92bfea'], ['09', 'PLAYFUL COLOR']] },
    { id: '161:362', offset: -98, gap: 104, items: [['17', 'NEXT VIBE', '#ffb3ba'], ['15', 'LOVELY'], ['11', 'PROJECTS']] },
    { id: '161:361', offset: -710, gap: 45, items: [['19', 'FIND YOUR MOOD'], ['01', 'MINE', '#c3e2ff'], ['17', 'NEXT VIBE']] },
    { id: '161:360', offset: -380, gap: 45, items: [['11', 'PROJECTS'], ['22', 'NEW PERIPERA', '#ff517e'], ['21', 'MOOD']] },
];

export default function Marquee() {
    const ref = useRef(null);
    const transitionRef = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        let frame;
        const update = () => {
            frame = null;
            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const progress = reduced ? 1 : Math.max(0, Math.min(1, -transitionRef.current.getBoundingClientRect().top / (window.innerHeight * .75)));
            const eased = progress * progress * (3 - 2 * progress);
            ref.current.style.clipPath = progress >= 1 ? 'none' : `inset(0 ${(1 - eased) * 50}%)`;
            ref.current.style.setProperty('--mood-reveal', Math.max(0, Math.min(1, (progress - .2) / .65)));
        };
        const schedule = () => { if (frame == null) frame = requestAnimationFrame(update); };
        update();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
        };
    }, []);

    return <section ref={transitionRef} className="mood-transition"><div ref={ref} className={`mood-marquee${visible ? ' mood-marquee--playing' : ''}`} data-node-id="143:222" aria-label="Find your mood with Peripera">
        {rows.map((row, index) => <div key={row.id} className="mood-marquee__row" data-node-id={row.id} style={{ '--row-offset': `${row.offset / 19.2}vw`, '--row-gap': `${row.gap / 19.2}vw`, '--row-direction': index % 2 ? 'reverse' : 'normal' }}>
            <div className="mood-marquee__track">
                {[0, 1, 2].map(copy => <div key={copy} className="mood-marquee__group" aria-hidden={copy > 0 ? true : undefined}>
                    {row.items.map(([number, word, color], item) => <span key={word} className="mood-marquee__item" style={{ '--word-color': color || '#ffeef3', '--number-color': color || '#ffdee7', '--hover-color': ['#ff517e', '#92bfea', '#ffa1b9', '#c3e2ff'][(index + item) % 4] }}>
                        <span className="mood-marquee__number">{number}</span><span>{word}</span>
                    </span>)}
                </div>)}
            </div>
        </div>)}
    </div></section>;
}
