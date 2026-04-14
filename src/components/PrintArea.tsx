import { useEffect } from 'react';
import { Sheet } from '../App';
import { GradeGroup, Chapter, buildAnswerURL } from '../data';
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
      const url = buildAnswerURL(sheet.wid, 1);
      const opts = { text: url, width: 83, height: 83, colorDark: '#000000', colorLight: '#ffffff' };
      const pEl = document.getElementById(`pqr-${si}`);
      if (pEl) { pEl.innerHTML = ''; new QRCode(pEl, opts); }
    });
  }, [sheets]);

  const gridCls = `print-problem-grid print-cols-${cols}`;

  return (
    <div id="print-root" style={{ display: 'none' }}>
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
    </div>
  );
}
