import { useEffect, useRef, useState } from 'react';
import './Card.css';
import '../shared/CloudBadge.css';

const image = (file) => `${import.meta.env.BASE_URL}images/card-${file}.png`;
const products = [
    { file: 'b09ee', title: ['[모공 고민별 3-TYPE]', '포어리스 프라이머 팟'], summary: ['모공 고민별 매칭,', '3가지 텍스처로 손쉬운 모공커버'] },
    { file: '83b06', title: ['페리페라 무드', '글로이 틴트'], summary: ['칙칙함 걱정 없이, 더 맑게', '제형은 더 가볍게, 광은 더 예쁘게'] },
    { file: 'a57bc', title: ['페리페라 스피디', '스키니 브로우'], summary: ['한 올씩 자연스럽게 연출되는', '1.5mm 스키니 브로우 펜슬'] },
    { file: 'b1bf6', title: ['맑게 물든 선샤인 치크', '(젤리/파우더)'], summary: ['내 톤에 맞는 컬러로', '두 볼을 맑게 물들일 선샤인 치크'] },
    { file: 'd918f', title: ['페리페라', '잉크 더 벨벳'], summary: ['폭신폭신 쫀쫀한 생크림 제형이', '입술 잔주름 사이사이 매끈하게 밀착 또 밀착'] },
];
// Each decoration uses its own local Figma position, rotation and image crop.
const decorations = [
    { cutout: ['e3fe1', -37.71, 367.31, 248.904, 248.545, 0, 100, 99.27, 0, .4], swatches: [['b50de',401.09,9.29,160,200],['aa33b',11.26,144.49,160,200],['73b9a',375.16,262.21,160,200]], badges: [[470.7,282.73,'NEW'],[498.76,24.11,'NEW'],[108.8,161.55,'NEW']] },
    { cutout: ['46963', 23.044, 285.993, 123.999, 372.168, -16.15, 145.04, 100, -17.99, 0], swatches: [['d9adf',350.41,-9.56,160,160],['ce075',408.98,142.79,160,160]], badges: [[452.76,-5.13,'BEST'],[512.87,141.42,'BEST']] },
    { cutout: ['e8f5a',77.856,245.788,40.791,500.746,-16.15,100,100,0,0], swatches: [['b4099',371,0,160,160],['2757e',417,135,160,160]], badges: [[461,16,'BEST'],[512,150,'BEST']] },
    { cutout: ['650a6', -8.374, 75.239, 248.904, 248.545, -16.15, 100, 99.27, 0, .4], swatches: [['20827',389.98,83.93,160,160],['d6683',356.47,240.95,160,160]], badges: [[503.63,89.71,'NEW'],[470.39,247.7,'NEW']] },
    { cutout: ['6ff07',24.193,293.29,142.962,357.005,-16.15,120.68,100,-14.97,0], swatches: [['8ec09',175.57,16.42,160,160],['d6125',19.19,135.57,160,160],['e583d',389.29,464.6,160,160]], badges: [[285.34,16.55,'NEW'],[127.13,142.53,'NEW'],[501.8,465.46,'NEW']] },
];

function CardDecorations({ index }) {
    const { cutout, swatches, badges } = decorations[index];
    const [file,x,y,width,height,angle,imageWidth,imageHeight,imageX,imageY] = cutout;
    return <div className="card__extras" aria-hidden="true">
        <div className="card__cutout" style={{ left: x, top: y, width, height, transform: `rotate(${angle}deg)` }}>
            <img src={image(file)} alt="" draggable="false" style={{ width: `${imageWidth}%`, height: `${imageHeight}%`, left: `${imageX}%`, top: `${imageY}%` }} />
        </div>
        {swatches.map(([asset,left,top,w,h]) => <img key={asset} className="card__swatch" src={image(asset)} alt="" draggable="false" style={{ left, top, width: w, height: h }} />)}
        {badges.map(([left,top,label],i) => <span key={i} className={`card__badge${label === 'NEW' ? ' card__badge--new' : ''}`} style={{ left, top }}>{label}</span>)}
    </div>;
}
// Unrotated card centers and tops from the five Figma slots.
const slots = [
    [-31.571, 487.1125], [439.392, 267.409], [960.5, 192],
    [1482.392, 274.409], [1952.429, 489.1125],
];
const wrap = (value) => ((value % products.length) + products.length) % products.length;
const relative = (index, current) => wrap(index - current + 2.5) - 2.5;
const position = (offset) => {
    const point = offset + 2;
    const lower = Math.max(0, Math.min(3, Math.floor(point)));
    const amount = point - lower;
    return slots[lower].map((value, axis) => value + (slots[lower + 1][axis] - value) * amount);
};

