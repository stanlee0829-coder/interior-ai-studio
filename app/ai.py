"""이미지·텍스트 AI 호출 (Google Gemini API, 표준 라이브러리만 사용).

환경 변수
- GEMINI_API_KEY      : 필수. 없으면 AI 기능이 꺼진다.
- GEMINI_TEXT_MODEL   : 사진 분석용 모델 (기본 gemini-2.5-flash)
- GEMINI_IMAGE_MODEL  : 실사 이미지 편집용 모델 (기본 gemini-2.5-flash-image)
- AI_MOCK=1           : 실제 호출 없이 정해진 답을 돌려준다 (테스트·화면 확인용).
"""
import base64
import json
import os
import re
import urllib.error
import urllib.request

BASE = 'https://generativelanguage.googleapis.com/v1beta'
TIMEOUT = 180


class AIError(Exception):
    def __init__(self, code, message, status=502):
        super().__init__(message)
        self.code, self.message, self.status = code, message, status


def key():
    return os.environ.get('GEMINI_API_KEY', '').strip()


def mock():
    return os.environ.get('AI_MOCK') == '1'


def enabled():
    return bool(key()) or mock()


def text_model():
    return os.environ.get('GEMINI_TEXT_MODEL', 'gemini-2.5-flash').strip()


def image_model():
    return os.environ.get('GEMINI_IMAGE_MODEL', 'gemini-2.5-flash-image').strip()


def split_data_url(url):
    """'data:image/jpeg;base64,...' → (mime, base64 문자열). 형식이 틀리면 AIError."""
    m = re.match(r'^data:(image/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$', url or '')
    if not m:
        raise AIError('bad_image', '이미지 형식이 올바르지 않습니다 (JPG·PNG·WebP).', 400)
    data = re.sub(r'\s+', '', m.group(2))
    try:
        base64.b64decode(data, validate=True)
    except Exception:
        raise AIError('bad_image', '이미지를 읽지 못했습니다.', 400)
    return m.group(1), data


