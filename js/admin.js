/* 管理者ダッシュボード: 学習者分析 + 問題管理 */
const ADMIN_CONFIG = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem('kagaku_lab_supabase_config') || '{}');
    return { url: window.SUPABASE_URL || saved.url || '', anonKey: window.SUPABASE_ANON_KEY || saved.anonKey || '' };
  } catch (e) { return { url: window.SUPABASE_URL || '', anonKey: window.SUPABASE_ANON_KEY || '' }; }
})();
let supabaseClient=null, allStudents=[], allSnapshots=[], allHistory=[], cloudQuestionRows=[];
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
function grade(v){return Mastery.grade(Number(v)||0)}
function fmtTime(sec){sec=Number(sec)||0;const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60);return h?`${h}時間${m}分`:`${m}分`}
function isToday(date){if(!date)return false;const d=new Date(date),n=new Date();return d.getFullYear()===n.getFullYear()&&d.getMonth()===n.getMonth()&&d.getDate()===n.getDate()}
function fmtDate(date){if(!date)return '—';return new Date(date).toLocaleString('ja-JP',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}
function fmtDay(date){if(!date)return '—';const d=new Date(date+'T00:00:00');return `${d.getMonth()+1}/${d.getDate()}`}

async function setup(){
  if(!ADMIN_CONFIG.url||!ADMIN_CONFIG.anonKey){
    $('login-status').textContent='Supabaseの接続設定がありません。';
    $('login-status').className='status danger-status';
    $('login-form').style.display='none';
    return
  }
  supabaseClient=window.supabase.createClient(ADMIN_CONFIG.url,ADMIN_CONFIG.anonKey);
  supabaseClient.auth.onAuthStateChange((_event,session)=>{if(session) enter(session)});
  const {data}=await supabaseClient.auth.getSession();
  if(data.session) await enter(data.session);
}

async function login(e){
  e.preventDefault();
  if(!supabaseClient)return;
  $('login-status').textContent='ログインしています…';
  const {error}=await supabaseClient.auth.signInWithPassword({
    email:$('login-email').value.trim(),
    password:$('login-password').value
  });
  if(error){
    $('login-status').textContent='ログインできませんでした。';
    $('login-status').className='status danger-status'
  }
}

async function enter(session){
  const {data:profile,error}=await supabaseClient
    .from('profiles')
    .select('display_name,role')
    .eq('id',session.user.id)
    .maybeSingle();

  if(error||!profile||profile.role!=='admin'){
    await supabaseClient.auth.signOut();
    $('login-status').textContent='このアカウントには管理者権限がありません。';
    $('login-status').className='status danger-status';
    return
  }

  $('login-view').hidden=true;
  $('admin-view').hidden=false;
  $('admin-subtitle').textContent=`ログイン中: ${profile.display_name||session.user.email||'管理者'}`;

  if(window.KagakuCloud?.questionsReady) await window.KagakuCloud.questionsReady;

  await loadData();
  await loadQuestionAdminData();
}

async function loadData(){
  $('admin-status').textContent='データを読み込んでいます…';

  const [profiles,snaps,history]=await Promise.all([
    supabaseClient
      .from('profiles')
      .select('id,display_name,email,role,created_at')
      .eq('role','student')
      .order('created_at',{ascending:false}),

    supabaseClient
      .from('progress_snapshots')
      .select('user_id,mastery,attempt_count,total_time_seconds,last_study_at,unit_mastery,data,updated_at')
      .order('updated_at',{ascending:false}),

    supabaseClient
      .from('progress_history')
      .select('user_id,recorded_date,mastery,attempt_count,total_time_seconds,unit_mastery,updated_at')
      .order('recorded_date',{ascending:true})
  ]);

  if(profiles.error||snaps.error){
    $('admin-status').textContent='データを取得できませんでした。RLS設定とテーブル設定を確認してください。';
    $('admin-status').className='status danger-status';
    return
  }

  allStudents=profiles.data||[];
  allSnapshots=snaps.data||[];
  allHistory=history.error?[]:(history.data||[]);

  render();

  $('admin-status').textContent=
    history.error
      ? `${allStudents.length}人分のデータを表示中（学習履歴テーブル未設定）`
      : `${allStudents.length}人分のデータを表示中`;
}

function latestByUser(){
  const map = new Map();

  function getAttemptCount(snapshot){
    const data =
      snapshot?.data &&
      typeof snapshot.data === 'object'
        ? snapshot.data
        : {};

    const attempts =
      data.attempts &&
      typeof data.attempts === 'object'
        ? data.attempts
        : {};

    const fromAttempts = Object.values(attempts).reduce(
      (sum, att) => sum + (Number(att?.count) || 0),
      0
    );

    const stored = Number(snapshot?.attempt_count);

    return Math.max(
      fromAttempts,
      Number.isFinite(stored) ? stored : 0
    );
  }

  function getTotalTime(snapshot){
    const data =
      snapshot?.data &&
      typeof snapshot.data === 'object'
        ? snapshot.data
        : {};

    const stored = Number(snapshot?.total_time_seconds);
    const fromData = Number(data?.totalTimeSeconds);

    return Math.max(
      Number.isFinite(stored) ? stored : 0,
      Number.isFinite(fromData) ? fromData : 0
    );
  }

  for(const snapshot of allSnapshots){
    const userId = String(snapshot?.user_id || '');
    if(!userId) continue;

    const current = map.get(userId);

    if(!current){
      map.set(userId, snapshot);
      continue;
    }

    const currentAttempts = getAttemptCount(current);
    const newAttempts = getAttemptCount(snapshot);

    const currentTime = getTotalTime(current);
    const newTime = getTotalTime(snapshot);

    const currentUpdated =
      new Date(current?.updated_at || 0).getTime() || 0;

    const newUpdated =
      new Date(snapshot?.updated_at || 0).getTime() || 0;

    /*
      同じユーザーに複数のsnapshotがある場合、
      実際の学習データが一番多いものを採用する。

      優先順位:
      1. 解答回数
      2. 総学習時間
      3. 更新日時
    */
    if(
      newAttempts > currentAttempts ||
      (
        newAttempts === currentAttempts &&
        newTime > currentTime
      ) ||
      (
        newAttempts === currentAttempts &&
        newTime === currentTime &&
        newUpdated > currentUpdated
      )
    ){
      map.set(userId, snapshot);
    }
  }

  return map;
}

/* =========================
   学習データ
========================= */
function snapshotData(snapshot){
  if(!snapshot){
    return {
      mastery: 0,
      attempt_count: 0,
      total_time_seconds: 0,
      last_study_at: null,
      unit_mastery: {},
      data: {},
      attempts: {}
    };
  }

  const data =
    snapshot.data &&
    typeof snapshot.data === 'object'
      ? snapshot.data
      : {};

  const attempts =
    data.attempts &&
    typeof data.attempts === 'object'
      ? data.attempts
      : {};

  /*
    解答回数

    例:
    Aを1回
    Bを3回
    Cを2回

    → 6問
  */
  const attemptsCount = Object.values(attempts).reduce(
    (sum, att) => {
      return sum + (Number(att?.count) || 0);
    },
    0
  );

  const savedAttemptCount =
    Number(snapshot.attempt_count);

  const attemptCount = Math.max(
    attemptsCount,
    Number.isFinite(savedAttemptCount)
      ? savedAttemptCount
      : 0
  );

  /*
    総学習時間
  */
  const snapshotTime =
    Number(snapshot.total_time_seconds);

  const dataTime =
    Number(data.totalTimeSeconds);

  const totalTimeSeconds = Math.max(
    Number.isFinite(snapshotTime)
      ? snapshotTime
      : 0,

    Number.isFinite(dataTime)
      ? dataTime
      : 0
  );

  /*
    定着度
  */
  const savedMastery =
    Number(snapshot.mastery);

  let mastery;

  if(Number.isFinite(savedMastery)){
    mastery = savedMastery;
  }else{
    const values = Object.values(attempts);

    mastery = values.length
      ? Math.round(
          values.reduce(
            (sum, att) =>
              sum + Mastery.questionScore(att),
            0
          ) / values.length
        )
      : 0;
  }

  /*
    単元別定着度
  */
  const savedUnits =
    snapshot.unit_mastery &&
    typeof snapshot.unit_mastery === 'object'
      ? snapshot.unit_mastery
      : {};

  const unitMastery = {
    ...savedUnits
  };

  if(!Object.keys(unitMastery).length){
    (KagakuData.units || []).forEach(unit => {
      unitMastery[unit.id] =
        Mastery.unitScore(
          unit.id,
          KagakuData.questions,
          attempts
        );
    });
  }

  /*
    最終学習日時
  */
  let lastStudyAt =
    snapshot.last_study_at || null;

  if(!lastStudyAt && data.lastStudyDate){
    lastStudyAt =
      new Date(
        data.lastStudyDate + 'T23:59:59'
      ).toISOString();
  }

  return {
    mastery,
    attempt_count: attemptCount,
    total_time_seconds: totalTimeSeconds,
    last_study_at: lastStudyAt,
    unit_mastery: unitMastery,
    data,
    attempts
  };
}
/* =========================
   ダッシュボード
========================= */

function render(){
  const map=latestByUser();

  const rows=
    allStudents.map(
      u=>({
        u,
        s:snapshotData(
          map.get(u.id)
        )
      })
    );

  const active=
    rows.filter(
      x=>isToday(
        x.s.last_study_at
      )
    ).length;

  const avg=
    rows.length
      ? Math.round(
          rows.reduce(
            (a,x)=>
              a+
              Number(
                x.s.mastery||0
              ),
            0
          )/rows.length
        )
      : 0;

  const review=
    rows.filter(
      x=>
        Number(
          x.s.mastery||0
        )<60
    ).length;

  $('a-users').textContent=
    rows.length;

  $('a-active').textContent=
    active;

  $('a-mastery').textContent=
    `${avg}% ${grade(avg)}`;

  $('a-review').textContent=
    review;

  renderStudents(rows);
  renderUnits(rows);
  renderRecent();
  renderOverallCharts();
}

function renderStudents(rows){
  const q=
    $('student-search')
      .value
      .trim()
      .toLowerCase();

  const f=
    $('student-filter').value;

  const filtered=
    rows.filter(
      x=>{
        const text=
          `${x.u.display_name||''} ${x.u.email||''}`
            .toLowerCase();

        if(
          q&&
          !text.includes(q)
        )return false;

        if(
          f==='review'&&
          Number(
            x.s.mastery||0
          )>=60
        )return false;

        if(
          f==='active'&&
          !isToday(
            x.s.last_study_at
          )
        )return false;

        return true
      }
    );

  $('student-tbody').innerHTML=
    filtered.length
      ? filtered.map(
          x=>{
            const m=
              Math.round(
                Number(
                  x.s.mastery||0
                )
              );

            const g=grade(m);

            return `
              <tr>
                <td>
                  <button
                    class="student-link"
                    data-user-id="${esc(x.u.id)}"
                  >
                    <strong>
                      ${esc(
                        x.u.display_name||
                        '名前未設定'
                      )}
                    </strong>
                  </button>
                  <br>
                  <span class="muted">
                    ${esc(
                      x.u.email||''
                    )}
                  </span>
                </td>

                <td>
                  <span class="badge badge-${g.toLowerCase()}">
                    ${m}%・${g}
                  </span>
                </td>

                <td>
                  ${Number(
                    x.s.attempt_count||0
                  )}問
                </td>

                <td>
                  ${fmtTime(
                    x.s.total_time_seconds
                  )}
                </td>

                <td>
                  ${fmtDate(
                    x.s.last_study_at
                  )}
                </td>
              </tr>
            `
          }
        ).join('')
      : `
        <tr>
          <td
            colspan="5"
            class="empty"
          >
            該当する学習者はいません。
          </td>
        </tr>
      `;

  document
    .querySelectorAll(
      '.student-link'
    )
    .forEach(
      btn=>
        btn.addEventListener(
          'click',
          ()=>
            showStudent(
              btn.dataset.userId
            )
        )
    );
}

function renderUnits(rows){
  const totals={};

  for(
    const x of rows
  ){
    for(
      const [id,v]
      of Object.entries(
        x.s.unit_mastery||{}
      )
    ){
      if(!totals[id])
        totals[id]=[];

      totals[id].push(
        Number(v)||0
      );
    }
  }

  $('unit-bars').innerHTML=
    KagakuData.units
      .map(
        u=>{
          const vals=
            totals[u.id]||[];

          const v=
            vals.length
              ? Math.round(
                  vals.reduce(
                    (a,b)=>
                      a+b,
                    0
                  )/
                  vals.length
                )
              : 0;

          return `
            <div class="unit-row">
              <div>
                <div class="unit-name">
                  ${esc(u.title)}
                </div>

                <div class="progress">
                  <i
                    style="width:${v}%"
                  ></i>
                </div>
              </div>

              <div class="unit-score">
                ${v}%・${grade(v)}
              </div>
            </div>
          `
        }
      )
      .join('');
}

function renderRecent(){
  const items=
    allSnapshots
      .slice(0,8)
      .map(
        raw=>{
          const u=
            allStudents.find(
              x=>
                x.id===
                raw.user_id
            );

          const s=
            snapshotData(raw);

          return `
            <div class="recent-item">
              <div>
                <strong>
                  ${esc(
                    u?.display_name||
                    u?.email||
                    '学習者'
                  )}
                </strong>

                <br>

                <span class="muted">
                  定着度
                  ${Math.round(
                    Number(
                      s.mastery||0
                    )
                  )}%
                </span>
              </div>

              <span class="muted">
                ${fmtDate(
                  raw.updated_at||
                  s.last_study_at
                )}
              </span>
            </div>
          `
        }
      );

  $('recent-list').innerHTML=
    items.length
      ? items.join('')
      : `
        <div class="empty">
          まだ学習データがありません。
        </div>
      `;
}

/* =========================
   グラフ
========================= */

function historyForUser(userId){
  return allHistory
    .filter(
      h=>h.user_id===userId
    )
    .sort(
      (a,b)=>
        String(
          a.recorded_date
        ).localeCompare(
          String(
            b.recorded_date
          )
        )
    );
}

function renderBars(
  chartId,
  labelId,
  items,
  maxValue,
  formatter
){
  const chart=$(chartId);
  const labels=$(labelId);

  if(!items.length){
    chart.innerHTML=
      '<div class="empty" style="width:100%">履歴がまだありません。</div>';

    labels.innerHTML='';
    return
  }

  const max=
    Math.max(
      maxValue||0,
      ...items.map(
        x=>Number(
          x.value
        )||0
      ),
      1
    );

  chart.innerHTML=
    items.map(
      x=>{
        const v=
          Math.max(
            0,
            Number(
              x.value
            )||0
          );

        const h=
          Math.max(
            3,
            Math.round(
              v/max*100
            )
          );

        return `
          <div
            class="chart-bar"
            style="height:${h}%"
            title="${esc(
              x.label
            )}: ${esc(
              formatter(v)
            )}"
          >
            <span>
              ${esc(
                formatter(v)
              )}
            </span>
          </div>
        `
      }
    ).join('');

  labels.innerHTML=
    items.map(
      x=>
        `<span>${esc(x.label)}</span>`
    ).join('');
}

function historyDays(){
  return [
    ...new Set(
      allHistory.map(
        h=>h.recorded_date
      )
    )
  ]
    .sort()
    .slice(-14);
}

function renderOverallCharts(){
  const days=
    historyDays();

  const mastery=
    days.map(
      day=>{
        const rows=
          allHistory.filter(
            h=>
              h.recorded_date===
              day
          );

        return {
          label:
            fmtDay(day),

          value:
            rows.length
              ? Math.round(
                  rows.reduce(
                    (a,r)=>
                      a+
                      Number(
                        r.mastery||0
                      ),
                    0
                  )/
                  rows.length
                )
              : 0
        }
      }
    );

  const time=
    days.map(
      (day,i)=>{
        const prev=
          days[i-1];

        let total=0;

        for(
          const u of allStudents
        ){
          const cur=
            allHistory.find(
              h=>
                h.user_id===u.id&&
                h.recorded_date===day
            );

          if(!cur)continue;

          const old=
            prev
              ? allHistory.find(
                  h=>
                    h.user_id===u.id&&
                    h.recorded_date===prev
                )
              : null;

          total+=Math.max(
            0,
            Number(
              cur.total_time_seconds||0
            )-
            (
              old
                ? Number(
                    old.total_time_seconds||0
                  )
                : 0
            )
          );
        }

        return {
          label:
            fmtDay(day),

          value:
            Math.round(
              total/60
            )
        }
      }
    );

  renderBars(
    'overall-mastery-chart',
    'overall-mastery-labels',
    mastery,
    100,
    v=>`${v}%`
  );

  renderBars(
    'overall-time-chart',
    'overall-time-labels',
    time,
    Math.max(
      60,
      ...time.map(
        x=>x.value
      )
    ),
    v=>`${v}分`
  );
}

function studentHistoryChart(history){
  return history
    .slice(-10)
    .map(
      h=>({
        label:
          fmtDay(
            h.recorded_date
          ),
        value:
          Number(
            h.mastery||0
          )
      })
    );
}

function questionStats(attempts){
  return KagakuData.questions
    .map(
      q=>{
        const a=
          attempts[q.id];

        if(
          !a||
          !Number(a.count)
        )return null;

        const count=
          Number(
            a.count
          )||0;

        const correct=
          Number(
            a.correct
          )||0;

        const acc=
          Math.round(
            correct/
            count*
            100
          );

        const score=
          Math.round(
            Mastery.questionScore(
              a
            )
          );

        return {
          q,
          count,
          correct,
          acc,
          score,
          lastAttempt:
            a.lastAttempt
        }
      }
    )
    .filter(Boolean)
    .sort(
      (a,b)=>
        a.score-b.score
    );
}

function showStudent(userId){
  const u=
    allStudents.find(
      x=>x.id===userId
    );

 const snapshotMap = latestByUser();
const raw = snapshotMap.get(userId);

  if(!u)return;

  const s=
    snapshotData(raw);

  const m=
    Math.round(
      Number(
        s.mastery||0
      )
    );

  const data=
    s.data||{};

  const attempts=
    data.attempts||{};

  const history=
    historyForUser(
      userId
    );

  const unitRows=
    KagakuData.units
      .map(
        unit=>`
          <div class="detail-unit">
            <span>
              ${esc(
                unit.title
              )}
            </span>

            <strong>
              ${Math.round(
                Number(
                  s.unit_mastery?.[
                    unit.id
                  ]||0
                )
              )}%・${grade(
                s.unit_mastery?.[
                  unit.id
                ]
              )}
            </strong>
          </div>
        `
      )
      .join('');

  const weak=
    questionStats(
      attempts
    ).slice(
      0,
      8
    );

  const weakHtml=
    weak.length
      ? weak
          .map(
            x=>`
              <li>
                ${esc(
                  x.q.question
                )}

                <span class="muted">
                  ${x.count}回・
                  正答率${x.acc}%・
                  定着${x.score}%
                </span>
              </li>
            `
          )
          .join('')
      : `
          <li>
            まだ十分な演習データがありません。
          </li>
        `;

  const qRows=
    questionStats(
      attempts
    )
      .slice(
        0,
        20
      )
      .map(
        x=>`
          <tr>
            <td>
              ${esc(x.q.id)}
            </td>

            <td>
              ${esc(
                x.q.question
              )}
            </td>

            <td>
              ${x.count}回
            </td>

            <td>
              ${x.acc}%
            </td>

            <td>
              ${x.score}%・${grade(
                x.score
              )}
            </td>
          </tr>
        `
      )
      .join('');

  const hist=
    studentHistoryChart(
      history
    );

  $('detail-content').innerHTML=`
    <div class="detail-head">
      <div>
        <div class="eyebrow">
          学習者詳細
        </div>

        <h2>
          ${esc(
            u.display_name||
            '名前未設定'
          )}
        </h2>

        <p class="muted">
          ${esc(
            u.email||''
          )}
        </p>
      </div>

      <button
        class="btn btn-outline btn-sm"
        id="close-detail"
      >
        閉じる
      </button>
    </div>

    <div class="detail-stats">
      <div>
        <span>
          総合定着度
        </span>

        <strong>
          ${m}%・${grade(m)}
        </strong>
      </div>

      <div>
        <span>
          確認問題
        </span>

        <strong>
          ${Number(
            s.attempt_count||0
          )}問
        </strong>
      </div>

      <div>
        <span>
          学習時間
        </span>

        <strong>
          ${fmtTime(
            s.total_time_seconds
          )}
        </strong>
      </div>

      <div>
        <span>
          最終学習
        </span>

        <strong>
          ${fmtDate(
            s.last_study_at
          )}
        </strong>
      </div>
    </div>

    <div class="detail-section">
      <h3>
        定着度の推移
      </h3>

      <div
        class="chart-wrap"
        id="student-history-chart"
      ></div>

      <div
        class="chart-labels"
        id="student-history-labels"
      ></div>

      <p class="stat-note">
        学習履歴を保存した日だけ表示されます。
      </p>
    </div>

    <div class="detail-section">
      <h3>
        単元別定着度
      </h3>

      <div class="detail-units">
        ${unitRows}
      </div>
    </div>

    <div class="detail-section">
      <h3>
        優先して復習したい問題
      </h3>

      <ol class="weak-list">
        ${weakHtml}
      </ol>
    </div>

    <div class="detail-section">
      <h3>
        問題別の演習状況
      </h3>

      ${
        qRows
          ? `
            <div class="table-wrap">
              <table class="detail-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>問題</th>
                    <th>回数</th>
                    <th>正答率</th>
                    <th>定着度</th>
                  </tr>
                </thead>

                <tbody>
                  ${qRows}
                </tbody>
              </table>
            </div>
          `
          : `
            <p class="muted">
              まだ問題を解いていません。
            </p>
          `
      }
    </div>
  `;

  $('student-detail').hidden=false;

  $('close-detail').onclick=()=>{
    $('student-detail').hidden=true
  };

  renderBars(
    'student-history-chart',
    'student-history-labels',
    hist,
    100,
    v=>`${v}%`
  );
}

/* =========================
   学習者CSV
========================= */

function exportStudentsCSV(){
  const map=
    latestByUser();

  const header=[
    '学習者',
    'メール',
    '総合定着度',
    'ランク',
    '確認問題数',
    '学習時間(分)',
    '最終学習'
  ];

  const lines=[
    header,

    ...allStudents.map(
      u=>{
        const s=
          snapshotData(
            map.get(
              u.id
            )
          );

        const m=
          Math.round(
            Number(
              s.mastery||0
            )
          );

        return [
          u.display_name||'',
          u.email||'',
          m,
          grade(m),
          Number(
            s.attempt_count||0
          ),
          Math.round(
            Number(
              s.total_time_seconds||0
            )/60
          ),
          s.last_study_at
            ? new Date(
                s.last_study_at
              ).toLocaleString(
                'ja-JP'
              )
            : ''
        ]
      }
    )
  ];

  const csv=
    '\ufeff'+
    lines
      .map(
        row=>
          row
            .map(
              v=>
                `"${String(v).replace(
                  /"/g,
                  '""'
                )}"`
            )
            .join(',')
      )
      .join('\n');

  const blob=
    new Blob(
      [csv],
      {
        type:
          'text/csv;charset=utf-8'
      }
    );

  const url=
    URL.createObjectURL(
      blob
    );

  const a=
    document.createElement(
      'a'
    );

  a.href=url;

  a.download=
    `kagaku_lab_students_${
      new Date()
        .toISOString()
        .slice(
          0,
          10
        )
    }.csv`;

  a.click();

  URL.revokeObjectURL(
    url
  );
}

/* =========================
   問題管理
========================= */

function cloudMap(){
  return new Map(
    cloudQuestionRows.map(
      r=>[
        r.id,
        r
      ]
    )
  );
}

function adminQuestions(){
  const map=
    cloudMap();

  const out=[];

  for(
    const q of KagakuData.questions
  ){
    const r=
      map.get(q.id);

    if(r?.is_deleted)
      continue;

    out.push({
      q,
      r:r||null
    });
  }

  for(
    const r of cloudQuestionRows
  ){
    if(
      r.is_deleted||
      KagakuData.questions.some(
        q=>q.id===r.id
      )
    )continue;

    out.push({
      q:{
        id:r.id,
        unitId:r.unit_id,
        difficulty:r.difficulty,
        question:r.question,
        options:r.options||[],
        answerIndex:
          Number(
            r.answer_index
          )||0,
        explanation:
          r.explanation||'',
        tags:r.tags||[]
      },
      r
    });
  }

  return out;
}

async function loadQuestionAdminData(){
  if(!supabaseClient)
    return;

  const {
    data,
    error
  }=
    await supabaseClient
      .from('questions')
      .select(
        'id,unit_id,difficulty,question,options,answer_index,explanation,tags,is_published,is_deleted,created_at,updated_at'
      )
      .order(
        'updated_at',
        {
          ascending:false
        }
      );

  if(error){
    $('question-tbody').innerHTML=`
      <tr>
        <td
          colspan="6"
          class="empty"
        >
          問題管理テーブルがまだ設定されていません。
          QUESTIONS_SETUP.mdのSQLを実行してください。
        </td>
      </tr>
    `;

    return
  }

  cloudQuestionRows=
    data||[];

  populateQuestionUnitFilters();
  renderQuestionAdmin();

  await loadTests();
  await loadAnnouncements();
}

function populateQuestionUnitFilters(){
  [
    'question-unit-filter',
    'q-unit'
  ].forEach(
    id=>{
      const el=$(id);

      if(!el)return;

      const current=
        el.value;

      el.innerHTML=
        (
          id===
          'question-unit-filter'
            ? '<option value="all">全単元</option>'
            : ''
        )+
        KagakuData.units
          .map(
            u=>
              `<option value="${esc(
                u.id
              )}">
                ${esc(
                  u.title
                )}
              </option>`
          )
          .join('');

      if(current)
        el.value=current;
    }
  );
}

function renderQuestionAdmin(){
  const search=
    (
      $('question-search')?.value||
      ''
    )
      .trim()
      .toLowerCase();

  const status=
    $('question-status-filter')?.value||
    'all';

  const unit=
    $('question-unit-filter')?.value||
    'all';

  const list=
    adminQuestions()
      .filter(
        ({q,r})=>{
          const pub=
            r
              ? r.is_published
              : true;

          const hay=
            `${q.id} ${q.question} ${(q.tags||[]).join(' ')}`
              .toLowerCase();

          if(
            search&&
            !hay.includes(search)
          )return false;

          if(
            unit!=='all'&&
            q.unitId!==unit
          )return false;

          if(
            status==='published'&&
            !pub
          )return false;

          if(
            status==='unpublished'&&
            pub
          )return false;

          return true;
        }
      );

  $('question-tbody').innerHTML=
    list.length
      ? list
          .map(
            ({q,r})=>{
              const pub=
                r
                  ? r.is_published
                  : true;

              const source=
                r
                  ? 'cloud'
                  : '内蔵';

              return `
                <tr>
                  <td>
                    <input
                      type="checkbox"
                      class="question-check"
                      value="${esc(q.id)}"
                    >
                  </td>

                  <td>
                    <strong>
                      ${esc(
                        q.question
                      )}
                    </strong>

                    <br>

                    <span class="muted">
                      ${esc(q.id)}
                      ・
                      ${source}
                      ${
                        (q.tags||[]).length
                          ? ' ・ '+
                            esc(
                              q.tags.join(
                                ' / '
                              )
                            )
                          : ''
                      }
                    </span>
                  </td>

                  <td>
                    ${esc(
                      KagakuData.units.find(
                        u=>
                          u.id===
                          q.unitId
                      )?.title||
                      q.unitId||
                      '—'
                    )}
                  </td>

                  <td>
                    ${esc(
                      q.difficulty
                    )}
                  </td>

                  <td>
                    <span class="publish-dot">
                      ${
                        pub
                          ? '🟢 公開'
                          : '⚪ 非公開'
                      }
                    </span>
                  </td>

                  <td>
                    <div class="question-actions">
                      <button
                        class="mini-btn"
                        data-q-edit="${esc(q.id)}"
                      >
                        編集
                      </button>

                      <button
                        class="mini-btn"
                        data-q-pub="${esc(q.id)}"
                      >
                        ${
                          pub
                            ? '非公開'
                            : '公開'
                        }
                      </button>

                      <button
                        class="mini-btn mini-btn-danger"
                        data-q-del="${esc(q.id)}"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              `
            }
          )
          .join('')
      : `
        <tr>
          <td
            colspan="6"
            class="empty"
          >
            該当する問題はありません。
          </td>
        </tr>
      `;

  document
    .querySelectorAll(
      '[data-q-edit]'
    )
    .forEach(
      b=>
        b.onclick=
          ()=>
            openEditor(
              b.dataset.qEdit
            )
    );

  document
    .querySelectorAll(
      '[data-q-pub]'
    )
    .forEach(
      b=>
        b.onclick=
          ()=>
            togglePublished(
              b.dataset.qPub
            )
    );

  document
    .querySelectorAll(
      '[data-q-del]'
    )
    .forEach(
      b=>
        b.onclick=
          ()=>
            deleteQuestion(
              b.dataset.qDel
            )
    );

  document
    .querySelectorAll(
      '.question-check'
    )
    .forEach(
      b=>
        b.onchange=
          updateSelectedCount
    );

  updateSelectedCount();
}

function selectedQuestionIds(){
  return [
    ...document.querySelectorAll(
      '.question-check:checked'
    )
  ].map(
    x=>x.value
  );
}

function updateSelectedCount(){
  const n=
    selectedQuestionIds()
      .length;

  if(
    $('question-selected-count')
  ){
    $('question-selected-count')
      .textContent=
        `${n}件選択`;
  }
}

function openEditor(id=''){
  const item=
    adminQuestions().find(
      x=>x.q.id===id
    );

  const q=
    item?.q;

  const r=
    item?.r;

  $('question-form').reset();

  $('q-id').value=
    id||'';

  $('editor-title').textContent=
    id
      ? '問題を編集'
      : '問題を追加';

  if(id&&q){
    $('q-unit').value=
      q.unitId;

    $('q-difficulty').value=
      q.difficulty||
      'basic';

    $('q-question').value=
      q.question||
      '';

    for(
      let i=0;
      i<4;
      i++
    ){
      $(`q-opt-${i}`).value=
        q.options?.[i]||
        '';
    }

    $('q-answer').value=
      String(
        q.answerIndex??0
      );

    $('q-explanation').value=
      q.explanation||
      '';

    $('q-tags').value=
      (
        r?.tags||
        q.tags||
        []
      ).join(', ');

    $('q-published').value=
      String(
        r
          ? r.is_published
          : true
      );
  }else{
    $('q-unit').value=
      KagakuData
        .units[0]?.id||
      '';

    $('q-difficulty').value=
      'basic';

    $('q-tags').value=
      '';

    $('q-published').value=
      'true';
  }

  $('question-editor').hidden=
    false;
}

async function saveQuestion(e){
  e.preventDefault();

  const id=
    $('q-id').value.trim()||
    `q-${Date.now()}`;

  const old=
    adminQuestions().find(
      x=>x.q.id===id
    )?.r;

  const user=
    (
      await supabaseClient
        .auth
        .getUser()
    ).data.user;

  const payload={
    id,

    unit_id:
      $('q-unit').value,

    difficulty:
      $('q-difficulty').value,

    question:
      $('q-question')
        .value
        .trim(),

    options:
      [0,1,2,3].map(
        i=>
          $(`q-opt-${i}`)
            .value
            .trim()
      ),

    answer_index:
      Number(
        $('q-answer').value
      ),

    explanation:
      $('q-explanation')
        .value
        .trim(),

    tags:
      $('q-tags')
        .value
        .split(',')
        .map(
          x=>x.trim()
        )
        .filter(Boolean),

    is_published:
      $('q-published')
        .value===
      'true',

    is_deleted:
      false,

    created_by:
      old?.created_by||
      user?.id||
      null,

    updated_at:
      new Date().toISOString()
  };

  const {error}=
    await supabaseClient
      .from('questions')
      .upsert(
        payload,
        {
          onConflict:'id'
        }
      );

  if(error){
    alert(
      '保存できませんでした: '+
      error.message
    );
    return
  }

  $('question-editor').hidden=
    true;

  await loadQuestionAdminData();
}

async function togglePublished(id){
  const item=
    adminQuestions().find(
      x=>x.q.id===id
    );

  if(!item)return;

  const r=
    item.r;

  const user=
    (
      await supabaseClient
        .auth
        .getUser()
    ).data.user;

  const payload={
    id,

    unit_id:
      item.q.unitId,

    difficulty:
      item.q.difficulty,

    question:
      item.q.question,

    options:
      item.q.options||[],

    answer_index:
      item.q.answerIndex||0,

    explanation:
      item.q.explanation||'',

    tags:
      r?.tags||
      item.q.tags||
      [],

    is_published:
      !(r
        ? r.is_published
        : true),

    is_deleted:
      false,

    created_by:
      r?.created_by||
      user?.id||
      null,

    updated_at:
      new Date().toISOString()
  };

  const {error}=
    await supabaseClient
      .from('questions')
      .upsert(
        payload,
        {
          onConflict:'id'
        }
      );

  if(error){
    alert(
      '公開状態を変更できませんでした: '+
      error.message
    );
  }else{
    await loadQuestionAdminData();
  }
}

async function deleteQuestion(id){
  if(
    !confirm(
      'この問題を削除しますか？\n生徒側からも表示されなくなります。'
    )
  )return;

  const item=
    adminQuestions().find(
      x=>x.q.id===id
    );

  if(!item)return;

  const r=
    item.r;

  const user=
    (
      await supabaseClient
        .auth
        .getUser()
    ).data.user;

  const payload={
    id,

    unit_id:
      item.q.unitId,

    difficulty:
      item.q.difficulty,

    question:
      item.q.question,

    options:
      item.q.options||[],

    answer_index:
      item.q.answerIndex||0,

    explanation:
      item.q.explanation||'',

    tags:
      r?.tags||
      item.q.tags||
      [],

    is_published:
      false,

    is_deleted:
      true,

    created_by:
      r?.created_by||
      user?.id||
      null,

    updated_at:
      new Date().toISOString()
  };

  const {error}=
    await supabaseClient
      .from('questions')
      .upsert(
        payload,
        {
          onConflict:'id'
        }
      );

  if(error){
    alert(
      '削除できませんでした: '+
      error.message
    );
  }else{
    await loadQuestionAdminData();
  }
}

async function bulkSet(
  published,
  del=false
){
  const ids=
    selectedQuestionIds();

  if(!ids.length){
    alert(
      '問題を選択してください。'
    );
    return
  }

  if(
    del&&
    !confirm(
      `${ids.length}問を削除しますか？`
    )
  )return;

  const user=
    (
      await supabaseClient
        .auth
        .getUser()
    ).data.user;

  for(
    const id of ids
  ){
    const item=
      adminQuestions().find(
        x=>x.q.id===id
      );

    if(!item)continue;

    const r=
      item.r;

    await supabaseClient
      .from('questions')
      .upsert(
        {
          id,

          unit_id:
            item.q.unitId,

          difficulty:
            item.q.difficulty,

          question:
            item.q.question,

          options:
            item.q.options||[],

          answer_index:
            item.q.answerIndex||0,

          explanation:
            item.q.explanation||'',

          tags:
            r?.tags||
            item.q.tags||
            [],

          is_published:
            del
              ? false
              : published,

          is_deleted:
            del,

          created_by:
            r?.created_by||
            user?.id||
            null,

          updated_at:
            new Date().toISOString()
        },
        {
          onConflict:'id'
        }
      );
  }

  await loadQuestionAdminData();
}

function downloadCSV(
  name,
  text
){
  const blob=
    new Blob(
      ['\ufeff'+text],
      {
        type:
          'text/csv;charset=utf-8'
      }
    );

  const url=
    URL.createObjectURL(
      blob
    );

  const a=
    document.createElement(
      'a'
    );

  a.href=url;
  a.download=name;
  a.click();

  URL.revokeObjectURL(
    url
  );
}

function csvCell(v){
  return `"${String(
    v??''
  ).replace(
    /"/g,
    '""'
  )}"`
}

function exportQuestionsCSV(){
  const rows=[
    [
      'id',
      'unit_id',
      'difficulty',
      'question',
      'option1',
      'option2',
      'option3',
      'option4',
      'answer_index',
      'explanation',
      'tags',
      'is_published'
    ],

    ...adminQuestions().map(
      ({q,r})=>[
        q.id,
        q.unitId,
        q.difficulty,
        q.question,
        ...(q.options||[])
          .slice(0,4),
        q.answerIndex,
        q.explanation,
        (
          r?.tags||
          q.tags||
          []
        ).join('|'),
        r
          ? r.is_published
          : true
      ]
    )
  ];

  downloadCSV(
    `kagaku_lab_questions_${
      new Date()
        .toISOString()
        .slice(0,10)
    }.csv`,

    rows
      .map(
        r=>
          r
            .map(csvCell)
            .join(',')
      )
      .join('\n')
  );
}

function parseCSV(text){
  const rows=[];

  let row=[];
  let cell='';
  let quote=false;

  for(
    let i=0;
    i<text.length;
    i++
  ){
    const ch=
      text[i];

    const next=
      text[i+1];

    if(
      ch==='"'&&
      quote&&
      next==='"'
    ){
      cell+='"';
      i++;
      continue
    }

    if(ch==='"'){
      quote=!quote;
      continue
    }

    if(
      ch===','&&
      !quote
    ){
      row.push(cell);
      cell='';
      continue
    }

    if(
      (
        ch==='\n'||
        ch==='\r'
      )&&
      !quote
    ){
      if(
        ch==='\r'&&
        next==='\n'
      )i++;

      row.push(cell);

      if(
        row.some(
          v=>v.trim()
        )
      ){
        rows.push(row);
      }

      row=[];
      cell='';
      continue
    }

    cell+=ch;
  }

  if(
    cell||
    row.length
  ){
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

async function importQuestions(file){
  const text=
    await file.text();

  const rows=
    parseCSV(text);

  if(rows.length<2){
    alert(
      'CSVにデータがありません。'
    );
    return
  }

  const header=
    rows[0].map(
      x=>x.trim()
    );

  const idx=
    Object.fromEntries(
      header.map(
        (h,i)=>[
          h,
          i
        ]
      )
    );

  let ok=0;

  const user=
    (
      await supabaseClient
        .auth
        .getUser()
    ).data.user;

  for(
    const r of rows.slice(1)
  ){
    if(
      !r[idx.id]||
      !r[idx.question]
    )continue;

    const options=
      [1,2,3,4].map(
        n=>
          r[
            idx[
              'option'+n
            ]
          ]||''
      );

    await supabaseClient
      .from('questions')
      .upsert(
        {
          id:
            r[idx.id],

          unit_id:
            r[idx.unit_id]||
            KagakuData
              .units[0]
              .id,

          difficulty:
            r[idx.difficulty]||
            'basic',

          question:
            r[idx.question],

          options,

          answer_index:
            Number(
              r[
                idx.answer_index
              ]
            )||0,

          explanation:
            r[idx.explanation]||
            '',

          tags:
            (
              r[idx.tags]||
              ''
            )
              .split('|')
              .map(
                x=>x.trim()
              )
              .filter(Boolean),

          is_published:
            String(
              r[
                idx.is_published
              ]
            ).toLowerCase()!==
            'false',

          is_deleted:
            false,

          created_by:
            user?.id||
            null,

          updated_at:
            new Date().toISOString()
        },
        {
          onConflict:'id'
        }
      );

    ok++;
  }

  alert(
    `${ok}問を取り込みました。`
  );

  await loadQuestionAdminData();
}

/* ===== テスト管理 ===== */

function toIds(v){
  return Array.isArray(v)
    ? v
    : (
        typeof v==='string'
          ? JSON.parse(
              v||'[]'
            )
          : []
      );
}

async function loadTests(){
  if(
    !supabaseClient||
    !$('test-admin-list')
  )return;

  const {
    data,
    error
  }=
    await supabaseClient
      .from('tests')
      .select('*')
      .order(
        'created_at',
        {
          ascending:false
        }
      );

  if(error){
    $('test-admin-list').innerHTML=
      '<div class="empty">FINAL_SETUP.sql実行後に利用できます。</div>';
    return
  }

  $('test-admin-list').innerHTML=
    (data||[])
      .map(
        t=>`
          <div class="recent-item">
            <div>
              <strong>
                ${esc(t.title)}
              </strong>

              <br>

              <span class="muted">
                ${
                  toIds(
                    t.question_ids
                  ).length
                }問 ・
                ${
                  t.time_limit_seconds
                    ? Math.ceil(
                        t.time_limit_seconds/60
                      )+'分'
                    : '無制限'
                } ・
                ${
                  t.is_published
                    ? '公開'
                    : '非公開'
                }
              </span>
            </div>

            <div class="question-actions">
              <button
                class="mini-btn"
                data-test-edit="${t.id}"
              >
                編集
              </button>

              <button
                class="mini-btn mini-btn-danger"
                data-test-del="${t.id}"
              >
                削除
              </button>
            </div>
          </div>
        `
      )
      .join('')||
    '<div class="empty">まだテストがありません。</div>';

  document
    .querySelectorAll(
      '[data-test-edit]'
    )
    .forEach(
      b=>
        b.onclick=
          ()=>
            openTestEditor(
              b.dataset.testEdit
            )
    );

  document
    .querySelectorAll(
      '[data-test-del]'
    )
    .forEach(
      b=>
        b.onclick=
          async ()=>{
            if(
              confirm(
                'このテストを削除しますか？'
              )
            ){
              await supabaseClient
                .from('tests')
                .delete()
                .eq(
                  'id',
                  b.dataset.testDel
                );

              loadTests();
            }
          }
    );
}

async function openTestEditor(
  id=''
){
  const t=
    id
      ? (
          await supabaseClient
            .from('tests')
            .select('*')
            .eq('id',id)
            .single()
        ).data
      : null;

  $('test-form').reset();

  $('test-id').value=id;

  $('test-title').value=
    t?.title||'';

  $('test-description').value=
    t?.description||'';

  $('test-limit').value=
    t
      ? Math.round(
          Number(
            t.time_limit_seconds||0
          )/60
        )
      : 0;

  $('test-published').value=
    String(
      t?.is_published||false
    );

  const selected=
    new Set(
      t
        ? toIds(
            t.question_ids
          )
        : []
    );

  $('test-question-picker')
    .innerHTML=
      adminQuestions()
        .filter(
          x=>
            x.r?.is_published!==false
        )
        .map(
          ({q})=>`
            <label
              style="
                display:block;
                padding:6px;
                border-bottom:1px solid var(--border-color)
              "
            >
              <input
                type="checkbox"
                class="test-q-check"
                value="${esc(q.id)}"
                ${
                  selected.has(q.id)
                    ? 'checked'
                    : ''
                }
              >

              ${esc(q.id)}
              ${esc(q.question)}
            </label>
          `
        )
        .join('');

  $('test-editor').hidden=
    false;
}

async function saveTest(e){
  e.preventDefault();

  const id=
    $('test-id').value;

  const ids=
    [
      ...document.querySelectorAll(
        '.test-q-check:checked'
      )
    ].map(
      x=>x.value
    );

  if(!ids.length){
    alert(
      '少なくとも1問選択してください。'
    );
    return
  }

  const user=
    (
      await supabaseClient
        .auth
        .getUser()
    ).data.user;

  const payload={
    title:
      $('test-title')
        .value
        .trim(),

    description:
      $('test-description')
        .value
        .trim(),

    question_ids:
      ids,

    time_limit_seconds:
      Math.max(
        0,
        Number(
          $('test-limit').value
        )||0
      )*60,

    is_published:
      $('test-published')
        .value==='true',

    created_by:
      user?.id||null,

    updated_at:
      new Date().toISOString()
  };

  const {error}=
    id
      ? await supabaseClient
          .from('tests')
          .update(payload)
          .eq('id',id)
      : await supabaseClient
          .from('tests')
          .insert(payload);

  if(error){
    alert(
      'テストを保存できませんでした: '+
      error.message
    );
    return
  }

  $('test-editor').hidden=
    true;

  await loadTests();
}

/* ===== お知らせ ===== */

async function loadAnnouncements(){
  if(
    !supabaseClient||
    !$('announcement-list')
  )return;

  const {
    data,
    error
  }=
    await supabaseClient
      .from('announcements')
      .select('*')
      .order(
        'created_at',
        {
          ascending:false
        }
      );

  if(error){
    $('announcement-list').innerHTML=
      '<div class="empty">FINAL_SETUP.sql実行後に利用できます。</div>';
    return
  }

  $('announcement-list').innerHTML=
    (data||[])
      .map(
        a=>`
          <div class="recent-item">
            <div>
              <strong>
                ${esc(a.title)}
              </strong>

              <br>

              <span class="muted">
                ${
                  a.is_published
                    ? '公開'
                    : '非公開'
                } ・
                ${esc(a.body).slice(
                  0,
                  70
                )}
              </span>
            </div>

            <div class="question-actions">
              <button
                class="mini-btn"
                data-ann-edit="${a.id}"
              >
                編集
              </button>

              <button
                class="mini-btn mini-btn-danger"
                data-ann-del="${a.id}"
              >
                削除
              </button>
            </div>
          </div>
        `
      )
      .join('')||
    '<div class="empty">お知らせはありません。</div>';

  document
    .querySelectorAll(
      '[data-ann-edit]'
    )
    .forEach(
      b=>
        b.onclick=
          ()=>
            openAnnouncementEditor(
              b.dataset.annEdit
            )
    );

  document
    .querySelectorAll(
      '[data-ann-del]'
    )
    .forEach(
      b=>
        b.onclick=
          async ()=>{
            if(
              confirm(
                '削除しますか？'
              )
            ){
              await supabaseClient
                .from(
                  'announcements'
                )
                .delete()
                .eq(
                  'id',
                  b.dataset.annDel
                );

              loadAnnouncements();
            }
          }
    );
}

async function openAnnouncementEditor(
  id=''
){
  const a=
    id
      ? (
          await supabaseClient
            .from(
              'announcements'
            )
            .select('*')
            .eq('id',id)
            .single()
        ).data
      : null;

  $('announcement-id').value=
    id;

  $('announcement-title').value=
    a?.title||'';

  $('announcement-body').value=
    a?.body||'';

  $('announcement-published').value=
    String(
      a?.is_published??true
    );

  $('announcement-editor').hidden=
    false;
}

async function saveAnnouncement(e){
  e.preventDefault();

  const id=
    $('announcement-id').value;

  const user=
    (
      await supabaseClient
        .auth
        .getUser()
    ).data.user;

  const payload={
    title:
      $('announcement-title')
        .value
        .trim(),

    body:
      $('announcement-body')
        .value
        .trim(),

    is_published:
      $('announcement-published')
        .value==='true',

    created_by:
      user?.id||null,

    updated_at:
      new Date().toISOString()
  };

  const {error}=
    id
      ? await supabaseClient
          .from('announcements')
          .update(payload)
          .eq('id',id)
      : await supabaseClient
          .from('announcements')
          .insert(payload);

  if(error){
    alert(
      'お知らせを保存できませんでした: '+
      error.message
    );
    return
  }

  $('announcement-editor').hidden=
    true;

  await loadAnnouncements();
}

/* =========================
   初期化
========================= */

document.addEventListener(
  'DOMContentLoaded',
  ()=>{
    try{
      $('login-form')
        ?.addEventListener(
          'submit',
          login
        );

      $('logout-btn')
        ?.addEventListener(
          'click',
          async ()=>{
            await supabaseClient
              ?.auth
              .signOut();

            location.reload();
          }
        );

      $('refresh-btn')
        ?.addEventListener(
          'click',
          loadData
        );

      $('student-search')
        ?.addEventListener(
          'input',
          render
        );

      $('student-filter')
        ?.addEventListener(
          'change',
          render
        );

      $('export-students-btn')
        ?.addEventListener(
          'click',
          exportStudentsCSV
        );

      $('add-question-btn')
        ?.addEventListener(
          'click',
          ()=>openEditor()
        );

      $('close-editor')
        ?.addEventListener(
          'click',
          ()=>{
            $('question-editor')
              .hidden=true
          }
        );

      $('cancel-editor')
        ?.addEventListener(
          'click',
          ()=>{
            $('question-editor')
              .hidden=true
          }
        );

      $('question-form')
        ?.addEventListener(
          'submit',
          saveQuestion
        );

      $('question-search')
        ?.addEventListener(
          'input',
          renderQuestionAdmin
        );

      $('question-unit-filter')
        ?.addEventListener(
          'change',
          renderQuestionAdmin
        );

      $('question-status-filter')
        ?.addEventListener(
          'change',
          renderQuestionAdmin
        );

      $('refresh-questions-btn')
        ?.addEventListener(
          'click',
          loadQuestionAdminData
        );

      $('select-all-questions')
        ?.addEventListener(
          'change',
          e=>{
            document
              .querySelectorAll(
                '.question-check'
              )
              .forEach(
                x=>
                  x.checked=
                    e.target.checked
              );

            updateSelectedCount();
          }
        );

      $('bulk-publish-btn')
        ?.addEventListener(
          'click',
          ()=>bulkSet(true)
        );

      $('bulk-unpublish-btn')
        ?.addEventListener(
          'click',
          ()=>bulkSet(false)
        );

      $('bulk-delete-btn')
        ?.addEventListener(
          'click',
          ()=>bulkSet(false,true)
        );

      $('export-questions-btn')
        ?.addEventListener(
          'click',
          exportQuestionsCSV
        );

      $('import-questions-input')
        ?.addEventListener(
          'change',
          e=>{
            if(
              e.target.files[0]
            ){
              importQuestions(
                e.target.files[0]
              );
            }

            e.target.value='';
          }
        );

      $('new-test-btn')
        ?.addEventListener(
          'click',
          ()=>openTestEditor()
        );

      $('close-test-editor')
        ?.addEventListener(
          'click',
          ()=>{
            $('test-editor')
              .hidden=true
          }
        );

      $('cancel-test-editor')
        ?.addEventListener(
          'click',
          ()=>{
            $('test-editor')
              .hidden=true
          }
        );

      $('test-form')
        ?.addEventListener(
          'submit',
          saveTest
        );

      $('new-announcement-btn')
        ?.addEventListener(
          'click',
          ()=>openAnnouncementEditor()
        );

      $('close-announcement-editor')
        ?.addEventListener(
          'click',
          ()=>{
            $('announcement-editor')
              .hidden=true
          }
        );

      $('cancel-announcement-editor')
        ?.addEventListener(
          'click',
          ()=>{
            $('announcement-editor')
              .hidden=true
          }
        );

      $('announcement-form')
        ?.addEventListener(
          'submit',
          saveAnnouncement
        );

      setup();

    }catch(error){
      console.error(
        '管理者画面の初期化に失敗しました:',
        error
      );

      const status=
        $('login-status');

      if(status){
        status.textContent=
          '管理者画面の初期化に失敗しました。ページを再読み込みしてください。';

        status.className=
          'status danger-status';
      }
    }
  }
);
