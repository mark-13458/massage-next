-- CreateTable - AuditLog
CREATE TABLE `AuditLog` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `action` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` INT,
    `changedBy` INT,
    `oldValue` JSON,
    `newValue` JSON,
    `ipAddress` VARCHAR(191),
    `userAgent` VARCHAR(500),
    `additionalInfo` JSON,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_action_idx`(`action`),
    INDEX `AuditLog_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable - BookingFrequencyLimit
CREATE TABLE `BookingFrequencyLimit` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `limitType` VARCHAR(191) NOT NULL,
    `limitValue` VARCHAR(191) NOT NULL,
    `bookingCount` INT NOT NULL DEFAULT 1,
    `lastAttemptAt` DATETIME(3) NOT NULL,
    `windowStart` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `BookingFrequencyLimit_limitType_limitValue_windowStart_key`(`limitType`, `limitValue`, `windowStart`),
    INDEX `BookingFrequencyLimit_limitType_limitValue_idx`(`limitType`, `limitValue`),
    INDEX `BookingFrequencyLimit_lastAttemptAt_idx`(`lastAttemptAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable - LoginAttempt
CREATE TABLE `LoginAttempt` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `success` BOOLEAN NOT NULL,
    `ipAddress` VARCHAR(191),
    `userAgent` VARCHAR(500),
    `failureReason` VARCHAR(500),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LoginAttempt_email_createdAt_idx`(`email`, `createdAt`),
    INDEX `LoginAttempt_success_idx`(`success`),
    INDEX `LoginAttempt_ipAddress_idx`(`ipAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_changedBy_fkey` FOREIGN KEY (`changedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
