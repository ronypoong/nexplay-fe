import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { SectionHeading } from "@/components/section-heading";
import { ArrowIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "한국어 레이더" };

export default async function KoreanRadarPage() {
  const radar = await api.koreanRadar();
  const { coverage, publishers, forecasts, fullVoiceGames } = radar;
  const checkedRate = coverage.totalGames ? Math.round((coverage.checked / coverage.totalGames) * 100) : 0;
  const supportRate = coverage.checked ? Math.round((coverage.supported / coverage.checked) * 100) : 0;

  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">한국어 레이더</span>
      <h1>이 게임, 한국어 나와요?</h1>
      <p>Steam 스토어에서 확인한 언어 지원을 퍼블리셔별로 모았습니다. 아직 발표되지 않은 작품은 그 퍼블리셔의 지난 이력으로 가능성을 가늠합니다.</p>
    </div>

    <div className="radar-stats">
      <div><strong>{coverage.supported}</strong><span>한국어 지원 확인</span></div>
      <div><strong>{coverage.fullVoice}</strong><span>한국어 음성까지</span></div>
      <div><strong>{supportRate}%</strong><span>확인된 것 중 지원률</span></div>
      <div><strong>{checkedRate}%</strong><span>카탈로그 확인 진행률</span></div>
    </div>
    {coverage.unchecked > 0 && <p className="radar-note">아직 {coverage.unchecked}개 게임은 언어 정보를 확인하는 중입니다. 매일 자동으로 채워집니다.</p>}

    {publishers.length > 0 && <section className="content-section">
      <SectionHeading eyebrow="퍼블리셔" title="한국어를 잘 챙기는 곳"/>
      <div className="rate-list">
        {publishers.map((row) => <div className="rate-row" key={row.publisher}>
          <span className="rate-name">{row.publisher}</span>
          <span className="rate-bar"><i style={{ width: `${row.ratePercent}%` }}/></span>
          <span className="rate-value">{row.ratePercent}%</span>
          <small className="rate-sample">{row.checked}개 중 {row.supported}개{row.fullVoice > 0 ? ` · 음성 ${row.fullVoice}` : ""}</small>
        </div>)}
      </div>
    </section>}

    {forecasts.length > 0 && <section className="content-section">
      <SectionHeading eyebrow="아직 미확인" title="한국어가 나올 것 같은 기대작"/>
      <p className="section-note">퍼블리셔의 지난 이력으로 계산한 값입니다. 공식 발표가 아닙니다.</p>
      <div className="forecast-grid">
        {forecasts.map((item) => <Link className="forecast-card" href={`/games/${item.slug}`} key={item.slug}>
          <span className="forecast-score" data-level={item.probabilityPercent >= 70 ? "high" : item.probabilityPercent >= 40 ? "mid" : "low"}>{item.probabilityPercent}%</span>
          <strong>{item.title}</strong>
          <small>{item.releaseLabel}</small>
          <p>{item.basis}</p>
        </Link>)}
      </div>
    </section>}

    {fullVoiceGames.length > 0 && <section className="content-section">
      <SectionHeading eyebrow="희귀" title="한국어 음성까지 지원하는 게임"/>
      <p className="section-note">자막은 흔해도 음성은 드뭅니다. 확인된 {coverage.checked}개 중 {coverage.fullVoice}개뿐입니다.</p>
      <div className="voice-list">
        {fullVoiceGames.map((item) => <Link className="voice-row" href={`/games/${item.slug}`} key={item.slug}>
          <span className="voice-badge">풀보이스</span>
          <strong>{item.title}</strong>
          <small>{item.publisher}</small>
          <ArrowIcon/>
        </Link>)}
      </div>
    </section>}

    {publishers.length === 0 && forecasts.length === 0 && <div className="empty-panel">
      <strong>아직 언어 데이터를 모으는 중이에요.</strong>
      <p>Steam 스토어 확인이 끝나면 퍼블리셔별 한국어 지원률이 여기에 표시됩니다.</p>
    </div>}
  </main>;
}
