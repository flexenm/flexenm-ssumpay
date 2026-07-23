import type { LucideIcon } from "lucide-react";
import { LayoutGrid, Tv2, Gamepad2, BookOpen, Gift } from "lucide-react";
import bannerBroadcast from "../assets/img/banner-broadcast.png";
import bannerGame from "../assets/img/banner-game.png";
import bannerWebtoon from "../assets/img/banner-webtoon.png";
import bannerGiftcard from "../assets/img/banner-giftcard.png";

/**
 * 상품 카테고리 단일 소스(SSOT).
 *
 * URL 패턴:
 *   전체상품               /products
 *   방송                   /products/broadcast
 *   방송 > 플렉스티비      /products/broadcast/flextv
 *   게임                   /products/game
 *   (웹툰·상품권 동일 패턴)
 *
 * slug 규칙: URL 세그먼트는 DB subcategory 값과 동일하게 둔다.
 * 단 하나의 예외 — `flex`(플렉스티비)는 공개 URL용 별칭 `flextv` 를 쓰고,
 * API 호출 시 `subcategory` 로 다시 매핑한다.
 */

export interface ProductSubConfig {
  slug: string; // URL 세그먼트 (예: "flextv")
  label: string; // 화면 표시명 (예: "플렉스티비")
  subcategory: string; // API/DB 값 (예: "flex")
}

export interface ProductCategoryConfig {
  slug: string | null; // URL 세그먼트. null = 전체상품(/products)
  category: string | null; // API 값. null = 전체
  label: string;
  desc: string;
  Icon: LucideIcon;
  banner: string;
  subs: ProductSubConfig[];
}

export const productCategories: ProductCategoryConfig[] = [
  {
    slug: null,
    category: null,
    label: "전체상품",
    desc: "다양한 상품을 확인해보세요",
    Icon: LayoutGrid,
    banner: bannerBroadcast,
    subs: [],
  },
  {
    slug: "broadcast",
    category: "broadcast",
    label: "방송",
    desc: "다양한 방송 플랫폼 관련 상품을 확인해보세요",
    Icon: Tv2,
    banner: bannerBroadcast,
    subs: [
      { slug: "flextv", label: "플렉스티비", subcategory: "flex" },
      { slug: "soop", label: "SOOP", subcategory: "soop" },
      { slug: "popcorn", label: "팝콘티비", subcategory: "popcorn" },
      { slug: "panda", label: "팬더", subcategory: "panda" },
    ],
  },
  {
    slug: "game",
    category: "game",
    label: "게임",
    desc: "다양한 게임 플랫폼 관련 상품을 확인해보세요",
    Icon: Gamepad2,
    banner: bannerGame,
    subs: [
      { slug: "lol", label: "리그오브레전드", subcategory: "lol" },
      { slug: "maple", label: "메이플스토리", subcategory: "maple" },
      { slug: "genshin", label: "원신", subcategory: "genshin" },
    ],
  },
  {
    slug: "webtoon",
    category: "webtoon",
    label: "웹툰",
    desc: "다양한 웹툰 플랫폼 관련 상품을 확인해보세요",
    Icon: BookOpen,
    banner: bannerWebtoon,
    subs: [{ slug: "toon", label: "투네이션", subcategory: "toon" }],
  },
  {
    slug: "giftcard",
    category: "giftcard",
    label: "상품권",
    desc: "다양한 상품권 관련 상품을 확인해보세요",
    Icon: Gift,
    banner: bannerGiftcard,
    subs: [{ slug: "culture", label: "컬처랜드", subcategory: "culture" }],
  },
];

/** 전체상품(카테고리 없음) 항목 */
export const ALL_CATEGORY = productCategories[0];

/**
 * URL slug 로 카테고리 설정을 찾는다.
 * slug 없음 → 전체상품. 매칭 실패 → undefined(호출부에서 리다이렉트 처리).
 */
export function resolveCategory(
  slug?: string,
): ProductCategoryConfig | undefined {
  if (!slug) return ALL_CATEGORY;
  return productCategories.find((c) => c.slug === slug);
}

/** 카테고리 내에서 하위 slug 로 서브카테고리 설정을 찾는다. */
export function resolveSub(
  category: ProductCategoryConfig,
  slug?: string,
): ProductSubConfig | undefined {
  if (!slug) return undefined;
  return category.subs.find((s) => s.slug === slug);
}
