import { useEffect, useRef, useState } from 'react';
import './Hero.css';
import '../shared/CloudBadge.css';

const image = (file) => `${import.meta.env.BASE_URL}images/${file}`;
const letters = [
    ['8a419.png', 209, 824, 208, '225:292'],
    ['4ce06.png', 334, 781, 208, '225:293'],
    ['a9d5c.png', 467, 824, 208, '225:294'],
    ['7a6cb.png', 90, 524, 212, '225:295'],
    ['7a404.png', 219, 569, 212, '225:296'],
    ['b704e.png', 356, 503, 212, '225:297'],
    ['afa1b.png', 491, 543, 212, '225:298'],
    ['fac25.png', 597, 798, 208, '225:299'],
];

export default function Hero({ onSearchClick, onCartClick, onAccountClick }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [revealStep, setRevealStep] = useState(0);
    const [pointerInside, setPointerInside] = useState(false);
    const tapRef = useRef(null);
    const pointerMotion = useRef({ frame: null, current: null, target: null });

    const stopFollowing = () => {
        cancelAnimationFrame(pointerMotion.current.frame);
        pointerMotion.current.frame = null;
        pointerMotion.current.current = null;
    };

    useEffect(() => {
        const hideTap = () => { setPointerInside(false); stopFollowing(); };
        window.addEventListener('blur', hideTap);
        document.documentElement.addEventListener('pointerleave', hideTap);
        return () => {
            stopFollowing();
            window.removeEventListener('blur', hideTap);
            document.documentElement.removeEventListener('pointerleave', hideTap);
        };
    }, []);

    const followPointer = (event) => {
        if (event.pointerType !== 'mouse' || !tapRef.current) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const tap = tapRef.current;
        const x = event.clientX - bounds.left - event.currentTarget.clientLeft;
        const y = event.clientY - bounds.top - event.currentTarget.clientTop;
        const motion = pointerMotion.current;
        motion.target = {
            x: Math.max(0, Math.min(x + 16, event.currentTarget.clientWidth - tap.offsetWidth)),
            y: Math.max(0, Math.min(y + 12, event.currentTarget.clientHeight - tap.offsetHeight)),
        };
        if (!motion.current) motion.current = { ...motion.target };
        if (motion.frame === null) {
            let previousTime;
            const animate = (time) => {
                if (!tapRef.current) { stopFollowing(); return; }
                const easing = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 1 - Math.pow(0.8, Math.min(time - (previousTime ?? time - 16.67), 50) / 16.67);
                previousTime = time;
                motion.current.x += (motion.target.x - motion.current.x) * easing;
                motion.current.y += (motion.target.y - motion.current.y) * easing;
                tapRef.current.style.left = `${motion.current.x}px`;
                tapRef.current.style.top = `${motion.current.y}px`;
                if (Math.abs(motion.target.x - motion.current.x) + Math.abs(motion.target.y - motion.current.y) < 0.2) { motion.frame = null; return; }
                motion.frame = requestAnimationFrame(animate);
            };
            motion.frame = requestAnimationFrame(animate);
        }
        setPointerInside(true);
    };

    const resetPointer = () => {
        stopFollowing();
        setPointerInside(false);
        tapRef.current?.style.removeProperty('left');
        tapRef.current?.style.removeProperty('top');
    };
    const revealNext = () => setRevealStep((step) => Math.min(step + 1, 6));
    const handleHeroClick = (event) => {
        if (event.target.closest('button, a, input, nav')) return;
        revealNext();
    };
    return (
        <section className={`hero${revealStep < 6 ? ' hero--interactive' : ''}`} onClick={handleHeroClick} onPointerMove={followPointer} onPointerLeave={resetPointer} aria-label="페리페라" data-node-id="225:289">
            <h1 className="hero__sr-only">peripera</h1>
            <div className="hero__art" aria-hidden="true">
                <div className="hero__paper-back" data-node-id="225:290"><img src={image('3fd49.png')} alt="" draggable="false" /></div>
                <img className="hero__paper-front" src={image('90f93.png')} alt="" draggable="false" data-node-id="225:291" />
                {letters.map(([file, x, y, size, node]) => (
                    <img key={node} className="hero__letter"
                        src={image(file)} alt="" draggable="false" data-node-id={node}
                        style={{ left: `${x / 19.2}%`, top: `${y / 10.8}%`, width: `${size / 19.2}%` }} />
                ))}
                {revealStep >= 2 && <div className="hero__model" data-node-id="233:684"><img src={image('hero-model.png')} alt="" draggable="false" /></div>}
                {revealStep >= 3 && <div className="hero__model-second" data-node-id="233:712"><img src={image('hero-model-second.png')} alt="" draggable="false" /></div>}
                {revealStep >= 6 && <img className="hero__products" src={image('hero-products.png')} alt="" draggable="false" data-node-id="233:794" />}
                {revealStep >= 4 && <div className="hero__heart" data-node-id="233:741"><img src={image('hero-heart.png')} alt="" draggable="false" /></div>}
                {revealStep >= 1 && <img className="hero__lips" src={image('hero-lips.png')} alt="" draggable="false" data-node-id="233:688" />}
                {revealStep >= 5 && <div className="hero__heart-blue" data-node-id="233:770"><img src={image('hero-heart-blue.png')} alt="" draggable="false" /></div>}
            </div>
            <header className="hero__header" data-node-id="225:300">
                <button className="hero__icon hero__menu" type="button" aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'} aria-expanded={menuOpen} aria-controls="hero-navigation" onClick={() => setMenuOpen(!menuOpen)}><img src={image('84646.svg')} alt="" /></button>
                <a className="hero__logo" href="#main" aria-label="페리페라 홈" onClick={() => setMenuOpen(false)}><img src={image('4d982.png')} alt="peripera" /></a>
                <div className="hero__actions">
                    <button className="hero__icon" type="button" aria-label="검색" onClick={onSearchClick}><img src={image('471ff.svg')} alt="" /></button>
                    <button className="hero__icon" type="button" aria-label="장바구니" onClick={onCartClick}><img src={image('b6d46.svg')} alt="" /></button>
                    <button className="hero__icon" type="button" aria-label="마이페이지" onClick={onAccountClick}><img src={image('0d796.svg')} alt="" /></button>
                </div>
            </header>
            {menuOpen && <nav className="hero__navigation" id="hero-navigation" aria-label="메인 메뉴">
                <a href="#main" onClick={() => setMenuOpen(false)}>peripera 홈</a>
                <button type="button" onClick={() => setMenuOpen(false)}>닫기</button>
            </nav>}
            {revealStep < 6 && <button ref={tapRef} style={{ '--cursor-shape': `url("${image('15477.png')}")` }} className={`hero__tap cloud-badge${pointerInside ? ' hero__tap--visible' : ''}`} type="button" aria-label={['입술 이미지 보기', '모델 이미지 보기', '두 번째 모델 이미지 보기', '하트 이미지 보기', '파란 하트 이미지 보기', '제품 이미지 보기'][revealStep]} onClick={revealNext}><span className="cloud-badge__eyes" aria-hidden="true" /><span className="cloud-badge__label">Tap Me!</span></button>}

        </section>
    );
}
