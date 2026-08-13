// FlexTV(flextv-web/server/routes/shared/router-handler-wrap.js)의 v1 wrap 패턴을
// ssumpay에 맞게 경량화한 모듈. i18n·채널링 등 FlexTV 전용 로직은 제외.
class ClientError {
  constructor(status, body = {}) {
    this.status = status
    this.body = body
  }
}

// query/params/body를 병합해 핸들러에 주입할 파라미터 객체를 만든다.
// caller: 인증된 회원 id (관리자 라우트에서는 관리자 id). 미인증이면 0.
function getParamsFromContext(ctx) {
  const params = ctx.method.toUpperCase() === 'GET'
    ? { ...ctx.query, ...ctx.params }
    : { ...ctx.request.body, ...ctx.params }
  params.caller = ctx.state.member?.id ?? ctx.state.admin?.id ?? 0
  return params
}

function getResponse(response) {
  if (response instanceof ClientError) {
    // web 에러 처리가 { message } 형태를 기대하므로 문자열 body는 정규화한다.
    const body = typeof response.body === 'string' ? { message: response.body } : response.body
    return { status: response.status, body }
  }
  if (response) {
    return { status: 200, body: response }
  }
  return { status: 204 }
}

// 핸들러 리턴 값이 곧 응답 body가 된다. truthy → 200, falsy → 204,
// ClientError 리턴 → 해당 status. 에러 throw는 잡지 않고 전역 핸들러로 전파한다.
function wrap(handler) {
  return async function controllerHandler(ctx) {
    const params = getParamsFromContext(ctx)
    const response = await handler(params, ctx)
    const { status, body } = getResponse(response)
    ctx.status = status
    if (body !== undefined) ctx.body = body
  }
}

module.exports = { wrap, ClientError, getParamsFromContext }
