import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "NEXPLAY가 무엇을 수집하고 무엇을 수집하지 않는지, 얼마나 보관하는지 적어 둡니다.",
  alternates: { canonical: "/privacy" },
};

/*
 * 실제 동작 그대로 적는다. 흔한 문구를 옮겨 오면 코드와 어긋나고, 어긋난 방침은
 * 없느니만 못하다. 아래 내용은 전부 지금 돌아가는 코드에서 확인한 것이다.
 */
export default function PrivacyPage() {
  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">개인정보처리방침</span>
      <h1>무엇을 수집하고 무엇을 안 하는지</h1>
      <p>NEXPLAY는 회원가입이 없습니다. 그래도 수집하는 것이 있어 그대로 적어 둡니다.</p>
    </div>

    <section className="content-section legal">
      <h2>1. 수집하는 것</h2>
      <h3>기대 표시를 누를 때</h3>
      <p>
        같은 사람이 한 게임에 여러 번 누르는 것을 막기 위해, 접속 주소(IP)에 비밀값을 섞어
        되돌릴 수 없는 형태로 바꾼 <b>해시값 하나</b>를 저장합니다.
        <b> 접속 주소 자체는 어디에도 저장하지 않습니다.</b>
      </p>
      <ul>
        <li>저장 항목: 게임 번호, 해시값, 누른 시각</li>
        <li>목적: 중복 집계 방지</li>
        <li>보관: <b>180일</b>이 지나면 해시값을 무작위 값으로 바꿔 누구였는지 알 수 없게 합니다. 기대 수는 그대로 남습니다.</li>
      </ul>

      <h3>화면을 볼 때</h3>
      <p>
        게임 상세를 열면 조회수를 하루 단위로 <b>합계만</b> 올립니다. 누가 봤는지는 기록하지 않습니다.
        같은 탭에서 새로고침한 것은 세지 않습니다.
      </p>

      <h2>2. 수집하지 않는 것</h2>
      <ul>
        <li>이름, 이메일, 전화번호 등 <b>연락처를 일절 받지 않습니다.</b> 가입 기능 자체가 없습니다.</li>
        <li>광고·분석용 추적 도구를 쓰지 않습니다.</li>
        <li>행동을 추적하는 쿠키를 심지 않습니다.</li>
      </ul>

      <h2>3. 브라우저에만 남는 것</h2>
      <p>아래는 서버로 보내지 않고 이 브라우저에만 저장됩니다. 브라우저 설정에서 직접 지울 수 있습니다.</p>
      <ul>
        <li><code>nexplay-saved</code> — 담아둔 게임 목록</li>
        <li><code>nexplay-theme</code> — 라이트·다크 선택</li>
        <li><code>nexplay-viewed:*</code> — 같은 탭에서 조회수가 중복으로 세지지 않게 하는 표시(탭을 닫으면 사라짐)</li>
      </ul>

      <h2>4. 맡겨서 처리하는 곳</h2>
      <p>서비스를 돌리기 위해 아래 업체의 설비를 씁니다. 이들은 접속 주소를 통신 과정에서 처리합니다.</p>
      <ul>
        <li>Cloudflare — 화면 전송과 보호</li>
        <li>Railway — 서버와 데이터베이스 운영</li>
      </ul>
      <p>
        소식을 한국어로 요약할 때 OpenAI를 씁니다. 이때 보내는 것은 <b>게임사가 공개한 발표문</b>이며,
        이용자에 관한 정보는 보내지 않습니다.
      </p>

      <h2>5. 이용자가 할 수 있는 것</h2>
      <p>
        가입이 없어 계정 단위로 확인·삭제해 드릴 방법이 없습니다. 다만 기대 표시는 <b>같은 자리에서
        다시 누르면 즉시 삭제</b>되고, 브라우저에 저장된 것은 브라우저 설정에서 지우시면 됩니다.
        그 밖에 문의하실 것이 있으면 아래로 연락해 주세요.
      </p>

      <h2>6. 연락처</h2>
      <p>운영: RUBI-ON · 문의: <a href="mailto:contact@rubi-on.com">contact@rubi-on.com</a></p>

      <p className="legal-updated">최종 수정: 2026-08-28</p>
      <p><Link className="secondary-button" href="/terms">이용약관 보기</Link></p>
    </section>
  </main>;
}
