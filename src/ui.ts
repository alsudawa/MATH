import { newSeed, deriveSeeds, renderDisplay } from './utils';
import { GRADE_DATA, parseWid, buildWid, buildURL, colsForPerPage } from './data';
import { generateProblems, Problem } from './generators';

// QRCode는 CDN에서 로드되므로 declare로 타입 선언
declare const QRCode: new (el: HTMLElement, opts: object) => void;

// ==================== TYPES ====================

interface Sheet {
  wid: string;
  seed: string;
  problems: Problem[];
}

interface AppState {
  gradeCode: string;
  chapIdx: number;
  sheets: Sheet[];
  currentSheet: number;
  showAnswers: boolean;
  sheetCount: number;
}

// ==================== STATE ====================

const state: AppState = {
  gradeCode: 'E2',
  chapIdx: 0,
  sheets: [],
  currentSheet: 0,
  showAnswers: false,
  sheetCount: 1,
};

// ==================== THEME ====================

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function applyTheme(color: string): void {
  document.documentElement.style.setProperty('--grade-color', color);
  document.documentElement.style.setProperty('--grade-color-light', hexToRgba(color, 0.1));
}

// ==================== RENDER GRADE TABS ====================

export function renderGradeTabs(): void {
  const el = document.getElementById('grade-tabs')!;
  el.innerHTML = GRADE_DATA.map(g =>
    `<button class="grade-tab${g.code === state.gradeCode ? ' active' : ''}"
      data-code="${g.code}">${g.label}</button>`
  ).join('');
  el.querySelectorAll<HTMLButtonElement>('.grade-tab').forEach(btn => {
    btn.addEventListener('click', () => selectGrade(btn.dataset.code!));
  });
}

// ==================== RENDER CHAPTER LIST ====================

export function renderChapterList(): void {
  const grade = GRADE_DATA.find(g => g.code === state.gradeCode)!;
  const el = document.getElementById('chapter-list')!;
  el.innerHTML = grade.chapters.map((ch, i) =>
    `<label class="chapter-item${i === state.chapIdx ? ' active' : ''}">
      <input type="radio" name="chapter" value="${i}"${i === state.chapIdx ? ' checked' : ''}>
      <span class="chapter-num">${ch.id}</span>
      <span class="chapter-name">${ch.name}</span>
    </label>`
  ).join('');
  el.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach(input => {
    input.addEventListener('change', () => selectChapter(Number(input.value)));
  });
}

// ==================== SELECT GRADE / CHAPTER ====================

export function selectGrade(code: string): void {
  state.gradeCode = code;
  state.chapIdx = 0;
  const grade = GRADE_DATA.find(g => g.code === code)!;
  applyTheme(grade.color);
  renderGradeTabs();
  renderChapterList();
}

function selectChapter(idx: number): void {
  state.chapIdx = idx;
  renderChapterList();
}

// ==================== SHEET COUNT ====================

export function changeSheetCount(delta: number): void {
  const input = document.getElementById('sheet-count') as HTMLInputElement;
  const val = Math.max(1, Math.min(20, parseInt(input.value) + delta));
  input.value = String(val);
  state.sheetCount = val;
}

// ==================== GENERATE ====================

export function generate(): void {
  const grade = GRADE_DATA.find(g => g.code === state.gradeCode)!;
  const chapter = grade.chapters[state.chapIdx];
  state.sheetCount = parseInt(
    (document.getElementById('sheet-count') as HTMLInputElement).value
  );

  const baseSeed = newSeed();
  const allSeeds = [baseSeed, ...deriveSeeds(baseSeed, state.sheetCount - 1)];

  state.sheets = allSeeds.map(seed => ({
    wid: buildWid(state.gradeCode, chapter.id, seed),
    seed,
    problems: generateProblems(state.gradeCode, chapter.id, seed, chapter.perPage),
  }));

  state.currentSheet = 0;
  state.showAnswers = false;

  history.replaceState(null, '', buildURL(state.sheets[0].wid, state.sheetCount));

  renderPreview();
  buildPrintArea();

  const card = document.getElementById('preview-card')!;
  card.style.display = 'block';
  card.scrollIntoView({ behavior: 'smooth' });
}

// ==================== RENDER PREVIEW ====================

export function renderPreview(): void {
  if (!state.sheets.length) return;

  const sheet = state.sheets[state.currentSheet];
  const grade = GRADE_DATA.find(g => g.code === state.gradeCode)!;
  const chapter = grade.chapters[state.chapIdx];
  const cols = colsForPerPage(chapter.perPage);

  // 페이지 내비게이션
  (document.getElementById('page-info') as HTMLElement).textContent =
    `${state.currentSheet + 1} / ${state.sheets.length}`;
  (document.getElementById('btn-prev') as HTMLButtonElement).disabled = state.currentSheet === 0;
  (document.getElementById('btn-next') as HTMLButtonElement).disabled =
    state.currentSheet === state.sheets.length - 1;

  // WID 텍스트
  document.getElementById('preview-wid-text')!.textContent = sheet.wid;

  // QR 코드
  const qrEl = document.getElementById('preview-qr')!;
  qrEl.innerHTML = '';
  new QRCode(qrEl, {
    text: buildURL(sheet.wid, 1),
    width: 80, height: 80,
    colorDark: '#000000', colorLight: '#ffffff',
  });

  // 문제 격자
  const gridEl = document.getElementById('preview-problems')!;
  gridEl.className = `problem-grid cols-${cols}`;
  gridEl.innerHTML = sheet.problems.map((p, i) =>
    `<div class="problem-item">
      <span class="problem-num">${i + 1}.</span>
      ${renderDisplay(p.display, false)}
    </div>`
  ).join('');

  // 정답
  const answersEl = document.getElementById('preview-answers')!;
  answersEl.innerHTML = sheet.problems.map((p, i) =>
    `<div class="answer-item">
      <span class="answer-num">${i + 1}.</span>${p.answer}
    </div>`
  ).join('');

  // 정답 토글 상태
  document.getElementById('answer-section')!.style.display =
    state.showAnswers ? 'block' : 'none';
  (document.getElementById('answer-toggle-btn') as HTMLButtonElement).textContent =
    state.showAnswers ? '정답 숨기기 ▲' : '정답 보기 ▼';
}

