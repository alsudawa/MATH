# 세션 인수인계 파일

## 현재 상태
- 브랜치: `claude/math-problem-generator-5JmYS`
- 완료된 작업: 플랜 작성 및 커밋 (`PLAN.md`)
- **아직 `index.html` 미생성** → 구현 시작 필요

---

## 해야 할 작업 (단계별)

### Step 1: HTML 골격 + CSS 작성 후 커밋
파일: `/home/user/MATH/index.html`

HTML 구조:
```
<header> 앱 헤더 + 문제집 번호 직접 입력창
<div.controls-card> 학년 탭 + 챕터 라디오 + 장 수 입력 + 버튼
<div.preview-card> 페이지 탐색 + QR + 문제 격자 + 정답 토글
<div.print-only> 인쇄 전용 영역 (JS로 동적 생성)
```

CSS 포함 사항:
- 화면용: 컬러풀한 학생용 디자인, 학년별 테마 색상 CSS 변수
- 인쇄용: `@media print` + `@page { size: A4 portrait; margin: 15mm 15mm 12mm 15mm; }`
- 분수 렌더링: `.frac` 클래스 (flex column)

### Step 2: 핵심 JS (유틸 + 데이터) 작성 후 커밋
- `SeededRandom` 클래스 (LCG)
- `newSeed()`, `deriveSeeds(baseSeed, count)` 함수
- `gcd()`, `lcm()`, `fracHTML()` 유틸
- `GRADE_DATA` 상수 (6개 학년 그룹, 39챕터 정의)
- WID 파싱/생성 함수: `parseWid()`, `buildWid()`, `buildURL()`

### Step 3: 문제 Generator 구현 후 커밋
`GENERATORS` 객체 — key: `'E1-01'` ~ `'M3-04'`, value: `(rng) => { display, answer }`

**답칸 표시**: `%%BLANK%%` 마커 사용, 렌더 시 치환:
- 화면: `<span class="answer-blank">&nbsp;&nbsp;&nbsp;</span>`
- 인쇄: `<span class="print-answer-blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>`

#### E1 (초등 1~2학년, 9챕터)
| key | 내용 | perPage |
|-----|------|---------|
| E1-01 | 덧셈 9이내: a(1~8)+b(1~9-a) | 30 |
| E1-02 | 뺄셈 9이내: a(2~9)-b(1~a) | 30 |
| E1-03 | 덧셈 두자리 받아올림없음: ones합<10 | 24 |
| E1-04 | 뺄셈 두자리 받아내림없음: ones(a)>=ones(b) | 24 |
| E1-05 | 덧셈 두자리 받아올림있음: ones합>=10 | 24 |
| E1-06 | 뺄셈 두자리 받아내림있음: ones(a)<ones(b) | 24 |
| E1-07 | 세 수 덧뺄셈: a+b-c 또는 a-b+c | 20 |
| E1-08 | 세자리 덧셈/뺄셈 | 20 |
| E1-09 | 곱셈기초 1·2·5단 | 30 |

#### E2 (초등 3~4학년, 9챕터)
| key | 내용 | perPage |
|-----|------|---------|
| E2-01 | 구구단 2~9단: a×b | 30 |
| E2-02 | 나눗셈 기초: a*b÷a | 30 |
| E2-03 | 두자리×한자리 | 20 |
| E2-04 | 세자리×한자리 | 20 |
| E2-05 | 세자리÷한자리 (역산으로 나머지0 보장) | 20 |
| E2-06 | 두자리×두자리 | 20 |
| E2-07 | 세자리÷두자리 (역산) | 16 |
| E2-08 | 분수 덧뺄셈 같은분모 (fracHTMLRaw 사용) | 20 |
| E2-09 | 소수 덧뺄셈 첫째자리 (toFixed(1)) | 20 |

#### E3 (초등 5~6학년, 7챕터)
| key | 내용 | perPage |
|-----|------|---------|
| E3-01 | 최대공약수: `${a}와 ${b}의 최대공약수` | 20 |
| E3-02 | 최소공배수: `${a}와 ${b}의 최소공배수` | 20 |
| E3-03 | 약분(fracHTMLRaw→fracHTML) / 통분(lcm) | 16 |
| E3-04 | 분수×분수 (fracHTMLRaw × fracHTMLRaw) | 16 |
| E3-05 | 소수×소수 (toFixed(1)) | 20 |
| E3-06 | 분수÷분수 (역수곱) | 16 |
| E3-07 | 소수÷소수 (역산으로 나머지0 보장) | 20 |

