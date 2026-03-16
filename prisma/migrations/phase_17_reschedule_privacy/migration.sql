-- Phase 17 Migration: 改约/取消安全链接、隐私同意与数据管理

-- 1. 在 Appointment 表中添加字段
ALTER TABLE `Appointment` ADD COLUMN `rescheduleToken` VARCHAR(191) UNIQUE;
ALTER TABLE `Appointment` ADD COLUMN `rescheduleTokenExpires` DATETIME(3);
ALTER TABLE `Appointment` ADD COLUMN `cancelToken` VARCHAR(191) UNIQUE;
ALTER TABLE `Appointment` ADD COLUMN `cancelTokenExpires` DATETIME(3);
ALTER TABLE `Appointment` ADD COLUMN `privacyConsent` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `Appointment` ADD COLUMN `privacyConsentAt` DATETIME(3);
ALTER TABLE `Appointment` ADD COLUMN `dataDeleteRequestedAt` DATETIME(3);
ALTER TABLE `Appointment` ADD COLUMN `dataDeletedAt` DATETIME(3);

-- 2. 为改约/取消 token 添加索引
CREATE INDEX `Appointment_rescheduleToken_idx` ON `Appointment`(`rescheduleToken`);
CREATE INDEX `Appointment_cancelToken_idx` ON `Appointment`(`cancelToken`);
CREATE INDEX `Appointment_dataDeleteRequestedAt_idx` ON `Appointment`(`dataDeleteRequestedAt`);

-- 3. 创建预约改约历史表
CREATE TABLE `AppointmentAudit` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `appointmentId` INT NOT NULL,
    `appointmentUuid` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `oldAppointmentDate` DATETIME(3),
    `oldAppointmentTime` VARCHAR(191),
    `newAppointmentDate` DATETIME(3),
    `newAppointmentTime` VARCHAR(191),
    `reason` VARCHAR(500),
    `customerEmail` VARCHAR(191),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AppointmentAudit_appointmentId_idx`(`appointmentId`),
    INDEX `AppointmentAudit_appointmentUuid_idx`(`appointmentUuid`),
    INDEX `AppointmentAudit_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
