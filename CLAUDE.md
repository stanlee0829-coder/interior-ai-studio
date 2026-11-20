# 인테리어 AI 견적 스튜디오 — 작업 규칙

Python 표준 라이브러리 HTTP 서버(`app/server.py`) + 의존성 없는 바닐라 JS 화면(`app/static/`). Render가 `main`을 자동 배포한다.

## 구조
- `app/server.py`: 정적 파일, 비밀번호 로그인, `/api/ask`(사진 분석), `/api/render`(실사 이미지), 하루 사용 한도.
- `app/ai.py`: Google Gemini API 호출. 모델 이름은 환경 변수(`GEMINI_TEXT_MODEL`, `GEMINI_IMAGE_MODEL`)로 바꾼다.
- `app/static/app.js`: 화면 전체. 기준 자료(스타일·자재·노임단가·가구 단가)가 파일 위쪽에 있다. AI에 보내는 지시문도 여기서 만든다.
- 가구 배치(3단계)는 `app.js`의 `CATALOG`(이케아 제품 참고 카탈로그)에서 고른다. 규격·가격은 공식 자료와 대조하지 않은 참고값이라 화면에 그렇게 표시한다. 3D 모양은 `furn3D`.
- 프로젝트 내용은 브라우저 localStorage, 사진은 브라우저 IndexedDB에 저장된다(서버 저장 없음).

## 확인
- `python3 -m compileall -q app tests`, `node --check app/static/app.js`
- `python3 -m unittest discover tests` (실제 AI를 부르지 않고 `AI_MOCK=1`로 돈다)
- 화면 확인: `AI_MOCK=1 python3 app/server.py` 후 http://127.0.0.1:8780

## 규칙
- `.env`, API 키, 비밀번호는 절대 커밋하지 않는다.
- 화면 문구는 한국어. 단가·품 같은 기준값은 근거가 없으면 "추정"으로 표시하고 화면에서 고칠 수 있게 둔다.
- 커밋 메시지와 PR 요약은 한국어로, 무엇이 바뀌고 어디서 확인하는지 적는다.