#### M1 (중학교 1학년, 5챕터)
| key | 내용 | perPage |
|-----|------|---------|
| M1-01 | 소인수분해: 2~3개 소수의 곱, 숫자<500 | 16 |
| M1-02 | 정수 사칙연산: 음수 포함 +−×÷ | 20 |
| M1-03 | 유리수 사칙연산: 분수 형태 | 16 |
| M1-04 | 일차식 동류항 정리: ax+b+cx+d | 16 |
| M1-05 | 일차방정식: ax+b=c 역산 | 16 |

#### M2 (중학교 2학년, 5챕터)
| key | 내용 | perPage |
|-----|------|---------|
| M2-01 | 유리수와 순환소수: 분수→소수 변환 문제 | 16 |
| M2-02 | 지수법칙: a^m×a^n, a^m÷a^n, (a^m)^n | 20 |
| M2-03 | 단항식·다항식 계산 | 16 |
| M2-04 | 일차부등식: ax+b [<>≤≥] c, 부호반전주의 | 16 |
| M2-05 | 연립방정식: 정수해 (x,y) 역산 생성 | 12 |

#### M3 (중학교 3학년, 4챕터)
| key | 내용 | perPage |
|-----|------|---------|
| M3-01 | 제곱근: √(n²)=n, √a×√b, (√a)² | 16 |
| M3-02 | 곱셈공식: (x±a)², (x+a)(x-a), (x+a)(x+b) | 12 |
| M3-03 | 인수분해: 위 공식의 역 | 12 |
| M3-04 | 이차방정식: (x-r1)(x-r2)=0 역산 | 12 |

### Step 4: UI 로직 + 렌더링 + QR 작성 후 커밋
- `state` 객체: `{ gradeCode, chapIdx, sheets, currentSheet, showAnswers, sheetCount }`
- `generate()`: N장 시드 파생 → `generateProblems()` 호출 → `renderPreview()` + `buildPrintArea()`
- `renderPreview()`: 현재 장 화면 렌더링 + `new QRCode()` 호출
- `buildPrintArea()`: N×문제지 + N×답안지 DOM 생성, 각 장 QR 생성
- `renderGradeTabs()`, `renderChapterList()`, `selectGrade()`, `selectChapter()`
- `navigateToWid()`: 직접 입력한 wid 파싱 → 문제 재생성
- `init()`: URL 파라미터 파싱 → 상태 복원 또는 기본값으로 최초 생성

### Step 5: 최종 push
```bash
cd /home/user/MATH
git push -u origin claude/math-problem-generator-5JmYS
```

---

## 학년별 테마 색상 (CSS 변수 `--grade-color`)
| 코드 | 색상 | 설명 |
|------|------|------|
| E1 | #FF8F00 | 주황 |
| E2 | #0288D1 | 하늘 |
| E3 | #7B1FA2 | 보라 |
| M1 | #1565C0 | 진파랑 |
| M2 | #00695C | 초록 |
| M3 | #B71C1C | 진빨강 |

---

## CDN
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
```

---

## WID 포맷 및 URL
```
E2-03-X7K2M
https://alsudawa.github.io/math/?wid=E2-03-X7K2M&n=5
```
- `parseWid` 정규식: `/^([EM][1-3])-(\d{2})-([0-9A-Z]{5})$/`
- `n` 파라미터: N장 세트, deriveSeeds(baseSeed, n) 으로 재현

---

## 주의사항
- 분수 display에는 `fracHTMLRaw(n,d)` (약분 없음) 사용
- 분수 answer에는 `fracHTML(n,d)` (GCD 약분) 사용
- 뺄셈 결과 음수 방지 (초등)
- 나눗셈은 역산으로 나머지 0 보장
- M2-05 연립방정식: `a1*b2 - a2*b1 === 0` 이면 재생성
- 인쇄 시 문제지 N장 → 답안지 N장 순서 (`page-break-after: always`)
- 인쇄 컬럼 수: perPage<=12 → 2열, <=16 → 3열, >16 → 4열
