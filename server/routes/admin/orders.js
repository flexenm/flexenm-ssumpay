const Router = require("koa-router");
const orderService = require("../../services/order");
const { wrap } = require("../shared/handler-wrap");

const router = new Router();

router.get(
  "/",
  wrap(
    async ({
      page = 1,
      limit = 20,
      paymentStatus,
      chargeStatus,
      keyword,
      startDate,
      endDate,
    }) => {
      const { items, total } = await orderService.searchForAdmin({
        page,
        limit,
        paymentStatus,
        chargeStatus,
        keyword,
        startDate,
        endDate,
      });
      return { items, total, page: Number(page), limit: Number(limit) };
    },
  ),
);

router.get(
  "/:id",
  wrap(async ({ id }) => {
    return await orderService.getByIdForAdmin(id);
  }),
);

// 무통장입금 수동 결제확인 — 입금자명 대조 후 관리자가 직접 확인 처리한다.
router.patch(
  "/:id/payment-confirm",
  wrap(async ({ id, caller, ...body }) => {
    await orderService.confirmPaymentManually(id, caller, body);
    return { message: "결제가 확인 처리되었습니다." };
  }),
);

// 결제 취소 — 카드·결제완료 건은 헥토 승인취소까지 수행한다.
router.post(
  "/:id/cancel",
  wrap(async ({ id }) => {
    await orderService.cancelPaymentByAdmin(id);
    return { message: "결제가 취소되었습니다." };
  })
);

router.patch(
  "/:id/charge-status",
  wrap(async ({ id, chargeStatus, memo }) => {
    await orderService.updateChargeStatus(id, { chargeStatus, memo });
    return { message: "충전 상태가 변경되었습니다." };
  }),
);

router.patch(
  "/:id/memo",
  wrap(async ({ id, memo }) => {
    await orderService.updateMemo(id, memo);
    return { message: "메모가 저장되었습니다." };
  }),
);

module.exports = router;
