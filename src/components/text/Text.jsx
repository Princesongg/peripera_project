import { useEffect, useRef, useState } from 'react';
import './Text.css';

const headline = 'What’s your color today?';

export default function Text() {
    const sectionRef = useRef(null);
    const [started, setStarted] = useState(false);
    const [count, setCount] = useState(0);
    const complete = count === headline.length;

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setStarted(true);
                observer.disconnect();
            }
        }, { threshold: 0.35 });
        observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!started || complete) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setCount(headline.length);
            return;
        }
        const delay = count === 0 ? 300 : headline[count - 1] === ' ' ? 145 : 75;
        const timer = window.setTimeout(() => setCount((value) => value + 1), delay);
        return () => window.clearTimeout(timer);
    }, [started, count, complete]);

    return <section ref={sectionRef} className={`text${complete ? ' text--complete' : ''}`} data-node-id="383:149" aria-label="나만의 컬러 찾기">
        <div className="text__content">
            <h2 className="text__headline" data-node-id="383:134" aria-label={headline}>
                <span aria-hidden="true">{Array.from(headline).map((letter, index) => <span key={index} className={`text__letter${index < count ? ' text__letter--visible' : ''}${started && !complete && index === Math.max(0, count - 1) ? ' text__letter--cursor' : ''}`}>{letter}</span>)}</span>
            </h2>
            <p className="text__description" data-node-id="722:412">
                <span>Find the shade that matches your mood and makes today feel more like you.</span>
                <span>Play your color, your way with Peripera.</span>
            </p>
        </div>
    </section>;
}
