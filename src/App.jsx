import React, { useState, useEffect, useRef } from 'react';

// =================================================================
//  ✏️ 여기만 채우면 됩니다 — 단원별 표현 + 이미지
// -----------------------------------------------------------------
//  - 4개 단원(Unit 1~4)에 표현을 넣어주세요.
//  - 한 단원에 6문장 이상 넣어두면, 게임을 시작할 때마다
//    그 중 6문장을 "무작위로" 뽑아 보드에 배치합니다. (매번 새 게임!)
//  - image: Firebase Storage 다운로드 URL(또는 /images/파일명)을 붙여넣으세요.
//  - emoji: 그림(image)이 없거나 불러오지 못할 때 대신 보여줄 이모지입니다.
//           (emoji도 비워두면 💬 아이콘이 표시됩니다.)
//  - question / answer: 학생이 말할 영어 질문과 대답입니다.
// =================================================================
const UNIT_POOLS = {
  '1단원': [
    { emoji: '1️⃣', image: '/images/grade1.webp', question: 'What grade are you in?', answer: "I'm in the first grade." },
    { emoji: '2️⃣', image: '/images/grade2.webp', question: 'What grade are you in?', answer: "I'm in the second grade." },
    { emoji: '3️⃣', image: '/images/grade3.webp', question: 'What grade are you in?', answer: "I'm in the third grade." },
    { emoji: '4️⃣', image: '/images/grade4.webp', question: 'What grade are you in?', answer: "I'm in the fourth grade." },
    { emoji: '5️⃣', image: '/images/grade5.webp', question: 'What grade are you in?', answer: "I'm in the fifth grade." },
    { emoji: '6️⃣', image: '/images/grade6.webp', question: 'What grade are you in?', answer: "I'm in the sixth grade." },
  ],
  '2단원': [
    { emoji: '🌸', image: '/images/season-spring-flowers.webp', question: 'What season do you like?', answer: 'I like spring. I can see beautiful flowers.' },
    { emoji: '🚌', image: '/images/season-spring-fieldtrip.webp', question: 'What season do you like?', answer: 'I like spring. I can go on a field trip.' },
    { emoji: '🍉', image: '/images/season-summer-watermelon.webp', question: 'What season do you like?', answer: 'I like summer. I can eat watermelon.' },
    { emoji: '🍁', image: '/images/season-fall-leaves.webp', question: 'What season do you like?', answer: 'I like fall. I can see colorful leaves.' },
    { emoji: '🍲', image: '/images/season-fall-food.webp', question: 'What season do you like?', answer: 'I like fall. I can eat delicious food.' },
    { emoji: '⛷️', image: '/images/season-winter-skiing.webp', question: 'What season do you like?', answer: 'I like winter. I can go skiing.' },
  ],
  '3단원': [
    { emoji: '🎂', image: '/images/date-birthday.webp', question: 'When is your birthday?', answer: "It's on January 15th." },
    { emoji: '🛒', image: '/images/date-school-market.webp', question: 'When is the school market?', answer: "It's on February 1st." },
    { emoji: '🚌', image: '/images/date-field-trip.webp', question: 'When is the field trip?', answer: "It's on March 21st." },
    { emoji: '🌍', image: '/images/date-earth-day.webp', question: 'When is Earth Day?', answer: "It's on April 22nd." },
    { emoji: '🎪', image: '/images/date-club-festival.webp', question: 'When is the club festival?', answer: "It's on October 10th." },
    { emoji: '🏅', image: '/images/date-sports-day.webp', question: 'When is Sports Day?', answer: "It's on December 2nd." },
  ],
  '4단원': [
    { emoji: '🥋', image: '/images/feeling-happy-belt.webp', question: 'Why are you happy?', answer: 'Because I got a black belt.' },
    { emoji: '🐶', image: '/images/feeling-sad-dog.webp', question: 'Why are you sad?', answer: 'Because my dog is sick.' },
    { emoji: '🤖', image: '/images/feeling-angry-robot.webp', question: 'Why are you angry?', answer: 'Because my brother broke my robot.' },
    { emoji: '🧹', image: '/images/feeling-tired-clean.webp', question: 'Why are you tired?', answer: 'Because I cleaned my house.' },
    { emoji: '🌙', image: '/images/feeling-sleepy-late.webp', question: 'Why are you sleepy?', answer: 'Because I went to bed late.' },
    { emoji: '📝', image: '/images/feeling-worried-test.webp', question: 'Why are you worried?', answer: 'Because I have a math test tomorrow.' },
  ],
};

const SENTENCES_PER_UNIT = 6;

// 보드 배치 틀: START + 일반칸 24 + 액션칸 3 + FINISH = 29칸
// (원래 동물 게임과 동일한 구조 — 'content' 자리에만 표현이 들어갑니다)
const BOARD_LAYOUT = [
  { type: 'start', label: 'START' },
  ...Array(10).fill({ type: 'content' }),
  { type: 'action', action: 'forward2', label: '앞으로\n2칸 🚀' },
  ...Array(2).fill({ type: 'content' }),
  { type: 'action', action: 'rest', label: '한 번\n쉬기 💤' },
  ...Array(3).fill({ type: 'content' }),
  { type: 'action', action: 'back2', label: '뒤로\n2칸 🍌' },
  ...Array(9).fill({ type: 'content' }),
  { type: 'finish', label: 'FINISH' },
];

// 문장 칸에 붙는 사다리: { 출발칸id: 도착칸id } (위/아래 섞어서 배치)
// 모든 칸은 일반(문장) 칸이며, 액션칸(11·14·18)·START(0)·FINISH(28)은 피함
const LADDERS = {
  3: 10, // 위로
  13: 24, // 위로
  22: 15, // 아래로
};

