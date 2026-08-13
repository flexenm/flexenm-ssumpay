/**
 * 결제창 호출 — 헥토파이낸셜 JavaScript SDK(`SettlePG`) 방식
 *
 * 헥토는 결제창 호출 방법을 두 가지 제공한다.
 *   1) SDK        — SettlePG_v1.2.js 를 로드하고 SETTLE_PG.pay() 호출   ← 우리가 쓰는 방식
 *   2) FORM-SUBMIT — 결제수단별 URL 로 hidden input 폼을 직접 POST
 * 두 방식은 같은 결제창을 같은 파라미터로 호출한다. 둘 다 콜백 함수가 없어서
 * 결제 결과는 어느 쪽이든 nextUrl(화면) · notiUrl(확정)로만 받는다.
 *
 * SDK 를 고른 이유:
 *   - 나중에 결제창을 팝업으로 띄울 때 창을 열고 폼을 그 안으로 제출하는 배선을
 *     SDK 가 대신해준다 → ui.type 만 'popup' 으로 바꾸면 된다.
 *   - 결제수단이 늘어도 경로 매핑(/card · /vbank · /bank …)을 프론트가 들지 않는다.
 *     method 값만 바꾸면 SDK 가 라우팅한다.
 *
 * SDK 가 해주지 '않는' 것 (팝업으로 갈 때 직접 만들어야 함):
 *   - 팝업이 부모에게 결과를 알리고 스스로 닫는 처리
 *     → 서버 콜백(/api/callback/hecto/return)이 302 대신
 *       window.opener.location = ...; window.close(); 를 담은 HTML 을 반환해야 한다
 *   - 팝업 차단 감지·안내
 *
 * 암호화(trdAmt)와 해시(pktHash)는 서버가 만든다. 헥토 문서상 암호화·해시 키는
 * 클라이언트에 노출해서는 안 되므로, 프론트는 받은 전문을 가공하지 않고 그대로 넘긴다.
 */

// 결제창 도메인. 아래 SDK 스크립트 URL 자체가 환경별로 갈려(tbnpg / npg) 프론트가 가진다.
// ⚠️ 서버의 HECTO_MCHT_ID 와 같은 환경을 가리켜야 한다 — 어긋나면 헥토가 해시 불일치로 거부한다.
//    한쪽만 운영으로 바꾸는 실수가 나오기 쉬우니 배포 시 함께 확인할 것.
const HECTO_ENV = import.meta.env.VITE_HECTO_ENV as string | undefined;

// 버전이 URL 에 박혀 있다 — 헥토가 새 버전을 내면 여기를 직접 올려야 한다.
const SDK_PATH = "/resources/js/v1/SettlePG_v1.2.js";

type PaymentUiType = "self" | "popup" | "blank";

interface PaymentUi {
  type: PaymentUiType;
  width?: number;
  height?: number;
}

// 결제 전문 필드(문자열)와 SDK 전용 필드(env·ui)가 한 객체에 섞여 들어간다.
interface SettlePGPayArgs {
  [field: string]: string | PaymentUi | undefined;
  env: string;
  ui: PaymentUi;
}

interface SettlePG {
  pay: (args: SettlePGPayArgs) => void;
}

declare global {
  interface Window {
    SETTLE_PG?: SettlePG;
  }
}

// 결제 시점에만 스크립트를 받는다 — 결제와 무관한 페이지에 외부 스크립트를 얹지 않으려고.
// 여러 번 눌려도 로드는 한 번만 일어나도록 진행 중인 Promise 를 재사용한다.
let sdkLoading: Promise<void> | null = null;

function loadPaymentSdk(): Promise<void> {
  if (window.SETTLE_PG) return Promise.resolve();
  if (sdkLoading) return sdkLoading;

  sdkLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${HECTO_ENV}${SDK_PATH}`;
    script.onload = () => resolve();
    script.onerror = () => {
      // 실패한 Promise 를 남겨두면 다음 시도까지 영구히 실패한다.
      sdkLoading = null;
      reject(new Error("결제 모듈을 불러오지 못했습니다."));
    };
    document.head.appendChild(script);
  });

  return sdkLoading;
}

// params 는 서버가 만든 전문을 그대로 넘긴다 (암호화·해시가 들어있어 가공하면 깨진다).
export async function openPaymentWindow(
  params: Record<string, string>,
  uiType: PaymentUiType = "self",
) {
  if (!HECTO_ENV) throw new Error("결제 설정이 없습니다.");

  await loadPaymentSdk();
  window.SETTLE_PG!.pay({ ...params, env: HECTO_ENV, ui: { type: uiType } });
}
