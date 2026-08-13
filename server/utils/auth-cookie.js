const RefreshTokensRepo = require("../repositories/RefreshTokens");

// 쿠키 스코프. Path 는 전부 '/' 다.
// Path 를 좁혀 web/admin 을 격리하려는 시도는 성립하지 않는다 — Path 는 "요청 경로"로 매칭되지
// 요청을 보낸 오리진과 무관하다. 사용자 사이트에서 /admin/* 로 요청해도 Path=/admin 쿠키는 그대로 붙는다.
// (RFC 6265 §8.5 — Path 는 격리 수단이 아니다.) 실제 격리는 index.js 의 라우트 그룹별 CORS 가 담당한다.
// 반대로 Path 를 좁히면 /api 밖으로 엔드포인트가 하나라도 나가는 순간 인증이 조용히 깨진다.
// web/admin 구분은 쿠키 이름으로 한다 — 서버가 이름으로 골라 읽는다.
const COOKIE_NAMES = {
  member: { access: "accessToken", refresh: "refreshToken" },
  admin: { access: "adminAccessToken", refresh: "adminRefreshToken" },
};

// 삭제는 발급과 속성이 정확히 일치해야 브라우저가 쿠키를 지운다.
// path/sameSite/secure 중 하나라도 어긋나면 로그아웃이 조용히 실패하므로 옵션을 한 곳에서만 만든다.
function baseOptions(ctx) {
  // NODE_ENV 가 아니라 ctx.secure 로 게이트한다. app.proxy=true 라 ctx.secure 는 앞단의
  // X-Forwarded-Proto 에 좌우되는데, secure:true 인데 ctx.secure 가 false 면 Koa 가 예외를 던져
  // 로그인이 운영에서만 500 이 된다. 프록시가 잘못 설정돼도 예외 대신 non-secure 로 degrade 시킨다.
  //
  // 다만 degrade 는 "https 인데 Secure 없는 인증 쿠키"라 조용히 넘어가면 안 된다.
  // 운영에서 이 경고가 보이면 ALB/nginx 의 X-Forwarded-Proto 전달 설정이 빠진 것이다.
  if (!ctx.secure && process.env.NODE_ENV === "production") {
    console.warn(
      "[WARN] 인증 쿠키를 Secure 없이 발급합니다. 앞단이 X-Forwarded-Proto 를 전달하는지 확인하세요.",
    );
  }

  return {
    httpOnly: true,
    secure: ctx.secure,
    sameSite: "lax",
    path: "/",
    overwrite: true,
  };
}

function setAuthCookies(ctx, type, { accessToken, refreshToken, expiresIn }) {
  const names = COOKIE_NAMES[type];
  const options = baseOptions(ctx);

  ctx.cookies.set(names.access, accessToken, {
    ...options,
    maxAge: expiresIn * 1000,
  });
  ctx.cookies.set(names.refresh, refreshToken, {
    ...options,
    maxAge: RefreshTokensRepo.ttlFor(type) * 1000,
  });
}

function clearAuthCookies(ctx, type) {
  const names = COOKIE_NAMES[type];
  const options = baseOptions(ctx);

  // 값이 falsy 면 Koa 가 만료된 쿠키로 내려보낸다. 발급과 동일한 options 를 써야 실제로 지워진다.
  ctx.cookies.set(names.access, null, options);
  ctx.cookies.set(names.refresh, null, options);
}

function getAccessToken(ctx, type) {
  return ctx.cookies.get(COOKIE_NAMES[type].access);
}

function getRefreshToken(ctx, type) {
  return ctx.cookies.get(COOKIE_NAMES[type].refresh);
}

module.exports = {
  COOKIE_NAMES,
  setAuthCookies,
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
};