def _call(model, body):
    if not key():
        raise AIError('no_key', '서버에 GEMINI_API_KEY가 설정되지 않았습니다.', 503)
    if not re.match(r'^[A-Za-z0-9._-]+$', model):
        raise AIError('bad_model', '모델 이름이 올바르지 않습니다.', 500)
    req = urllib.request.Request(
        f'{BASE}/models/{model}:generateContent', data=json.dumps(body).encode(),
        headers={'Content-Type': 'application/json', 'x-goog-api-key': key()}, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        detail = ''
        try:
            detail = json.loads(e.read()).get('error', {}).get('message', '')
        except Exception:
            pass
        if e.code == 404:
            raise AIError('model_not_found', f"모델 '{model}'을 찾을 수 없습니다. /api/ai-models 에서 쓸 수 있는 이름을 확인해 환경 변수를 고치세요.")
        if e.code == 429:
            raise AIError('rate_limited', 'AI 사용 한도에 걸렸습니다. 잠시 뒤 다시 시도하세요.', 429)
        if e.code in (401, 403):
            raise AIError('bad_key', 'API 키가 거부됐습니다. 키와 결제 설정을 확인하세요.')
        raise AIError('upstream', f'AI 서비스 오류({e.code}): {detail[:300]}')
    except (urllib.error.URLError, TimeoutError) as e:
        raise AIError('network', f'AI 서비스에 연결하지 못했습니다: {e}')


def _parts(res):
    cands = res.get('candidates') or []
    if not cands:
        reason = (res.get('promptFeedback') or {}).get('blockReason', '')
        raise AIError('refused', 'AI가 이 요청을 처리하지 않았습니다.' + (f' ({reason})' if reason else ''), 422)
    return (cands[0].get('content') or {}).get('parts') or []


def parse_json(text):
    """모델 답에서 JSON 값 하나를 꺼낸다 (코드 펜스·앞뒤 문장 허용)."""
    t = (text or '').strip()
    m = re.search(r'```(?:json)?\s*(.*?)```', t, re.S)
    if m:
        t = m.group(1).strip()
    try:
        return json.loads(t)
    except Exception:
        pass
    starts = [i for i in (t.find('{'), t.find('[')) if i >= 0]
    end = max(t.rfind('}'), t.rfind(']'))
    if starts and end > min(starts):
        try:
            return json.loads(t[min(starts):end + 1])
        except Exception:
            pass
    raise AIError('invalid_json', 'AI 응답을 읽지 못했습니다. 다시 시도하세요.')


MOCK_DESIGN = {
    'room': {'w': 4500, 'd': 4200, 'h': 2300},
    'openings': [{'type': 'door', 'wall': 'S', 'pos': 200, 'width': 900, 'sill': 0, 'height': 2100},
                 {'type': 'window', 'wall': 'N', 'pos': 600, 'width': 3000, 'sill': 900, 'height': 1200}],
    'furniture': [{'name': '소파', 'x': 1100, 'y': 3200, 'w': 2200, 'd': 900, 'h': 800, 'tone': 'main', 'price': 1200000},
                  {'name': 'TV장', 'x': 1350, 'y': 50, 'w': 1800, 'd': 400, 'h': 450, 'tone': 'wood', 'price': 350000}],
    'materials': {'floor': 'f_gangmaru', 'wall': 'w_silk', 'ceiling': 'c_paper'},
    'conditions': {'demolition': True, 'sash': False, 'insulation': False},
    'summary': '(모의 응답) 실제 AI가 아닌 테스트용 설계입니다.', 'notes': ['AI_MOCK=1 로 실행 중'],
}


def ask(prompt, images, want_json):
    """텍스트(+사진) 질문. images 는 data URL 목록. want_json 이면 파싱한 값을 돌려준다."""
    if mock():
        return MOCK_DESIGN if want_json else '(모의 응답) ' + prompt[:80]
    parts = [{'text': prompt}]
    for url in images:
        mime, data = split_data_url(url)
        parts.append({'inline_data': {'mime_type': mime, 'data': data}})
    body = {'contents': [{'role': 'user', 'parts': parts}]}
    if want_json:
        body['generationConfig'] = {'responseMimeType': 'application/json'}
    text = ''.join(p.get('text', '') for p in _parts(_call(text_model(), body)))
    if not text.strip():
        raise AIError('empty', 'AI가 빈 답을 보냈습니다. 다시 시도하세요.')
    return parse_json(text) if want_json else text


def render(prompt, image):
    """현장 사진(data URL)을 지시문대로 편집한 이미지를 data URL로 돌려준다."""
    mime, data = split_data_url(image)
    if mock():
        return f'data:{mime};base64,{data}'
    body = {'contents': [{'role': 'user', 'parts': [{'text': prompt}, {'inline_data': {'mime_type': mime, 'data': data}}]}],
            'generationConfig': {'responseModalities': ['TEXT', 'IMAGE']}}
    for p in _parts(_call(image_model(), body)):
        d = p.get('inlineData') or p.get('inline_data')
        if d and d.get('data'):
            return f"data:{d.get('mimeType') or d.get('mime_type') or 'image/png'};base64,{d['data']}"
    raise AIError('no_image', 'AI가 이미지를 만들지 않았습니다. 지시문을 바꾸거나 다시 시도하세요.', 422)


def list_models():
    """이 키로 쓸 수 있는 모델 이름 목록 (모델 이름 설정 확인용)."""
    if mock():
        return [text_model(), image_model()]
    if not key():
        raise AIError('no_key', '서버에 GEMINI_API_KEY가 설정되지 않았습니다.', 503)
    req = urllib.request.Request(f'{BASE}/models?pageSize=200', headers={'x-goog-api-key': key()})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return sorted(m.get('name', '').replace('models/', '') for m in json.loads(r.read()).get('models', []))
    except urllib.error.HTTPError as e:
        raise AIError('upstream', f'모델 목록을 가져오지 못했습니다({e.code}).')
    except (urllib.error.URLError, TimeoutError) as e:
        raise AIError('network', f'AI 서비스에 연결하지 못했습니다: {e}')
