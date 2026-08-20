const Router = require('koa-router')

// 헥토 결제 테스트 페이지. HECTO_TEST_PAGE=1 일 때만 마운트된다 (routes/index.js).
// web/ 을 건드리지 않고 서버 단독으로 결제창 e2e 를 확인하기 위한 개발 도구다.
const router = new Router()

const PAGE = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>ssumpay 헥토 결제 테스트</title>
<style>
  body { font-family: sans-serif; max-width: 640px; margin: 40px auto; padding: 0 16px; }
  fieldset { margin-bottom: 16px; }
  input, select, button { padding: 6px 8px; margin: 4px 0; }
  pre { background: #f4f4f4; padding: 12px; overflow-x: auto; font-size: 12px; white-space: pre-wrap; }
</style>
</head>
<body>
<h1>헥토 결제 테스트</h1>

<fieldset>
  <legend>1. 로그인</legend>
  <input id="username" placeholder="아이디">
  <input id="password" type="password" placeholder="비밀번호">
  <button onclick="login()">로그인</button>
  <span id="loginStatus"></span>
</fieldset>

<fieldset>
  <legend>2. 주문 생성</legend>
  <select id="productId"></select>
  <select id="method">
    <option value="1">신용카드</option>
    <option value="2">무통장(가상계좌)</option>
  </select>
  <input id="flexUsername" placeholder="FlexTV 아이디">
  <input id="flexPassword" type="password" placeholder="FlexTV 비밀번호">
  <input id="payerName" placeholder="입금자명(무통장)">
  <button onclick="createOrder()">주문 생성</button>
</fieldset>

<fieldset>
  <legend>3. 결제</legend>
  <button onclick="openPayWindow()">카드 결제창 열기</button>
  <button onclick="refreshOrder()">주문 상태 새로고침</button>
</fieldset>

<pre id="log"></pre>

<script>
let currentOrder = null;
const log = (label, data) => {
  document.getElementById('log').textContent =
    '[' + label + ']\\n' + JSON.stringify(data, null, 2) + '\\n\\n' + document.getElementById('log').textContent;
};
const api = async (path, opts = {}) => {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
};

async function login() {
  try {
    const r = await api('/api/auth/login', { method: 'POST', body: {
      username: document.getElementById('username').value,
      password: document.getElementById('password').value
    }});
    document.getElementById('loginStatus').textContent = '✓ ' + r.member.username;
    const products = await api('/api/products');
    document.getElementById('productId').innerHTML = products
      .map(p => '<option value="' + p.id + '">' + p.name + ' (' + p.price + '원)</option>').join('');
    log('login', r);
  } catch (e) { log('login FAIL', e); }
}

async function createOrder() {
  try {
    currentOrder = await api('/api/orders', { method: 'POST', body: {
      productId: Number(document.getElementById('productId').value),
      paymentMethod: Number(document.getElementById('method').value),
      flexUsername: document.getElementById('flexUsername').value,
      flexPassword: document.getElementById('flexPassword').value,
      payerName: document.getElementById('payerName').value || undefined
    }});
    log('order created', currentOrder);
  } catch (e) { log('order FAIL', e); }
}

async function openPayWindow() {
  if (!currentOrder) return log('pay', '주문을 먼저 생성하세요');
  try {
    const ready = await api('/api/payments/ready', { method: 'POST', body: { orderNo: currentOrder.orderNo } });
    log('ready', ready);
    const s = document.createElement('script');
    s.src = ready.sdkUrl;
    s.onload = () => {
      ready.params.nextUrl = location.origin + '/dev/hecto-test';
      ready.params.cancUrl = location.origin + '/dev/hecto-test';
      SETTLE_PG.pay(ready.params, (rsp) => log('pay result', rsp));
    };
    s.onerror = () => log('pay', 'SDK 로드 실패: ' + ready.sdkUrl);
    document.head.appendChild(s);
  } catch (e) { log('ready FAIL', e); }
}

async function refreshOrder() {
  if (!currentOrder) return log('refresh', '주문을 먼저 생성하세요');
  try { log('order status', await api('/api/orders/' + currentOrder.orderNo)); }
  catch (e) { log('refresh FAIL', e); }
}
</script>
</body>
</html>`

router.get('/dev/hecto-test', (ctx) => {
  ctx.type = 'html'
  ctx.body = PAGE
})

module.exports = router
