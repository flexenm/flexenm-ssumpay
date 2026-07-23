// 서버(server/utils/validators.js)와 동일한 규칙을 유지할 것
// 영문과 숫자를 모두 포함한 4~16자 (영문만/숫자만 불가)
export const USERNAME_REGEX = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{4,16}$/;
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~`!?@#$%^&*()\-+=]).{8,}$/;

export const ERROR_MSG = {
  username: "아이디는 영문과 숫자를 모두 포함한 4~16자여야 합니다.",
  password: "비밀번호는 8자 이상, 영문·숫자·특수문자를 각각 1개 이상 포함해야 합니다.",
} as const;
