import { useEffect, useRef, useState } from 'react';
import './Play.css';

export default function Play({ variant = 'play' }) {
    const isYour = variant === 'your';
    const isColor = variant === 'color';
    const heading = isColor ? 'COLOR' : isYour ? 'YOUR' : 'PLAY';
    const finalAngle = isColor ? 1.37 : isYour ? 8.33 : -3.98;
    const image = (file) => `${import.meta.env.BASE_URL}images/${variant}-${file}`;
    const [notice, setNotice] = useState(false);
    const sectionRef = useRef(null);
    const [typing, setTyping] = useState(false);
    const [letters, setLetters] = useState(0);
    useEffect(() => {
        const section = sectionRef.current;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        let frame = null;
        let startTime = null;
        const render = (progress) => {
            const eased = 1 - Math.pow(1 - progress, 3);
            section.style.setProperty('--play-rise', `${reduced.matches ? 0 : (1 - eased) * 75}vh`);
            section.style.setProperty('--play-rotation', `${reduced.matches ? finalAngle : 18 + eased * (finalAngle - 18)}deg`);
            section.style.setProperty('--play-scale', reduced.matches ? 1 : .86 + eased * .14);
        };
        const update = () => {
            frame = null;
            const bounds = section.getBoundingClientRect();
            section.style.setProperty('--play-pin-top', `${Math.min(0, window.innerHeight - section.offsetHeight)}px`);
            // Reset as soon as the section leaves its presentation area, so
            // returning from either scroll direction replays the entrance.
            const next = section.nextElementSibling;
            const covered = next?.classList.contains('play') && next.getBoundingClientRect().top <= window.innerHeight * .15;
            const inPresentation = bounds.top <= window.innerHeight * .15 && bounds.bottom >= window.innerHeight * .85 && !covered;
            if (!inPresentation) {
                startTime = null;
                setTyping(false);
                setLetters(0);
                render(0);
                return;
            }
            if (startTime === null) {
                startTime = performance.now();
                setTyping(true);
            }
            const progress = startTime === null ? 0 : reduced.matches ? 1 : Math.min(1, (performance.now() - startTime) / 1450);
            render(progress);
            if (startTime !== null && progress < 1) frame = requestAnimationFrame(update);
        };
        const schedule = () => { if (frame === null) frame = requestAnimationFrame(update); };
        update();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
    }, [finalAngle]);
    useEffect(() => {
        if (!typing || letters === heading.length) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setLetters(heading.length); return; }
        const timer = setTimeout(() => setLetters((value) => value + 1), letters === 0 ? 180 : 280);
        return () => clearTimeout(timer);
    }, [typing, letters, heading]);
    return <section ref={sectionRef} className={`play${variant !== 'play' ? ` ${variant}` : ''}`} data-node-id={isColor ? '167:56' : isYour ? '167:54' : '167:44'} aria-label={isColor ? 'Color hits different' : isYour ? 'Your face, your vibe' : 'Play your color'}>
        <div className="play__canvas">
            <img className="play__logo" src={image('logo.png')} alt="peripera" data-node-id={isColor ? '337:273' : isYour ? '337:261' : '337:257'} />
            <div className="play__photo" data-node-id={isColor ? '167:63' : isYour ? '167:62' : '167:58'}><img src={image('photo.png')} alt={isColor ? '다양한 컬러 무드를 소개하는 페리페라 모델 카드' : isYour ? '나만의 메이크업 컬러를 소개하는 페리페라 모델 카드' : '핑크 컬러 메이크업과 페리페라 틴트를 소개하는 모델 카드'} draggable="false" /></div>
            <div className="play__text" data-node-id={isColor ? '337:260' : isYour ? '337:259' : '337:258'}>
                {isColor ? <p>Color hits different.<br />From soft blur to glossy pop,<br />make every mood visible.</p> : isYour ? <p>Your face, your vibe.<br />Pick the shade that feels right today,<br />and wear it like a signature.</p> : <p>Play with the mood.<br />Layer it, switch it, make it yours.<br />No rules, just good color.</p>}
                <h2 aria-label={heading}><span aria-hidden="true">{Array.from(heading).map((letter,index) => <span key={`${letter}-${index}`} className={`play__letter${index < letters ? ' play__letter--visible' : ''}${typing && letters < heading.length && index === Math.max(0,letters - 1) ? ' play__letter--cursor' : ''}`}>{letter}</span>)}</span></h2>
                <button type="button" className="play__more" aria-expanded={notice} onClick={() => setNotice((value) => !value)}><img src={image('arrow.svg')} alt="" /><span>View More</span></button>
                {notice && <small className="play__notice" role="status">개인 포트폴리오용으로 제작된 페이지입니다.</small>}
            </div>
        </div>
    </section>;
}
