import './Footer.css';

const asset = name => `${import.meta.env.BASE_URL}images/footer-${name}.svg`;
const menu = ['회사소개', '개인정보 처리방침', '해외수출 문의', '클리오 IR', '제휴/마케팅 문의'];
const socials = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['youtube', 'YouTube'], ['kakao', 'Kakao']];

export default function Footer() {
    return <footer className="footer" data-node-id="724:148">
        <div className="footer__socials" data-node-id="724:161">
            {socials.map(([name, label]) => <span key={name} title={label}><img src={asset(name)} alt={label} /></span>)}
        </div>
        <div className="footer__menu" data-node-id="724:150">
            {menu.map((label, index) => <span className="footer__menu-item" key={label}>
                {index > 0 && <span className="footer__short-divider"><img src={asset('menu-line')} alt="" /></span>}
                <span>{label}</span>
            </span>)}
        </div>
        <div className="footer__details" data-node-id="724:170">
            <div className="footer__support" data-node-id="724:171">
                <p className="footer__support-title">고객만족센터</p>
                <p className="footer__phone">080-080-1510</p>
                <p className="footer__hours">1:1 문의<br />챗봇 상담 : 24시간<br />상담원 채팅 운영시간 : 09:00~18:00</p>
            </div>
            <div className="footer__long-divider"><img src={asset('divider')} alt="" /></div>
            <div className="footer__company" data-node-id="724:177">
                <p className="footer__company-title"><span>(주) 클리오</span><span className="footer__short-divider"><img src={asset('company-line')} alt="" /></span><span>대표 : 한현옥</span></p>
                <p>주소 : 서울 성동구 왕십리로 66 (성수동1가)</p>
                <p className="footer__registration">사업자등록번호 : 211-86-22189<br />통신판매업신고번호 : 제 2020-서울성동-00339호</p>
                <p className="footer__registration">개인정보담당자 : 이연재 팀장</p>
            </div>
        </div>
        <p className="footer__wordmark" data-node-id="724:149">PeriPera</p>
    </footer>;
}
