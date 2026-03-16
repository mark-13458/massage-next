-- Phase 48 Migration: 安全索引 + 性能优化

-- 为 Appointment 表添加高频查询字段索引
CREATE INDEX `Appointment_confirmationToken_idx` ON `Appointment`(`confirmationToken`);
CREATE INDEX `Appointment_status_idx` ON `Appointment`(`status`);
CREATE INDEX `Appointment_appointmentDate_idx` ON `Appointment`(`appointmentDate`);
CREATE INDEX `Appointment_customerPhone_idx` ON `Appointment`(`customerPhone`);
CREATE INDEX `Appointment_customerEmail_idx` ON `Appointment`(`customerEmail`);
