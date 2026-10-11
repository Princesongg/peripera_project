import { useEffect, useRef, useState } from 'react';
import './Con1.css';

const image = (file) => `${import.meta.env.BASE_URL}images/con1-${file}`;
const products = [
    [-1084,149,'f9539.png',450,0,79,178,0,'잉크 더 벨벳','잉크처럼 선명한 컬러로 오래도록','컬러 하나 하나 뚜렷한 존재감'],
    [-605,369,'81436.png',350,8,0,0,338,'잉크 글래스팅 립글로스 플럼퍼','다각도로 빛나는 펄감이 더해져','입술을 영롱하고 도톰해 보이게 연출'],
    [-217,200,'b52b3.png',400,0,0,72,382,'무드 라이크 하이라이터','영롱한 요정광으로 코 존재감 발굴','무드라이크 하이라이터'],
    [225,302,'acee5.png',500,0,78,184,0,'무드 글로이 틴트','가볍지만 확실한 광감으로','주름을 커버해 매끈한 입술 연출'],
    [860,266,'ac29a.png',350,0,0,37,340,'워터 베어 틴트','끈적임 걱정 없이 투명하게 배어드는','생기 애착 수분 촉촉 틴트'],
    [1303,299,'4671f.png',423,0,115,142,0,'무드 블러 틴트','분위기 있게 퍼져드는 블러 무드','포근 무광 블러링'],
    [1803,215,'dc7d6.png',350,28,0,0,332,'맑게 물든 선샤인 치크','여러 번 덧발라도 뭉침 걱정 없이','차곡차곡 쌓이는 자연스러운 컬러 레이어링'],
    [2263,308,'795b4.png',500,0,99,9,0,'올테이크 무드 팔레트','맞춤 제작한 듯 톤별 컬러 맞춤 배열','동시 힛팬 올테이크 무드 팔레트'],
];
const decorations = [
    ['a90bb.png',627,746,74,77],['5c981.png',1831,216,34,35],
    ['7dc77.png',-1046,180,38,33],['7dc77.png',159,250,54,48],
    ['e0055.png',-643,679,36,37],['e0055.png',1241,65,31,32],
    ['36f81.png',-323,331,54,56],['36f81.png',-976,828,54,56],
    ['36f81.png',1372,348,73,76],['36f81.png',515,881,73,76],
    ['36f81.png',143,469,54,56],['36f81.png',833,283,54,56],
    ['36f81.png',2245,413,54,56],['7dc77.png',1632,830,30,27],['7dc77.png',2230,496,30,27],
];

export default function Con1() {
    const viewportRef = useRef(null);
    const dragRef = useRef(null);
    const suppressClickRef = useRef(false);
    const dialogRef = useRef(null);
    const [selected, setSelected] = useState(null);
    useEffect(() => {
        if (selected === null) return;
        const dialog = dialogRef.current;
        const trigger = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.showModal();
        return () => {
            dialog.close();
            document.body.style.overflow = previousOverflow;
            if (trigger instanceof HTMLElement) trigger.focus({ preventScroll: true });
        };
    }, [selected]);
    useEffect(() => {
        const viewport = viewportRef.current;
        let previousScale;
        const observer = new ResizeObserver(() => {
            const scale = Math.max(viewport.clientWidth / 1920, 0.45);
            const position = previousScale ? viewport.scrollLeft / previousScale : 1084;
            viewport.style.setProperty('--con1-scale', scale);
            viewport.scrollLeft = position * scale;
            previousScale = scale;
        });
        observer.observe(viewport);
        return () => observer.disconnect();
    }, []);
    const startDrag = (event) => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        suppressClickRef.current = false;
        dragRef.current = { x: event.clientX, scroll: event.currentTarget.scrollLeft };
        event.currentTarget.classList.add('con1__viewport--dragging');
    };
    const stopDrag = (event) => {
        dragRef.current = null;
        event.currentTarget.classList.remove('con1__viewport--dragging');
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    };
    return <section className="con1" aria-label="페리페라 제품 컬렉션" data-node-id="171:64">
        <div ref={viewportRef} className="con1__viewport" tabIndex={0} role="region" aria-label="제품 목록, 좌우로 스크롤하여 더 보기"
            onPointerDown={startDrag} onPointerUp={stopDrag} onPointerCancel={stopDrag}
            onClickCapture={(event) => { if (suppressClickRef.current) { event.preventDefault(); event.stopPropagation(); suppressClickRef.current = false; } }}
            onPointerMove={(event) => {
                if (!dragRef.current) return;
                const distance = event.clientX - dragRef.current.x;
                if (Math.abs(distance) > 6) {
                    suppressClickRef.current = true;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    event.currentTarget.scrollLeft = dragRef.current.scroll - distance;
                }
            }}>
            <div className="con1__canvas">
                {products.map(([x,y,file,size,ix,iy,tx,ty,title,line1,line2], index) => <article className="con1__product" key={file} data-node-id={`587:${149 + index}`} style={{ left: x + 1084, top: y }}>
                    <button type="button" className={`con1__image${file === 'ac29a.png' ? ' con1__image--crop' : ''}`} style={{ left: ix, top: iy, width: size, height: file === 'ac29a.png' ? 355 : size }} aria-label={`${title} 제품 자세히 보기`} aria-haspopup="dialog" onClick={() => setSelected(index)}><img src={image(file)} alt={title} draggable="false" /></button>
                    <div className="con1__description" style={{ left: tx, top: ty }}>
                        <button type="button" className="con1__heart-button" aria-label={`${title} 요약 보기`} aria-haspopup="dialog" onClick={() => setSelected(index)}><img className="con1__heart" src={image('99344.svg')} alt="" /></button>
                        <h2>{title}</h2><p><span>{line1}</span><span>{line2}</span></p>
                    </div>
                </article>)}
                <div className="con1__decorations" aria-hidden="true">{decorations.map(([file,x,y,width,height], index) => <span key={index} className="con1__gem" style={{ left: x + 1084, top: y, width, height, '--twinkle-delay': `${-index * 0.73}s`, '--twinkle-duration': `${2.8 + (index % 4) * 0.45}s` }}><img src={image(file)} alt="" draggable="false" /><i className="con1__glint" /></span>)}</div>
            </div>
        </div>
        <dialog ref={dialogRef} className="con1__dialog" aria-labelledby="con1-dialog-title" aria-describedby="con1-dialog-summary" onCancel={() => setSelected(null)} onClick={(event) => {
            if (event.target !== event.currentTarget) return;
            const bounds = event.currentTarget.getBoundingClientRect();
            if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setSelected(null);
        }}>
            {selected !== null && <div className="con1__dialog-content">
                <button type="button" className="con1__dialog-close" aria-label="제품 요약 닫기" autoFocus onClick={() => setSelected(null)}><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 5 19 19M19 5 5 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
                <div className="con1__dialog-image"><img src={image(products[selected][2])} alt={products[selected][8]} /></div>
                <div className="con1__dialog-info">
                    <span className="con1__dialog-brand">PERIPERA</span>
                    <h2 id="con1-dialog-title">{products[selected][8]}</h2>
                    <p id="con1-dialog-summary">{products[selected][9]}<br />{products[selected][10]}</p>
                    <button type="button" className="con1__purchase" disabled>구매하러 가기</button>
                    <small>본 사이트는 개인 포트폴리오용으로 제작되었으며, 실제 구매 기능은 제공하지 않습니다.</small>
                </div>
            </div>}
        </dialog>
    </section>;
}
