# Server Layer Guide

后台服务端代码分为三层：

## 1. repositories/admin
负责后台数据读取与 Prisma 访问。

示例：
- `dashboard.repository.ts`
- `booking.repository.ts`
- `service.repository.ts`
- `content.repository.ts`
- `media.repository.ts`
- `settings.repository.ts`

## 2. services
负责模块级业务组合与对页面暴露稳定接口。

示例：
- `admin-dashboard.service.ts`
- `admin-booking.service.ts`
- `admin-service.service.ts`
- `admin-content.service.ts`
- `admin-media.service.ts`
- `admin-settings.service.ts`

## 3. view-models/admin
负责把底层数据整理为页面直接可消费的结构。

示例：
- `booking.vm.ts`
- `service.vm.ts`
- `media.vm.ts`
- `settings.vm.ts`
- `shared/formatters.ts`
- `shared/mappers.ts`

## 原则

- repository：尽量只做数据访问
- service：尽量只做模块组合
- view model：尽量只做展示数据整理
- 页面层不要回退到直接 Prisma 访问
