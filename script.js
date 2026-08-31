const STORAGE_KEY = 'repair-roster-names-v1';
const baseNames = ['A', 'B', 'C', 'D'];
// 由使用者提供的 8/1–8/31 排程，週期從 8/1 起算。
const augustTemplate = ['A','B','B','B','B','B','B','A','B','C','C','C','C','C','C','D','D','D','D','D','D','C','D','A','A','A','A','A','A','B','B'];
const today = new Date();
const state = { year: today.getFullYear(), month: today.getMonth(), names: loadNames() };
const $ = id => document.getElementById(id);

function loadNames() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [...baseNames]; } catch { return [...baseNames]; } }
function saveNames() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.names)); }
function assignment(date) {
  // 以 8/1 為固定基準連續循環；用 UTC 避免夏令時間造成日期偏移。
  const anchor = Date.UTC(state.year, 7, 1);
  const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const index = Math.floor((current - anchor) / 86400000);
  return augustTemplate[((index % augustTemplate.length) + augustTemplate.length) % augustTemplate.length];
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
