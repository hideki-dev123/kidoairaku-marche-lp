import Image from "./StaticImage";
import MotionExperience from "./MotionExperience";
import ScrollIntro from "./ScrollIntro";

const FORM_URL_3 = "https://forms.gle/qkEByJECFsTB1tiGA";
const FORM_URL_4 = "https://docs.google.com/forms/d/e/1FAIpQLSd-fdjrcu8swAWqqKDGypXd3B78oRXNhxMd0xuo5n6I03S3rw/viewform?usp=dialog";
const voices = [
  "本当に来てよかった。次は参加するだけじゃなくて、登壇したいと思いました。",
  "まだやりたいことが曖昧な私でも、みんなの輝いている姿を見て、来てよかったと思えました。",
  "ワークショップで色々体験できて楽しかったです。みんなの内省も知ることができて面白かったです。",
  "今日は素敵な時間を本当にありがとうございました。今度は出展者として参加したいなと思える1日になりました。",
];
const faq = [
  ["まだやりたいことがはっきりしていなくても参加できますか？", "もちろんです。むしろ、まだ言葉になっていない“好き”や“やりたい”を見つけに来てほしいイベントです。"],
  ["初参加・一人参加でも大丈夫ですか？", "大丈夫です。前回も初参加や一人参加の方がたくさんいました。見るだけ、話すだけの参加も歓迎です。"],
  ["出展や登壇はハードルが高いです。参加者として入ってもいいですか？", "もちろんです。まず参加者として空気を味わい、次回に出展や登壇へ挑戦する方もいます。"],
  ["詳細スケジュールはいつ分かりますか？", "確定次第、申込者へ分かりやすくご案内します。"],
  ["心理的に重い内容が苦手なのですが、大丈夫ですか？", "無理に深く話す必要はありません。自分の心地よい範囲で参加できます。安心して参加できる空気づくりを大切にしています。"],
];
function Cta({ label = "開催日を選んで申し込む", dark = false }: { label?: string; dark?: boolean }) {
  return <a className={`cta ${dark ? "cta-dark" : ""}`} href="#entry">{label}<span aria-hidden>↓</span></a>;
}
export default function Home() {
  return <main>
    <MotionExperience />
    <header className="topbar"><a className="brand" href="#top"><span className="brand-mark">喜怒哀楽</span><span>全開マルシェ</span></a><nav aria-label="メインナビゲーション"><a href="#about">この場所について</a><a href="#outline">開催概要</a><Cta label="申し込む" /></nav></header>
    <ScrollIntro>
    <section className="hero">
      <div className="hero-brand-art" aria-hidden="true"><Image src="/images/marche-watercolor.png" alt="" fill priority sizes="(max-width: 800px) 100vw, 64vw" /></div>
      <div className="hero-copy">
        <p className="eyebrow">3rd KIDO-AI-RAKU MARCHE · 2026</p>
        <h1><span className="copy-line">あなたの「好き」、</span><span className="copy-line"><em>ちゃんと生きてる？</em></span></h1>
        <p className="lead"><span className="copy-line">やりたいことより、正解。ワクワクより、評価。</span><span className="copy-line">そんな毎日から一度降りて、自分の“熱”に触れなおす1日へ。</span></p>
        <div className="brand-thought"><span>喜</span><span>怒</span><span>哀</span><span>楽</span><p><span className="copy-line">違う感情、違う人、違う「好き」が、</span><span className="copy-line">ひとつの渦になって交わる。</span></p></div>
        <div className="date-card"><strong>2026.9.27 <small>SUN</small></strong><span>10:00–16:00 ／ 途中入退場OK</span></div>
        <div className="hero-actions"><Cta label="開催日を選んで申し込む" /><a className="text-link" href="#about">この場所を知る ↓</a></div>
      </div>
      <div className="quick-facts"><span>第三回 喜怒哀楽全開マルシェ</span><span>学生 ¥2,900〜</span><span>会場は決定次第ご案内</span></div>
    </section>
    </ScrollIntro>
    <div className="brand-marquee" aria-hidden="true"><div className="marquee-track"><span>好きから始める</span><i>●</i><span>未完成で出す</span><i>●</i><span>もっと、人間人間する</span><i>●</i><span>好きから始める</span><i>●</i><span>未完成で出す</span><i>●</i><span>もっと、人間人間する</span><i>●</i></div></div>
    <section className="manifesto section"><p className="section-no">01 · WHY</p><div className="manifesto-text"><p><span className="copy-line">気づけば、</span><span className="copy-line">“誰かに認められるための人生”を</span><span className="copy-line">生きてしまっていないだろうか。</span></p><h2><span className="copy-line">あなたの人生の起点は、</span><span className="copy-line emphasis">社会じゃなくて、あなた。</span></h2></div><p className="side-note"><span className="copy-line">立ち止まってもいい。</span><span className="copy-line">答えがなくてもいい。</span></p></section>
    <section className="about section" id="about"><div className="section-head"><p className="section-no">02 · ABOUT</p><h2><span className="copy-line">未完成のまま、</span><span className="copy-line">ここに来ていい。</span></h2></div><div className="about-grid"><div className="about-copy"><p className="large">喜怒哀楽全開マルシェは、自分の「好き」「やりたい」「気になる」を持ち寄って、人と交わり、表現し、感じるイベントです。</p><p>完成していなくてもいい。すごい実績がなくてもいい。うまく言葉にできなくてもいい。大切なのは、あなたの中の感情が動くこと。</p></div><div className="image-stack"><Image src="/images/collage.png" alt="写真を選びながら対話するワークショップ" fill sizes="(max-width: 700px) 92vw, 45vw" /></div></div><div className="values"><article><span>01</span><h3>好きから始める</h3><p>役に立つかより、心が動くかを大切に。</p></article><article><span>02</span><h3>未完成で出す</h3><p>準備万端じゃなくていい。今の自分をそのまま。</p></article><article className="accent"><span>03</span><h3>人間人間する</h3><p>喜びも迷いも熱も、人間らしさごと交わる。</p></article></div></section>
    <section className="gallery section"><div className="section-head inverse"><p className="section-no">03 · LAST TIME</p><h2><span className="copy-line">言葉にする。手を動かす。</span><span className="copy-line">ちゃんと、交わる。</span></h2><p>第二回は、一人ひとりの“人間らしさ”が交わる時間になりました。</p></div><div className="gallery-grid"><figure className="g1"><Image src="/images/craft.png" alt="テーブルで作品をつくる参加者" fill sizes="(max-width: 700px) 92vw, 42vw" /><figcaption>つくる</figcaption></figure><figure className="g2"><Image src="/images/dialogue.png" alt="一対一でじっくり対話する参加者" fill sizes="(max-width: 700px) 92vw, 33vw" /><figcaption>話す・聴く</figcaption></figure><figure className="g3"><Image src="/images/talk.png" alt="輪になって笑顔で交流する参加者" fill sizes="(max-width: 700px) 92vw, 45vw" /><figcaption>交わる</figcaption></figure><figure className="g4"><Image src="/images/hands.png" alt="作品づくりに夢中になる手元" fill sizes="(max-width: 700px) 92vw, 28vw" /><figcaption>夢中になる</figcaption></figure></div></section>
    <section className="fit section"><div className="section-head"><p className="section-no">04 · FOR YOU</p><h2><span className="copy-line">まだ途中のあなたに、</span><span className="copy-line">来てほしい。</span></h2></div><div className="fit-list">{["好きなことはあるけど、自信がない","何か始めたいけど、まだ形になっていない","最近ちょっと、感情が鈍ってる気がする","誰かの“好き”や“熱”に触れたい","出展や登壇に興味はあるけど、一歩目が怖い","まだ言葉になっていない“やりたい”を見つけたい"].map((x,i)=><div key={x}><span>0{i+1}</span><p>{x}</p></div>)}</div><p className="fit-note"><span className="copy-line">完成された人のための場所ではありません。</span><span className="copy-line">むしろ、まだ途中の人にこそ来てほしいイベントです。</span></p></section>
    <section className="experience section"><div className="section-head"><p className="section-no">05 · EXPERIENCE</p><h2>この日、できること。</h2></div><div className="experience-track">{[['出展','自分の「好き」から生まれたものを、形にして届ける。'],['登壇','自分の想いや経験、問いを、人前で言葉にする。'],['ワークショップ','手を動かしながら、自分の感覚や内側に触れる。'],['対話','1対1でも、少人数でも。誰かを聴き、自分を話す。'],['交流','迷いながらも進んでいる人と、ここで出会う。']].map((item,i)=><article key={item[0]}><span>0{i+1}</span><h3>{item[0]}</h3><p>{item[1]}</p></article>)}</div><p className="schedule-note">当日の詳しいタイムスケジュールは、決まり次第申込者へご案内します。</p></section>
    <section className="voices section"><div className="voice-stats"><p>第二回参加後アンケート <strong>16</strong>件</p><div><span><strong>4.5</strong><small>/ 5 満足度</small></span><span><strong>13</strong><small>/ 16 再参加意向</small></span></div></div><div className="section-head"><p className="section-no">06 · VOICES</p><h2><span className="copy-line">「来てよかった」が、</span><span className="copy-line">次の一歩になった。</span></h2></div><div className="voice-grid">{voices.map((v,i)=><blockquote key={v} className={`note n${i+1}`}><span>“</span><p>{v}</p><small>第二回 参加者アンケートより</small></blockquote>)}</div></section>
    <section className="outline section" id="outline"><div className="section-head"><p className="section-no">07 · INFORMATION</p><h2>開催概要</h2><p>参加前に必要なことを、ここにすべてまとめました。</p></div><div className="outline-card"><div className="event-primary"><p>第三回 喜怒哀楽全開マルシェ</p><strong>2026.9.27 <small>SUN</small></strong><span>10:00–16:00　途中入退場可能</span></div><dl><div><dt>場所</dt><dd>現在、素敵な場所を探し中です。<br /><small>決まり次第、申込者へご案内します。</small></dd></div><div><dt>決済</dt><dd>事前決済制<br /><small>銀行振込 または PayPay（詳細は申込時にご案内）</small></dd></div><div><dt>キャンセル</dt><dd>1週間前〜当日は参加費の100％</dd></div></dl></div><div className="prices"><article><span>見る・話す・感じる</span><h3>参加者</h3><p>学生 <strong>¥2,900</strong></p><p>社会人 <strong>¥3,900</strong></p></article><article className="featured"><span>想いを言葉にする</span><h3>登壇者</h3><p>学生 <strong>¥3,400</strong></p><p>社会人 <strong>¥4,400</strong></p></article><article><span>好きを形にして届ける</span><h3>出展者</h3><p>学生 <strong>¥3,900</strong></p><p>社会人 <strong>¥4,900</strong></p></article></div></section>
    <section className="faq section"><div className="section-head"><p className="section-no">08 · FAQ</p><h2>よくある質問</h2></div><div className="faq-list">{faq.map(([q,a])=><details key={q}><summary><span>{q}</span><b>＋</b></summary><p>{a}</p></details>)}</div></section>
    <section className="final-cta" id="entry"><Image src="/images/group.png" alt="第二回 喜怒哀楽全開マルシェの集合写真" fill sizes="100vw" /><div className="final-overlay" /><div className="final-copy"><p>次に主役になるのは、あなたかもしれない。</p><h2><span className="copy-line">あなたの「好き」は、</span><span className="copy-line">どこの何？</span></h2><p><span className="copy-line">まだ言葉になっていなくてもいい。</span><span className="copy-line">参加したい日程を選んで、Googleフォームからお申し込みください。</span></p><div className="entry-options" aria-label="開催日を選ぶ"><a className="entry-option" href={FORM_URL_3} target="_blank" rel="noreferrer"><small>第3回</small><strong>2026.9.27 <span>SUN</span></strong><em>9月開催に申し込む</em><b aria-hidden>↗</b></a><a className="entry-option entry-option-next" href={FORM_URL_4} target="_blank" rel="noreferrer"><small>第4回</small><strong>2026.11.29 <span>SUN</span></strong><em>11月29日（日）に申し込む</em><b aria-hidden>↗</b></a></div></div></section>
    <footer><div><span className="brand-mark">喜怒哀楽</span><span>全開マルシェ</span></div><p>あなたの喜怒哀楽で、交わりたい。</p><small>© 2026 KIDO-AI-RAKU MARCHE</small></footer><a className="mobile-cta" href="#entry">開催日を選んで申し込む <span>↓</span></a>
  </main>;
}
