// 영문과 숫자를 모두 포함한 6~15자 (영문만/숫자만 불가)
const USERNAME_REGEX = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{6,15}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~`!?@#$%^&*()\-+=]).{8,15}$/;
// 이메일: 공백 없이 @ 와 도메인 내 . 필수 (실무 표준 패턴)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 이름: 한글·영문 2~20자, 공백은 중간에만 허용 (실명 필드)
const NAME_REGEX = /^[가-힣a-zA-Z][가-힣a-zA-Z\s]{0,18}[가-힣a-zA-Z]$/;

const dns = require('dns').promises

async function hasMxRecord(email) {
  const domain = email.split('@')[1]
  try {
    const mx = await dns.resolveMx(domain)
    return mx.length > 0
  } catch {
    return false
  }
}

// 대소문자만 다른 이메일이 별도 계정으로 가입되지 않도록
// 검증·중복확인·저장 전에 반드시 정규화를 거친다.
function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : email;
}

function validateUsername(username) {
  if (!username) return "아이디를 입력해주세요.";
  if (!USERNAME_REGEX.test(username))
    return "아이디는 영문과 숫자를 모두 포함한 6~15자여야 합니다.";
  return null;
}

function validatePassword(password) {
  if (!password) return "비밀번호를 입력해주세요.";
  if (!PASSWORD_REGEX.test(password))
    return "비밀번호는 8~15자 이내로, 영문·숫자·특수문자를 각각 1개 이상 포함해야 합니다.";
  return null;
}

function validateEmail(email) {
  if (!email) return "이메일을 입력해주세요.";
  if (typeof email !== "string") return "올바른 이메일 형식이 아닙니다.";
  if (email.length > 254 || !EMAIL_REGEX.test(email))
    return "올바른 이메일 형식이 아닙니다.";
  return null;
}

function validateName(name) {
  if (!name) return "이름을 입력해주세요.";
  if (!NAME_REGEX.test(name))
    return "이름은 한글 또는 영문 2~20자여야 합니다.";
  return null;
}

module.exports = {
  USERNAME_REGEX,
  PASSWORD_REGEX,
  EMAIL_REGEX,
  NAME_REGEX,
  normalizeEmail,
  hasMxRecord,
  validateUsername,
  validatePassword,
  validateEmail,
  validateName,
};
