const STORAGE_KEY = 'repair-roster-names-v1';
const baseNames = ['A', 'B', 'C', 'D'];
const today = new Date();
// 2026、2027 為已公告/可核對的法定節日；2028 行政院辦公日曆尚未公告，先列已知節日日期。
const holidays = {
  '2026-01-01': '開國紀念日', '2026-02-15': '春節假期', '2026-02-16': '除夕', '2026-02-17': '春節', '2026-02-18': '春節', '2026-02-19': '春節', '2026-02-20': '春節', '2026-02-28': '和平紀念日', '2026-04-04': '兒童節', '2026-04-05': '清明節', '2026-05-01': '勞動節', '2026-06-19': '端午節', '2026-09-25': '中秋節', '2026-09-28': '教師節', '2026-10-10': '國慶日', '2026-10-25': '臺灣光復暨金門古寧頭大捷紀念日', '2026-12-25': '行憲紀念日',
  '2027-01-01': '開國紀念日', '2027-02-05': '除夕', '2027-02-06': '春節', '2027-02-07': '春節', '2027-02-08': '春節', '2027-02-09': '春節補假', '2027-02-10': '春節補假', '2027-02-28': '和平紀念日', '2027-04-04': '兒童節', '2027-04-05': '清明節', '2027-04-06': '兒童節補假', '2027-05-01': '勞動節', '2027-06-09': '端午節', '2027-09-15': '中秋節', '2027-09-28': '教師節', '2027-10-10': '國慶日', '2027-10-25': '臺灣光復暨金門古寧頭大捷紀念日', '2027-12-25': '行憲紀念日', '2027-12-31': '2028 元旦補假',
  '2028-01-01': '開國紀念日（預估）', '2028-01-25': '除夕（預估）', '2028-01-26': '春節（預估）', '2028-01-27': '春節（預估）', '2028-01-28': '春節（預估）', '2028-01-29': '春節（預估）', '2028-02-28': '和平紀念日（預估）', '2028-04-04': '兒童節（預估）', '2028-04-05': '清明節（預估）', '2028-05-01': '勞動節（預估）', '2028-05-28': '端午節（預估）', '2028-09-28': '教師節（預估）', '2028-10-03': '中秋節（預估）', '2028-10-10': '國慶日（預估）', '2028-10-25': '臺灣光復暨金門古寧頭大捷紀念日（預估）', '2028-12-25': '行憲紀念日（預估）'
};
const state = { year: today.getFullYear(), month: today.getMonth(), names: loadNames() };
const $ = id => document.getElementById(id);

function loadNames() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [...baseNames]; } catch { return [...baseNames]; } }
function saveNames() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.names)); }
function dateKey(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
function assignment(date) {
  // 平日以 2026/8/3（一）為第一個平日週；用 UTC 避免時區造成日期偏移。
  const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const day = date.getDay();
  if (day >= 1 && day <= 5) {
    const weekdayAnchor = Date.UTC(2026, 7, 3);
    const weekIndex = Math.floor((current - weekdayAnchor) / 86400000 / 7);
    return ['B', 'C', 'D', 'A'][((weekIndex % 4) + 4) % 4];
  }
  // 週末以 2026/8/1（六）為第一個週末；每兩週切換一次 A/C 或 B/D。
  const weekendAnchor = Date.UTC(2026, 7, 1);
  const weekendIndex = Math.floor((current - weekendAnchor) / 86400000 / 7);
  const pairIndex = Math.floor(weekendIndex / 2);
  return day === 6 ? ['A', 'C'][((pairIndex % 2) + 2) % 2] : ['B', 'D'][((pairIndex % 2) + 2) % 2];
}
function renderNames() {
  $('nameInputs').innerHTML = state.names.map((name, i) => `<input aria-label="人員 ${baseNames[i]} 姓名" data-index="${i}" value="${name.replace(/"/g, '&quot;')}">`).join('');
  document.querySelectorAll('#nameInputs input').forEach(input => input.addEventListener('input', e => { state.names[e.target.dataset.index] = e.target.value || baseNames[e.target.dataset.index]; saveNames(); $('legend').innerHTML = baseNames.map((key,i) => `<div class="legend-item"><span class="dot"></span>${key}：${state.names[i]}</div>`).join(''); document.querySelectorAll(`.assignee[data-key="${baseNames[e.target.dataset.index]}"]`).forEach(node => node.textContent = state.names[e.target.dataset.index]); }));
  $('legend').innerHTML = baseNames.map((key,i) => `<div class="legend-item"><span class="dot"></span>${key}：${state.names[i]}</div>`).join('');
}
function renderSelectors() { const years = [today.getFullYear(), today.getFullYear()+1, today.getFullYear()+2]; $('yearSelect').innerHTML = years.map(y => `<option value="${y}" ${y===state.year?'selected':''}>${y} 年</option>`).join(''); $('monthSelect').innerHTML = Array.from({length:12},(_,i)=>`<option value="${i}" ${i===state.month?'selected':''}>${i+1} 月</option>`).join(''); }
function render() {
  renderNames(); renderSelectors();
  const first = new Date(state.year,state.month,1), last = new Date(state.year,state.month+1,0), prefix = first.getDay();
  $('calendarTitle').textContent = `${state.year} 年 ${state.month+1} 月`; $('monthSummary').textContent = `共 ${last.getDate()} 天 · 依樣本循環排班`;
  const cells = Array(prefix).fill('<div class="day empty"></div>');
  for (let d=1; d<=last.getDate(); d++) { const date = new Date(state.year,state.month,d); const key=assignment(date), name=state.names[baseNames.indexOf(key)] || key; const holiday=holidays[dateKey(date)]; const isToday=date.toDateString()===today.toDateString(); cells.push(`<div class="day shift-${key.toLowerCase()} ${isToday?'today':''}"><div class="date">${d} 日${holiday ? `<span class="holiday" title="${holiday}">${holiday}</span>` : ''}</div><div class="assignee" data-key="${key}">${name}</div></div>`); }
  $('calendar').innerHTML = cells.join('');
}
function shiftMonth(delta) { const next = new Date(state.year,state.month+delta,1); state.year=next.getFullYear(); state.month=next.getMonth(); render(); }
$('yearSelect').addEventListener('change', e => { state.year=+e.target.value; render(); }); $('monthSelect').addEventListener('change', e => { state.month=+e.target.value; render(); }); $('prevMonth').addEventListener('click',()=>shiftMonth(-1)); $('nextMonth').addEventListener('click',()=>shiftMonth(1)); $('todayBtn').addEventListener('click',()=>{state.year=today.getFullYear();state.month=today.getMonth();render();}); render();