export default function Card() {
    const sectionRef = useRef(null);
    useEffect(() => {
        const section = sectionRef.current;
        let frame = null;
        const update = () => {
            frame = null;
            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const pinArea = section.parentElement;
            const progress = reduced ? 1 : Math.max(0, Math.min(1, (window.innerHeight - pinArea.getBoundingClientRect().top) / window.innerHeight));
            const eased = progress * progress * (3 - 2 * progress);
            const width = section.clientWidth;
            const height = section.offsetHeight;
            const scale = parseFloat(getComputedStyle(section).getPropertyValue('--card-scale')) || 1;
            section.style.setProperty('--card-pin-top', `${-75 * scale}px`);
            // A true circular cap expands from the center. Continue the fill
            // below the cap so the bottom never becomes a circular cutout.
            const radius = width * .16 * Math.pow(25, eased);
            const center = width / 2;
            const left = center - radius;
            const right = center + radius;
            const bottom = Math.max(height, radius + 1);
            section.style.clipPath = progress >= 1 ? 'none' : `path('M ${left} ${radius} A ${radius} ${radius} 0 0 1 ${right} ${radius} L ${right} ${bottom} L ${left} ${bottom} Z')`;
            section.style.setProperty('--card-reveal', Math.max(0, Math.min(1, (progress - .65) / .3)));
        };
        const schedule = () => { if (frame === null) frame = requestAnimationFrame(update); };
        update();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
    }, []);
    const dragRef = useRef(null);
    const suppressClick = useRef(false);
    const cursorRef = useRef(null);
    const cursorMotion = useRef({ frame: null, current: null, target: null });
    const [cursorVisible, setCursorVisible] = useState(false);
    const [cursorDirection, setCursorDirection] = useState(1);
    const [current, setCurrent] = useState(2);
    const [drag, setDrag] = useState(0);
    const [dragging, setDragging] = useState(false);
    const active = products[wrap(current)];

    const hideCursor = () => {
        cancelAnimationFrame(cursorMotion.current.frame);
        cursorMotion.current.frame = null;
        cursorMotion.current.current = null;
        setCursorVisible(false);
    };
    useEffect(() => {
        const motion = cursorMotion.current;
        window.addEventListener('blur', hideCursor);
        window.addEventListener('scroll', hideCursor, { passive: true });
        document.documentElement.addEventListener('pointerleave', hideCursor);
        return () => {
            cancelAnimationFrame(motion.frame);
            window.removeEventListener('blur', hideCursor);
            window.removeEventListener('scroll', hideCursor);
            document.documentElement.removeEventListener('pointerleave', hideCursor);
        };
    }, []);

    const followCursor = (event) => {
        if (event.pointerType !== 'mouse') return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const motion = cursorMotion.current;
        motion.target = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
        setCursorDirection(motion.target.x < bounds.width / 2 ? -1 : 1);
        setCursorVisible(true);
        if (!motion.current) motion.current = { ...motion.target };
        if (motion.frame !== null) return;
        let previous;
        const animate = (time) => {
            if (!cursorRef.current) return;
            const easing = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 1 - Math.pow(.8, Math.min(time - (previous ?? time - 16.67), 50) / 16.67);
            previous = time;
            motion.current.x += (motion.target.x - motion.current.x) * easing;
            motion.current.y += (motion.target.y - motion.current.y) * easing;
            cursorRef.current.style.left = `${motion.current.x}px`;
            cursorRef.current.style.top = `${motion.current.y}px`;
            if (Math.abs(motion.target.x - motion.current.x) + Math.abs(motion.target.y - motion.current.y) < .2) { motion.frame = null; return; }
            motion.frame = requestAnimationFrame(animate);
        };
        motion.frame = requestAnimationFrame(animate);
    };

    useEffect(() => {
        const section = sectionRef.current;
        const observer = new ResizeObserver(() => {
            section.style.setProperty('--card-scale', Math.max(section.clientWidth / 1920, 0.55));
        });
        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    const step = (amount) => setCurrent((value) => value + amount);
    const startDrag = (event) => {
        if (event.button !== 0 || event.target.closest('.card__controls')) return;
        suppressClick.current = false;
        dragRef.current = { x: event.clientX, pointerId: event.pointerId };
    };
    const moveDrag = (event) => {
        if (!dragRef.current) return;
        const distance = event.clientX - dragRef.current.x;
        if (Math.abs(distance) < 6 && !suppressClick.current) return;
        suppressClick.current = true;
        setDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
        const scale = parseFloat(getComputedStyle(sectionRef.current).getPropertyValue('--card-scale'));
        setDrag(Math.max(-1.9, Math.min(1.9, distance / (521 * scale))));
    };
    const endDrag = (event) => {
        if (!dragRef.current) return;
        if (event.type !== 'pointercancel') {
            const distance = event.clientX - dragRef.current.x;
            const change = Math.round(-drag) || (Math.abs(distance) > 55 ? -Math.sign(distance) : 0);
            if (change) step(change);
        }
        dragRef.current = null;
        setDrag(0);
        setDragging(false);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    };

    return <section ref={sectionRef} className={`card${dragging ? ' card--dragging' : ''}`} data-node-id="2083:465" aria-label="추천 제품">
        <div className="card__viewport" role="region" aria-roledescription="캐러셀" aria-label="추천 제품 카드, 좌우로 드래그하여 보기" tabIndex={0}
            onPointerDown={startDrag} onPointerMove={(event) => { followCursor(event); moveDrag(event); }} onPointerUp={endDrag} onPointerCancel={(event) => { endDrag(event); hideCursor(); }} onPointerLeave={hideCursor}
            onClickCapture={(event) => {
                if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; return; }
                if (event.detail > 0 && cursorVisible) {
                    event.preventDefault(); event.stopPropagation();
                    const bounds = event.currentTarget.getBoundingClientRect();
                    step(event.clientX - bounds.left < bounds.width / 2 ? -1 : 1);
                }
            }}
            onKeyDown={(event) => {
                if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                    event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1);
                }
            }}>
            <div className="card__canvas">
                <h2 className="card__heading" data-node-id="667:449">RECOMMEND</h2>
                {products.map((product, index) => {
                    const offset = relative(index, current - drag);
                    const [left, top] = position(offset);
                    const selected = index === wrap(current);
                    return <article key={product.file} className={`card__item${selected && !dragging ? ' card__item--active' : ''}`} style={{ left, top, '--card-angle': `${offset * 15}deg`, zIndex: 10 - Math.round(Math.abs(offset) * 2) }}>
                        <button type="button" className="card__photo" aria-label={`${product.title.join(' ')}${selected ? ', 선택됨' : ' 선택'}`} aria-pressed={selected} onClick={() => step(Math.round(relative(index, current)))}>
                            <img src={image(product.file)} alt={product.title.join(' ')} draggable="false" />
                        </button>
                        <CardDecorations index={index} />
                        <div className="card__caption" aria-hidden={!selected}>
                            <h3>{product.title.map((line) => <span key={line}>{line}</span>)}</h3>
                            <p>{product.summary.map((line) => <span key={line}>{line}</span>)}</p>
                        </div>
                    </article>;
                })}
                <div className="card__controls">
                    <span className="card__count">{wrap(current) + 1} / {products.length}</span>
                </div>
            </div>
            <div ref={cursorRef} className={`card__cursor cloud-badge${cursorVisible ? ' card__cursor--visible' : ''}`} aria-hidden="true" style={{ '--cursor-shape': `url("${import.meta.env.BASE_URL}images/15477.png")` }}><span className="cloud-badge__eyes" /><span className="cloud-badge__label">{dragging ? 'DRAG' : cursorDirection === 1 ? 'NEXT' : 'PREV'}</span></div>
        </div>
        <p className="card__sr-only" aria-live="polite" aria-atomic="true">{active.title.join(' ')}. {wrap(current) + 1}번째 추천 제품, 총 {products.length}개.</p>
    </section>;
}