const UNIT_COLORS = {
  '1단원': 'text-rose-700 bg-rose-50 border-rose-300',
  '2단원': 'text-sky-700 bg-sky-50 border-sky-300',
  '3단원': 'text-emerald-700 bg-emerald-50 border-emerald-300',
  '4단원': 'text-violet-700 bg-violet-50 border-violet-300',
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// 한 단원에서 n개를 뽑는다. 표현이 n개보다 많으면 무작위로 n개를 뽑고,
// 적으면 모든 표현을 한 번씩 쓴 뒤 무작위로 반복해 n개를 채운다.
const pickForUnit = (pool, n) => {
  const result = shuffle(pool);
  while (result.length < n) {
    result.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return shuffle(result.slice(0, n));
};

// 매 게임마다 단원별 6문장을 뽑아 24개 일반칸에 무작위로 배치한 보드를 생성
const buildBoard = () => {
  const picked = [];
  Object.entries(UNIT_POOLS).forEach(([unit, pool]) => {
    pickForUnit(pool, SENTENCES_PER_UNIT).forEach((item) => picked.push({ ...item, unit }));
  });
  const contentQueue = shuffle(picked);

  let qi = 0;
  return BOARD_LAYOUT.map((layout, id) => {
    if (layout.type === 'content') {
      const c = contentQueue[qi++] || { unit: '', question: '', answer: '' };
      return { id, type: 'normal', ...c };
    }
    return { id, ...layout };
  });
};

const RPS_EMOJI = { rock: '✊', paper: '🖐️', scissors: '✌️' };

// --- 음성 정답 인식(너그러운 매칭) ---------------------------------
// 학생이 문장을 살짝 다르게 말해도 정답으로 인정합니다.
//  · 관사/대명사 등 기능어(the, a, I, my ...)는 무시
//  · 서수/날짜 표기를 숫자로 통일 (first/1st → 1, fifteenth/15th → 15)
//  · 핵심 단어가 모두 들어 있으면 정답 (단, 숫자는 정확히 일치해야 함)
const ORDINAL_WORDS = {
  first: '1', second: '2', third: '3', fourth: '4', fifth: '5', sixth: '6',
  seventh: '7', eighth: '8', ninth: '9', tenth: '10', eleventh: '11', twelfth: '12',
  thirteenth: '13', fourteenth: '14', fifteenth: '15', sixteenth: '16', seventeenth: '17',
  eighteenth: '18', nineteenth: '19', twentieth: '20', twentyfirst: '21', twentysecond: '22',
  twentythird: '23', thirtieth: '30', thirtyfirst: '31',
};

const STOPWORDS = new Set([
  'the', 'a', 'an', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'i', 'im', 'my', 'me',
  'mine', 'on', 'it', 'its', 'in', 'of', 'to', 'you', 'your', 'and', 'can', 'do', 'does',
  'did', 'go', 'goes', 'got', 'get', 'have', 'has', 'had', 'will', 'at', 'for', 'with',
  'because', 'this', 'that', 'so', 'very',
]);

const normWord = (w) => {
  const s = w.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!s) return '';
  const m = s.match(/^(\d+)(st|nd|rd|th)$/);
  if (m) return m[1];
  return ORDINAL_WORDS[s] || s;
};

const tokenize = (str) => str.replace(/['’`]/g, '').split(/[^a-zA-Z0-9]+/).map(normWord).filter(Boolean);

const contentTokens = (str) => [...new Set(tokenize(str).filter((t) => !STOPWORDS.has(t)))];

// 두 단어의 편집 거리(발음 오인식·오타 허용용)
const lev = (a, b) => {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[n];
};

// 정답의 핵심 단어 하나가 학생 발화에 (대략) 들어 있는지 판정
const tokenMatches = (tok, spokenToks, spokenConcat) => {
  if (/^\d+$/.test(tok)) return spokenToks.includes(tok); // 숫자(학년·날짜)는 정확히 일치
  if (spokenConcat.includes(tok)) return true;
  return spokenToks.some((st) => {
    if (st.length >= 3 && (tok.startsWith(st) || st.startsWith(tok))) return true;
    const thr = tok.length <= 5 ? 1 : 2; // 짧은 단어는 1글자, 긴 단어는 2글자까지 차이 허용
    return lev(st, tok) <= thr;
  });
};

// 여러 인식 후보를 모두 합쳐서 정답 핵심 단어가 충분히 들어 있으면 통과
//  · 숫자(학년·날짜)는 모두 정확히 일치해야 함
//  · 나머지 핵심 단어는 75% 이상 맞으면 통과(발음/오인식 한두 개는 허용)
const matchAggregate = (transcripts, required) => {
  let spokenToks = [];
  transcripts.forEach((t) => { spokenToks = spokenToks.concat(tokenize(t)); });
  const spokenConcat = spokenToks.join('');
  const nums = required.filter((t) => /^\d+$/.test(t));
  const words = required.filter((t) => !/^\d+$/.test(t));
  if (!nums.every((t) => tokenMatches(t, spokenToks, spokenConcat))) return false;
  if (words.length === 0) return true;
  const hit = words.filter((t) => tokenMatches(t, spokenToks, spokenConcat)).length;
  return hit >= Math.ceil(words.length * 0.75);
};

// 여러 인식 후보 중 정답 핵심 단어와 가장 많이 맞는 후보를 고름(화면 표시용)
const bestTranscript = (transcripts, required) => {
  let best = transcripts[0];
  let bestScore = -1;
  transcripts.forEach((t) => {
    const st = tokenize(t);
    const sc = st.join('');
    const score = required.filter((tok) => tokenMatches(tok, st, sc)).length;
    if (score > bestScore) { bestScore = score; best = t; }
  });
  return best;
};

function CellImage({ src, alt, className, fallbackClass, fallbackEmoji = '💬' }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div className={`${fallbackClass} flex items-center justify-center`}>{fallbackEmoji}</div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setErr(true)} />;
}

// 문장을 단어 단위로 쪼개, 단어를 누르면 그 단어만 읽어주도록 렌더링
function ClickableWords({ text, onWord }) {
  return (
    <>
      {text.split(/(\s+)/).map((seg, i) => {
        if (seg === '' || /^\s+$/.test(seg)) return <span key={i}>{seg}</span>;
        const clean = seg.replace(/[^A-Za-z0-9'’]/g, '');
        return (
          <span
            key={i}
            onClick={(e) => { e.stopPropagation(); if (clean) onWord(clean); }}
            className="cursor-pointer rounded px-0.5 hover:bg-yellow-200 transition-colors"
            title="클릭하면 이 단어를 들려줘요"
          >
            {seg}
          </span>
        );
      })}
    </>
  );
}

// 대답 문장에서 핵심 단어(기능어 제외)를 빈칸으로 만들기 위한 분해
const parseForBlanks = (answer) => {
  const segs = [];
  let blankIdx = 0;
  answer.split(/(\s+)/).forEach((seg) => {
    if (seg === '') return;
    if (/^\s+$/.test(seg)) { segs.push({ type: 'space', text: seg }); return; }
    const m = seg.match(/^([^A-Za-z0-9'’]*)([A-Za-z0-9'’]*)([^A-Za-z0-9'’]*)$/);
    const pre = m ? m[1] : '';
    const core = m ? m[2] : seg;
    const post = m ? m[3] : '';
    const norm = normWord(core);
    if (core && norm && !STOPWORDS.has(norm)) {
      segs.push({ type: 'blank', pre, core, post, norm, idx: blankIdx });
      blankIdx++;
    } else {
      segs.push({ type: 'text', text: seg });
    }
  });
  return segs;
};

export default function App() {
  const [board, setBoard] = useState(() => buildBoard());
  const [gameState, setGameState] = useState('lobby');
  const [turn, setTurn] = useState('player');
  const [gameMode, setGameMode] = useState('answerOnly');

  const [rpsState, setRpsState] = useState('idle');
  const [playerChoice, setPlayerChoice] = useState(null);
  const [aiChoice, setAiChoice] = useState(null);
  const [rpsResult, setRpsResult] = useState('');

  const [playerPos, setPlayerPos] = useState(0);
  const [aiPos, setAiPos] = useState(0);
  const [playerRest, setPlayerRest] = useState(false);
  const [aiRest, setAiRest] = useState(false);
  const [diceResult, setDiceResult] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  // 3D 주사위 상태
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [showDicePopup, setShowDicePopup] = useState(false);
  const [diceDisplay, setDiceDisplay] = useState(1);
  const [diceTransform, setDiceTransform] = useState('rotateX(0deg) rotateY(0deg)');

  // 팝업 상태
  const [actionPopup, setActionPopup] = useState(null);
  const [catchEvent, setCatchEvent] = useState(null);
  const [previewCell, setPreviewCell] = useState(null); // 그림 클릭 시 문장 보여주기(연습용)
  const [writeMode, setWriteMode] = useState(false); // 쓰기 활동(빈칸 채우기) 모드
  const [writeInputs, setWriteInputs] = useState({}); // 빈칸별 입력값 {idx: value}
  const [writeRevealed, setWriteRevealed] = useState(false); // 답 보기 눌렀는지

  const [currentTask, setCurrentTask] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [aiSpeechText, setAiSpeechText] = useState('');

  // --- 마이크 오류 방지 로직 ---
  const recognitionRef = useRef(null);
  const currentTaskRef = useRef(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    currentTaskRef.current = currentTask;
  }, [currentTask]);

  const speakText = (text, rate = 0.8) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- 가위바위보 시뮬레이션 ---
  const handleRPS = (choice) => {
    if (rpsState !== 'idle') return;
    setPlayerChoice(choice);
    setRpsState('animating');

    let counter = 0;
    const choices = ['rock', 'paper', 'scissors'];

    const interval = setInterval(() => {
      setAiChoice(choices[counter % 3]);
      counter++;
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      const finalAiChoice = choices[Math.floor(Math.random() * 3)];
      setAiChoice(finalAiChoice);

      let result = '';
      if (choice === finalAiChoice) result = 'draw';
      else if (
        (choice === 'rock' && finalAiChoice === 'scissors') ||
        (choice === 'paper' && finalAiChoice === 'rock') ||
        (choice === 'scissors' && finalAiChoice === 'paper')
      ) {
        result = 'win';
      } else {
        result = 'lose';
      }

      setRpsResult(result);
      setRpsState('result');

      setTimeout(() => {
        if (result === 'draw') {
          setRpsState('idle');
          setPlayerChoice(null);
          setAiChoice(null);
          setRpsResult('');
        } else {
          setTurn(result === 'win' ? 'player' : 'ai');
          setGameState('playing');
        }
      }, 2000);
    }, 1500);
  };

  // AI 턴 자동 실행
  useEffect(() => {
    if (gameState === 'playing' && turn === 'ai' && !actionPopup && !catchEvent) {
      const timer = setTimeout(() => {
        executeAiTurn();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, turn, actionPopup, catchEvent]);

  const rollDice = () => Math.floor(Math.random() * 6) + 1;

  const getDiceTransform = (finalDice) => {
    const extraX = 360 * (Math.floor(Math.random() * 2) + 2);
    const extraY = 360 * (Math.floor(Math.random() * 2) + 2);
    let targetX = extraX;
    let targetY = extraY;

    switch (finalDice) {
      case 1: break;
      case 2: targetY -= 90; break;
      case 3: targetY += 180; break;
      case 4: targetY += 90; break;
      case 5: targetX -= 90; break;
      case 6: targetX += 90; break;
    }
    return `rotateX(${targetX}deg) rotateY(${targetY}deg)`;
  };

  const animateMove = (who, currentPos, targetPos) => {
    if (currentPos === targetPos) {
      processCellLanding(targetPos, who);
      return;
    }
    const nextPos = currentPos < targetPos ? currentPos + 1 : currentPos - 1;
    if (who === 'player') setPlayerPos(nextPos);
    else setAiPos(nextPos);

    setTimeout(() => animateMove(who, nextPos, targetPos), 350);
  };

  const startDiceRoll = (who, finalDice, newPos) => {
    setShowDicePopup(true);
    setDiceTransform('rotateX(0deg) rotateY(0deg)');

    setTimeout(() => {
      setIsRollingDice(true);
      setDiceDisplay(finalDice);
      setDiceTransform(getDiceTransform(finalDice));
    }, 50);

    setTimeout(() => {
      setIsRollingDice(false);
      setDiceResult(`🎲 ${who === 'player' ? '나온 숫자' : 'AI 숫자'}: ${finalDice}`);

      setTimeout(() => {
        setShowDicePopup(false);
        animateMove(who, who === 'player' ? playerPos : aiPos, newPos);
      }, 1500);
    }, 1550);
  };

  const handlePlayerTurn = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
    }

    if (playerRest) {
      setPlayerRest(false);
      setTurn('ai');
      return;
    }
    setIsMoving(true);
    const dice = rollDice();
    const newPos = Math.min(playerPos + dice, board.length - 1);
    startDiceRoll('player', dice, newPos);
  };

  const executeAiTurn = () => {
    if (aiRest) {
      setDiceResult('🤖 AI 쉬는 턴 💤');
      setAiRest(false);
      setTurn('player');
      return;
    }
    setIsMoving(true);
    const dice = rollDice();
    const newPos = Math.min(aiPos + dice, board.length - 1);
    startDiceRoll('ai', dice, newPos);
  };

  const processCellLanding = (pos, who) => {
    if (pos !== 0 && pos !== board.length - 1) {
      if (who === 'player' && pos === aiPos) {
        setCatchEvent({ victim: 'ai', who, pos });
        return;
      } else if (who === 'ai' && pos === playerPos) {
        setCatchEvent({ victim: 'player', who, pos });
        return;
      }
    }
    continueCellLanding(pos, who);
  };

  const handleCatchClose = () => {
    const { victim, who, pos } = catchEvent;
    if (victim === 'ai') setAiPos(0);
    if (victim === 'player') setPlayerPos(0);

    setCatchEvent(null);
    continueCellLanding(pos, who);
  };

  const continueCellLanding = (pos, who) => {
    const cell = board[pos];

    if (cell.type === 'finish') {
      setIsMoving(false);
      setGameState('finished');
      return;
    }

    if (cell.type === 'action') {
      setActionPopup({ action: cell.action, who: who, pos: pos });
      return;
    }

    const ladderTo = LADDERS[pos];
    if (cell.type === 'normal' && ladderTo !== undefined) {
      setActionPopup({ action: 'ladder', who: who, pos: pos, to: ladderTo });
      return;
    }

    setIsMoving(false);
    if (who === 'player') {
      startSpeakingTask(cell);
    } else {
      startAiSpeakingTask(cell);
    }
  };

  const handleActionPopupClose = () => {
    const { action, who, pos } = actionPopup;
    setActionPopup(null);

    let finalPos = pos;
    if (action === 'forward2') {
      finalPos = Math.min(pos + 2, board.length - 1);
      animateMove(who, pos, finalPos);
    } else if (action === 'ladder') {
      finalPos = Math.min(Math.max(actionPopup.to, 0), board.length - 1);
      animateMove(who, pos, finalPos);
    } else if (action === 'back2') {
      finalPos = Math.max(pos - 2, 0);
      animateMove(who, pos, finalPos);
    } else if (action === 'rest') {
      if (who === 'player') setPlayerRest(true);
      else setAiRest(true);
      setIsMoving(false);
      setTurn(who === 'player' ? 'ai' : 'player');
    }
  };

  const getActionMessage = () => {
    if (!actionPopup) return null;
    const { action, who } = actionPopup;
    const isMe = who === 'player';

    if (action === 'forward2') {
      return {
        title: isMe ? '우와 신난다! 🚀' : '앗, AI가 빨라요! 🚀',
        desc: isMe ? '앞으로 2칸 더 전진합니다!' : 'AI가 앞으로 2칸 더 이동합니다!',
        color: 'text-green-600 bg-green-50 border-green-400',
      };
    } else if (action === 'ladder') {
      const up = actionPopup.to > actionPopup.pos;
      return {
        title: up
          ? isMe ? '사다리 타고 쑥! 🪜' : 'AI가 사다리로 쑥! 🪜'
          : isMe ? '사다리 타고 주르륵! 🪜' : 'AI가 사다리로 내려가요! 🪜',
        desc: up
          ? `사다리를 타고 ${actionPopup.to}번 칸으로 올라갑니다!`
          : `사다리를 타고 ${actionPopup.to}번 칸으로 내려갑니다!`,
        color: up
          ? 'text-amber-600 bg-amber-50 border-amber-400'
          : 'text-orange-600 bg-orange-50 border-orange-400',
      };
    } else if (action === 'back2') {
      return {
        title: isMe ? '앗, 미끄러졌어요! 🍌' : '휴, 다행이에요! 🍌',
        desc: isMe ? '뒤로 2칸 돌아갑니다 ㅠㅠ' : 'AI가 뒤로 2칸 미끄러집니다!',
        color: 'text-red-500 bg-red-50 border-red-400',
      };
    } else if (action === 'rest') {
      return {
        title: isMe ? '조금 쉬어갈까요? 💤' : 'AI도 피곤해요 💤',
        desc: isMe ? '다음 차례에는 한 번 쉬게 됩니다.' : 'AI가 다음 차례에 한 번 쉽니다.',
        color: 'text-blue-500 bg-blue-50 border-blue-400',
      };
    }
  };

  const startSpeakingTask = (cell) => {
    setGameState('speaking');
    setSpokenText('');
    setFeedback('');

    setCurrentTask({
      cell,
      question: cell.question,
      answer: cell.answer,
      mode: gameMode,
    });

    // qna 모드는 학생이 스스로 질문/대답을 만들어야 하므로 자동 음성을 재생하지 않음
    // (한국어 안내를 영어 엔진으로 읽어 이상하게 들리던 문제 제거 — 필요하면 '들어보며 연습' 버튼 사용)
    if (gameMode !== 'qna') {
      setTimeout(() => speakText(cell.question), 500);
    }
  };

  const startListening = () => {
    if (isListeningRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome을 사용해주세요.');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // 무시
      }
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 5; // 여러 인식 후보를 받아 통과율을 높임

    recognition.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const result = event.results[0];
      const transcripts = [];
      for (let i = 0; i < result.length; i++) transcripts.push(result[i].transcript);
      setSpokenText(transcripts[0]);
      checkAnswerRef(transcripts, currentTaskRef.current);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      isListeningRef.current = false;
      setIsListening(false);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setFeedback('마이크 연결이 불안정합니다. 다시 버튼을 눌러주세요! 🎤');
      }
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      setSpokenText('');
      setFeedback('');
      isListeningRef.current = true;
      setIsListening(true);
      recognition.start();
    } catch (e) {
      console.warn('마이크 시작 오류 방어:', e);
      isListeningRef.current = false;
      setIsListening(false);
    }
  };

  const checkAnswerRef = (transcripts, task) => {
    if (!task) return;
    const list = Array.isArray(transcripts) ? transcripts : [transcripts];

    const required = contentTokens(task.answer);
    if (task.mode === 'qna') {
      contentTokens(task.question).forEach((t) => {
        if (!required.includes(t)) required.push(t);
      });
    }

    setSpokenText(bestTranscript(list, required)); // 정답과 가장 가까운 후보를 표시

    const isCorrect = required.length > 0 && matchAggregate(list, required);

    if (isCorrect) {
      setFeedback('Excellent! 정답입니다! 🎉 (AI 턴으로 넘어갑니다)');
      speakText('Excellent!');
      setTimeout(() => {
        setGameState('playing');
        setTurn('ai');
      }, 2500);
    } else {
      setFeedback(`앗, 다시 해볼까요? (인식된 말: ${list[0]})`);
    }
  };

  const startAiSpeakingTask = (cell) => {
    setGameState('aiSpeaking');
    setAiSpeechText('음... 🤔');

    const question = cell.question;
    const answer = cell.answer;

    setCurrentTask({ cell, question, answer });

    setTimeout(() => {
      setAiSpeechText(`"${question}"`);
      speakText(question);

      setTimeout(() => {
        setAiSpeechText(`"${answer}"`);
        speakText(answer);

        setTimeout(() => {
          setAiSpeechText('내 차례 끝!');
          setTimeout(() => {
            setGameState('playing');
            setTurn('player');
          }, 1000);
        }, 2500);
      }, 2500);
    }, 1000);
  };

  const skipSpeaking = () => {
    setGameState('playing');
    setTurn('ai');
  };

  const handleCellClick = (cell) => {
    if (
      cell.type !== 'normal' ||
      (gameState !== 'playing' && gameState !== 'lobby') ||
      isMoving ||
      showDicePopup ||
      actionPopup ||
      catchEvent
    )
      return;

    setWriteMode(false);
    setWriteInputs({});
    setWriteRevealed(false);
    setPreviewCell(cell);
    speakText(`${cell.question} ... ${cell.answer}`);
  };

  const closePreview = () => {
    setPreviewCell(null);
    setWriteMode(false);
    setWriteInputs({});
    setWriteRevealed(false);
  };

  const startWriting = () => {
    setWriteInputs({});
    setWriteRevealed(false);
    setWriteMode(true);
  };

  const revealWriting = () => {
    setWriteRevealed(true);
  };

  const resetGame = () => {
    setBoard(buildBoard());
    setPlayerPos(0);
    setAiPos(0);
    setPlayerRest(false);
    setAiRest(false);
    setRpsState('idle');
    setPlayerChoice(null);
    setAiChoice(null);
    setGameState('lobby');
    setTurn('player');
    setDiceResult(null);
    setShowDicePopup(false);
    setActionPopup(null);
    setCatchEvent(null);
    setPreviewCell(null);
    setWriteMode(false);
    setWriteInputs({});
    setWriteRevealed(false);
  };

  const handleModeChange = (mode) => {
    setGameMode(mode);
    resetGame();
  };

  const renderDots = (num) => {
    const dot = 'w-6 h-6 bg-slate-700 rounded-full shadow-inner';
    const redDot = 'w-8 h-8 bg-red-600 rounded-full shadow-inner';
    switch (num) {
      case 1:
        return <div className={redDot}></div>;
      case 2:
        return (
          <div className="w-full h-full p-4 flex flex-col justify-between">
            <div className={`${dot} self-start`}></div>
            <div className={`${dot} self-end`}></div>
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full p-4 flex flex-col justify-between items-center">
            <div className={`${dot} self-start`}></div>
            <div className={dot}></div>
            <div className={`${dot} self-end`}></div>
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full p-4 grid grid-cols-2 grid-rows-2 gap-4 place-items-center">
            <div className={dot}></div>
            <div className={dot}></div>
            <div className={dot}></div>
            <div className={dot}></div>
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full p-4 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className={dot}></div>
              <div className={dot}></div>
            </div>
            <div className="flex justify-center">
              <div className={dot}></div>
            </div>
            <div className="flex justify-between">
              <div className={dot}></div>
              <div className={dot}></div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full p-4 grid grid-cols-2 grid-rows-3 gap-2 place-items-center">
            <div className={dot}></div>
            <div className={dot}></div>
            <div className={dot}></div>
            <div className={dot}></div>
            <div className={dot}></div>
            <div className={dot}></div>
          </div>
        );
      default:
        return null;
    }
  };

  const appStyle = {
    fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', 'NanumSquareRound', 'Nanum Gothic', sans-serif",
  };

  return (
    <div
      className="min-h-screen bg-emerald-800 text-gray-800 p-4 flex flex-col items-center relative overflow-hidden"
      style={appStyle}
    >
      <style>{`
        @import url('https://hangeul.pstatic.net/hangeul_static/css/nanum-square-round.css');

        .perspective-1000 { perspective: 1000px; }
        .cube-container {
          transform-style: preserve-3d;
          width: 100%;
          height: 100%;
          position: absolute;
        }
        .dice-face {
          position: absolute;
          width: 128px;
          height: 128px;
          background: #f8fafc;
          border: 4px solid #cbd5e1;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.05);
        }
        .face-front  { transform: rotateY(0deg) translateZ(64px); }
        .face-right  { transform: rotateY(90deg) translateZ(64px); }
        .face-back   { transform: rotateY(180deg) translateZ(64px); }
        .face-left   { transform: rotateY(-90deg) translateZ(64px); }
        .face-top    { transform: rotateX(90deg) translateZ(64px); }
        .face-bottom { transform: rotateX(-90deg) translateZ(64px); }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-700 to-emerald-900 opacity-80 pointer-events-none"></div>

      <header className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center gap-4 mb-4 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,0.2)] z-10 border-2 border-emerald-900">
        <h1 className="text-2xl md:text-3xl font-black text-emerald-800 uppercase tracking-wider flex items-center gap-2">
          🦁 Review Board Game
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex bg-gray-200 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => handleModeChange('answerOnly')}
              className={`px-4 py-2 rounded-lg font-bold transition-all text-sm md:text-base ${gameMode === 'answerOnly' ? 'bg-white shadow-sm text-emerald-800 border border-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
            >
              대답만 하기
            </button>
            <button
              onClick={() => handleModeChange('qna')}
              className={`px-4 py-2 rounded-lg font-bold transition-all text-sm md:text-base ${gameMode === 'qna' ? 'bg-white shadow-sm text-emerald-800 border border-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
            >
              질문&대답 같이
            </button>
          </div>

          <button
            onClick={resetGame}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-xl font-bold transition-all shadow-[0_4px_0_0_rgba(180,83,9,1)] active:shadow-[0_0px_0_0_rgba(180,83,9,1)] active:translate-y-1 whitespace-nowrap"
          >
            처음부터 다시 하기
          </button>
        </div>
      </header>

      {gameState === 'lobby' && (
        <div className="w-full max-w-5xl bg-white/95 p-4 rounded-2xl shadow-md mb-4 text-center border-4 border-emerald-400 z-10 animate-pulse">
          <h2 className="text-xl md:text-2xl font-black text-emerald-700">
            💡 그림을 클릭하면 질문과 대답 문장이 나와요. 듣고 따라 읽고 공책에 써보며 연습해봅시다!
          </h2>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full max-w-5xl bg-white/95 p-4 rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,0.2)] mb-4 flex justify-between items-center border-l-8 border-amber-500 z-10">
          <div className="text-xl font-bold w-1/3 flex items-center gap-2">
            {turn === 'player' ? (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg border-2 border-blue-300 shadow-sm flex items-center gap-2">
                👦 내 차례
              </span>
            ) : (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-lg border-2 border-red-300 shadow-sm flex items-center gap-2 animate-pulse">
                🤖 AI 차례...
              </span>
            )}
          </div>

          <div className="w-1/3 flex justify-center">
            {diceResult && !showDicePopup && (
              <div className="text-lg bg-emerald-100 text-emerald-900 border-2 border-emerald-300 px-6 py-2 rounded-xl font-black shadow-sm transition-all">
                {diceResult}
              </div>
            )}
          </div>

          <div className="w-1/3 flex justify-end relative">
            {turn === 'player' && !isMoving && !showDicePopup && !actionPopup && !catchEvent && !playerRest && (
              <div className="absolute -top-10 right-0 md:-top-12 whitespace-nowrap text-xs md:text-sm font-bold text-amber-700 animate-bounce bg-amber-100 px-3 py-1 rounded-full border border-amber-300 shadow-sm z-20">
                내가 주사위 굴리기 버튼을 눌러서 시작해봅시다! 👇
              </div>
            )}
            <button
              onClick={handlePlayerTurn}
              disabled={(turn !== 'player' && !playerRest) || isMoving || showDicePopup || actionPopup || catchEvent}
              className={`px-8 py-3 rounded-2xl font-black text-white text-lg transition-all
                ${
                  playerRest && turn === 'player'
                    ? 'bg-purple-500 hover:bg-purple-400 border-2 border-purple-600 shadow-[0_5px_0_0_rgba(147,51,234,1)] active:shadow-none active:translate-y-1 cursor-pointer animate-pulse'
                    : turn === 'player' && !isMoving && !showDicePopup && !actionPopup && !catchEvent
                      ? 'bg-amber-500 hover:bg-amber-400 border-2 border-amber-600 shadow-[0_5px_0_0_rgba(180,83,9,1)] active:shadow-none active:translate-y-1 cursor-pointer'
                      : 'bg-gray-400 border-2 border-gray-500 shadow-[0_5px_0_0_rgba(107,114,128,1)] cursor-not-allowed opacity-80'
                }`}
            >
              {playerRest && turn === 'player'
                ? '쿨쿨.. 한 번 쉬기 (턴 넘기기) 💤'
                : isMoving || showDicePopup || actionPopup || catchEvent
                  ? '기다려주세요...'
                  : '주사위 굴리기'}
            </button>
          </div>
        </div>
      )}

      <div
        className={`w-full max-w-6xl p-8 md:p-14 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] flex flex-wrap gap-4 md:gap-5 justify-center relative z-10 border-[16px] border-[#4a2e15] bg-[#e8dcc4] overflow-hidden ${gameState === 'lobby' ? 'mb-24' : ''}`}
      >
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
          <div className="absolute top-1/2 left-0 w-full h-[3px] bg-[#4a2e15]"></div>
          <div className="absolute top-0 left-1/2 w-[3px] h-full bg-[#4a2e15]"></div>
        </div>

        <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-0 bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:20px_20px]"></div>

        {board.map((cell, idx) => {
          const isPlayerHere = playerPos === idx;
          const isAiHere = aiPos === idx;

          let baseStyle =
            'w-20 h-24 md:w-[120px] md:h-[140px] rounded-2xl flex flex-col items-center justify-center relative transform transition-all duration-300 hover:-translate-y-2 z-10 group';
          let cellStyle = '';

          if (cell.type === 'normal') {
            cellStyle = `${baseStyle} bg-[#fdfbf7] border-[3px] border-[#d4bca3] shadow-[0_8px_0_0_#bca38f,0_15px_10px_rgba(0,0,0,0.2)] cursor-pointer hover:border-emerald-400 hover:shadow-[0_8px_0_0_#10b981,0_15px_10px_rgba(0,0,0,0.2)]`;
          } else if (cell.type === 'start') {
            cellStyle = `${baseStyle} bg-gradient-to-b from-amber-200 to-amber-400 border-[3px] border-amber-500 shadow-[0_8px_0_0_#b45309,0_15px_10px_rgba(0,0,0,0.2)]`;
          } else if (cell.type === 'finish') {
            cellStyle = `${baseStyle} bg-gradient-to-b from-rose-400 to-rose-600 border-[3px] border-rose-700 shadow-[0_8px_0_0_#9f1239,0_15px_10px_rgba(0,0,0,0.2)]`;
          } else if (cell.type === 'action') {
            let actionColor =
              cell.action === 'rest'
                ? 'bg-blue-100 border-blue-300 shadow-[0_8px_0_0_#93c5fd,0_15px_10px_rgba(0,0,0,0.2)]'
                : cell.action === 'forward2'
                  ? 'bg-green-100 border-green-300 shadow-[0_8px_0_0_#86efac,0_15px_10px_rgba(0,0,0,0.2)]'
                  : 'bg-red-100 border-red-300 shadow-[0_8px_0_0_#fca5a5,0_15px_10px_rgba(0,0,0,0.2)]';
            cellStyle = `${baseStyle} ${actionColor} border-[3px]`;
          }

          return (
            <div key={idx} className={cellStyle} onClick={() => handleCellClick(cell)}>
              <div className="absolute -top-4 -left-2 md:-top-6 md:-left-4 flex gap-1 z-30 w-full px-1">
                {isPlayerHere && (
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-400 to-blue-700 rounded-full border-[3px] border-white shadow-[0_8px_10px_rgba(0,0,0,0.5),inset_0_4px_4px_rgba(255,255,255,0.4)] flex items-center justify-center text-2xl md:text-3xl animate-bounce z-40">
                    👦
                  </div>
                )}
                {isAiHere && (
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-red-400 to-red-700 rounded-full border-[3px] border-white shadow-[0_8px_10px_rgba(0,0,0,0.5),inset_0_4px_4px_rgba(255,255,255,0.4)] flex items-center justify-center text-2xl md:text-3xl transition-transform duration-300 z-30">
                    🤖
                  </div>
                )}
              </div>

              {cell.type === 'normal' && (
                <>
                  <div className="absolute top-2 right-2 text-sm bg-gray-200/50 rounded-full w-6 h-6 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-emerald-100 transition-all">
                    🔊
                  </div>
                  <CellImage
                    src={cell.image}
                    alt={cell.answer}
                    fallbackEmoji={cell.emoji}
                    className="w-12 h-12 md:w-20 md:h-20 object-contain mb-1 drop-shadow-md transform transition-transform group-hover:scale-110"
                    fallbackClass="text-4xl md:text-6xl mb-1 drop-shadow-md transform transition-transform group-hover:scale-110"
                  />
                  <div
                    className={`text-[10px] md:text-xs font-black border-2 px-2 py-0.5 rounded-full shadow-inner mt-1 ${UNIT_COLORS[cell.unit] || 'text-[#5c3a21] bg-[#e8dcc4] border-[#d4bca3]'}`}
                  >
                    {cell.unit}
                  </div>
                </>
              )}

              {cell.type === 'action' && (
                <div className="text-[11px] md:text-sm font-black text-center whitespace-pre-line p-1 text-slate-700 drop-shadow-sm leading-tight">
                  {cell.label}
                </div>
              )}

              {(cell.type === 'start' || cell.type === 'finish') && (
                <div className="font-black text-xl md:text-2xl text-white tracking-wider drop-shadow-md bg-black/20 px-3 py-1 rounded-lg border border-white/30">
                  {cell.label}
                </div>
              )}

              {LADDERS[idx] !== undefined && (
                <div
                  className={`absolute -bottom-3 left-1 md:left-2 h-6 md:h-7 px-1.5 rounded-full flex items-center gap-0.5 text-[10px] md:text-xs font-black shadow-[0_3px_0_0_rgba(0,0,0,0.25)] border-2 border-white z-20 ${LADDERS[idx] > idx ? 'bg-amber-400 text-amber-950' : 'bg-orange-400 text-orange-950'}`}
                  title={`사다리: ${idx}번 → ${LADDERS[idx]}번 칸`}
                >
                  🪜{LADDERS[idx] > idx ? '⬆' : '⬇'}{LADDERS[idx]}
                </div>
              )}

              <div className="absolute -bottom-3 right-2 md:right-3 w-6 h-6 md:w-8 md:h-8 bg-[#5c3a21] text-[#e8dcc4] rounded-full flex items-center justify-center text-[10px] md:text-sm font-black shadow-[0_4px_0_0_rgba(0,0,0,0.3)] border-2 border-[#e8dcc4] z-20">
                {idx}
              </div>
            </div>
          );
        })}
      </div>

      {gameState === 'lobby' && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => {
              if ('speechSynthesis' in window) {
                window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
              }
              setGameState('rps');
            }}
            className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white rounded-full font-black text-2xl md:text-3xl shadow-[0_8px_0_0_rgba(180,83,9,1)] active:shadow-none active:translate-y-2 transition-all flex items-center gap-3 border-4 border-white animate-bounce"
          >
            🚀 게임 시작하기!
          </button>
        </div>
      )}

      {previewCell && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[80] p-4 backdrop-blur-sm"
          onClick={closePreview}
        >
          <div
            className="bg-white rounded-[2rem] p-6 md:p-10 max-w-lg w-full text-center shadow-2xl border-8 border-emerald-400 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePreview}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-xl flex items-center justify-center z-10"
            >
              ✕
            </button>

            <div className="flex flex-col items-center mb-5">
              <CellImage
                src={previewCell.image}
                alt={previewCell.answer}
                fallbackEmoji={previewCell.emoji}
                className="w-24 h-24 object-contain drop-shadow-md mb-3"
                fallbackClass="text-6xl drop-shadow-md mb-3"
              />
              <span
                className={`inline-block text-sm font-black px-3 py-1 rounded-xl shadow-sm border-2 ${UNIT_COLORS[previewCell.unit] || 'text-emerald-700 bg-emerald-50 border-emerald-300'}`}
              >
                {previewCell.unit}
              </span>
            </div>

            {!writeMode ? (
              <>
                <div className="space-y-3 text-left">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                    <p className="text-xs font-black text-blue-500 uppercase tracking-wide mb-1">Question · 질문</p>
                    <p className="text-2xl md:text-3xl font-black text-slate-800 leading-snug">
                      <ClickableWords text={previewCell.question} onWord={(w) => speakText(w)} />
                    </p>
                  </div>
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
                    <p className="text-xs font-black text-amber-600 uppercase tracking-wide mb-1">Answer · 대답</p>
                    <p className="text-2xl md:text-3xl font-black text-slate-800 leading-snug">
                      <ClickableWords text={previewCell.answer} onWord={(w) => speakText(w)} />
                    </p>
                  </div>
                </div>

                <p className="text-sm font-bold text-slate-500 mt-3">💡 단어를 누르면 그 단어만 들려줘요</p>

                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => speakText(`${previewCell.question} ... ${previewCell.answer}`)}
                    className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full font-black text-lg shadow-[0_5px_0_0_rgba(5,150,105,1)] active:shadow-none active:translate-y-1 transition-all"
                  >
                    🔊 다시 듣기
                  </button>
                  <button
                    onClick={startWriting}
                    className="px-5 py-3 bg-violet-500 hover:bg-violet-400 text-white rounded-full font-black text-lg shadow-[0_5px_0_0_rgba(124,58,237,1)] active:shadow-none active:translate-y-1 transition-all"
                  >
                    ✏️ 쓰기 활동
                  </button>
                </div>
              </>
            ) : (
              (() => {
                const segs = parseForBlanks(previewCell.answer);
                return (
                  <>
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3 text-left mb-3">
                      <p className="text-xs font-black text-blue-500 uppercase tracking-wide mb-1">Question · 질문</p>
                      <p className="text-xl md:text-2xl font-black text-slate-800 leading-snug">
                        <ClickableWords text={previewCell.question} onWord={(w) => speakText(w)} />
                      </p>
                    </div>

                    <p className="text-base font-bold text-violet-700 mb-2">✏️ 빈칸에 알맞은 단어를 써보세요</p>

                    <div className="bg-violet-50 border-2 border-violet-200 rounded-2xl p-4 text-left text-2xl md:text-3xl font-black text-slate-800 leading-relaxed">
                      {segs.map((s, i) => {
                        if (s.type !== 'blank') return <span key={i}>{s.text}</span>;
                        const val = writeInputs[s.idx] || '';
                        return (
                          <span key={i} className="inline-flex items-baseline">
                            {s.pre}
                            <input
                              type="text"
                              value={val}
                              onChange={(e) =>
                                setWriteInputs((prev) => ({ ...prev, [s.idx]: e.target.value }))
                              }
                              placeholder={'_'.repeat(Math.max(s.core.length, 3))}
                              className="mx-0.5 px-2 text-center border-b-4 border-violet-300 bg-white rounded-md outline-none focus:border-violet-500"
                              style={{ width: `${Math.max(s.core.length + 1, 4)}ch` }}
                            />
                            {s.post}
                          </span>
                        );
                      })}
                    </div>

                    {writeRevealed && (
                      <div className="mt-4 bg-green-50 border-2 border-green-300 rounded-2xl p-4 text-left">
                        <p className="text-xs font-black text-green-600 uppercase tracking-wide mb-1">정답</p>
                        <p className="text-2xl md:text-3xl font-black text-slate-800 leading-snug">
                          {segs.map((s, i) =>
                            s.type !== 'blank' ? (
                              <span key={i}>{s.text}</span>
                            ) : (
                              <span key={i}>
                                {s.pre}
                                <span className="text-green-700 underline decoration-green-400 decoration-4">{s.core}</span>
                                {s.post}
                              </span>
                            )
                          )}
                        </p>
                        <p className="text-sm font-bold text-green-600 mt-2">내가 쓴 답과 비교해보세요 🙂</p>
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      <button
                        onClick={revealWriting}
                        className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-full font-black text-lg shadow-[0_5px_0_0_rgba(180,83,9,1)] active:shadow-none active:translate-y-1 transition-all"
                      >
                        👀 답 보기
                      </button>
                      <button
                        onClick={() => { setWriteInputs({}); setWriteRevealed(false); }}
                        className="px-5 py-3 bg-slate-400 hover:bg-slate-300 text-white rounded-full font-black text-lg shadow-[0_5px_0_0_rgba(100,116,139,1)] active:shadow-none active:translate-y-1 transition-all"
                      >
                        🔄 다시 쓰기
                      </button>
                      <button
                        onClick={() => setWriteMode(false)}
                        className="px-5 py-3 bg-white border-2 border-slate-300 text-slate-600 hover:bg-slate-50 rounded-full font-black text-lg transition-all"
                      >
                        ← 읽기로
                      </button>
                    </div>
                  </>
                );
              })()
            )}
          </div>
        </div>
      )}

      {catchEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-white rounded-[2rem] p-10 max-w-md w-full text-center shadow-2xl border-8 border-orange-400 transform transition-all scale-100">
            <div className="text-7xl mb-6 animate-bounce">{catchEvent.victim === 'ai' ? '😆' : '😱'}</div>
            <h2 className="text-3xl font-black mb-4 drop-shadow-sm text-orange-600">
              {catchEvent.victim === 'ai' ? '잡았다!' : '앗, 잡혔다!'}
            </h2>
            <p className="text-xl font-bold text-gray-700 mb-8 whitespace-pre-line">
              {catchEvent.victim === 'ai'
                ? '내가 AI를 잡았어요!\nAI는 출발선으로 돌아갑니다.'
                : 'AI에게 잡히고 말았어요!\n출발선으로 돌아갑니다.'}
            </p>
            <button
              onClick={handleCatchClose}
              className="w-full py-4 text-white bg-orange-500 hover:bg-orange-400 rounded-2xl font-black text-2xl transition-transform active:translate-y-2 border-b-8 border-orange-700"
            >
              알겠어요! 👍
            </button>
          </div>
        </div>
      )}

      {actionPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
          <div
            className={`bg-white rounded-[2rem] p-10 max-w-md w-full text-center shadow-2xl border-8 ${getActionMessage()?.color} transform transition-all scale-100`}
          >
            <div className="text-7xl mb-6 animate-bounce">
              {getActionMessage()?.title.includes('🚀')
                ? '🚀'
                : getActionMessage()?.title.includes('🍌')
                  ? '🍌'
                  : getActionMessage()?.title.includes('🪜')
                    ? '🪜'
                    : '💤'}
            </div>
            <h2 className="text-3xl font-black mb-4 drop-shadow-sm">{getActionMessage()?.title}</h2>
            <p className="text-xl font-bold text-gray-700 mb-8">{getActionMessage()?.desc}</p>
            <button
              onClick={handleActionPopupClose}
              className={`w-full py-4 text-white rounded-2xl font-black text-2xl transition-transform active:translate-y-2
                ${
                  actionPopup.action === 'rest'
                    ? 'bg-blue-500 border-b-8 border-blue-700'
                    : actionPopup.action === 'forward2'
                      ? 'bg-green-500 border-b-8 border-green-700'
                      : actionPopup.action === 'ladder'
                        ? 'bg-amber-500 border-b-8 border-amber-700'
                        : 'bg-red-500 border-b-8 border-red-700'
                }`}
            >
              알겠어요! 👍
            </button>
          </div>
        </div>
      )}

      {gameState === 'rps' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full text-center shadow-2xl border-8 border-emerald-500 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>

            {rpsState === 'idle' && (
              <div className="relative z-10">
                <h2 className="text-3xl font-black mb-4 text-emerald-800">누가 먼저 할까요?</h2>
                <p className="text-emerald-600 font-bold mb-8">가위바위보로 먼저 시작할 사람을 정해요!</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => handleRPS('scissors')}
                    className="text-5xl hover:scale-110 transition-transform bg-white p-5 rounded-2xl border-4 border-emerald-200 shadow-[0_8px_0_0_rgba(167,243,208,1)] active:shadow-none active:translate-y-2"
                  >
                    ✌️
                  </button>
                  <button
                    onClick={() => handleRPS('rock')}
                    className="text-5xl hover:scale-110 transition-transform bg-white p-5 rounded-2xl border-4 border-emerald-200 shadow-[0_8px_0_0_rgba(167,243,208,1)] active:shadow-none active:translate-y-2"
                  >
                    ✊
                  </button>
                  <button
                    onClick={() => handleRPS('paper')}
                    className="text-5xl hover:scale-110 transition-transform bg-white p-5 rounded-2xl border-4 border-emerald-200 shadow-[0_8px_0_0_rgba(167,243,208,1)] active:shadow-none active:translate-y-2"
                  >
                    🖐️
                  </button>
                </div>
              </div>
            )}

            {(rpsState === 'animating' || rpsState === 'result') && (
              <div className="flex flex-col items-center relative z-10">
                <h2 className="text-3xl font-black mb-8 text-amber-500 animate-pulse">가위~ 바위~ 보!</h2>

                <div className="flex justify-center items-center gap-6 mb-8 w-full px-4">
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-slate-500 mb-2 font-bold text-lg">👦 나</span>
                    <div className="text-6xl bg-blue-50 w-full py-6 rounded-3xl border-4 border-blue-200 shadow-inner">
                      {RPS_EMOJI[playerChoice]}
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-300 italic">VS</div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-slate-500 mb-2 font-bold text-lg">🤖 AI</span>
                    <div className="text-6xl bg-red-50 w-full py-6 rounded-3xl border-4 border-red-200 shadow-inner">
                      {aiChoice ? RPS_EMOJI[aiChoice] : '❓'}
                    </div>
                  </div>
                </div>

                {rpsState === 'result' && (
                  <div className="text-2xl font-black mt-4 animate-bounce bg-amber-100 py-3 px-6 rounded-full text-amber-800 border-2 border-amber-300 shadow-lg">
                    {rpsResult === 'draw'
                      ? '앗, 비겼다! 다시! 😅'
                      : rpsResult === 'win'
                        ? '🎉 내가 이겼다! 먼저 시작! 🎉'
                        : '😭 AI 승리! AI가 먼저 시작! 😭'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showDicePopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full text-center shadow-2xl border-8 border-amber-400 transform transition-all scale-110">
            <h2 className="text-3xl font-black mb-12 text-amber-600 drop-shadow-sm">
              {turn === 'player' ? '👦 내 차례!' : '🤖 AI 차례!'}
            </h2>

            <div className="w-32 h-32 relative perspective-1000 mb-12 mx-auto">
              <div
                className="cube-container"
                style={{
                  transform: diceTransform,
                  transition: isRollingDice ? 'transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
                }}
              >
                <div className="dice-face face-front">{renderDots(1)}</div>
                <div className="dice-face face-right">{renderDots(2)}</div>
                <div className="dice-face face-back">{renderDots(3)}</div>
                <div className="dice-face face-left">{renderDots(4)}</div>
                <div className="dice-face face-top">{renderDots(5)}</div>
                <div className="dice-face face-bottom">{renderDots(6)}</div>
              </div>
            </div>

            <div className="h-12 flex items-center justify-center">
              {!isRollingDice && (
                <div className="text-3xl font-black text-emerald-600 animate-pulse bg-emerald-50 px-6 py-2 rounded-full border-2 border-emerald-200 shadow-md">
                  {diceDisplay}칸 이동!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {gameState === 'speaking' && currentTask && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-6 md:p-10 max-w-lg w-full text-center shadow-2xl border-8 border-blue-400">
            {currentTask.mode === 'qna' ? (
              <div className="mb-6 bg-blue-50 p-6 rounded-3xl border-2 border-blue-100 relative">
                <div className="flex justify-center items-center gap-4 mb-4">
                  <CellImage
                    src={currentTask.cell.image}
                    alt={currentTask.answer}
                    fallbackEmoji={currentTask.cell.emoji}
                    className="w-24 h-24 object-contain drop-shadow-md"
                    fallbackClass="text-7xl drop-shadow-md"
                  />
                  <span className={`text-sm font-black px-3 py-1 rounded-xl shadow-sm border-2 ${UNIT_COLORS[currentTask.cell.unit] || 'text-blue-600 bg-white border-blue-200'}`}>
                    {currentTask.cell.unit}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 leading-snug">
                  그림에 맞는 <span className="text-blue-600 border-b-4 border-blue-300">질문</span>과{' '}
                  <span className="text-blue-600 border-b-4 border-blue-300">대답</span>을<br />
                  모두 말해보세요!
                </h3>
                <button
                  onClick={() => speakText(`${currentTask.question} ... ${currentTask.answer}`)}
                  className="mt-4 text-sm text-blue-600 bg-white border border-blue-200 hover:bg-blue-100 px-4 py-2 rounded-full transition-colors font-bold shadow-sm"
                >
                  🔊 들어보며 연습하기
                </button>
              </div>
            ) : (
              <div className="mb-6 bg-blue-50 p-6 rounded-3xl border-2 border-blue-100 relative">
                <div className="flex justify-center items-center gap-4 mb-4">
                  <CellImage
                    src={currentTask.cell.image}
                    alt={currentTask.answer}
                    fallbackEmoji={currentTask.cell.emoji}
                    className="w-24 h-24 object-contain drop-shadow-md"
                    fallbackClass="text-7xl drop-shadow-md"
                  />
                  <span className={`text-sm font-black px-3 py-1 rounded-xl shadow-sm border-2 ${UNIT_COLORS[currentTask.cell.unit] || 'text-blue-600 bg-white border-blue-200'}`}>
                    {currentTask.cell.unit}
                  </span>
                </div>
                <p className="text-blue-500 font-bold mb-2 uppercase tracking-wide">🤖 AI 친구의 질문:</p>
                <h3 className="text-3xl font-black text-slate-800">"{currentTask.question}"</h3>
                <button
                  onClick={() => speakText(currentTask.question)}
                  className="mt-4 text-sm text-blue-600 bg-white border border-blue-200 hover:bg-blue-100 px-4 py-2 rounded-full transition-colors font-bold shadow-sm"
                >
                  🔊 질문 다시 듣기
                </button>
              </div>
            )}

            <div className="mb-8">
              <p className="text-lg font-bold text-slate-600 mb-4">
                {currentTask.mode === 'qna'
                  ? '마이크를 누르고 질문과 대답을 모두 말해보세요!'
                  : '마이크를 누르고 영어로 대답하세요!'}
              </p>
              <button
                onClick={startListening}
                disabled={isListening || feedback.includes('Excellent')}
                className={`w-24 h-24 rounded-full text-4xl shadow-[0_8px_0_0_rgba(0,0,0,0.15)] flex items-center justify-center mx-auto transition-all
                  ${isListening ? 'bg-red-500 text-white animate-pulse shadow-none translate-y-2' : 'bg-green-500 text-white hover:bg-green-400 active:shadow-none active:translate-y-2'}`}
              >
                {isListening ? '🎙️' : '🎤'}
              </button>

              {isListening && <p className="text-red-500 font-bold mt-6 animate-pulse">듣고 있어요... 🗣️</p>}

              {spokenText && (
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl border-2 border-slate-200">
                  <p className="text-xs text-slate-400 font-bold mb-1 uppercase">내가 한 말</p>
                  <p className="text-xl font-black text-slate-800">"{spokenText}"</p>
                </div>
              )}

              {feedback && (
                <div
                  className={`mt-4 text-xl font-black py-3 px-4 rounded-xl border-2 ${feedback.includes('정답') ? 'text-green-700 bg-green-100 border-green-300' : 'text-rose-600 bg-rose-50 border-rose-200'}`}
                >
                  {feedback}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={skipSpeaking}
                className="text-slate-400 text-sm font-bold hover:text-slate-600 bg-slate-100 px-3 py-1 rounded-lg"
              >
                PASS (선생님용)
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'aiSpeaking' && currentTask && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-6 md:p-10 max-w-lg w-full text-center shadow-2xl border-8 border-red-400">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-red-100 rounded-full border-4 border-red-500 flex items-center justify-center text-6xl mb-4 shadow-lg animate-bounce">
                🤖
              </div>
              <h2 className="text-2xl font-black text-red-600 uppercase tracking-widest">🤖 AI의 차례입니다!</h2>
            </div>

            <div className="mb-6 bg-slate-50 p-6 rounded-3xl border-2 border-slate-200 relative">
              <div className="flex justify-center items-center gap-4 mb-6 opacity-60">
                <CellImage
                  src={currentTask.cell.image}
                  alt={currentTask.answer}
                  fallbackEmoji={currentTask.cell.emoji}
                  className="w-20 h-20 object-contain"
                  fallbackClass="text-5xl"
                />
                <span className="text-sm font-black text-slate-500 border-2 border-slate-300 px-3 py-1 rounded-xl">
                  {currentTask.cell.unit}
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border-2 border-red-200 shadow-md relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-t-2 border-l-2 border-red-200 rotate-45"></div>
                <p className="text-3xl font-black text-slate-800 transition-all duration-300">{aiSpeechText}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-10 max-w-md w-full text-center shadow-2xl border-8 border-amber-400">
            <div className="text-8xl mb-6 animate-bounce">🏆</div>
            <h2 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-500">
              {playerPos >= board.length - 1 ? '나의 승리!' : 'AI의 승리!'}
            </h2>
            <p className="text-lg font-bold text-slate-500 mb-8">정말 멋진 게임이었어요!</p>
            <button
              onClick={resetGame}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-white rounded-2xl font-black text-2xl transition-transform border-b-8 border-amber-600 active:border-b-0 active:translate-y-2"
            >
              다시 게임하기 🔄
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
