// 서버(server/utils/validators.js)와 동일한 규칙을 유지할 것
// 영문과 숫자를 모두 포함한 4~16자 (영문만/숫자만 불가)
export const USERNAME_REGEX = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{4,16}$/;
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~`!?@#$%^&*()\-+=]).{8,}$/;
// 이메일: 공백 없이 @ 와 도메인 내 . 필수 (실무 표준 패턴)
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 이름: 한글·영문 2~20자, 공백은 중간에만 허용 (실명 필드)
export const NAME_REGEX = /^[가-힣a-zA-Z][가-힣a-zA-Z\s]{0,18}[가-힣a-zA-Z]$/;

export const ERROR_MSG = {
  username: "아이디는 영문과 숫자를 모두 포함한 4~16자여야 합니다.",
  password: "비밀번호는 8자 이상, 영문·숫자·특수문자를 각각 1개 이상 포함해야 합니다.",
  email: "올바른 이메일 형식이 아닙니다.",
  name: "이름은 한글 또는 영문 2~20자여야 합니다.",
} as const;

// 서버(normalizeEmail)와 동일: 대소문자만 다른 이메일 중복 방지
export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
