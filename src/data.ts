// ==================== TYPES ====================

export interface Chapter {
  id: string;
  name: string;
  perPage: number;
  prereqs?: string[];       // 선수학습 챕터 ID (예: ['E1-05', 'E1-06'])
  difficulty?: 1 | 2 | 3;  // 기본 난이도 (1=쉬움, 2=보통, 3=어려움)
}

export interface GradeGroup {
  code: string;
  label: string;
  fullLabel: string;
  color: string;
  chapters: Chapter[];
}

export interface ParsedWid {
  gradeCode: string;
  chapId: string;
  chapIdx: number;
  seed: string;
}

// ==================== GRADE DATA ====================

export const GRADE_DATA: GradeGroup[] = [
  {
    code: 'E1', label: '초1-2', fullLabel: '초등 1~2학년', color: '#FF8F00',
    chapters: [
      { id: '01', name: '덧셈 (9 이내)', perPage: 20 },
      { id: '02', name: '뺄셈 (9 이내)', perPage: 20 },
      { id: '03', name: '덧셈 (두 자리, 받아올림 없음)', perPage: 20 },
      { id: '04', name: '뺄셈 (두 자리, 받아내림 없음)', perPage: 20 },
      { id: '05', name: '덧셈 (두 자리, 받아올림 있음)', perPage: 20 },
      { id: '06', name: '뺄셈 (두 자리, 받아내림 있음)', perPage: 20 },
      { id: '07', name: '세 수의 덧셈과 뺄셈', perPage: 16 },
      { id: '08', name: '세 자리 수 덧셈/뺄셈', perPage: 16 },
      { id: '09', name: '곱셈 기초 (1단·2단·5단)', perPage: 20 },
      { id: '10', name: '덧셈과 뺄셈의 관계 (역연산)', perPage: 20 },
      { id: '11', name: '곱셈 기초 (3단·4단)', perPage: 20 },
      { id: '12', name: '10의 보수 만들기', perPage: 20 },
      { id: '13', name: '곱셈 기초 (6단·7단)', perPage: 20 },
    ],
  },
  {
    code: 'E2', label: '초3-4', fullLabel: '초등 3~4학년', color: '#0288D1',
    chapters: [
      { id: '01', name: '곱셈 구구단 (2~9단)', perPage: 20 },
      { id: '02', name: '나눗셈 기초 (구구단 역산)', perPage: 20 },
      { id: '03', name: '두 자리 × 한 자리', perPage: 16 },
      { id: '04', name: '세 자리 × 한 자리', perPage: 16 },
      { id: '05', name: '세 자리 ÷ 한 자리', perPage: 16 },
      { id: '06', name: '두 자리 × 두 자리', perPage: 16 },
      { id: '07', name: '세 자리 ÷ 두 자리', perPage: 12 },
      { id: '08', name: '분수 덧셈/뺄셈 (같은 분모)', perPage: 16 },
      { id: '09', name: '소수 덧셈/뺄셈 (소수 첫째 자리)', perPage: 16 },
      { id: '10', name: '나머지가 있는 나눗셈', perPage: 16 },
      { id: '11', name: '세 자리 × 두 자리', perPage: 12 },
      { id: '12', name: '네 자리 수 나눗셈', perPage: 12 },
      { id: '13', name: '분수 덧셈/뺄셈 (다른 분모)', perPage: 16 },
      { id: '14', name: '소수 덧셈/뺄셈 (소수 둘째 자리)', perPage: 16 },
      { id: '15', name: '네 자리 수 덧셈/뺄셈', perPage: 16 },
      { id: '16', name: '혼합 계산 (연산 순서)', perPage: 16 },
    ],
  },
  {
    code: 'E3', label: '초5-6', fullLabel: '초등 5~6학년', color: '#7B1FA2',
    chapters: [
      { id: '01', name: '최대공약수 구하기', perPage: 12 },
      { id: '02', name: '최소공배수 구하기', perPage: 12 },
      { id: '03', name: '약분과 통분', perPage: 12 },
      { id: '04', name: '분수의 곱셈 (분수×분수)', perPage: 12 },
      { id: '05', name: '소수의 곱셈', perPage: 16 },
      { id: '06', name: '분수의 나눗셈 (분수÷분수)', perPage: 12 },
      { id: '07', name: '소수의 나눗셈', perPage: 16 },
      { id: '08', name: '분수의 곱셈 (정수×분수)', perPage: 16 },
      { id: '09', name: '대분수의 덧셈과 뺄셈', perPage: 12 },
      { id: '10', name: '소수의 곱셈 (둘째 자리)', perPage: 16 },
      { id: '11', name: '소수의 나눗셈 (소수 몫)', perPage: 16 },
      { id: '12', name: '분수·소수 변환', perPage: 12 },
      { id: '13', name: '비와 비율', perPage: 12 },
      { id: '14', name: '백분율', perPage: 12 },
      { id: '15', name: '사칙 혼합 계산', perPage: 12 },
      { id: '16', name: '대분수의 곱셈과 나눗셈', perPage: 12 },
    ],
  },
  {
    code: 'M1', label: '중1', fullLabel: '중학교 1학년', color: '#1565C0',
    chapters: [
      { id: '01', name: '소인수분해', perPage: 12 },
      { id: '02', name: '정수의 사칙연산 (음수 포함)', perPage: 16 },
      { id: '03', name: '유리수의 사칙연산', perPage: 12 },
      { id: '04', name: '일차식의 계산 (동류항 정리)', perPage: 12 },
      { id: '05', name: '일차방정식 풀기', perPage: 10 },
      { id: '06', name: '정수의 혼합계산 (괄호 포함)', perPage: 12 },
      { id: '07', name: '부호가 있는 식의 계산', perPage: 12 },
      { id: '08', name: '일차식의 덧셈과 뺄셈', perPage: 12 },
      { id: '09', name: '절댓값 계산', perPage: 16 },
      { id: '10', name: '유리수 혼합 계산', perPage: 10 },
      { id: '11', name: '문자식 대입', perPage: 12 },
      { id: '12', name: '비와 비례식', perPage: 12 },
    ],
  },
  {
    code: 'M2', label: '중2', fullLabel: '중학교 2학년', color: '#00695C',
    chapters: [
      { id: '01', name: '유리수와 순환소수', perPage: 10 },
      { id: '02', name: '지수법칙 (단항식)', perPage: 16 },
      { id: '03', name: '단항식·다항식의 계산', perPage: 10 },
      { id: '04', name: '일차부등식 풀기', perPage: 10 },
      { id: '05', name: '연립일차방정식 풀기', perPage: 8 },
      { id: '06', name: '단항식의 곱셈/나눗셈 (이변수)', perPage: 12 },
      { id: '07', name: '다항식 곱셈 (분배법칙)', perPage: 10 },
      { id: '08', name: '다항식 나눗셈', perPage: 10 },
      { id: '09', name: '연립부등식', perPage: 8 },
    ],
  },
  {
    code: 'M3', label: '중3', fullLabel: '중학교 3학년', color: '#B71C1C',
    chapters: [
      { id: '01', name: '제곱근 계산 (근호 포함 식)', perPage: 10 },
      { id: '02', name: '다항식 곱셈 (곱셈공식)', perPage: 8 },
      { id: '03', name: '인수분해', perPage: 8 },
      { id: '04', name: '이차방정식 풀기', perPage: 8 },
      { id: '05', name: '제곱근 사칙 혼합', perPage: 10 },
      { id: '06', name: '곱셈공식 역방향 (대칭식)', perPage: 8 },
      { id: '07', name: '근의 공식', perPage: 8 },
      { id: '08', name: '근과 계수의 관계', perPage: 10 },
      { id: '09', name: '완전제곱식 변형', perPage: 8 },
    ],
  },
  {
    code: 'H1', label: '고1', fullLabel: '고등학교 1학년', color: '#1B5E20',
    chapters: [
      { id: '01', name: '다항식의 덧셈과 뺄셈', perPage: 10 },
      { id: '02', name: '다항식의 곱셈', perPage: 8 },
      { id: '03', name: '인수분해 (심화)', perPage: 8 },
      { id: '04', name: '이차부등식', perPage: 8 },
      { id: '05', name: '이차함수 꼭짓점 공식', perPage: 8 },
      { id: '06', name: '절댓값 방정식·부등식', perPage: 10 },
      { id: '07', name: '나머지 정리', perPage: 10 },
      { id: '08', name: '지수·로그 기초', perPage: 10 },
    ],
  },
];

// ==================== WID ====================

const WID_REGEX = /^([EMH][1-3])-(\d{2})-([0-9A-Z]{5})$/;

export function parseWid(wid: string): ParsedWid | null {
  const m = WID_REGEX.exec(wid.toUpperCase());
  if (!m) return null;
  const [, gradeCode, chapId, seed] = m;
  const grade = GRADE_DATA.find(g => g.code === gradeCode);
  if (!grade) return null;
  const chapIdx = grade.chapters.findIndex(c => c.id === chapId);
  if (chapIdx === -1) return null;
  return { gradeCode, chapId, chapIdx, seed };
}

export function buildWid(gradeCode: string, chapId: string, seed: string): string {
  return `${gradeCode}-${chapId}-${seed}`;
}

export function buildURL(wid: string, n: number): string {
  const base = location.origin + location.pathname;
  return `${base}?wid=${wid}&n=${n}`;
}

export function buildAnswerURL(wid: string, n: number): string {
  const base = location.origin + location.pathname;
  return `${base}?wid=${wid}&n=${n}&answers=1`;
}

export function colsForPerPage(perPage: number): number {
  if (perPage <= 12) return 2;
  if (perPage <= 16) return 3;
  return 4;
}
