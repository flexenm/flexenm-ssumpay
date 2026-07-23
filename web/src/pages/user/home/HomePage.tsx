import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import heroMain from "../../../assets/img/hero-main.png";
import heroEllipse from "../../../assets/img/hero-ellipse.svg";
import catBroadcast from "../../../assets/img/cat-broadcast.png";
import catGame from "../../../assets/img/cat-game.png";
import catWebtoon from "../../../assets/img/cat-webtoon.png";
import catGiftcard from "../../../assets/img/cat-giftcard.png";

const categories = [
  {
    key: "broadcast",
    label: "방송",
    desc: "플렉스티비·SOOP·투네이션 등",
    img: catBroadcast,
  },
  {
    key: "game",
    label: "게임",
    desc: "리그오브레전드·메이플스토리·원신 등",
    img: catGame,
  },
  {
    key: "webtoon",
    label: "웹툰",
    desc: "네이버웹툰·카카오웹툰 등",
    img: catWebtoon,
  },
  {
    key: "giftcard",
    label: "상품권",
    desc: "문화상품권·해피머니·도서상품권 등",
    img: catGiftcard,
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-hero">
        <img
          src={heroEllipse}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 z-0 w-[600px] max-w-none opacity-60"
        />
        <div className="relative z-10 mx-auto flex max-w-[1200px] items-center justify-between gap-10 px-10 py-24">
          <div>
            <h1 className="text-[50px] font-bold leading-[1.25] text-ink">
              <span className="text-primary">간편</span>하고{" "}
              <span className="text-primary">안전한 결제</span>,
              <br />
              썸페이와 함께하세요
            </h1>
            <p className="mt-5 text-[20px] leading-[1.5] text-ink/60">
              방송, 게임, 웹툰, 상품권까지
              <br />
              모든 결제를 썸페이에서 한번에 해결할 수 있어요
            </p>
          </div>
          <img
            src={heroMain}
            alt="썸페이 안전 결제"
            className="w-[440px] max-w-full shrink-0"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mx-auto my-[80px] max-w-[1200px] px-10">
        <h2 className="text-center text-[30px] font-bold leading-[1.3] text-ink">
          원하는 서비스를
          <br />
          <span className="text-primary">빠르고 안전하게</span> 결제하세요
        </h2>
        <p className="mb-12 mt-3 text-center text-[16px] text-ink/50">
          방송, 게임, 웹툰, 상품권까지 모두 한번에!
        </p>
        <div className="grid grid-cols-4 gap-4">
          {categories.map((c) => (
            <div
              key={c.key}
              onClick={() => navigate(`/products?category=${c.key}`)}
              className="flex cursor-pointer flex-col items-center rounded-[20px] bg-page px-6 py-10 text-center transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
            >
              <img src={c.img} alt={c.label} className="mb-5 h-[88px] w-[88px] object-contain" />
              <h3 className="mb-2 text-[24px] font-bold text-ink">{c.label}</h3>
              <p className="mb-6 text-[14px] text-ink/50">{c.desc}</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/products?category=${c.key}`);
                }}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-primary bg-transparent px-4 py-1.5 text-[13px] font-medium text-primary transition-colors hover:bg-primary hover:text-white"
              >
                상품 보러가기
                <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
