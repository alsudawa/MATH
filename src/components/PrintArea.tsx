import { useEffect } from 'react';
import { Sheet } from '../App';
import { GradeGroup, Chapter, buildURL } from '../data';
import { renderDisplay } from '../utils';

declare const QRCode: new (el: HTMLElement, opts: object) => void;

interface Props {
  sheets: Sheet[];
  grade: GradeGroup;
  chapter: Chapter;
  cols: number;
}

export default function PrintArea({ sheets, grade, chapter, cols }: Props) {
  useEffect(() => {
    sheets.forEach((sheet, si) => {
      const url = buildURL(sheet.wid, 1);
      const opts = { text: url, width: 83, height: 83, colorDark: '#000000', colorLight: '#ffffff' };
      const pEl = document.getElementById(`pqr-${si}`);
      const aEl = document.getElementById(`aqr-${si}`);
      if (pEl) { pEl.innerHTML = ''; new QRCode(pEl, opts); }
      if (aEl) { aEl.innerHTML = ''; new QRCode(aEl, opts); }
    });
  }, [sheets]);

  const gridCls = `print-problem-grid print-cols-${cols}`;

  return (
    <div id="print-root" style={{ display: 'none' }}>
      {/* 문제지 N장 */}
      {sheets.map((sheet, si) => (
        <div key={`p-${si}`} className="print-page">
          <div className="print-header">
            <div className="print-header-left">
              <h2>수학 연산 연습</h2>
              <p>{grade.fullLabel} · {chapter.name}</p>
              <p className="print-info-line">날짜: _________________&nbsp;&nbsp; 이름: _________________</p>
            </div>
            <div className="print-qr-block">
              <div id={`pqr-${si}`} />
              <div>{sheet.wid}</div>
            </div>
          </div>
          <div className={gridCls}>
            {sheet.problems.map((p, i) => (
              <div key={i} className="print-problem-item">
                <span className="print-num">{i + 1}.</span>
                <span dangerouslySetInnerHTML={{ __html: renderDisplay(p.display, true) }} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 답안지 N장 */}
      {sheets.map((sheet, si) => (
        <div key={`a-${si}`} className="print-page">
          <div className="print-header">
            <div className="print-header-left">
              <h2>정답지</h2>
              <p>{grade.fullLabel} · {chapter.name}</p>
            </div>
            <div className="print-qr-block">
              <div id={`aqr-${si}`} />
              <div>{sheet.wid}</div>
            </div>
          </div>
          <div className="print-answer-grid">
            {sheet.problems.map((p, i) => (
              <div key={i} className="print-answer-item">
                <span className="print-num">{i + 1}.</span>
                <span dangerouslySetInnerHTML={{ __html: p.answer }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
