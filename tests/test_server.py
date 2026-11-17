"""서버 동작 확인. 실제 AI는 부르지 않고 AI_MOCK=1 로 돈다: python3 -m unittest discover tests"""
import json
import os
import sys
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer

os.environ['AI_MOCK'] = '1'
os.environ['APP_PASSWORD'] = 'pw-for-test'
os.environ['SESSION_SECRET'] = 'test-secret'
os.environ['DAILY_RENDER_LIMIT'] = '2'
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'app'))
import ai  # noqa: E402
import server  # noqa: E402

PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='


class ServerTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.httpd = ThreadingHTTPServer(('127.0.0.1', 0), server.Handler)
        cls.base = f'http://127.0.0.1:{cls.httpd.server_address[1]}'
        threading.Thread(target=cls.httpd.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()

    def call(self, path, body=None, cookie=None, xrw=True):
        headers = {'Content-Type': 'application/json'}
        if xrw:
            headers['X-Requested-With'] = 'studio'
        if cookie:
            headers['Cookie'] = cookie
        req = urllib.request.Request(self.base + path, data=None if body is None else json.dumps(body).encode(), headers=headers)
        try:
            with urllib.request.urlopen(req) as r:
                return r.status, json.loads(r.read()), r.headers.get('Set-Cookie')
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read()), None

    def login(self):
        st, _, cookie = self.call('/api/login', {'password': 'pw-for-test'})
        self.assertEqual(st, 200)
        return cookie.split(';')[0]

    def test_static_and_config(self):
        with urllib.request.urlopen(self.base + '/') as r:
            self.assertIn('인테리어 AI 견적 스튜디오', r.read().decode())
        st, cfg, _ = self.call('/api/config')
        self.assertEqual((st, cfg['ai'], cfg['login'], cfg['authed']), (200, True, True, False))
        with self.assertRaises(urllib.error.HTTPError) as c:
            urllib.request.urlopen(self.base + '/../server.py')
        self.assertEqual(c.exception.code, 404)

    def test_login_required_and_wrong_password(self):
        self.assertEqual(self.call('/api/ask', {'prompt': 'x', 'json': True})[0], 401)
        self.assertEqual(self.call('/api/login', {'password': 'nope'})[0], 401)
        self.assertEqual(self.call('/api/ask', {'prompt': 'x'}, cookie='sid=123.abc')[0], 401)

    def test_cross_site_post_blocked(self):
        self.assertEqual(self.call('/api/login', {'password': 'pw-for-test'}, xrw=False)[0], 403)

    def test_ask_and_render_with_limit(self):
        cookie = self.login()
        st, out, _ = self.call('/api/ask', {'prompt': '분석', 'images': [PNG], 'json': True}, cookie)
        self.assertEqual(st, 200)
        self.assertEqual(out['value']['room']['w'], 4500)
        self.assertEqual(self.call('/api/render', {'prompt': 'p', 'image': 'not-an-image'}, cookie)[0], 400)
        server._usage.update(day='', render=0, ask=0)
        for _ in range(2):
            st, out, _ = self.call('/api/render', {'prompt': 'p', 'image': PNG}, cookie)
            self.assertEqual(st, 200)
            self.assertTrue(out['image'].startswith('data:image/png;base64,'))
        self.assertEqual(self.call('/api/render', {'prompt': 'p', 'image': PNG}, cookie)[1]['error'], 'daily_limit')

    def test_token_expiry_and_json_parsing(self):
        self.assertTrue(server.valid_token(server.make_token()))
        self.assertFalse(server.valid_token(server.make_token(now=1)))
        self.assertEqual(ai.parse_json('설명\n```json\n{"a": 1}\n```'), {'a': 1})
        self.assertEqual(ai.parse_json('결과: [1, 2] 입니다'), [1, 2])
        with self.assertRaises(ai.AIError):
            ai.parse_json('JSON 없음')


if __name__ == '__main__':
    unittest.main()
