import { useEffect, useRef, useState } from 'react';
import './Brand.css';

const image = (file) => `${import.meta.env.BASE_URL}images/brand-${file}-new.png`;

export default function Brand() {
    const sectionRef = useRef(null);
    const [visible, setVisible] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let active = true;
        Promise.all([...sectionRef.current.querySelectorAll('img')].map((img) => img.decode())).then(() => { if (active) setReady(true); });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisible(true);
                observer.disconnect();
            }
        }, { rootMargin: '0px 0px -35% 0px', threshold: 0.12 });
        observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return <section ref={sectionRef} className={`brand${visible && ready ? ' brand--visible' : ''}`} aria-label="PERIPERA" data-node-id="2083:458">
        <img className="brand__back" src={image('back')} alt="" data-node-id="2083:453" />
        <div className="brand__product" data-node-id="2083:456"><img src={image('product')} alt="페리페라 무드 글로이 틴트" draggable="false" /></div>
        <div className="brand__word brand__word--peri" data-node-id="741:430">
            <div className="brand__motion"><div className="brand__crop"><img src={image('peri')} alt="PERI" draggable="false" /></div></div>
        </div>
        <div className="brand__word brand__word--pera" data-node-id="741:431">
            <div className="brand__motion"><div className="brand__crop"><img src={image('pera')} alt="PERA" draggable="false" /></div></div>
        </div>
    </section>;
}