// ==================== BUILD PRINT AREA ====================

export function buildPrintArea(): void {
  const grade = GRADE_DATA.find(g => g.code === state.gradeCode)!;
  const chapter = grade.chapters[state.chapIdx];
  const cols = colsForPerPage(chapter.perPage);
  const printArea = document.getElementById('print-area')!;

  let html = '';

  // 문제지 N장
  state.sheets.forEach((sheet, si) => {
    html += `
      <div class="print-page">
        <div class="print-header">
          <div class="print-header-left">
            <h2>수학 연산 연습</h2>
            <p>${grade.fullLabel} &middot; ${chapter.name}</p>
            <p class="print-info-line">날짜: _________________ &nbsp;&nbsp; 이름: _________________</p>
          </div>
          <div class="print-qr-block">
            <div id="pqr-${si}"></div>
            <div>${sheet.wid}</div>
          </div>
        </div>
        <div class="print-problem-grid cols-${cols}">
          ${sheet.problems.map((p, i) =>
            `<div class="print-problem-item">
              <span class="print-num">${i + 1}.</span>
              ${renderDisplay(p.display, true)}
            </div>`
          ).join('')}
        </div>
      </div>`;
  });

  // 답안지 N장
  state.sheets.forEach((sheet, si) => {
    html += `
      <div class="print-page">
        <div class="print-header">
          <div class="print-header-left">
            <h2>정답지</h2>
            <p>${grade.fullLabel} &middot; ${chapter.name}</p>
          </div>
          <div class="print-qr-block">
            <div id="aqr-${si}"></div>
            <div>${sheet.wid}</div>
          </div>
        </div>
        <div class="print-answer-grid">
          ${sheet.problems.map((p, i) =>
            `<div class="print-answer-item">
              <span class="print-num">${i + 1}.</span>${p.answer}
            </div>`
          ).join('')}
        </div>
      </div>`;
  });

  printArea.innerHTML = html;

  // 인쇄용 QR 생성
  state.sheets.forEach((sheet, si) => {
    const url = buildURL(sheet.wid, 1);
    const opts = { text: url, width: 83, height: 83, colorDark: '#000000', colorLight: '#ffffff' };
    new QRCode(document.getElementById(`pqr-${si}`)!, opts);
    new QRCode(document.getElementById(`aqr-${si}`)!, opts);
  });
}

// ==================== NAVIGATION ====================

export function navigateSheet(delta: number): void {
  state.currentSheet = Math.max(0, Math.min(state.sheets.length - 1, state.currentSheet + delta));
  renderPreview();
}

export function toggleAnswers(): void {
  state.showAnswers = !state.showAnswers;
  renderPreview();
}

// ==================== WID DIRECT INPUT ====================

export function navigateToWid(): void {
  const input = document.getElementById('wid-input') as HTMLInputElement;
  const errEl = document.getElementById('wid-error') as HTMLElement;
  const parsed = parseWid(input.value.trim());

  if (!parsed) {
    errEl.style.display = 'inline';
    return;
  }
  errEl.style.display = 'none';

  state.gradeCode = parsed.gradeCode;
  selectGrade(parsed.gradeCode);
  state.chapIdx = parsed.chapIdx;
  renderChapterList();
  state.sheetCount = 1;

  const grade = GRADE_DATA.find(g => g.code === parsed.gradeCode)!;
  const chapter = grade.chapters[parsed.chapIdx];

  state.sheets = [{
    wid: parsed.gradeCode + '-' + parsed.chapId + '-' + parsed.seed,
    seed: parsed.seed,
    problems: generateProblems(parsed.gradeCode, chapter.id, parsed.seed, chapter.perPage),
  }];
  state.currentSheet = 0;
  state.showAnswers = false;

  history.replaceState(null, '', buildURL(state.sheets[0].wid, 1));
  renderPreview();
  buildPrintArea();

  const card = document.getElementById('preview-card')!;
  card.style.display = 'block';
  card.scrollIntoView({ behavior: 'smooth' });
}

// ==================== INIT ====================

export function init(): void {
  const params = new URLSearchParams(location.search);
  const wid = params.get('wid');
  const n = Math.max(1, Math.min(20, parseInt(params.get('n') ?? '1') || 1));

  if (wid) {
    const parsed = parseWid(wid);
    if (parsed) {
      state.gradeCode = parsed.gradeCode;
      selectGrade(parsed.gradeCode);
      state.chapIdx = parsed.chapIdx;
      renderChapterList();
      state.sheetCount = n;

      const grade = GRADE_DATA.find(g => g.code === parsed.gradeCode)!;
      const chapter = grade.chapters[parsed.chapIdx];
      const allSeeds = [parsed.seed, ...deriveSeeds(parsed.seed, n - 1)];

      state.sheets = allSeeds.map(seed => ({
        wid: buildWid(state.gradeCode, chapter.id, seed),
        seed,
        problems: generateProblems(state.gradeCode, chapter.id, seed, chapter.perPage),
      }));
      state.currentSheet = 0;

      renderPreview();
      buildPrintArea();
      document.getElementById('preview-card')!.style.display = 'block';
      return;
    }
  }

  // 기본값
  selectGrade('E2');
  renderChapterList();
}
