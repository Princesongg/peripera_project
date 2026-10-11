import { useEffect, useRef, useState } from 'react';
import './TopButton.css';

export default function TopButton() {
    const buttonRef = useRef(null);
    const [inverse, setInverse] = useState(false);

    useEffect(() => {
        let frame;
        const update = () => {
            frame = null;
            const button = buttonRef.current;
            const bounds = button.getBoundingClientRect();
            const layers = document.elementsFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
            for (const layer of layers) {
                if (button.contains(layer)) continue;
                const values = getComputedStyle(layer).backgroundColor.match(/[\d.]+/g)?.map(Number);
                if (!values || (values.length === 4 && values[3] < .5)) continue;
                const [r, g, b] = values;
                const luminance = (.2126 * r + .7152 * g + .0722 * b) / 255;
                const pinkDistance = Math.hypot(r - 195, g - 95, b - 123);
                setInverse(luminance < .55 || pinkDistance < 100);
                return;
            }
            setInverse(false);
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

    return <button ref={buttonRef} className={`top-button${inverse ? ' top-button--inverse' : ''}`} aria-label="맨 위로 이동" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>
        <img className="top-button__circle" src={`${import.meta.env.BASE_URL}images/top-circle.svg`} alt="" width="50" height="50" />
        <img className="top-button__arrow" src={`${import.meta.env.BASE_URL}images/top-arrow.svg`} alt="" width="12.0023" height="8.91731" />
        <span>TOP</span>
    </button>;
}
