CREATE TABLE `Comment` (
	`comment_idx`	INT(10)	NOT NULL,
	`shop_id`	INT(10)	NOT NULL,
	`user_id`	INT(100)	NOT NULL,
	`contents`	TEXT	NULL,
	`reg_dtm`	DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
	`score`	INT(10)	NULL
);

CREATE TABLE `Cart` (
	`user_id`	INT(100)	NOT NULL,
	`shop_id`	INT(10)	NOT NULL
);

CREATE TABLE `Shop` (
	`shop_id`	INT(10)	NOT NULL,
	`user_id`	INT(100)	NOT NULL,
	`shop_name`	VARCHAR(100)	NULL,
	`shop_addr`	VARCHAR(255)	NULL,
	`telno`	VARCHAR(15)	NULL,
	`latitude`	FLOAT	NULL,
	`longitude`	FLOAT	NULL,
	`shop_url`	VARCHAR(255)	NULL,
	`Field`	TEXT	NULL,
	`reg_dtm`	DATETIME NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `Shop_Category` (
	`shop_id`	INT(10)	NOT NULL,
	`category_name`	VARCHAR(50)	NULL
);

CREATE TABLE `User` (
	`user_id`	INT(100)	NOT NULL,
    	`user_email`	VARCHAR(50)	NULL,
	`user_name`	VARCHAR(100)	NULL,
	`user_nickname`	VARCHAR(100)   NULL,
	`user_password`	VARCHAR(10000)	NULL,
	`user_phonenumber`	VARCHAR(100)	NULL,
	`user_snsid`	VARCHAR(1000)	NULL,
	`user_imageaddr`	VARCHAR(1000)	NULL
);

CREATE TABLE `Shop_Img` (
	`shop_id`	INT(10)	NOT NULL,
	`image`	VARCHAR(255)	NULL
);

-- 기본키 및 일련번호 auto_increment

ALTER TABLE `Comment` ADD CONSTRAINT `PK_COMMENT` PRIMARY KEY (
	`comment_idx`
);

alter table `Comment` modify `comment_idx` int not null auto_increment;

ALTER TABLE `Shop` ADD CONSTRAINT `PK_SHOP` PRIMARY KEY (
	`shop_id`
);

alter table `Shop` modify `shop_id` int not null auto_increment;

ALTER TABLE `User` ADD CONSTRAINT `PK_USER` PRIMARY KEY (
	`user_id`
);
alter table `User` modify `user_id` int not null auto_increment;
-- 외래키

ALTER TABLE `Comment` ADD CONSTRAINT `FK_Shop_TO_Comment_1` FOREIGN KEY (
	`shop_id`
)
REFERENCES `Shop` (
	`shop_id`
);

ALTER TABLE `Comment` ADD CONSTRAINT `FK_User_TO_Comment_1` FOREIGN KEY (
	`user_id`
)
REFERENCES `User` (
	`user_id`
);

ALTER TABLE `Cart` ADD CONSTRAINT `FK_User_TO_Cart_1` FOREIGN KEY (
	`user_id`
)
REFERENCES `User` (
	`user_id`
);

ALTER TABLE `Cart` ADD CONSTRAINT `FK_Shop_TO_Cart_1` FOREIGN KEY (
	`shop_id`
)
REFERENCES `Shop` (
	`shop_id`
);

ALTER TABLE `Shop` ADD CONSTRAINT `FK_User_TO_Shop_1` FOREIGN KEY (
	`user_id`
)
REFERENCES `User` (
	`user_id`
);

ALTER TABLE `Shop_Category` ADD CONSTRAINT `FK_Shop_TO_Shop_Category_1` FOREIGN KEY (
	`shop_id`
)
REFERENCES `Shop` (
	`shop_id`
);

ALTER TABLE `Shop_Img` ADD CONSTRAINT `FK_Shop_TO_Shop_Img_1` FOREIGN KEY (
	`shop_id`
)
REFERENCES `Shop` (
	`shop_id`
);


