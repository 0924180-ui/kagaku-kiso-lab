// 化学基礎の単元・問題データベース
const KagakuData = {
  units: [
    {
      id: "u1",
      title: "1. 物質の構成と純物質・混合物",
      summary: "物質の分類から、状態変化・分離精製までを「分類 → 性質 → 操作」の流れで整理します。",
      explanation: `
        <div class="visual-summary">
          <div class="visual-kicker">まず全体像</div>
          <div class="concept-map">
            <div class="concept-node main">物質</div>
            <div class="concept-branch"><span>1種類だけ</span><div class="concept-node">純物質</div><div class="mini-branch"><span>1種類の元素</span><b>単体</b><span>2種類以上の元素</span><b>化合物</b></div></div>
            <div class="concept-branch"><span>2種類以上が混在</span><div class="concept-node">混合物</div><div class="mini-tags"><span>空気</span><span>海水</span><span>石油</span></div></div>
          </div>
        </div>

        <div class="explain-grid">
          <section class="explain-card">
            <h3>① 純物質と混合物</h3>
            <p>「中身が1種類か、複数か」でまず分類します。</p>
            <div class="particle-box two-columns">
              <div><div class="particle-title">純物質</div><div class="particles same"><i></i><i></i><i></i><i></i></div><small>同じ種類の粒子だけ</small></div>
              <div><div class="particle-title">混合物</div><div class="particles mixed"><i></i><i></i><i></i><i></i></div><small>異なる種類の粒子が混在</small></div>
            </div>
          </section>

          <section class="explain-card">
            <h3>② 分離・精製は「何の差」を利用？</h3>
            <div class="method-flow">
              <div><b>蒸留</b><span>沸点の違い</span></div>
              <div><b>分留</b><span>沸点の違いを利用して液体混合物を分離</span></div>
              <div><b>再結晶</b><span>溶解度の違い</span></div>
              <div><b>抽出</b><span>溶媒への溶けやすさの違い</span></div>
              <div><b>クロマトグラフィー</b><span>物質の移動しやすさの違い</span></div>
              <div><b>昇華</b><span>固体 → 気体になりやすさの違い</span></div>
            </div>
          </section>
        </div>

        <section class="explain-card state-card">
          <h3>③ 状態変化は「6種類」を位置までそろえて覚える</h3>
          <p class="diagram-caption">固体・液体・気体を一直線に置き、逆向きの変化も同じ位置に対応させます。特に「固体↔気体」が昇華・凝華です。</p>
          <div class="state-change-grid" role="img" aria-label="固体、液体、気体の6種類の状態変化を対応させた図">
            <div class="state-node">固体</div>
            <div class="state-arrow forward">→<small>融解</small></div>
            <div class="state-node">液体</div>
            <div class="state-arrow forward">→<small>気化</small></div>
            <div class="state-node">気体</div>
            <div class="state-arrow reverse">←<small>凝固</small></div>
            <div class="state-node">液体</div>
            <div class="state-arrow reverse">←<small>液化・凝縮</small></div>
            <div class="state-node">気体</div>
            <div class="state-direct"><span>固体</span><b>→</b><strong>気体</strong><small>昇華</small></div>
            <div class="state-direct"><span>気体</span><b>→</b><strong>固体</strong><small>凝華</small></div>
          </div>
          <div class="memory-note-inline"><b>入試での注意：</b>「凝華」は<strong>気体 → 固体</strong>。「昇華」は高校化学基礎では<strong>固体 → 気体</strong>として扱います。</div>
        </section>

        <div class="memory-note"><b>入試での見分け方</b> 「純物質/混合物」→「単体/化合物」→「どの性質の差を使う分離か」の3段階で考えると迷いにくい。</div>
      `,
      example: {
        question: "【例題】次の物質のうち「混合物」に該当するものをすべて選べ。 (a) 水 (b) 空気 (c) 酸素 (d) 海水",
        solution: "【解答・解説】正解は (b) 空気 と (d) 海水 です。水(H₂O)と酸素(O₂)は純物質です。"
      }
    },
    {
      id: "u2",
      title: "2. 原子構造と周期表",
      summary: "原子核・電子、同位体、電子配置、イオン、周期表を「粒子 → 電子配置 → 周期表」の順で整理します。",
      explanation: `
        <div class="explanation-hero">
          <div class="visual-kicker">この単元のゴール</div>
          <h2>「原子番号 → 電子配置 → 周期表」の順で考える</h2>
          <div class="learning-route">
            <div><b>1</b><span>原子をつくる粒子</span><small>陽子・中性子・電子</small></div>
            <i>→</i>
            <div><b>2</b><span>電子配置</span><small>何個の電子殻を使うか</small></div>
            <i>→</i>
            <div><b>3</b><span>周期表</span><small>性質の似た元素を位置で読む</small></div>
          </div>
        </div>

        <section class="explain-card key-card">
          <h3>① 原子番号と質量数を「原子の図」で理解する</h3>
          <div class="atomic-number-lesson">
            <div class="atom-visual-panel">
              <div class="atom-visual-title">例：ナトリウム原子 <b>²³Na</b></div>
              <div class="atom-visual">
                <div class="atom-orbit atom-orbit-k"></div>
                <div class="atom-orbit atom-orbit-l"></div>
                <div class="atom-orbit atom-orbit-m"></div>
                <div class="atom-nucleus atom-nucleus-large">
                  <span class="proton-dot">11p⁺</span><span class="neutron-dot">12n⁰</span>
                </div>
                <span class="atom-electron ae1">e⁻</span><span class="atom-electron ae2">e⁻</span>
                <span class="atom-electron ae3">e⁻</span><span class="atom-electron ae4">e⁻</span><span class="atom-electron ae5">e⁻</span><span class="atom-electron ae6">e⁻</span>
                <span class="atom-electron ae7">e⁻</span><span class="atom-electron ae8">e⁻</span><span class="atom-electron ae9">e⁻</span><span class="atom-electron ae10">e⁻</span>
                <span class="atom-electron ae11">e⁻</span>
              </div>
              <div class="atom-visual-legend"><span><i class="legend-dot proton-dot"></i>陽子 11個</span><span><i class="legend-dot neutron-dot"></i>中性子 12個</span><span><i class="legend-dot electron-dot"></i>電子 11個</span></div>
            </div>
            <div class="atomic-number-explain">
              <div class="number-explain-row number-z">
                <div class="number-badge">原子番号<br><b>11</b></div>
                <div><strong>陽子の数</strong><p>元素の種類を決める数字。<br>Naなら必ず陽子が11個。</p></div>
              </div>
              <div class="number-explain-row number-a">
                <div class="number-badge">質量数<br><b>23</b></div>
                <div><strong>陽子＋中性子</strong><p>11＋12＝23。<br>同位体では中性子数が変わる。</p></div>
              </div>
              <div class="number-explain-row number-e">
                <div class="number-badge">電子数<br><b>11</b></div>
                <div><strong>中性原子では陽子数と同じ</strong><p>Naは中性なので11個。<br>イオンになると電子数だけ変化する。</p></div>
              </div>
            </div>
          </div>
          <div class="atomic-formula-strip">
            <div><b>原子番号 Z</b><strong>＝ 陽子数</strong></div>
            <div><b>質量数 A</b><strong>＝ 陽子数 ＋ 中性子数</strong></div>
            <div><b>中性原子</b><strong>陽子数 ＝ 電子数</strong></div>
          </div>
          <div class="memory-note-inline"><b>入試の鉄則：</b>「原子番号＝電子数」ではなく、<b>原子番号＝陽子数</b>。電子数が同じなのは中性原子のときだけ。</div>
        </section>

        <div class="explain-grid">
          <section class="explain-card">
            <h3>② 同位体は「陽子が同じ・中性子が違う」</h3>
            <div class="isotope-compare"><div><b>¹²C</b><span>陽子 6<br>中性子 6</span></div><div class="same-mark">同じ元素</div><div><b>¹³C</b><span>陽子 6<br>中性子 7</span></div></div>
            <p>原子番号が同じなので同じ元素です。質量数が異なるのは中性子数が違うためです。</p>
          </section>
          <section class="explain-card">
            <h3>③ 電子配置は「内側から入れる」</h3>
            <div class="shell-diagram"><div class="shell k">K殻<br><b>2個まで</b></div><div class="shell l">L殻<br><b>8個まで</b></div><div class="shell m">M殻<br><b>18個まで</b></div></div>
            <p>高校化学基礎では、代表的な元素の電子配置を<strong>2・8・8…</strong>の形で整理します。最外殻電子が化学的性質を考える手がかりです。</p>
          </section>
        </div>

        <section class="explain-card periodic-card">
          <h3>④ 周期表は「位置」から性質を読む</h3>
          <p class="diagram-caption"><b>横方向＝周期</b>、<b>縦方向＝族</b>。同じ族の元素は価電子数が似ていて、化学的性質も似ます。</p>
          <div class="periodic-table-wrap">
            <div class="periodic-group-numbers" aria-hidden="true">${Array.from({length:18},(_,i)=>`<span>${i+1}</span>`).join('')}</div>
            <div class="periodic-table" role="img" aria-label="第1族から第18族までを示した簡略周期表">
              <div class="pt-cell pt-h" style="--g:1;--p:1"><small>1</small><b>H</b></div><div class="pt-cell pt-he" style="--g:18;--p:1"><small>2</small><b>He</b></div>
              <div class="pt-cell" style="--g:1;--p:2"><small>3</small><b>Li</b></div><div class="pt-cell" style="--g:2;--p:2"><small>4</small><b>Be</b></div><div class="pt-cell" style="--g:13;--p:2"><small>5</small><b>B</b></div><div class="pt-cell" style="--g:14;--p:2"><small>6</small><b>C</b></div><div class="pt-cell" style="--g:15;--p:2"><small>7</small><b>N</b></div><div class="pt-cell" style="--g:16;--p:2"><small>8</small><b>O</b></div><div class="pt-cell pt-halogen" style="--g:17;--p:2"><small>9</small><b>F</b></div><div class="pt-cell pt-noble" style="--g:18;--p:2"><small>10</small><b>Ne</b></div>
              <div class="pt-cell" style="--g:1;--p:3"><small>11</small><b>Na</b></div><div class="pt-cell" style="--g:2;--p:3"><small>12</small><b>Mg</b></div><div class="pt-cell" style="--g:13;--p:3"><small>13</small><b>Al</b></div><div class="pt-cell" style="--g:14;--p:3"><small>14</small><b>Si</b></div><div class="pt-cell" style="--g:15;--p:3"><small>15</small><b>P</b></div><div class="pt-cell" style="--g:16;--p:3"><small>16</small><b>S</b></div><div class="pt-cell pt-halogen" style="--g:17;--p:3"><small>17</small><b>Cl</b></div><div class="pt-cell pt-noble" style="--g:18;--p:3"><small>18</small><b>Ar</b></div>
              <div class="pt-cell" style="--g:1;--p:4"><small>19</small><b>K</b></div><div class="pt-cell" style="--g:2;--p:4"><small>20</small><b>Ca</b></div><div class="pt-cell" style="--g:13;--p:4"><small>31</small><b>Ga</b></div><div class="pt-cell" style="--g:14;--p:4"><small>32</small><b>Ge</b></div><div class="pt-cell" style="--g:15;--p:4"><small>33</small><b>As</b></div><div class="pt-cell" style="--g:16;--p:4"><small>34</small><b>Se</b></div><div class="pt-cell pt-halogen" style="--g:17;--p:4"><small>35</small><b>Br</b></div><div class="pt-cell pt-noble" style="--g:18;--p:4"><small>36</small><b>Kr</b></div>
            </div>
            <div class="periodic-family-labels" aria-label="代表的な族">
              <span class="family family-1">アルカリ金属<br><small>Li・Na・K…</small></span>
              <span class="family family-2">アルカリ土類金属<br><small>Be・Mg・Ca…</small></span>
              <span class="family family-17">ハロゲン<br><small>F・Cl・Br・I…</small></span>
              <span class="family family-18">希ガス<br><small>He・Ne・Ar…</small></span>
            </div>
          </div>
          <div class="periodic-rules">
            <div><b>第1族</b><span>最外殻電子 1個<br>陽イオンになりやすい</span></div>
            <div><b>第17族</b><span>最外殻電子 7個<br>電子を1個受け取りやすい</span></div>
            <div><b>第18族</b><span>最外殻が安定<br>反応しにくい</span></div>
          </div>
        </section>

        <section class="explain-card trend-card">
          <h3>⑤ 周期表の「右上・左下」を使いこなす</h3>
          <div class="trend-map">
            <div class="trend-arrow right">→<span>非金属性が強くなる</span></div>
            <div class="trend-arrow up">↑<span>非金属性が強くなる</span></div>
            <div class="trend-corner">右上<br><b>F付近</b></div>
            <div class="trend-corner bottom">左下<br><b>Cs付近</b></div>
          </div>
          <p>一般に左下ほど金属性が強く、電子を失って陽イオンになりやすい。右上ほど非金属性が強く、電子を受け取りやすい傾向があります。<strong>希ガスはこの比較から除いて考える</strong>のが基本です。</p>
        </section>

        <section class="explain-card ion-card">
          <h3>⑥ イオンは「安定な電子配置」を目指す</h3>
          <div class="ion-route"><div><b>Na</b><span>2・8・1</span></div><strong>− e⁻ →</strong><div class="ion-result"><b>Na⁺</b><span>2・8</span></div></div>
          <div class="ion-route"><div><b>Cl</b><span>2・8・7</span></div><strong>＋ e⁻ →</strong><div class="ion-result"><b>Cl⁻</b><span>2・8・8</span></div></div>
          <p>Naは電子を1個失ってNa⁺、Clは電子を1個受け取ってCl⁻になります。どちらも希ガス型の安定な電子配置になります。</p>
        </section>

        <div class="memory-note"><b>入試での最短ルート</b> ①原子番号から陽子数 → ②電子数を決める → ③電子配置を書く → ④最外殻電子を見る → ⑤周期・族と性質を判断する。</div>
      `,
      example: {
        question: "【例題】炭素原子 ¹²C と ¹³C の関係を何と呼ぶか。",
        solution: "【解答・解説】同位体（アイソトープ）。化学的性質はほぼ同じですが、中性子の数が異なります。"
      }
    },
    {
      id: "u3",
      title: "3. 化学結合（イオン結合・共有結合・金属結合）",
      summary: "結合の種類を「誰が電子をどう扱うか」で比較し、物質の性質につなげて理解します。",
      explanation: `
        <div class="visual-summary">
          <div class="visual-kicker">結合は「電子の扱い方」で見分ける</div>
          <div class="bond-grid">
            <div class="bond-card ionic"><div class="bond-icon"><span>Na⁺</span><span>↔</span><span>Cl⁻</span></div><h3>イオン結合</h3><p>陽イオンと陰イオンの静電気力。</p><b>例：NaCl</b></div>
            <div class="bond-card covalent"><div class="bond-icon"><span>H</span><span>••</span><span>H</span></div><h3>共有結合</h3><p>原子どうしが電子対を共有。</p><b>例：H₂・H₂O</b></div>
            <div class="bond-card metal"><div class="bond-icon metal-dots">＋ ＋ ＋<br>e⁻ e⁻ e⁻<br>＋ ＋ ＋</div><h3>金属結合</h3><p>金属イオンと自由電子の結びつき。</p><b>例：Cu・Al</b></div>
            <div class="bond-card molecular"><div class="bond-icon"><span>H₂O</span><span>⋯</span><span>H₂O</span></div><h3>分子結晶</h3><p>分子が分子間力で集まった結晶。</p><b>例：I₂・ドライアイス</b></div>
          </div>
        </div>

        <section class="explain-card bond-types-card">
          <h3>① 結晶の4分類を「結晶をつくる粒子」で見分ける</h3>
          <div class="crystal-four-grid">
            <div><b>イオン結晶</b><span>陽イオン・陰イオン</span><small>NaCl、CaCl₂</small></div>
            <div><b>共有結合の結晶</b><span>原子</span><small>ダイヤモンド、SiO₂</small></div>
            <div><b>金属結晶</b><span>金属原子・自由電子</span><small>Cu、Al、Fe</small></div>
            <div><b>分子結晶</b><span>分子</span><small>I₂、CO₂、H₂O</small></div>
          </div>
          <div class="memory-note-inline"><b>分子結晶のポイント：</b>分子そのものの中では共有結合が働いています。一方、分子どうしを結晶として集めている主な力は<strong>分子間力</strong>です。</div>
        </section>

        <section class="explain-card">
          <h3>② 結合の強さは「同じ土俵で単純ランキング」しない</h3>
          <div class="bond-strength-flow">
            <div class="strength strong"><b>原子内の結合</b><span>共有結合・イオン結合・金属結合</span><small>結晶や物質の骨格をつくる強い結びつき</small></div>
            <div class="strength-arrow">＞</div>
            <div class="strength weak"><b>分子間力</b><span>分子どうしの引力</span><small>分子結晶を保つ力。一般に原子間の結合より弱い</small></div>
          </div>
          <p>「イオン結合＞共有結合＞金属結合」のように一列に並べるのは適切ではありません。種類が違うため、入試では<strong>どの粒子どうしを結びつけているか</strong>を見ます。</p>
        </section>

        <section class="explain-card">
          <h3>③ 結晶の性質をまとめて比較</h3>
          <div class="compare-table">
            <div class="compare-head"><span>種類</span><span>結合の主役</span><span>電気伝導性</span></div>
            <div><b>イオン結晶</b><span>陽・陰イオン</span><span>固体× / 融解・水溶液○</span></div>
            <div><b>共有結合の結晶</b><span>原子間の共有結合</span><span>基本的に×</span></div>
            <div><b>金属結晶</b><span>自由電子</span><span>固体でも○</span></div>
            <div><b>分子結晶</b><span>分子間力</span><span>×</span></div>
          </div>
        </section>

        <div class="explain-grid">
          <section class="explain-card">
            <h3>④ 共有電子対と価電子</h3>
            <div class="electron-pair"><span>H</span><strong>••</strong><span>F</span></div>
            <p>共有結合では、原子どうしが電子対を共有します。H・F・O・N・Cなどの価電子数を押さえると、結合の数を考えやすくなります。</p>
          </section>
          <section class="explain-card">
            <h3>⑤ 電気陰性度と極性</h3>
            <div class="polarity"><span>δ⁺</span><b>H — Cl</b><span>δ⁻</span></div>
            <p>共有電子対を引きつける強さに差があると、結合に偏りが生じます。分子全体の極性は形も合わせて判断します。</p>
          </section>
        </div>

        <div class="memory-note"><b>判定の順番</b> まず「粒子は何か」を見る。金属結晶・イオン結晶・共有結合の結晶・分子結晶を区別し、さらに分子結晶では「分子内は共有結合、分子間は分子間力」と切り分ける。</div>
      `,
      example: {
        question: "【例題】塩化ナトリウム(NaCl)の結晶に電気を通すと電気を導くか？",
        solution: "【解答・解説】固体の状態では導きませんが、水溶液にするか高温で融解させるとイオンが自由に動けるため電気を導きます。"
      }
    },
    {
      id: "u4",
      title: "4. 物質量（モル mol）と化学計算",
      summary: "モルを「粒子数・質量・気体の体積」をつなぐ共通単位として、公式を図で整理します。",
      explanation: `
        <div class="visual-summary">
          <div class="visual-kicker">1 molを中心に3方向へつなぐ</div>
          <div class="mol-hub">
            <div class="mol-center">1 mol</div>
            <div class="mol-arm top"><b>粒子数</b><span>6.02 × 10²³ 個</span></div>
            <div class="mol-arm left"><b>質量</b><span>モル質量 M [g/mol]</span></div>
            <div class="mol-arm right"><b>気体の体積</b><span>標準状態で 22.4 L</span></div>
          </div>
        </div>

        <section class="formula-panel">
          <h3>計算は「何を求めるか」で式を選ぶ</h3>
          <div class="formula-grid">
            <div><span>物質量 n</span><b>n = m / M</b><small>質量 m [g] ÷ モル質量 M [g/mol]</small></div>
            <div><span>粒子数 N</span><b>N = n × Nₐ</b><small>Nₐ = 6.02 × 10²³ mol⁻¹</small></div>
            <div><span>気体の体積 V</span><b>V = n × 22.4</b><small>標準状態の気体 [L]</small></div>
            <div><span>モル濃度 c</span><b>c = n / V</b><small>溶質の物質量 [mol] ÷ 溶液 [L]</small></div>
          </div>
        </section>

        <div class="explain-grid">
          <section class="explain-card">
            <h3>① モル質量</h3>
            <div class="calculation-card"><span>H₂O</span><b>1×2 + 16×1 = 18 g/mol</b></div>
            <div class="calculation-card"><span>SO₄²⁻</span><b>32 + 16×4 = 96 g/mol</b></div>
            <p>化学式の各原子の相対質量を足して求めます。</p>
          </section>
          <section class="explain-card">
            <h3>② 質量パーセント濃度</h3>
            <div class="big-formula">質量％ = <span>溶質の質量</span> ÷ <span>溶液の質量</span> × 100</div>
            <div class="solution-beaker"><div class="liquid"></div><span>溶質</span><small>溶液全体</small></div>
          </section>
        </div>

        <section class="explain-card reaction-card">
          <h3>③ 化学反応式は「係数 → mol比 → 求める量」</h3>
          <div class="reaction-flow"><span>反応式をそろえる</span><b>→</b><span>係数比から mol比</span><b>→</b><span>質量・体積・濃度へ</span></div>
          <p class="memory-note-inline">分子を1個ずつ数えるのではなく、反応式の係数を「molの比」として使うのがコツ。</p>
        </section>
      `,
      example: {
        question: "【例題】標準状態において、水酸化ナトリウム水溶液（0.5 mol/L）200 mL に含まれる溶質の物質量は何 mol か。",
        solution: "【解答・解説】0.5 mol/L × (200 / 1000) L = 0.1 mol です。"
      }
    },
    {
      id: "u5",
      title: "5. 酸と塩基の反応",
      summary: "酸・塩基の定義、価数、pH、中和、滴定を「H⁺・OH⁻の動き」で一本につなげます。",
      explanation: `
        <div class="visual-summary">
          <div class="visual-kicker">酸・塩基は「H⁺のやりとり」で見る</div>
          <div class="acid-base-map">
            <div class="ab-box acid"><b>酸</b><span>H⁺を与える</span><small>アレニウス：水中で H⁺</small><small>ブレンステッド：H⁺を与える</small></div>
            <div class="ab-arrow">H⁺ ⇄</div>
            <div class="ab-box base"><b>塩基</b><span>H⁺を受け取る</span><small>アレニウス：水中で OH⁻</small><small>ブレンステッド：H⁺を受け取る</small></div>
          </div>
        </div>

        <div class="explain-grid">
          <section class="explain-card">
            <h3>① 酸・塩基の価数</h3>
            <div class="valence-grid"><div><b>HCl</b><span>1価の酸</span></div><div><b>H₂SO₄</b><span>2価の酸</span></div><div><b>NaOH</b><span>1価の塩基</span></div><div><b>Ba(OH)₂</b><span>2価の塩基</span></div></div>
            <p>中和計算では「1 molあたり何 molのH⁺やOH⁻を出せるか」を価数で考えます。</p>
          </section>
          <section class="explain-card">
            <h3>② pHは0〜14のものさし</h3>
            <div class="ph-scale"><span>0<br><b>酸性</b></span><i></i><span>7<br><b>中性</b></span><i></i><span>14<br><b>塩基性</b></span></div>
            <div class="ph-formula">pH = −log[H⁺]</div>
            <p>酸性ではpHが7より小さく、塩基性では7より大きい。希釈すると中性側へ近づきます。</p>
          </section>
        </div>

        <section class="explain-card">
          <h3>③ 中和反応は H⁺ と OH⁻ の出会い</h3>
          <div class="neutralization"><span>H⁺</span><b>＋</b><span>OH⁻</span><b>→</b><strong>H₂O</strong></div>
          <div class="neutral-formula">a × C × V = b × C' × V'</div>
          <p>価数 × 濃度 × 体積で「反応できるH⁺・OH⁻の量」をそろえます。</p>
        </section>

        <section class="explain-card titration-card">
          <h3>④ 滴定曲線は「当量点付近で急変」する</h3>
          <p class="diagram-caption">強塩基に強酸を加える例。最初は塩基性で、当量点付近でpHが一気に下がります。</p>
          <div class="titration-chart" role="img" aria-label="強塩基に強酸を加えたときの滴定曲線">
            <svg viewBox="0 0 640 280" preserveAspectRatio="none" aria-hidden="true">
              <line x1="58" y1="18" x2="58" y2="238" class="axis-line"/>
              <line x1="58" y1="238" x2="610" y2="238" class="axis-line"/>
              <line x1="58" y1="128" x2="610" y2="128" class="grid-line"/>
              <line x1="334" y1="18" x2="334" y2="238" class="equiv-line"/>
              <path d="M70 34 C150 36 235 42 292 55 C318 62 326 76 330 102 C333 124 334 139 338 160 C344 194 362 216 400 224 C460 232 535 234 600 235" class="titration-curve"/>
              <text x="30" y="24" class="axis-text">pH</text>
              <text x="42" y="42" class="tick-text">14</text><text x="42" y="132" class="tick-text">7</text><text x="42" y="242" class="tick-text">0</text>
              <text x="58" y="258" class="tick-text">0</text><text x="322" y="258" class="tick-text">10</text><text x="592" y="258" class="tick-text">20</text>
              <text x="345" y="35" class="equiv-text">当量点</text>
              <text x="450" y="276" class="axis-text">加えた酸の体積 (mL)</text>
            </svg>
          </div>
          <div class="indicator-row"><span>当量点 ≈ pH 7</span><span>急変する範囲を利用</span><span>指示薬は変色域で選ぶ</span></div>
        </section>

        <div class="memory-note"><b>計算の順番</b> まず「酸が何価・塩基が何価」→ 次に濃度と体積 → 最後にH⁺とOH⁻の量をそろえる。</div>
      `,
      example: {
        question: "【例題】0.1 mol/L 塩酸(1価の強酸) 10 mL を中和するのに必要な 0.1 mol/L 水酸化バリウム水溶液(2価の強塩基)の体積は何 mL か。",
        solution: "【解答・解説】 1 × 0.1 × 10 = 2 × 0.1 × V  ⇒ V = 5 mL です。"
      }
    },
    {
      id: "u6",
      title: "6. 酸化還元反応と電池・電気分解",
      summary: "酸化数、酸化剤・還元剤、イオン化傾向、電池、電気分解を「電子の移動」でつなげます。",
      explanation: `
        <div class="visual-summary">
          <div class="visual-kicker">酸化還元の核心は「電子 e⁻ の移動」</div>
          <div class="redox-map">
            <div class="redox-box oxidation"><b>酸化</b><span>電子を失う</span><span>酸化数 ↑</span></div>
            <div class="electron-flow">e⁻ →</div>
            <div class="redox-box reduction"><b>還元</b><span>電子を受け取る</span><span>酸化数 ↓</span></div>
          </div>
          <div class="agent-map"><span>酸化される物質</span><b>＝ 還元剤</b><span>還元される物質</span><b>＝ 酸化剤</b></div>
        </div>

        <div class="explain-grid">
          <section class="explain-card">
            <h3>① 酸化数を決める</h3>
            <div class="oxidation-example"><span>SO₄²⁻</span><b>Oは −2 × 4 = −8</b><b>全体で −2</b><b>S = ＋6</b></div>
            <p>化合物やイオン全体の酸化数の和を利用します。元素単体では基本的に0です。</p>
          </section>
          <section class="explain-card oxidation-special-card">
            <h3>② 酸化数の特殊パターンはここだけ注意</h3>
            <div class="oxidation-rules">
              <div><b>H</b><span>通常 ＋1</span><small>金属水素化物では −1<br>例：NaH</small></div>
              <div><b>O</b><span>通常 −2</span><small>過酸化物では −1<br>例：H₂O₂</small></div>
              <div><b>F</b><span>常に −1</span><small>高校化学基礎では例外を考えない</small></div>
              <div><b>Cl・Br・I</b><span>通常 −1</span><small>酸素やFと結合すると例外あり<br>例：HClO、ClF</small></div>
            </div>
            <div class="oxidation-example-row"><span>OF₂</span><b>F＝−1×2</b><b>全体0</b><strong>O＝＋2</strong></div>
            <div class="memory-note-inline"><b>最重要：</b>例外を丸暗記するより、まず「単体0・化合物/イオンの酸化数の和＝全体の電荷」を使い、既知の酸化数から未知を求める。</div>
          </section>
          <section class="explain-card">
            <h3>③ イオン化傾向</h3>
            <div class="ion-series"><span>Li</span><span>K</span><span>Ca</span><span>Na</span><span>Mg</span><span>Al</span><span>Zn</span><span>Fe</span><span>Ni</span><span>Sn</span><span>Pb</span><span>H</span><span>Cu</span><span>Hg</span><span>Ag</span><span>Pt</span><span>Au</span></div>
            <p>左ほど電子を失って陽イオンになりやすい金属。金属の反応性や電池の向きを考える土台になります。</p>
          </section>
        </div>

        <section class="explain-card battery-card">
          <h3>④ ダニエル電池は「亜鉛・銅・素焼き板・導線」で見る</h3>
          <p class="diagram-caption">2つの水溶液を<strong>素焼き板</strong>で仕切ります。電子は素焼き板を通らず、外部回路を<strong>Zn → Cu</strong>へ流れます。イオンは水溶液中を移動して電荷の偏りを調整します。</p>
          <div class="daniel-cell ceramic-cell" role="img" aria-label="素焼き板を使ったダニエル電池の模式図">
            <div class="cell-top">
              <div class="terminal negative"><span class="terminal-sign">−</span><b>負極</b><small>亜鉛板 Zn</small></div>
              <div class="wire-route"><span>電子 e⁻　→　→　→</span></div>
              <div class="terminal positive"><span class="terminal-sign">＋</span><b>正極</b><small>銅板 Cu</small></div>
            </div>
            <div class="ceramic-cell-body">
              <div class="beaker zn-beaker">
                <div class="beaker-title">ZnSO₄水溶液</div>
                <div class="beaker-liquid">
                  <div class="ion-bubble zn-ion">Zn²⁺</div>
                  <div class="ion-bubble sulfate-ion">SO₄²⁻</div>
                  <div class="plate-vertical zn-plate">Zn</div>
                  <div class="reaction-tag oxidation-tag">酸化<br><small>Zn → Zn²⁺ + 2e⁻</small></div>
                </div>
              </div>

              <div class="porous-separator">
                <div class="porous-plate">
                  <span class="pore p1"></span><span class="pore p2"></span><span class="pore p3"></span><span class="pore p4"></span><span class="pore p5"></span><span class="pore p6"></span>
                  <b>素焼き板</b>
                  <small>イオンは通す<br>電子は通さない</small>
                </div>
                <div class="ion-arrows"><span>Zn²⁺ →</span><span>← SO₄²⁻</span></div>
              </div>

              <div class="beaker cu-beaker">
                <div class="beaker-title">CuSO₄水溶液</div>
                <div class="beaker-liquid">
                  <div class="ion-bubble cu-ion">Cu²⁺</div>
                  <div class="ion-bubble sulfate-ion right-sulfate">SO₄²⁻</div>
                  <div class="plate-vertical cu-plate">Cu</div>
                  <div class="reaction-tag reduction-tag">還元<br><small>Cu²⁺ + 2e⁻ → Cu</small></div>
                </div>
              </div>
            </div>
            <div class="cell-labels ceramic-labels"><span>Znが溶ける<br><b>電子を放出</b></span><b>素焼き板を通って<br>イオンが移動</b><span>Cuが析出<br><b>電子を受け取る</b></span></div>
          </div>

          <div class="battery-explain-grid">
            <div class="battery-mini-card"><b>亜鉛極（負極）</b><span>Zn → Zn²⁺ + 2e⁻</span><small>酸化。亜鉛板は少しずつ溶ける。</small></div>
            <div class="battery-mini-card"><b>銅極（正極）</b><span>Cu²⁺ + 2e⁻ → Cu</span><small>還元。銅が銅板に析出する。</small></div>
            <div class="battery-mini-card"><b>素焼き板</b><span>イオンが移動</span><small>2つの水溶液を仕切り、電荷の偏りを小さくする。</small></div>
            <div class="battery-mini-card"><b>外部回路</b><span>e⁻：Zn → Cu</span><small>電子が導線を通って移動し、電流を取り出せる。</small></div>
          </div>
          <div class="battery-key"><b>覚え方：</b>電池では<strong>負極＝酸化、正極＝還元</strong>。ダニエル電池なら「Znが電子を出す → 導線を通ってCuへ → Cu²⁺が電子を受け取る」と一本につながります。</div>
        </section>

        <section class="explain-card electrolysis-card">
          <h3>⑤ 電気分解は「外部電源で電子の流れを強制」</h3>
          <div class="electrolysis"><div><b>電源</b><span>＋</span><span>−</span></div><div class="electrolyte"><i>電解質水溶液</i><strong>陽イオン → 陰極</strong><strong>陰イオン → 陽極</strong></div></div>
          <p>電池は化学反応から電気エネルギーを取り出し、電気分解は電気エネルギーを使って化学反応を進めます。</p>
        </section>

        <div class="memory-note"><b>一番大事な対応</b> 酸化＝電子を失う＝酸化数増加、還元＝電子を受け取る＝酸化数減少。ここが固まると電池・電気分解も整理しやすい。</div>
      `,
      example: {
        question: "【例題】KMnO₄（高マンガン酸カリウム）における Mn の酸化数はいくつか。",
        solution: "【解答・解説】K(+1) + Mn(x) + O₄(-2×4) = 0 より、+1 + x - 8 = 0 ⇒ x = +7 です。"
      }
    }
  ],
  questions: [
    {
      "id": "q1",
      "unitId": "u1",
      "difficulty": "basic",
      "question": "液体混合物を加熱して発生した蒸気を冷却し、再び液体として分離・精製する操作を何と呼ぶか。",
      "options": [
        "凝縮（凝結）",
        "黄色",
        "混合物",
        "蒸留"
      ],
      "answerIndex": 3,
      "explanation": "沸点の違いを利用して液体混合物を気体にし、冷やして液体として分離する操作です。"
    },
    {
      "id": "q2",
      "unitId": "u1",
      "difficulty": "basic",
      "question": "沸点の異なる2種類以上の液体混合物を、蒸留によって段階的に分離する操作を何と呼ぶか。",
      "options": [
        "白色",
        "クロマトグラフィー",
        "分留",
        "化合物"
      ],
      "answerIndex": 2,
      "explanation": "液体混合物（石油など）を沸点の違いによって複数の成分に分けて採取する操作です。"
    },
    {
      "id": "q3",
      "unitId": "u1",
      "difficulty": "basic",
      "question": "固体混合物に適切な溶媒を加え、特定の成分だけを溶かし出して分離する操作を何と呼ぶか。",
      "options": [
        "抽出",
        "分留",
        "赤紫色",
        "再結晶"
      ],
      "answerIndex": 0,
      "explanation": "溶媒への溶解度の差を利用して、目的の物質のみを溶かし出す操作です。"
    },
    {
      "id": "q4",
      "unitId": "u1",
      "difficulty": "basic",
      "question": "温度による溶解度の変化の違いを利用して、純粋な結晶を得る操作を何と呼ぶか。",
      "options": [
        "硫黄（S）、炭素（C）、酸素（O）、リン（P）",
        "黄色",
        "再結晶",
        "白色"
      ],
      "answerIndex": 2,
      "explanation": "高温の水などに物質を溶かし、冷却して溶解度の差から純粋な結晶を析出させる方法です。"
    },
    {
      "id": "q5",
      "unitId": "u1",
      "difficulty": "basic",
      "question": "インクなどの色素混合物を、紙やろ紙に対する移動速度の違いを利用して分離する操作は何か。",
      "options": [
        "クロマトグラフィー",
        "再結晶",
        "白色",
        "石油中"
      ],
      "answerIndex": 0,
      "explanation": "ろ紙や担体に対する各成分の吸着力や移動速度の差を利用して分離します。"
    },
    {
      "id": "q6",
      "unitId": "u1",
      "difficulty": "basic",
      "question": "1種類の元素のみからなる物質を何と呼ぶか。",
      "options": [
        "抽出",
        "同素体",
        "単体",
        "黄色"
      ],
      "answerIndex": 2,
      "explanation": "酸素（O₂）や銅（Cu）のように、1種類の元素だけでできている純物質です。"
    },
    {
      "id": "q7",
      "unitId": "u1",
      "difficulty": "basic",
      "question": "2種類以上の元素からなる純物質を何と呼ぶか。",
      "options": [
        "昇華",
        "白色",
        "凝縮（凝結）",
        "化合物"
      ],
      "answerIndex": 3,
      "explanation": "水（H₂O）や二酸化炭素（CO₂）のように、複数元素からなる純物質です。"
    },
    {
      "id": "q8",
      "unitId": "u1",
      "difficulty": "standard",
      "question": "同じ元素からなる単体で、性質や構造が異なる物質どうしの関係を何と呼ぶか。",
      "options": [
        "化合物",
        "同素体",
        "再結晶",
        "黄色"
      ],
      "answerIndex": 1,
      "explanation": "同じ元素からできているが、結晶構造や性質が異なる単体どうしの関係です。"
    },
    {
      "id": "q9",
      "unitId": "u1",
      "difficulty": "standard",
      "question": "同素体が存在する代表的な4つの元素（SCOP）の名称をすべて挙げよ。",
      "options": [
        "凝縮（凝結）",
        "拡散",
        "硫黄（S）、炭素（C）、酸素（O）、リン（P）",
        "青緑色"
      ],
      "answerIndex": 2,
      "explanation": "「スコップ（SCOP）」の語呂合わせで覚える代表的な同素体をもつ元素群です。"
    },
    {
      "id": "q10",
      "unitId": "u1",
      "difficulty": "standard",
      "question": "炎色反応において、ナトリウム（Na）が示す炎の色は何色か。",
      "options": [
        "凝縮（凝結）",
        "黄色",
        "青緑色",
        "蒸留"
      ],
      "answerIndex": 1,
      "explanation": "アルカリ金属などの特定元素を炎に入れると特有の発色が起こり、Naは黄色を示します。"
    },
    {
      "id": "q11",
      "unitId": "u1",
      "difficulty": "standard",
      "question": "炎色反応において、カリウム（K）が示す炎の色は何色か。",
      "options": [
        "黄色",
        "赤紫色",
        "単体",
        "凝縮（凝結）"
      ],
      "answerIndex": 1,
      "explanation": "カリウム（K）の炎色反応は淡い赤紫色（パープル）を示します。"
    },
    {
      "id": "q12",
      "unitId": "u1",
      "difficulty": "standard",
      "question": "炎色反応において、銅（Cu）が示す炎の色は何色か。",
      "options": [
        "抽出",
        "昇華",
        "青緑色",
        "混合物"
      ],
      "answerIndex": 2,
      "explanation": "銅（Cu）の炎色反応は青緑色を示します。"
    },
    {
      "id": "q13",
      "unitId": "u1",
      "difficulty": "standard",
      "question": "硝酸銀水溶液に塩化物イオン（Cl⁻）を加えたときに生じる沈殿の色は何色か。",
      "options": [
        "同素体",
        "白色",
        "分留",
        "青緑色"
      ],
      "answerIndex": 1,
      "explanation": "塩化銀（AgCl）の白色沈殿が生成します（Ag⁺ + Cl⁻ → AgCl↓）。"
    },
    {
      "id": "q14",
      "unitId": "u1",
      "difficulty": "standard",
      "question": "二酸化炭素を石灰水（水酸化カルシウム水溶液）に通したときに生じる白濁の正体は何か。",
      "options": [
        "分留",
        "拡散",
        "白色",
        "炭酸カルシウム（CaCO₃）"
      ],
      "answerIndex": 3,
      "explanation": "Ca(OH)₂ + CO₂ → CaCO₃↓ + H₂O により水に不溶な CaCO₃ が生じます。"
    },
    {
      "id": "q15",
      "unitId": "u1",
      "difficulty": "standard",
      "question": "空調用空気や海水、石油のように、2種類以上の純物質が混ざり合ったものを何と呼ぶか。",
      "options": [
        "抽出",
        "水中",
        "硫黄（S）、炭素（C）、酸素（O）、リン（P）",
        "混合物"
      ],
      "answerIndex": 3,
      "explanation": "複数の純物質が混ざったもので、融点や沸点が一定になりません。"
    },
    {
      "id": "q16",
      "unitId": "u1",
      "difficulty": "advanced",
      "question": "物質を構成する粒子が、その熱運動によって自ら自然に広がる現象を何と呼ぶか。",
      "options": [
        "拡散",
        "水中",
        "抽出",
        "硫黄（S）、炭素（C）、酸素（O）、リン（P）"
      ],
      "answerIndex": 0,
      "explanation": "粒子が熱運動によって濃度の高い方から低い方へと広がっていく現象です。"
    },
    {
      "id": "q17",
      "unitId": "u1",
      "difficulty": "advanced",
      "question": "固体から直接気体に、または気体から直接固体に変化する状態変化を何と呼ぶか。",
      "options": [
        "昇華",
        "黄色",
        "白色",
        "抽出"
      ],
      "answerIndex": 0,
      "explanation": "液体を経ずに固体と気体の間を直接変化する現象（ドライアイスやヨウ素など）です。"
    },
    {
      "id": "q18",
      "unitId": "u1",
      "difficulty": "advanced",
      "question": "黄リンは空気中で自然発火するのを防ぐため、どのような場所に保存するか。",
      "options": [
        "水中",
        "赤紫色",
        "クロマトグラフィー",
        "混合物"
      ],
      "answerIndex": 0,
      "explanation": "黄リンは空気中の酸素と反応して自然発火するため、水中に没して保存します。"
    },
    {
      "id": "q19",
      "unitId": "u1",
      "difficulty": "advanced",
      "question": "ナトリウムやカリウムなどのアルカリ金属の単体は、何の中に保存するか。",
      "options": [
        "蒸留",
        "混合物",
        "水中",
        "石油中"
      ],
      "answerIndex": 3,
      "explanation": "空気中の酸素や水蒸気と激しく反応するため、石油（灯油）中に没して保存します。"
    },
    {
      "id": "q20",
      "unitId": "u1",
      "difficulty": "advanced",
      "question": "気体が冷却されて液体に変化する状態変化の名称は何か。",
      "options": [
        "水中",
        "石油中",
        "分留",
        "凝縮（凝結）"
      ],
      "answerIndex": 3,
      "explanation": "気体の熱運動が弱まり、粒子間の引力によって液体に変わる現象です。"
    },
    {
      "id": "q21",
      "unitId": "u2",
      "difficulty": "basic",
      "question": "原子の中心に存在し、正の電荷をもつ中心部分を何と呼ぶか。",
      "options": [
        "18個",
        "0個",
        "価電子",
        "原子核"
      ],
      "answerIndex": 3,
      "explanation": "原子の中心にあり、陽子と中性子から構成されています。"
    },
    {
      "id": "q22",
      "unitId": "u2",
      "difficulty": "basic",
      "question": "原子核を構成する粒子のうち、正の電荷をもつ粒子は何か。",
      "options": [
        "希ガス",
        "アルゴン（Ar）",
        "価電子",
        "陽子"
      ],
      "answerIndex": 3,
      "explanation": "1個につき＋1の電荷をもち、その数が原子番号と等しくなります。"
    },
    {
      "id": "q23",
      "unitId": "u2",
      "difficulty": "basic",
      "question": "原子の「質量数」とは、何の数と何の数の和で表されるか。",
      "options": [
        "イオン化エネルギー",
        "周期",
        "6個",
        "陽子の数 ＋ 中性子の数"
      ],
      "answerIndex": 3,
      "explanation": "原子の質量のほとんどを占める陽子と中性子の合計個数が質量数です。"
    },
    {
      "id": "q24",
      "unitId": "u2",
      "difficulty": "basic",
      "question": "原子番号（陽子の数）が同じで、中性子の数が異なるため質量数が異なる原子どうしの関係を何と呼ぶか。",
      "options": [
        "価電子",
        "アルゴン（Ar）",
        "右上",
        "同位体（アイソトープ）"
      ],
      "answerIndex": 3,
      "explanation": "化学的性質はほぼ同じですが、質量などの物理的性質が異なります。"
    },
    {
      "id": "q25",
      "unitId": "u2",
      "difficulty": "basic",
      "question": "最も内側にある電子殻（K殻）に入ることができる電子の最大数はいくつおか。",
      "options": [
        "18個",
        "イオン化エネルギー",
        "2個",
        "希ガス"
      ],
      "answerIndex": 2,
      "explanation": "電子殻に入る最大電子数は 2n²（nは内側からの番号）で表され、K殻（n=1）は2個です。"
    },
    {
      "id": "q26",
      "unitId": "u2",
      "difficulty": "basic",
      "question": "内側から3番目の電子殻（M殻）に入ることができる電子の最大数はいくつおか。",
      "options": [
        "2個",
        "0個",
        "18個",
        "原子核"
      ],
      "answerIndex": 2,
      "explanation": "M殻（n=3）に入る最大電子数は 2 × 3² = 18 個です。"
    },
    {
      "id": "q27",
      "unitId": "u2",
      "difficulty": "basic",
      "question": "原子の最外殻にある電子のうち、化学結合や化学反応に直接関与する電子を何と呼ぶか。",
      "options": [
        "ハロゲン",
        "価電子",
        "同位体（アイソトープ）",
        "アルカリ金属"
      ],
      "answerIndex": 1,
      "explanation": "最外殻電子のうち結合に関わる電子で、希ガスでは0個とみなします。"
    },
    {
      "id": "q28",
      "unitId": "u2",
      "difficulty": "standard",
      "question": "希ガス元素（He, Ne, Ar等）の価電子の数はいくつか。",
      "options": [
        "0個",
        "周期",
        "族",
        "ネオン（Ne）"
      ],
      "answerIndex": 0,
      "explanation": "希ガスは最外殻が満たされて極めて安定なため、結合に関与する価電子は0とみなします。"
    },
    {
      "id": "q29",
      "unitId": "u2",
      "difficulty": "standard",
      "question": "周期表において、縦の列を何と呼ぶか。",
      "options": [
        "アルカリ金属",
        "族",
        "0個",
        "同位体（アイソトープ）"
      ],
      "answerIndex": 1,
      "explanation": "同一の「族」に属する同族元素は、価電子数が等しく化学的性質が似ています。"
    },
    {
      "id": "q30",
      "unitId": "u2",
      "difficulty": "standard",
      "question": "周期表において、横の行を何と呼ぶか。",
      "options": [
        "周期",
        "原子核",
        "陽子",
        "価電子"
      ],
      "answerIndex": 0,
      "explanation": "同一の「周期」に属する元素は、最外殻の電子殻の種類が共通しています。"
    },
    {
      "id": "q31",
      "unitId": "u2",
      "difficulty": "standard",
      "question": "周期表の第17族元素（F, Cl, Br, Iなど）の総称は何か。",
      "options": [
        "希ガス",
        "ハロゲン",
        "右上",
        "ネオン（Ne）"
      ],
      "answerIndex": 1,
      "explanation": "価電子を7個もち、1個の電子を受け取って1価の陰イオンになりやすい元素群です。"
    },
    {
      "id": "q32",
      "unitId": "u2",
      "difficulty": "standard",
      "question": "周期表の第1族元素（水素 H を除く Li, Na, Kなど）の総称は何か。",
      "options": [
        "ハロゲン",
        "6個",
        "左下",
        "アルカリ金属"
      ],
      "answerIndex": 3,
      "explanation": "価電子を1個もち、電子を1個失って1価の陽イオンになりやすい金属元素群です。"
    },
    {
      "id": "q33",
      "unitId": "u2",
      "difficulty": "standard",
      "question": "周期表の第18族元素（He, Ne, Arなど）の総称は何か。",
      "options": [
        "アルカリ金属",
        "陽子の数 ＋ 中性子の数",
        "希ガス",
        "左下"
      ],
      "answerIndex": 2,
      "explanation": "最外殻電子配置が閉殻構造をとり、化学的に極めて不活性な非金属元素群です。"
    },
    {
      "id": "q34",
      "unitId": "u2",
      "difficulty": "standard",
      "question": "原子から電子1個を取り去って、1価の陽イオンにするために必要なエネルギーを何と呼ぶか。",
      "options": [
        "イオン化エネルギー",
        "陽子の数 ＋ 中性子の数",
        "周期",
        "族"
      ],
      "answerIndex": 0,
      "explanation": "値が小さいほど電子を放出しやすく、陽イオンになりやすいことを意味します。"
    },
    {
      "id": "q35",
      "unitId": "u2",
      "difficulty": "standard",
      "question": "原子が電子1個を受け取って、1価の陰イオンになるときに放出されるエネルギーを何と呼ぶか。",
      "options": [
        "イオン化エネルギー",
        "左下",
        "同位体（アイソトープ）",
        "電子親和力"
      ],
      "answerIndex": 3,
      "explanation": "値が大きいほど電子を引きつけやすく、陰イオンになりやすいことを意味します。"
    },
    {
      "id": "q36",
      "unitId": "u2",
      "difficulty": "advanced",
      "question": "ナトリウムイオン（Na⁺）と同じ電子配置をもつ希ガス原子はどれか。",
      "options": [
        "ネオン（Ne）",
        "周期",
        "原子核",
        "同位体（アイソトープ）"
      ],
      "answerIndex": 0,
      "explanation": "Na（原子番号11）が電子を1個失うと、電子数10個のネオン（Ne）と同じ電子配置になります。"
    },
    {
      "id": "q37",
      "unitId": "u2",
      "difficulty": "advanced",
      "question": "塩化物イオン（Cl⁻）と同じ電子配置をもつ希ガス原子はどれか。",
      "options": [
        "アルゴン（Ar）",
        "陽子の数 ＋ 中性子の数",
        "原子核",
        "18個"
      ],
      "answerIndex": 0,
      "explanation": "Cl（原子番号17）が電子を1個受け取ると、電子数18個のアルゴン（Ar）と同じ電子配置になります。"
    },
    {
      "id": "q38",
      "unitId": "u2",
      "difficulty": "advanced",
      "question": "原子番号6、質量数12の炭素原子（¹²C）に含まれる中性子の数はいくつか。",
      "options": [
        "0個",
        "周期",
        "6個",
        "陽子の数 ＋ 中性子の数"
      ],
      "answerIndex": 2,
      "explanation": "中性子の数 ＝ 質量数（12）− 陽子の数（6）＝ 6個 です。"
    },
    {
      "id": "q39",
      "unitId": "u2",
      "difficulty": "advanced",
      "question": "元素の周期表において、イオン化エネルギーが最も小さく陽イオンになりやすい元素が位置するのはどの方向か。",
      "options": [
        "アルカリ金属",
        "原子核",
        "左下",
        "陽子の数 ＋ 中性子の数"
      ],
      "answerIndex": 2,
      "explanation": "周期表の「左下」ほどイオン化エネルギーが小さく、陽イオンになりやすい傾向があります。"
    },
    {
      "id": "q40",
      "unitId": "u2",
      "difficulty": "advanced",
      "question": "元素の周期表において、電子親和力が大きく陰イオンになりやすい元素が位置するのはどの方向（希ガスを除く）か。",
      "options": [
        "右上",
        "アルゴン（Ar）",
        "アルカリ金属",
        "原子核"
      ],
      "answerIndex": 0,
      "explanation": "希ガスを除く周期表の「右上（フッ素など）」ほど陰イオンになりやすい傾向があります。"
    },
    {
      "id": "q41",
      "unitId": "u3",
      "difficulty": "basic",
      "question": "陽イオンと陰イオンが静電気力（クーロン力）で結合する化学結合を何と呼ぶか。",
      "options": [
        "イオン結合",
        "正四面体形",
        "硬いが、衝撃に弱い（もろい）",
        "極性分子"
      ],
      "answerIndex": 0,
      "explanation": "正の電荷をもつ陽イオンと負の電荷をもつ陰イオンが引き合って形成されます。"
    },
    {
      "id": "q42",
      "unitId": "u3",
      "difficulty": "basic",
      "question": "イオン結合によって形成される結晶（イオン結晶）の物理的性質（硬さと脆さ）の特徴は何か。",
      "options": [
        "硬いが、衝撃に弱い（もろい）",
        "固体では通さないが、水溶液や融解液では通す",
        "フッ素（F）",
        "電気陰性度"
      ],
      "answerIndex": 0,
      "explanation": "力がかかるとイオンの位置がずれ、同種の電荷が向かい合って反発するため割れやすいです。"
    },
    {
      "id": "q43",
      "unitId": "u3",
      "difficulty": "basic",
      "question": "非金属元素の原子どうしが、互いに電子を共有して形成される化学結合を何と呼ぶか。",
      "options": [
        "電気陰性度",
        "共有結合",
        "配位結合",
        "正四面体形"
      ],
      "answerIndex": 1,
      "explanation": "互いの価電子を出し合って共有電子対をつくり、安定な希ガス配置をとる強固な結合です。"
    },
    {
      "id": "q44",
      "unitId": "u3",
      "difficulty": "basic",
      "question": "一方の原子から提供された非共有電子対を、他方の原子と共有することでできる結合を何と呼ぶか。",
      "options": [
        "固体では通さないが、水溶液や融解液では通す",
        "配位結合",
        "共有結合",
        "フッ素（F）"
      ],
      "answerIndex": 1,
      "explanation": "アンモニウムイオン（NH₄⁺）やオキソニウムイオン（H₃O⁺）に見られる共有結合の一種です。"
    },
    {
      "id": "q45",
      "unitId": "u3",
      "difficulty": "basic",
      "question": "共有結合における電子対を引きつける強さの尺度を何と呼ぶか。",
      "options": [
        "共有結合",
        "共有結合の結晶（原子結晶）",
        "フッ素（F）",
        "電気陰性度"
      ],
      "answerIndex": 3,
      "explanation": "値が大きい原子ほど共有電子対を自分の方へ強く引き寄せます（最大はフッ素）。"
    },
    {
      "id": "q46",
      "unitId": "u3",
      "difficulty": "basic",
      "question": "全元素の中で、電気陰性度が最も大きい元素は何か。",
      "options": [
        "正四面体形",
        "自由電子",
        "硬いが、衝撃に弱い（もろい）",
        "フッ素（F）"
      ],
      "answerIndex": 3,
      "explanation": "フッ素は電子を最も強く引きつけるため、電気陰性度が最大の元素です。"
    },
    {
      "id": "q47",
      "unitId": "u3",
      "difficulty": "basic",
      "question": "水分子（H₂O）の分子全体の立体構造（形状）はどのような形か。",
      "options": [
        "折れ線形",
        "直線形",
        "ファンデルワールス力",
        "極性分子"
      ],
      "answerIndex": 0,
      "explanation": "中心の酸素原子にある2対の非共有電子対の影響により、分子は折れ線形をとります。"
    },
    {
      "id": "q48",
      "unitId": "u3",
      "difficulty": "standard",
      "question": "メタン分子（CH₄）の分子全体の立体構造（形状）はどのような形か。",
      "options": [
        "延性",
        "正四面体形",
        "固体では通さないが、水溶液や融解液では通す",
        "配位結合"
      ],
      "answerIndex": 1,
      "explanation": "中心の炭素原子から4方向へ均等に共有結合が伸びるため正四面体形となります。"
    },
    {
      "id": "q49",
      "unitId": "u3",
      "difficulty": "standard",
      "question": "アンモニア分子（NH₃）の分子全体の立体構造（形状）はどのような形か。",
      "options": [
        "三角錐形",
        "硬いが、衝撃に弱い（もろい）",
        "自由電子",
        "直線形"
      ],
      "answerIndex": 0,
      "explanation": "1対の非共有電子対が存在するため、窒素原子を頂点とした三角錐形になります。"
    },
    {
      "id": "q50",
      "unitId": "u3",
      "difficulty": "standard",
      "question": "二酸化炭素分子（CO₂）の分子全体の立体構造（形状）はどのような形か。",
      "options": [
        "直線形",
        "硬いが、衝撃に弱い（もろい）",
        "分子結晶",
        "水素結合"
      ],
      "answerIndex": 0,
      "explanation": "炭素を中心に両側へ二重結合が直線上に伸びた構造をとります（極性は打ち消し合います）。"
    },
    {
      "id": "q51",
      "unitId": "u3",
      "difficulty": "standard",
      "question": "すべての分子間に共通して働く、極めて弱い引力を何と呼ぶか。",
      "options": [
        "水素結合",
        "ファンデルワールス力",
        "配位結合",
        "極性分子"
      ],
      "answerIndex": 1,
      "explanation": "分子の相関運動や電荷の一時的な偏りによって生じる弱い分子間力です。"
    },
    {
      "id": "q52",
      "unitId": "u3",
      "difficulty": "standard",
      "question": "F, O, N原子に結合したH原子が、隣接する分子のF, O, N原子と引き合う強い分子間力を何と呼ぶか。",
      "options": [
        "正四面体形",
        "固体では通さないが、水溶液や融解液では通す",
        "水素結合",
        "共有結合"
      ],
      "answerIndex": 2,
      "explanation": "沸点や融点が分子量に対して著しく高くなる原因（水やフッ化水素など）となります。"
    },
    {
      "id": "q53",
      "unitId": "u3",
      "difficulty": "standard",
      "question": "金属結晶において、特定原子に固定されず結晶全体を自由に動く電子を何と呼ぶか。",
      "options": [
        "極性分子",
        "自由電子",
        "正四面体形",
        "イオン結合"
      ],
      "answerIndex": 1,
      "explanation": "金属特有の高い電気導電性や熱伝導性、金属光沢の要因となる電子です。"
    },
    {
      "id": "q54",
      "unitId": "u3",
      "difficulty": "standard",
      "question": "金属を叩いたときに薄く広がる性質を何と呼ぶか。",
      "options": [
        "分子結晶",
        "延性",
        "直線形",
        "展性"
      ],
      "answerIndex": 3,
      "explanation": "自由電子が格子欠陥や位置ずれを媒介するため、叩いても割れずに薄く広がります。"
    },
    {
      "id": "q55",
      "unitId": "u3",
      "difficulty": "standard",
      "question": "金属を引っ張ったときに細く長く伸びる性質を何と呼ぶか。",
      "options": [
        "イオン結合",
        "分子結晶",
        "延性",
        "自由電子"
      ],
      "answerIndex": 2,
      "explanation": "展性と並ぶ金属特有の機械的性質で、線状に引き伸ばすことができる能力です。"
    },
    {
      "id": "q56",
      "unitId": "u3",
      "difficulty": "advanced",
      "question": "ダイヤモンドや二酸化ケイ素（SiO₂）のように、多数の原子が共有結合のみで連なった結晶は何か。",
      "options": [
        "イオン結合",
        "水素結合",
        "共有結合の結晶（原子結晶）",
        "共有結合"
      ],
      "answerIndex": 2,
      "explanation": "全体が非常に強い共有結合で結ばれているため、極めて硬く融点が非常に高いです。"
    },
    {
      "id": "q57",
      "unitId": "u3",
      "difficulty": "advanced",
      "question": "ヨウ素やドライアイス、ナフタレンのように分子が分子間力で集まってできた結晶は何か。",
      "options": [
        "配位結合",
        "折れ線形",
        "分子結晶",
        "電気陰性度"
      ],
      "answerIndex": 2,
      "explanation": "弱い分子間力で保持されているため、柔らかく融点が低く、昇華性をもつものが多いです。"
    },
    {
      "id": "q58",
      "unitId": "u3",
      "difficulty": "advanced",
      "question": "イオン結晶が「固体状態」と「水溶液・融解状態」のときに電気を通すか否かを答えよ。",
      "options": [
        "電気陰性度",
        "分子結晶",
        "固体では通さないが、水溶液や融解液では通す",
        "直線形"
      ],
      "answerIndex": 2,
      "explanation": "固体ではイオンが固定されていますが、水溶液や融解状態ではイオンが自由に移動できます。"
    },
    {
      "id": "q59",
      "unitId": "u3",
      "difficulty": "advanced",
      "question": "分子内で正負の電荷の偏り（電位差）が存在する分子を何と呼ぶか。",
      "options": [
        "分子結晶",
        "極性分子",
        "共有結合",
        "直線形"
      ],
      "answerIndex": 1,
      "explanation": "水や塩化水素のように、電気陰性度の差や構造の非対称性から電荷の偏りをもつ分子です。"
    },
    {
      "id": "q60",
      "unitId": "u3",
      "difficulty": "advanced",
      "question": "水（極性溶媒）によく溶けやすいのは、極性分子と非極性分子のどちらか。",
      "options": [
        "極性分子",
        "直線形",
        "フッ素（F）",
        "水素結合"
      ],
      "answerIndex": 0,
      "explanation": "「似たものは似たものを溶かす」原理により、極性溶媒の水には極性分子がよく溶けます。"
    },
    {
      "id": "q61",
      "unitId": "u4",
      "difficulty": "basic",
      "question": "質量数12の炭素原子（¹²C）1個の質量を12と定め、これを基準とした相対的な質量の比を何と呼ぶか。",
      "options": [
        "22.4 L",
        "相対質量",
        "0.4 mol/L",
        "物質 1 mol に含まれる粒子（原子・分子など）の数"
      ],
      "answerIndex": 1,
      "explanation": "単位をもたない相対値で、各原子の質量の比較基準となります。"
    },
    {
      "id": "q62",
      "unitId": "u4",
      "difficulty": "basic",
      "question": "アボガドロ定数（約 6.0 × 10²³ /mol）が意味する個数は何か。",
      "options": [
        "0.2 mol",
        "物質 1 mol に含まれる粒子（原子・分子など）の数",
        "質量保存の法則",
        "0.25 mol"
      ],
      "answerIndex": 1,
      "explanation": "6.0 × 10²³ 個の集まりを 1 mol（物質量）と定義します。"
    },
    {
      "id": "q63",
      "unitId": "u4",
      "difficulty": "basic",
      "question": "標準状態（0℃, 1.013 × 10⁵ Pa）において、すべての気体 1 mol が占める体積は約何 L か。",
      "options": [
        "0.40 mol/L",
        "0.2 mol",
        "22.4 L",
        "1.0 mol"
      ],
      "answerIndex": 2,
      "explanation": "気体の種類に関わらず、標準状態の理想気体 1 mol の体積は常に 22.4 L です。"
    },
    {
      "id": "q64",
      "unitId": "u4",
      "difficulty": "basic",
      "question": "水分子（H₂O）の分子量はいくつか。（原子量：H=1.0, O=16）",
      "options": [
        "18",
        "22.4 L",
        "28",
        "1.0 mol"
      ],
      "answerIndex": 0,
      "explanation": "1.0 × 2 + 16 = 18 です（分子量に単位はつきません）。"
    },
    {
      "id": "q65",
      "unitId": "u4",
      "difficulty": "basic",
      "question": "二酸化炭素（CO₂） 44 g の物質量（mol）はいくらか。（原子量：C=12, O=16）",
      "options": [
        "16 g",
        "1.0 mol",
        "28",
        "0.40 mol/L"
      ],
      "answerIndex": 1,
      "explanation": "CO₂ の分子量は 44 です。物質量 ＝ 44 g ÷ 44 g/mol = 1.0 mol となります。"
    },
    {
      "id": "q66",
      "unitId": "u4",
      "difficulty": "basic",
      "question": "水分子 3.0 × 10²³ 個の物質量（mol）はいくらか。",
      "options": [
        "0.5 mol",
        "0.25 mol",
        "質量保存の法則",
        "質量の比"
      ],
      "answerIndex": 0,
      "explanation": "物質量 ＝ (3.0 × 10²³) ÷ (6.0 × 10²³/mol) = 0.5 mol です。"
    },
    {
      "id": "q67",
      "unitId": "u4",
      "difficulty": "basic",
      "question": "標準状態における酸素（O₂） 5.6 L の物質量（mol）はいくらか。",
      "options": [
        "20%",
        "0.25 mol",
        "物質 1 mol に含まれる粒子（原子・分子など）の数",
        "0.40 mol/L"
      ],
      "answerIndex": 1,
      "explanation": "物質量 ＝ 5.6 L ÷ 22.4 L/mol = 0.25 mol です。"
    },
    {
      "id": "q68",
      "unitId": "u4",
      "difficulty": "standard",
      "question": "溶質 0.2 mol を水に溶かして 500 mL にした水溶液のモル濃度（mol/L）はいくらか。",
      "options": [
        "質量保存の法則",
        "28",
        "22.4 L",
        "0.4 mol/L"
      ],
      "answerIndex": 3,
      "explanation": "500 mL ＝ 0.5 L です。モル濃度 ＝ 0.2 mol ÷ 0.5 L = 0.4 mol/L となります。"
    },
    {
      "id": "q69",
      "unitId": "u4",
      "difficulty": "standard",
      "question": "食塩 20 g を水 80 g に溶かした水溶液の質量パーセント濃度（%）はいくらか。",
      "options": [
        "0.2 mol",
        "18",
        "20%",
        "16 g"
      ],
      "answerIndex": 2,
      "explanation": "溶液全体の質量は 20 + 80 = 100 g です。(20 ÷ 100) × 100 = 20% となります。"
    },
    {
      "id": "q70",
      "unitId": "u4",
      "difficulty": "standard",
      "question": "化学反応式の「係数の比」と一致しない比率はどれか（物質量・個数・気体体積・質量）。",
      "options": [
        "質量の比",
        "18",
        "2.0 mol",
        "0.2 mol"
      ],
      "answerIndex": 0,
      "explanation": "反応式の係数の比は「物質量(mol)」「粒子数」「気体体積」の比と等しいですが、「質量」の比とは一致しません。"
    },
    {
      "id": "q71",
      "unitId": "u4",
      "difficulty": "standard",
      "question": "メタン（CH₄） 1 mol が完全燃焼した際、生成する二酸化炭素（CO₂）の物質量はいくらか。",
      "options": [
        "約28.8",
        "質量の比",
        "0.2 mol",
        "1 mol"
      ],
      "answerIndex": 3,
      "explanation": "反応式 CH₄ + 2O₂ → CO₂ + 2H₂O より、係数比が 1:1 なので 1 mol 生成します。"
    },
    {
      "id": "q72",
      "unitId": "u4",
      "difficulty": "standard",
      "question": "水素 2.0 g（分子量 2.0）が完全燃焼して水が生成するとき、必要な酸素の質量は何 g か。",
      "options": [
        "16 g",
        "0.4 mol/L",
        "質量保存の法則",
        "モル濃度（単位：mol/L）"
      ],
      "answerIndex": 0,
      "explanation": "水素は 1.0 mol です。反応式 2H₂ + O₂ → 2H₂O より酸素は 0.5 mol（0.5 × 32 = 16 g）必要です。"
    },
    {
      "id": "q73",
      "unitId": "u4",
      "difficulty": "standard",
      "question": "2.0 mol/L の塩酸 100 mL に含まれる塩化水素（HCl）の物質量はいくらか。",
      "options": [
        "相対質量",
        "0.40 mol/L",
        "質量の比",
        "0.2 mol"
      ],
      "answerIndex": 3,
      "explanation": "物質量 ＝ 2.0 mol/L × (100 ÷ 1000) L = 0.2 mol です。"
    },
    {
      "id": "q74",
      "unitId": "u4",
      "difficulty": "standard",
      "question": "水酸化ナトリウム（NaOH、式量40）8.0 g の物質量（mol）はいくらか。",
      "options": [
        "質量の比",
        "0.2 mol",
        "22.4 L",
        "物質 1 mol に含まれる粒子（原子・分子など）の数"
      ],
      "answerIndex": 1,
      "explanation": "物質量 ＝ 8.0 g ÷ 40 g/mol = 0.2 mol です。"
    },
    {
      "id": "q75",
      "unitId": "u4",
      "difficulty": "standard",
      "question": "溶液 1 L 中に含まれる溶質の物質量（mol）で表した濃度を何と呼ぶか。",
      "options": [
        "20%",
        "モル濃度（単位：mol/L）",
        "16 g",
        "1 mol"
      ],
      "answerIndex": 1,
      "explanation": "化学実験で最もよく使われる濃度表現で、溶液の体積 1 L あたりの mol 数です。"
    },
    {
      "id": "q76",
      "unitId": "u4",
      "difficulty": "advanced",
      "question": "窒素 80%、酸素 20% の体積組成からなる空気の平均分子量は約いくつか。（N=14, O=16）",
      "options": [
        "22.4 L",
        "約28.8",
        "モル濃度（単位：mol/L）",
        "20%"
      ],
      "answerIndex": 1,
      "explanation": "N₂(28) × 0.8 + O₂(32) × 0.2 = 22.4 + 6.4 = 28.8 と計算できます。"
    },
    {
      "id": "q77",
      "unitId": "u4",
      "difficulty": "advanced",
      "question": "標準状態で密度が 1.25 g/L である気体の分子量はいくつか。",
      "options": [
        "28",
        "約28.8",
        "質量保存の法則",
        "相対質量"
      ],
      "answerIndex": 0,
      "explanation": "分子量 ＝ 標準状態での密度(g/L) × 22.4 L/mol = 1.25 × 22.4 = 28 です。"
    },
    {
      "id": "q78",
      "unitId": "u4",
      "difficulty": "advanced",
      "question": "メタン分子（CH₄） 0.5 mol に含まれる「水素原子」の物質量は何 mol か。",
      "options": [
        "0.25 mol",
        "0.40 mol/L",
        "2.0 mol",
        "1.0 mol"
      ],
      "answerIndex": 2,
      "explanation": "CH₄ 1分子中に H は 4個あるため、0.5 mol × 4 = 2.0 mol となります。"
    },
    {
      "id": "q79",
      "unitId": "u4",
      "difficulty": "advanced",
      "question": "塩化ナトリウム 5.85 g（式量58.5）を溶かして 250 mL にした水溶液のモル濃度はいくつか。",
      "options": [
        "0.40 mol/L",
        "0.5 mol",
        "28",
        "2.0 mol"
      ],
      "answerIndex": 0,
      "explanation": "NaCl は 5.85 ÷ 58.5 = 0.10 mol です。モル濃度 ＝ 0.10 mol ÷ 0.25 L = 0.40 mol/L となります。"
    },
    {
      "id": "q80",
      "unitId": "u4",
      "difficulty": "advanced",
      "question": "化学反応の前後で、反応に関与する物質全体の全質量は変わらないという法則は何か。",
      "options": [
        "22.4 L",
        "質量保存の法則",
        "相対質量",
        "2.0 mol"
      ],
      "answerIndex": 1,
      "explanation": "ラボアジエが発見した法則で、反応前後で原子の種類と個数が変化しないため成り立ちます。"
    },
    {
      "id": "q81",
      "unitId": "u5",
      "difficulty": "basic",
      "question": "水溶液中で電離して水素イオン（H⁺）を生じる物質を何と定義するか（アレニウスの定義）。",
      "options": [
        "酸",
        "弱酸（酢酸）",
        "1.0 × 10⁻¹⁴ (mol/L)²",
        "酸性塩"
      ],
      "answerIndex": 0,
      "explanation": "水に溶かしたときに H⁺ を放出する物質をアレニウスは酸と定義しました。"
    },
    {
      "id": "q82",
      "unitId": "u5",
      "difficulty": "basic",
      "question": "ブレンステッド・ローリーの定義において、相手に「H⁺（プロトン）を与える物質」は何か。",
      "options": [
        "フェノールフタレイン",
        "20 mL",
        "酸",
        "酸性"
      ],
      "answerIndex": 2,
      "explanation": "ブレンステッドの定義では、H⁺ の授受に着目し、H⁺ の供与体を酸と呼びます。"
    },
    {
      "id": "q83",
      "unitId": "u5",
      "difficulty": "basic",
      "question": "硫酸（H₂SO₄）の酸としての価数はいくつか。",
      "options": [
        "2価",
        "1価の弱塩基",
        "二酸化炭素（CO₂）",
        "酸"
      ],
      "answerIndex": 0,
      "explanation": "硫酸分子 1個から最大 2個の H⁺ を生じることができるため2価の酸です。"
    },
    {
      "id": "q84",
      "unitId": "u5",
      "difficulty": "basic",
      "question": "酢酸（CH₃COOH）の強弱および価数は何か。",
      "options": [
        "1価の弱酸",
        "酸性",
        "ビュレット",
        "弱酸（酢酸）"
      ],
      "answerIndex": 0,
      "explanation": "示性式中に H は4個ありますが、電離するのはカルボキシ基の H 1個のみで、電離度の小さい弱酸です。"
    },
    {
      "id": "q85",
      "unitId": "u5",
      "difficulty": "basic",
      "question": "アンモニア（NH₃）の塩基としての強弱および価数は何か。",
      "options": [
        "ビュレット",
        "20 mL",
        "1価の弱塩基",
        "酸性塩"
      ],
      "answerIndex": 2,
      "explanation": "水と反応して OH⁻ をわずかに生じる（NH₃ + H₂O ⇄ NH₄⁺ + OH⁻）1価の弱塩基です。"
    },
    {
      "id": "q86",
      "unitId": "u5",
      "difficulty": "basic",
      "question": "水溶液に溶かした電解質のうち、電離している分子（またはイオン）の割合を何と呼ぶか。",
      "options": [
        "2価",
        "電離度（α）",
        "20 mL",
        "40 mL"
      ],
      "answerIndex": 1,
      "explanation": "電離度 ＝ 電離した物質量 ÷ 溶かした全物質量 （0 ≤ α ≤ 1）で表されます。"
    },
    {
      "id": "q87",
      "unitId": "u5",
      "difficulty": "basic",
      "question": "25℃における水のイオン積 Kw = [H⁺][OH⁻] の値はいくらか。",
      "options": [
        "1.0 × 10⁻¹⁴ (mol/L)²",
        "フェノールフタレイン",
        "ビュレット",
        "1価の弱酸"
      ],
      "answerIndex": 0,
      "explanation": "25℃の薄い水溶液では、液性（酸性・中性・塩基性）に関わらず積が一定値をとります。"
    },
    {
      "id": "q88",
      "unitId": "u5",
      "difficulty": "standard",
      "question": "[H⁺] = 1.0 × 10⁻³ mol/L である水溶液の pH はいくつか。",
      "options": [
        "a · c · V = b · c' · V'",
        "ホールピペット",
        "2価",
        "3"
      ],
      "answerIndex": 3,
      "explanation": "[H⁺] = 1.0 × 10⁻ⁿ mol/L のとき、pH ＝ n です。"
    },
    {
      "id": "q89",
      "unitId": "u5",
      "difficulty": "standard",
      "question": "0.01 mol/L の水酸化ナトリウム水溶液（完全電離）の25℃における pH はいくつか。",
      "options": [
        "3",
        "12",
        "弱酸（酢酸）",
        "40 mL"
      ],
      "answerIndex": 1,
      "explanation": "[OH⁻] = 1.0 × 10⁻² mol/L より、[H⁺] = 1.0 × 10⁻¹² mol/L となり pH ＝ 12 です。"
    },
    {
      "id": "q90",
      "unitId": "u5",
      "difficulty": "standard",
      "question": "酸と塩基が反応して、互いの性質を打ち消し合い塩と水を生じる反応を何と呼ぶか。",
      "options": [
        "a · c · V = b · c' · V'",
        "ビュレット",
        "中和反応",
        "弱酸（酢酸）"
      ],
      "answerIndex": 2,
      "explanation": "酸の H⁺ と塩基の OH⁻ が結合して H₂O が生成し、同時に「塩」が形成されます。"
    },
    {
      "id": "q91",
      "unitId": "u5",
      "difficulty": "standard",
      "question": "価数 a、濃度 c mol/L、体積 V mL の酸を完全中和する中和条件の基本式は何か。",
      "options": [
        "酸性",
        "a · c · V = b · c' · V'",
        "フェノールフタレイン",
        "電離度（α）"
      ],
      "answerIndex": 1,
      "explanation": "（酸から生じる H⁺ の mol 数）＝（塩基から生じる OH⁻ の mol 数）の条件式です。"
    },
    {
      "id": "q92",
      "unitId": "u5",
      "difficulty": "standard",
      "question": "0.10 mol/L の塩酸（HCl）20 mL を中和するのに必要な 0.050 mol/L の水酸化ナトリウム水溶液の体積は何 mL か。",
      "options": [
        "1価の弱塩基",
        "酸性塩",
        "弱酸（酢酸）",
        "40 mL"
      ],
      "answerIndex": 3,
      "explanation": "1 × 0.10 × 20 = 1 × 0.050 × V' より、V' = 40 mL と求まります。"
    },
    {
      "id": "q93",
      "unitId": "u5",
      "difficulty": "standard",
      "question": "0.10 mol/L の硫酸（H₂SO₄）10 mL を中和するのに必要な 0.10 mol/L の水酸化ナトリウム水溶液の体積は何 mL か。",
      "options": [
        "20 mL",
        "酸性",
        "40 mL",
        "1価の弱酸"
      ],
      "answerIndex": 0,
      "explanation": "硫酸は2価なので、2 × 0.10 × 10 = 1 × 0.10 × V' より、V' = 20 mL と求まります。"
    },
    {
      "id": "q94",
      "unitId": "u5",
      "difficulty": "standard",
      "question": "中和滴定において、溶液を一定量正確にはかり取って移すための実験器具は何か。",
      "options": [
        "3",
        "酸性塩",
        "ホールピペット",
        "a · c · V = b · c' · V'"
      ],
      "answerIndex": 2,
      "explanation": "既知濃度の標準液や試料溶液を精度よく一定量採取するための器具です。"
    },
    {
      "id": "q95",
      "unitId": "u5",
      "difficulty": "standard",
      "question": "中和滴定において、滴定液を少しずつ滴下してその使用体積を精密に読み取る器具は何か。",
      "options": [
        "1価の弱酸",
        "ビュレット",
        "酸性塩",
        "中和反応"
      ],
      "answerIndex": 1,
      "explanation": "コックを調整して滴下し、始点と終点の液面目盛りの差から滴下量を測定します。"
    },
    {
      "id": "q96",
      "unitId": "u5",
      "difficulty": "advanced",
      "question": "弱酸（酢酸）と強塩基（NaOH）の中和滴定において、終点指示薬として適しているのは何か。",
      "options": [
        "フェノールフタレイン",
        "1価の弱塩基",
        "a · c · V = b · c' · V'",
        "12"
      ],
      "answerIndex": 0,
      "explanation": "中和点が塩基性領域（pH 8〜10）に傾くため、変色域が pH 8.0〜9.8 の指示薬が適します。"
    },
    {
      "id": "q97",
      "unitId": "u5",
      "difficulty": "advanced",
      "question": "硫酸水素ナトリウム（NaHSO₄）のように、分子内に酸の H が残っている塩の分類は何か。",
      "options": [
        "中和反応",
        "2価",
        "酸性塩",
        "フェノールフタレイン"
      ],
      "answerIndex": 2,
      "explanation": "酸の H⁺ が完全に置換されず残っている塩を指します（液性が酸性とは限りません）。"
    },
    {
      "id": "q98",
      "unitId": "u5",
      "difficulty": "advanced",
      "question": "強酸（塩酸）と弱塩基（アンモニア）から生じる塩である塩化アンモニウム（NH₄Cl）の水溶液の性質は何か。",
      "options": [
        "フェノールフタレイン",
        "40 mL",
        "二酸化炭素（CO₂）",
        "酸性"
      ],
      "answerIndex": 3,
      "explanation": "弱塩基由来の NH₄⁺ が加水分解して H⁺ を生じるため、水溶液は酸性を示します。"
    },
    {
      "id": "q99",
      "unitId": "u5",
      "difficulty": "advanced",
      "question": "弱酸の塩（酢酸ナトリウム）に強酸（塩酸）を加えたとき、何が発生・遊離するか。",
      "options": [
        "1価の弱塩基",
        "弱酸（酢酸）",
        "1価の弱酸",
        "1.0 × 10⁻¹⁴ (mol/L)²"
      ],
      "answerIndex": 1,
      "explanation": "「弱酸の塩 ＋ 強酸 → 強酸の塩 ＋ 弱酸」の反応により、弱酸が遊離します。"
    },
    {
      "id": "q100",
      "unitId": "u5",
      "difficulty": "advanced",
      "question": "炭酸水素ナトリウム（NaHCO₃）に塩酸を加えたとき、発生する気体は何か。",
      "options": [
        "二酸化炭素（CO₂）",
        "1価の弱酸",
        "12",
        "40 mL"
      ],
      "answerIndex": 0,
      "explanation": "弱酸である炭酸が遊離し、それが分解して CO₂ と H₂O が発生します。"
    },
    {
      "id": "q101",
      "unitId": "u6",
      "difficulty": "basic",
      "question": "電子の授受に基づく定義において、「物質が電子を失う」変化を何と呼ぶか。",
      "options": [
        "Cu²⁺ + 2e⁻ → Cu",
        "酸化",
        "K, Ca, Na, Mg, Al, Zn, Fe, Ni, Sn, Pb, (H₂), Cu, Hg, Ag, Pt, Au",
        "赤紫色から無色（淡桃色）へ変化"
      ],
      "answerIndex": 1,
      "explanation": "電子を失う変化が酸化で、逆に電子を受け取る変化が還元です。"
    },
    {
      "id": "q102",
      "unitId": "u6",
      "difficulty": "basic",
      "question": "単体中の原子の酸化数はいくらと定められているか。",
      "options": [
        "亜鉛（Zn）",
        "電池（化学電池）",
        "0",
        "+4"
      ],
      "answerIndex": 2,
      "explanation": "H₂, O₂, Fe, Cu などの単体を構成する原子の酸化数はすべて 0 です。"
    },
    {
      "id": "q103",
      "unitId": "u6",
      "difficulty": "basic",
      "question": "化合物中の水素原子（H）および酸素原子（O）の一般的な酸化数はいくつか。",
      "options": [
        "H：+1、O：-2",
        "激しく反応して水素を発生する",
        "電池（化学電池）",
        "一次電池"
      ],
      "answerIndex": 0,
      "explanation": "化合物中では原則として H は +1、O は -2 として基準をとります。"
    },
    {
      "id": "q104",
      "unitId": "u6",
      "difficulty": "basic",
      "question": "二酸化炭素（CO₂）における炭素原子（C）の酸化数はいくつか。",
      "options": [
        "+4",
        "溶けない",
        "硫黄（S）",
        "二次電池（蓄電池）"
      ],
      "answerIndex": 0,
      "explanation": "Oが -2 なので、x + (-2) × 2 = 0 より x = +4 と計算されます。"
    },
    {
      "id": "q105",
      "unitId": "u6",
      "difficulty": "basic",
      "question": "過マンガン酸イオン（MnO₄⁻）におけるマンガン（Mn）の酸化数はいくつか。",
      "options": [
        "+7",
        "H：+1、O：-2",
        "酸化された",
        "酸化剤"
      ],
      "answerIndex": 0,
      "explanation": "電荷が -1 なので、x + (-2) × 4 = -1 より x = +7 です。"
    },
    {
      "id": "q106",
      "unitId": "u6",
      "difficulty": "basic",
      "question": "原子やイオンの酸化数が増加したとき、その物質は「酸化」されたか「還元」されたか。",
      "options": [
        "一次電池",
        "+4",
        "酸化剤",
        "酸化された"
      ],
      "answerIndex": 3,
      "explanation": "酸化数が増える変化は電子を放出したことを表し、「酸化された」状態を意味します。"
    },
    {
      "id": "q107",
      "unitId": "u6",
      "difficulty": "basic",
      "question": "自身は還元され、相手の物質を酸化する働きをもつ物質を何と呼ぶか。",
      "options": [
        "酸化剤",
        "+4",
        "酸化",
        "+7"
      ],
      "answerIndex": 0,
      "explanation": "相手から電子を奪って酸化させる物質で、自身は電子を受け取って還元されます。"
    },
    {
      "id": "q108",
      "unitId": "u6",
      "difficulty": "standard",
      "question": "過マンガン酸カリウム（KMnO₄）が酸性水溶液中で酸化剤として働くとき、自身の色はどう変化するか。",
      "options": [
        "赤紫色から無色（淡桃色）へ変化",
        "電池（化学電池）",
        "亜鉛（Zn）",
        "酸化"
      ],
      "answerIndex": 0,
      "explanation": "MnO₄⁻（赤紫）が電子を受け取り Mn²⁺（ほぼ無色）へと還元されます。"
    },
    {
      "id": "q109",
      "unitId": "u6",
      "difficulty": "standard",
      "question": "硫化水素（H₂S）が還元剤として働いたとき、生成する単体は何か。",
      "options": [
        "硫黄（S）",
        "Cu²⁺ + 2e⁻ → Cu",
        "激しく反応して水素を発生する",
        "赤紫色から無色（淡桃色）へ変化"
      ],
      "answerIndex": 0,
      "explanation": "H₂S → S + 2H⁺ + 2e⁻ と反応し、単体の硫黄（S）が析出します。"
    },
    {
      "id": "q110",
      "unitId": "u6",
      "difficulty": "standard",
      "question": "金属が水溶液中で電子を失って陽イオンになろうとする傾向を何と呼ぶか。",
      "options": [
        "酸化",
        "イオン化傾向",
        "0",
        "+7"
      ],
      "answerIndex": 1,
      "explanation": "金属の反応性の高さを示す順序で、値が大きいほど陽イオンになりやすいです。"
    },
    {
      "id": "q111",
      "unitId": "u6",
      "difficulty": "standard",
      "question": "金属のイオン化傾向の順序（KからAu）を答える際の一般的な語呂合わせの頭文字の並びは何か。",
      "options": [
        "一次電池",
        "激しく反応して水素を発生する",
        "K, Ca, Na, Mg, Al, Zn, Fe, Ni, Sn, Pb, (H₂), Cu, Hg, Ag, Pt, Au",
        "二次電池（蓄電池）"
      ],
      "answerIndex": 2,
      "explanation": "「貸そうかな町父ちゃん…（K Ca Na Mg Al Zn Fe Ni Sn Pb H Cu Hg Ag Pt Au）」で覚えます。"
    },
    {
      "id": "q112",
      "unitId": "u6",
      "difficulty": "standard",
      "question": "アルカリ金属であるカリウム（K）やナトリウム（Na）を冷水に入れるとどのような反応が起きるか。",
      "options": [
        "H：+1、O：-2",
        "激しく反応して水素を発生する",
        "一次電池",
        "溶けない"
      ],
      "answerIndex": 1,
      "explanation": "イオン化傾向が極めて大きいため、冷水と激しく反応して H₂ を発生します。"
    },
    {
      "id": "q113",
      "unitId": "u6",
      "difficulty": "standard",
      "question": "銅（Cu）や銀（Ag）は塩酸などの薄い酸に溶けるか、溶けないか。",
      "options": [
        "溶けない",
        "一次電池",
        "K, Ca, Na, Mg, Al, Zn, Fe, Ni, Sn, Pb, (H₂), Cu, Hg, Ag, Pt, Au",
        "0"
      ],
      "answerIndex": 0,
      "explanation": "水素（H₂）よりイオン化傾向が小さいため、強酸の塩酸や稀硫酸には溶けません（硝酸等には溶けます）。"
    },
    {
      "id": "q114",
      "unitId": "u6",
      "difficulty": "standard",
      "question": "硫酸銅(II)水溶液に亜鉛板（Zn）を浸したとき、亜鉛板の表面に沈殿・析出する金属は何か。",
      "options": [
        "酸化剤",
        "激しく反応して水素を発生する",
        "H：+1、O：-2",
        "銅（Cu）"
      ],
      "answerIndex": 3,
      "explanation": "イオン化傾向が Zn > Cu のため、Znが溶け出し、液中の Cu²⁺ が銅として析出します。"
    },
    {
      "id": "q115",
      "unitId": "u6",
      "difficulty": "standard",
      "question": "酸化還元反応を利用して化学エネルギーを直接電気エネルギーに変換する装置を何と呼ぶか。",
      "options": [
        "酸化",
        "溶けない",
        "電池（化学電池）",
        "赤紫色から無色（淡桃色）へ変化"
      ],
      "answerIndex": 2,
      "explanation": "負極で酸化反応、正極で還元反応を起こさせて電流（導線中の電子移動）を取り出します。"
    },
    {
      "id": "q116",
      "unitId": "u6",
      "difficulty": "advanced",
      "question": "ダニエル電池（亜鉛板|硫酸亜鉛水溶液||硫酸銅水溶液|銅板）において「負極」となるのはどちらの金属か。",
      "options": [
        "一次電池",
        "亜鉛（Zn）",
        "+4",
        "酸化"
      ],
      "answerIndex": 1,
      "explanation": "イオン化傾向が大きい亜鉛が負極となり、溶けて電子を導線に放続・供給します。"
    },
    {
      "id": "q117",
      "unitId": "u6",
      "difficulty": "advanced",
      "question": "ダニエル電池の正極（銅板）で起こる化学変化（半反応式）は何か。",
      "options": [
        "Cu²⁺ + 2e⁻ → Cu",
        "イオン化傾向",
        "溶けない",
        "硫黄（S）"
      ],
      "answerIndex": 0,
      "explanation": "水溶液中の銅イオン（Cu²⁺）が導線から流れてきた電子を受け取り、銅（Cu）として析出します。"
    },
    {
      "id": "q118",
      "unitId": "u6",
      "difficulty": "advanced",
      "question": "放電すると元に戻らず、一度きりで使い切る電池を何と呼ぶか。",
      "options": [
        "一次電池",
        "二次電池（蓄電池）",
        "+4",
        "赤紫色から無色（淡桃色）へ変化"
      ],
      "answerIndex": 0,
      "explanation": "マンガン乾電池やアルカリ乾電池などのように、充電して再利用できない電池です。"
    },
    {
      "id": "q119",
      "unitId": "u6",
      "difficulty": "advanced",
      "question": "外部から逆向きの電流を流す（充電する）ことで、繰り返し使用できる電池を何と呼ぶか。",
      "options": [
        "+7",
        "酸化された",
        "溶けない",
        "二次電池（蓄電池）"
      ],
      "answerIndex": 3,
      "explanation": "鉛蓄電池やリチウムイオン電池のように、充電・放電を交互に行える電池です。"
    },
    {
      "id": "q120",
      "unitId": "u6",
      "difficulty": "advanced",
      "question": "自動車のバッテリー等に用いられる、負極に鉛（Pb）、正極に二酸化鉛（PbO₂）を用いた二次電池は何か。",
      "options": [
        "H：+1、O：-2",
        "鉛蓄電池",
        "赤紫色から無色（淡桃色）へ変化",
        "溶けない"
      ],
      "answerIndex": 1,
      "explanation": "電解液に稀硫酸（H₂SO₄）を用いた代表的な二次電池で、充放電が可能です。"
    }
  ]
};
