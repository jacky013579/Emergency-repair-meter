const STORAGE_KEY = 'repair-roster-names-v1';
const baseNames = ['A', 'B', 'C', 'D'];
const today = new Date();
const state = { year: today.getFullYear(), month: today.getMonth(), names: loadNames() };
const $ = id => document.getElementById(id);

function loadNames() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [...baseNames]; } catch { return [...baseNames]; } }
function saveNames() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.names)); }
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
  for (let d=1; d<=last.getDate(); d++) { const date = new Date(state.year,state.month,d); const key=assignment(date), name=state.names[baseNames.indexOf(key)] || key; const isToday=date.toDateString()===today.toDateString(); cells.push(`<div class="day shift-${key.toLowerCase()} ${isToday?'today':''}"><div class="date">${d} 日</div><div class="assignee" data-key="${key}">${name}</div></div>`); }
  $('calendar').innerHTML = cells.join('');
}
function shiftMonth(delta) { const next = new Date(state.year,state.month+delta,1); state.year=next.getFullYear(); state.month=next.getMonth(); render(); }
$('yearSelect').addEventListener('change', e => { state.year=+e.target.value; render(); }); $('monthSelect').addEventListener('change', e => { state.month=+e.target.value; render(); }); $('prevMonth').addEventListener('click',()=>shiftMonth(-1)); $('nextMonth').addEventListener('click',()=>shiftMonth(1)); $('todayBtn').addEventListener('click',()=>{state.year=today.getFullYear();state.month=today.getMonth();render();}); render();
