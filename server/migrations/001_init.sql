-- ssumpay DB 초기 스키마

CREATE DATABASE IF NOT EXISTS ssumpay DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ssumpay;

-- 관리자
CREATE TABLE IF NOT EXISTS admins (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  name        VARCHAR(50)  NOT NULL,
  email       VARCHAR(100) NOT NULL,
  isActive    TINYINT(1)   NOT NULL DEFAULT 1,
  createdAt   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- 관리자 허용 IP
CREATE TABLE IF NOT EXISTS admin_allowed_ips (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ipAddress   VARCHAR(45)  NOT NULL,
  memo        VARCHAR(100),
  createdAt   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ip (ipAddress)
) ENGINE=InnoDB;

-- 회원
CREATE TABLE IF NOT EXISTS members (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,
  name          VARCHAR(50)  NOT NULL,
  email         VARCHAR(100) NOT NULL UNIQUE,
  phone         VARCHAR(20),
  flexUsername  VARCHAR(100) COMMENT 'FlexTV 아이디 (주문 시 입력, 저장용)',
  status        TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '0:정상 1:차단',
  createdAt     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- 비밀번호 재설정 토큰
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  memberId    INT UNSIGNED NOT NULL,
  token       VARCHAR(100) NOT NULL UNIQUE,
  expiresAt   DATETIME     NOT NULL,
  usedAt      DATETIME,
  createdAt   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_memberId (memberId)
) ENGINE=InnoDB;

-- 상품
CREATE TABLE IF NOT EXISTS products (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  category    VARCHAR(30)   NOT NULL COMMENT 'broadcast/game/webtoon/giftcard',
  subcategory VARCHAR(30)   NOT NULL COMMENT 'flex/soop/toon/popcorn/panda',
  name        VARCHAR(100)  NOT NULL,
  price       INT UNSIGNED  NOT NULL COMMENT '원화 가격',
  lexAmount   INT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '지급할 LEX (방송 카테고리)',
  coinAmount  INT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '지급할 코인 (기타)',
  isActive    TINYINT(1)    NOT NULL DEFAULT 1,
  sortOrder   INT           NOT NULL DEFAULT 0,
  createdAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_category (category, subcategory, isActive)
) ENGINE=InnoDB;

-- 주문
CREATE TABLE IF NOT EXISTS orders (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  orderNo         VARCHAR(30)   NOT NULL UNIQUE COMMENT '주문번호 (YYYYMMDDHHMMSS + 랜덤)',
  memberId        INT UNSIGNED  NOT NULL,
  productId       INT UNSIGNED  NOT NULL,
  productName     VARCHAR(100)  NOT NULL,
  price           INT UNSIGNED  NOT NULL,
  flexUsername    VARCHAR(100)  COMMENT '충전 대상 FlexTV 아이디',
  paymentMethod   TINYINT       NOT NULL DEFAULT 1 COMMENT '1:카드 2:계좌이체',
  paymentStatus   TINYINT       NOT NULL DEFAULT 0 COMMENT '0:대기 1:완료 2:취소',
  chargeStatus    TINYINT       NOT NULL DEFAULT 0 COMMENT '0:대기 1:완료 2:환불',
  pgTrxNo         VARCHAR(100)  COMMENT 'PG 거래번호',
  pgTid           VARCHAR(100)  COMMENT 'PG TID',
  paidAt          DATETIME,
  chargedAt       DATETIME,
  ipAddr          VARCHAR(45),
  memo            VARCHAR(500)  COMMENT '관리자 메모',
  createdAt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_memberId (memberId),
  KEY idx_orderNo (orderNo),
  KEY idx_paymentStatus (paymentStatus, chargeStatus),
  KEY idx_createdAt (createdAt)
) ENGINE=InnoDB;

-- 공지사항
CREATE TABLE IF NOT EXISTS notices (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title       VARCHAR(200) NOT NULL,
  content     MEDIUMTEXT   NOT NULL,
  isPinned    TINYINT(1)   NOT NULL DEFAULT 0,
  isActive    TINYINT(1)   NOT NULL DEFAULT 1,
  viewCount   INT UNSIGNED NOT NULL DEFAULT 0,
  createdAt   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- 1:1 문의
CREATE TABLE IF NOT EXISTS inquiries (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  memberId    INT UNSIGNED NOT NULL,
  type        TINYINT      NOT NULL COMMENT '1:충전 2:결제 3:취소환불 4:기타',
  title       VARCHAR(200) NOT NULL,
  content     TEXT         NOT NULL,
  status      TINYINT      NOT NULL DEFAULT 0 COMMENT '0:답변대기 1:답변완료',
  answer      TEXT,
  answeredAt  DATETIME,
  createdAt   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_memberId (memberId),
  KEY idx_status (status)
) ENGINE=InnoDB;
