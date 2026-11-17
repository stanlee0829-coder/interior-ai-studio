"""인테리어 AI 견적 스튜디오 서버 (Python 표준 라이브러리만 사용).

- 정적 화면: app/static/
- POST /api/login   비밀번호 로그인 (APP_PASSWORD)
- GET  /api/config  AI 사용 가능 여부·로그인 상태
- POST /api/ask     사진 분석 (텍스트 AI)
- POST /api/render  시공 후 실사 이미지 (이미지 AI)
- GET  /api/ai-models  쓸 수 있는 모델 이름 확인

환경 변수: PORT, BIND, APP_PASSWORD, SESSION_SECRET, SECURE_COOKIE, DAILY_RENDER_LIMIT, 그리고 ai.py 의 변수들.
"""
import base64
import hashlib
import hmac
import json
import mimetypes
import os
import sys
import threading
import time
import traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ai  # noqa: E402

STATIC = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
MAX_BODY = 40 * 1024 * 1024
SESSION_DAYS = 14
_secret = (os.environ.get('SESSION_SECRET') or base64.b64encode(os.urandom(32)).decode()).encode()
_lock = threading.Lock()
_usage = {'day': '', 'render': 0, 'ask': 0}
_fails = {}  # ip -> [실패 시각]


def password():
    return os.environ.get('APP_PASSWORD', '')


def daily_limit():
    try:
        return max(1, int(os.environ.get('DAILY_RENDER_LIMIT', '60')))
    except ValueError:
        return 60


def make_token(now=None):
    exp = str(int((now or time.time()) + SESSION_DAYS * 86400))
    sig = hmac.new(_secret, exp.encode(), hashlib.sha256).hexdigest()
    return exp + '.' + sig


