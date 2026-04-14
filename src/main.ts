import {
  init,
  generate,
  navigateSheet,
  toggleAnswers,
  navigateToWid,
  changeSheetCount,
} from './ui';
import './styles/style.css';
import './styles/print.css';

// 버튼/입력 이벤트 바인딩
document.addEventListener('DOMContentLoaded', () => {
  // WID 이동
  document.getElementById('btn-wid-go')!
    .addEventListener('click', navigateToWid);
  document.getElementById('wid-input')!
    .addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') navigateToWid();
    });

  // 장 수 버튼
  document.getElementById('btn-count-down')!
    .addEventListener('click', () => changeSheetCount(-1));
  document.getElementById('btn-count-up')!
    .addEventListener('click', () => changeSheetCount(1));

  // 생성 / 인쇄
  document.getElementById('btn-generate')!
    .addEventListener('click', generate);
  document.getElementById('btn-print')!
    .addEventListener('click', () => window.print());

  // 미리보기 내비게이션
  document.getElementById('btn-prev')!
    .addEventListener('click', () => navigateSheet(-1));
  document.getElementById('btn-next')!
    .addEventListener('click', () => navigateSheet(1));

  // 정답 토글
  document.getElementById('answer-toggle-btn')!
    .addEventListener('click', toggleAnswers);

  // 앱 초기화
  init();
});
