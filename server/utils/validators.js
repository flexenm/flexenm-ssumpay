// 영문과 숫자를 모두 포함한 4~16자 (영문만/숫자만 불가)
const USERNAME_REGEX = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{4,16}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~`!?@#$%^&*()\-+=]).{8,}$/;

function validateUsername(username) {
  if (!username) return "아이디를 입력해주세요.";
  if (!USERNAME_REGEX.test(username))
    return "아이디는 영문과 숫자를 모두 포함한 4~16자여야 합니다.";
  return null;
}

function validatePassword(password) {
  if (!password) return "비밀번호를 입력해주세요.";
  if (!PASSWORD_REGEX.test(password))
    return "비밀번호는 8자 이상, 영문·숫자·특수문자를 각각 1개 이상 포함해야 합니다.";
  return null;
}

module.exports = { USERNAME_REGEX, PASSWORD_REGEX, validateUsername, validatePassword };