def valid_token(tok, now=None):
    try:
        exp, sig = (tok or '').split('.', 1)
        good = hmac.new(_secret, exp.encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(sig, good) and int(exp) > (now or time.time())
    except Exception:
        return False


def count(kind):
    """하루 사용량을 세고, 한도를 넘으면 False."""
    with _lock:
        day = time.strftime('%Y-%m-%d')
        if _usage['day'] != day:
            _usage.update(day=day, render=0, ask=0)
        cap = daily_limit() * (1 if kind == 'render' else 3)
        if _usage[kind] >= cap:
            return False
        _usage[kind] += 1
        return True


def too_many_fails(ip):
    with _lock:
        recent = [t for t in _fails.get(ip, []) if time.time() - t < 600]
        _fails[ip] = recent
        return len(recent) >= 8


def note_fail(ip):
    with _lock:
        _fails.setdefault(ip, []).append(time.time())


class Handler(BaseHTTPRequestHandler):
    server_version = 'InteriorStudio/1'

    def log_message(self, fmt, *args):  # 요청 본문(사진)은 남기지 않는다
        sys.stderr.write('%s %s\n' % (self.address_string(), fmt % args))

    # ----- 응답 -----
    def send_json(self, obj, status=200, headers=None):
        data = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        for k, v in (headers or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(data)

    def fail(self, status, code, message):
        self.send_json({'error': code, 'message': message}, status)

    def authed(self):
        if not password():
            return True
        for part in (self.headers.get('Cookie') or '').split(';'):
            k, _, v = part.strip().partition('=')
            if k == 'sid' and valid_token(v):
                return True
        return False

    def body(self):
        try:
            n = int(self.headers.get('Content-Length') or 0)
        except ValueError:
            n = 0
        if n <= 0 or n > MAX_BODY:
            return None
        try:
            v = json.loads(self.rfile.read(n))
            return v if isinstance(v, dict) else None
        except Exception:
            return None

    # ----- GET -----
    def do_GET(self):
        path = self.path.split('?', 1)[0]
        if path == '/healthz':
            return self.send_json({'ok': True})
        if path == '/api/config':
            return self.send_json({'ai': ai.enabled(), 'login': bool(password()), 'authed': self.authed(), 'mock': ai.mock()})
        if path == '/api/ai-models':
            if not self.authed():
                return self.fail(401, 'login', '로그인이 필요합니다.')
            try:
                return self.send_json({'text': ai.text_model(), 'image': ai.image_model(), 'available': ai.list_models()})
            except ai.AIError as e:
                return self.fail(e.status, e.code, e.message)
        if path.startswith('/api/'):
            return self.fail(404, 'not_found', '없는 주소입니다.')
        rel = 'index.html' if path in ('/', '') else path.lstrip('/')
        full = os.path.normpath(os.path.join(STATIC, rel))
        if not full.startswith(STATIC + os.sep) or not os.path.isfile(full):
            self.send_response(404)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.end_headers()
            self.wfile.write('없는 페이지입니다.'.encode())
            return
        with open(full, 'rb') as f:
            data = f.read()
        self.send_response(200)
        self.send_header('Content-Type', (mimetypes.guess_type(full)[0] or 'application/octet-stream') + ('; charset=utf-8' if full.endswith(('.html', '.js', '.css')) else ''))
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers()
        self.wfile.write(data)

    # ----- POST -----
    def do_POST(self):
        path = self.path.split('?', 1)[0]
        if self.headers.get('X-Requested-With') != 'studio':  # 다른 사이트에서 보낸 요청 차단
            return self.fail(403, 'forbidden', '허용되지 않은 요청입니다.')
        data = self.body()
        if data is None:
            return self.fail(400, 'bad_request', '요청 내용이 없거나 너무 큽니다.')
        try:
            if path == '/api/login':
                return self.login(data)
            if not self.authed():
                return self.fail(401, 'login', '로그인이 필요합니다.')
            if path == '/api/ask':
                return self.ask(data)
            if path == '/api/render':
                return self.render(data)
            return self.fail(404, 'not_found', '없는 주소입니다.')
        except ai.AIError as e:
            return self.fail(e.status, e.code, e.message)
        except Exception:
            traceback.print_exc()
            return self.fail(500, 'server', '서버 오류가 났습니다. 잠시 뒤 다시 시도하세요.')

    def login(self, data):
        ip = self.client_address[0]
        if too_many_fails(ip):
            return self.fail(429, 'slow_down', '잘못된 시도가 많습니다. 10분 뒤 다시 시도하세요.')
        if not password() or not hmac.compare_digest(str(data.get('password', '')).encode(), password().encode()):
            note_fail(ip)
            return self.fail(401, 'wrong', '비밀번호가 맞지 않습니다.')
        cookie = f'sid={make_token()}; Path=/; HttpOnly; SameSite=Lax; Max-Age={SESSION_DAYS * 86400}'
        if os.environ.get('SECURE_COOKIE') == '1':
            cookie += '; Secure'
        return self.send_json({'ok': True}, headers={'Set-Cookie': cookie})

    def ask(self, data):
        prompt, images = data.get('prompt'), data.get('images') or []
        if not isinstance(prompt, str) or not prompt.strip() or len(prompt) > 60000:
            return self.fail(400, 'bad_request', '질문 내용이 없습니다.')
        if not isinstance(images, list) or len(images) > 12:
            return self.fail(400, 'bad_request', '사진은 12장까지 보낼 수 있습니다.')
        if not ai.enabled():
            return self.fail(503, 'no_key', '서버에 AI 키가 설정되지 않았습니다.')
        if not count('ask'):
            return self.fail(429, 'daily_limit', '오늘 AI 분석 한도를 다 썼습니다.')
        want_json = bool(data.get('json'))
        out = ai.ask(prompt, images, want_json)
        return self.send_json({'value': out} if want_json else {'text': out})

    def render(self, data):
        prompt, image = data.get('prompt'), data.get('image')
        if not isinstance(prompt, str) or not prompt.strip() or len(prompt) > 8000 or not isinstance(image, str):
            return self.fail(400, 'bad_request', '사진과 지시문이 필요합니다.')
        if not ai.enabled():
            return self.fail(503, 'no_key', '서버에 AI 키가 설정되지 않았습니다.')
        if not count('render'):
            return self.fail(429, 'daily_limit', f'오늘 실사 이미지 한도({daily_limit()}장)를 다 썼습니다.')
        return self.send_json({'image': ai.render(prompt, image)})


def main():
    port = int(os.environ.get('PORT', '8780'))
    bind = os.environ.get('BIND', '127.0.0.1')
    if bind != '127.0.0.1' and not password():
        print('경고: APP_PASSWORD 가 없어 누구나 접속해 AI 비용을 쓸 수 있습니다.', file=sys.stderr)
    print(f'http://{bind}:{port}  AI={"켜짐" if ai.enabled() else "꺼짐"}', file=sys.stderr)
    ThreadingHTTPServer((bind, port), Handler).serve_forever()


if __name__ == '__main__':
    main()
