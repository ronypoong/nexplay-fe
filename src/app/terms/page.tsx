import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이용약관",
  description: "NEXPLAY가 어떤 서비스인지, 무엇을 보장하고 보장하지 않는지, 출처와 저작권을 어떻게 다루는지 적어 둡니다.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">이용약관</span>
      <h1>이 서비스가 하는 일과 하지 않는 일</h1>
      <p>NEXPLAY는 게임사의 공식 발표를 모아 정리해 보여주는 개인 프로젝트입니다.</p>
    </div>

    <section className="content-section legal">
      <h2>1. 무엇을 하는 서비스인가</h2>
      <p>
        게임사와 플랫폼이 <b>공개한 발표</b>를 모아 게임별로 정리하고, 영어·일본어로 온 글에는
        한국어 한 줄을 붙입니다. 발표에 담긴 약속과 실제로 일어난 일을 나란히 놓아 기록으로 남깁니다.
      </p>
      <p>
        기사를 쓰지 않고, 남의 글을 옮겨 싣지 않습니다. 원문은 항상 <b>발표한 곳으로 가는 링크</b>로 대신합니다.
      </p>

      <h2>2. 출처와 저작권</h2>
      <ul>
        <li><b>Wikidata</b> — CC0. 게임·회사·출시일 등 카탈로그 정보</li>
        <li><b>Wikipedia</b> — CC BY-SA 4.0. 소개문에 출처와 라이선스를 링크하고, 도입부만 발췌했음을 밝힙니다</li>
        <li><b>Steam</b> — 공식 스토어와 뉴스 피드. 이미지는 스토어가 제공하는 주소를 그대로 씁니다</li>
        <li>게임 제목·이미지·발표문의 권리는 각 게임사와 권리자에게 있습니다</li>
      </ul>
      <p>
        저작권자께서 게시 중단이나 정정을 요청하시면 확인 후 조치하겠습니다.
        아래 연락처로 알려 주세요.
      </p>

      <h2>3. 정확성에 대해</h2>
      <p>
        수집과 정리는 자동으로 이루어지고, 일부 항목은 인공지능이 원문에서 뽑아냅니다.
        <b> 틀릴 수 있습니다.</b> 출시일·가격·한국어 지원 여부처럼 중요한 결정은 반드시
        각 게임의 공식 페이지에서 다시 확인해 주세요. 이 화면의 정보를 근거로 한 구매나 판단의
        결과에 대해 책임지지 않습니다.
      </p>
      <p>
        잘못된 내용을 발견하시면 알려 주세요. 기록을 지우지 않고 정정 이력을 남기는 것이 원칙입니다.
      </p>

      <h2>4. 이용자가 남기는 것</h2>
      <p>
        기대 표시는 계정 없이 누를 수 있습니다. 자동화된 방법으로 수를 조작하거나 서비스에
        과도한 부하를 주는 행위는 삼가 주세요. 그런 요청은 제한될 수 있습니다.
      </p>

      <h2>5. 서비스 제공에 대해</h2>
      <p>
        개인이 운영하는 프로젝트라 예고 없이 중단되거나 기능이 바뀔 수 있습니다.
        무료로 제공되며, 광고나 제휴가 도입되면 그 사실을 화면에 밝히겠습니다.
      </p>

      <h2>6. 연락처</h2>
      <p>운영: RUBI-ON · 문의: <a href="mailto:contact@rubi-on.com">contact@rubi-on.com</a></p>

      <p className="legal-updated">최종 수정: 2026-08-28</p>
      <p><Link className="secondary-button" href="/privacy">개인정보처리방침 보기</Link></p>
    </section>
  </main>;
}
