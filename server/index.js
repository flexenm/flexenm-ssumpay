require("dotenv").config();

const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const helmet = require("koa-helmet");
const cors = require("@koa/cors");

const routes = require("./routes");

const app = new Koa();

app.proxy = true;

// ② 전역 에러 핸들러
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || err.statusCode || 500;
    if (ctx.status >= 500) {
      ctx.body = { message: "서버 오류가 발생했습니다." };
      console.error("[ERROR]", err);
    } else {
      ctx.body = { message: err.message };
    }
  }
});

const parseOrigins = (value, fallback) => {
  const origins = (value || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  return origins.length ? origins : fallback;
};

// 라우트 그룹별 허용 오리진. 인증이 HttpOnly 쿠키로 바뀌면서 두 SPA 가 같은 API 호스트를 공유하게
// 됐으므로, 오리진 화이트리스트를 하나로 두면 사용자 사이트의 XSS 가 credentials 를 실어 /admin/*
// 을 호출하고 응답까지 읽을 수 있다. 그룹을 나눠 그 경로를 막는다.
// (쿠키 Path 로는 막을 수 없다 — Path 는 요청 경로로 매칭되지 호출 오리진과 무관하다.)
const ALLOWED_ORIGINS = {
  "/admin": parseOrigins(process.env.ALLOWED_ORIGINS_ADMIN, [
    "http://localhost:5174",
  ]),
  "/api": parseOrigins(process.env.ALLOWED_ORIGINS_USER, [
    "http://localhost:5173",
  ]),
};

// ① CORS — 라우트 그룹별로 허용 오리진 명시
app.use(
  cors({
    origin: (ctx) => {
      const origin = ctx.get("Origin");
      const prefix = Object.keys(ALLOWED_ORIGINS).find((p) =>
        ctx.path.startsWith(p),
      );
      // 그룹 밖(/health, /webhooks/pg)은 브라우저 오리진을 허용하지 않는다.
      // 웹훅은 서버-투-서버라 CORS 헤더가 필요 없고, 서명 검증이 신뢰 경계다.
      if (!prefix) return "";
      return ALLOWED_ORIGINS[prefix].includes(origin) ? origin : "";
    },
    credentials: true,
  }),
);

app.use(helmet());
app.use(bodyParser());

app.use(routes.routes());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ssumpay-server running on port ${PORT}`);
});
