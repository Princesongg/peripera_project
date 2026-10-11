import { useEffect, useRef, useState } from 'react';
import './PreFooter.css';

const photos = [7, 6, 5, 4, 3, 2, 1];
const image = name => `${import.meta.env.BASE_URL}images/pre-${name}`;

export default function PreFooter() {
    const pointer = useRef(null);
    const [index, setIndex] = useState(10);
    const [drag, setDrag] = useState(0);
    const [moving, setMoving] = useState(true);
    const [interacting, setInteracting] = useState(false);

    useEffect(() => {
        if (interacting || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const timer = setInterval(() => setIndex(value => value + 1), 1800);
        return () => clearInterval(timer);
    }, [interacting]);
    useEffect(() => {
        if (moving) return;
        let second;
        const frame = requestAnimationFrame(() => { second = requestAnimationFrame(() => setMoving(true)); });
        return () => { cancelAnimationFrame(frame); cancelAnimationFrame(second); };
    }, [moving]);
    useEffect(() => {
        if (index >= 7 && index < 14) return;
        const timer = setTimeout(() => {
            setMoving(false);
            setIndex(value => ((value % 7) + 7) % 7 + 7);
        }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350);
        return () => clearTimeout(timer);
    }, [index]);

    const finish = event => {
        if (!pointer.current) return;
        const distance = event.clientX - pointer.current.x;
        pointer.current = null;
        setDrag(0);
        setMoving(true);
        setInteracting(false);
        if (event.type !== 'pointercancel' && Math.abs(distance) > 35) setIndex(value => value + (distance < 0 ? 1 : -1));
    };

    return <section className="pre-footer" data-node-id="288:111" aria-label="Peripera Instagram gallery">
        <div className={`pre-footer__viewport${interacting ? ' pre-footer__viewport--dragging' : ''}`} tabIndex={0} role="region" aria-roledescription="carousel" aria-label="페리페라 사진, 좌우 방향키로 넘기기"
            onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); setIndex(value => value + (event.key === 'ArrowRight' ? 1 : -1)); } }}
            onPointerDown={event => { if (event.button !== 0 || event.target.closest('a')) return; pointer.current = { x: event.clientX }; event.currentTarget.setPointerCapture(event.pointerId); setInteracting(true); }}
            onPointerMove={event => { if (pointer.current) setDrag(event.clientX - pointer.current.x); }}
            onPointerUp={finish} onPointerCancel={finish}>
            <div className="pre-footer__track" style={{ '--slide-index': index, '--drag-distance': `${drag}px`, transition: interacting || !moving ? 'none' : undefined }}
                onTransitionEnd={event => { if (event.target !== event.currentTarget) return; if (index >= 14 || index < 7) { setMoving(false); setIndex(value => ((value % 7) + 7) % 7 + 7); } }}>
                {Array.from({ length: 21 }, (_, slot) => {
                    const photo = photos[slot % 7];
                    return <div key={slot} className={`pre-footer__card pre-footer__card--${photo}`} aria-hidden={slot < 7 || slot >= 14 ? true : undefined}>
                        <img className="pre-footer__photo" src={image(`insta${photo}.png`)} alt={`페리페라 컬러 무드 사진 ${photo}`} draggable="false" />

                    </div>;
                })}
            </div>
                        <div className="pre-footer__card pre-footer__profile pre-footer__profile--fixed">
                            <div className="pre-footer__collage"><img src={image('collage.png')} alt="페리페라 핑크 콜라주" draggable="false" /></div>
                            <img className="pre-footer__logo" src={image('logo.png')} alt="peripera" draggable="false" />
                            <p className="pre-footer__handle">@peripera_official</p>
                            <p className="pre-footer__tagline">Play With PeriPera♥</p>
                            <a className="pre-footer__instagram" href="https://www.instagram.com/peripera_official/" target="_blank" rel="noopener noreferrer" aria-label="페리페라 인스타그램 새 창으로 보기"><img src={image('instagram.svg')} alt="" draggable="false" /></a>
                        </div>
        </div>
    </section>;
}
