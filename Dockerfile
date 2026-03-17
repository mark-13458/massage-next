FROM node:20-bullseye-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci || npm install
RUN npx prisma generate

FROM node:20-bullseye-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
ENV DATABASE_URL="mysql://user:password@localhost:3306/db"
COPY . .
RUN npm run build

# 单独安装 prisma CLI（仅用于 migrate，不污染 standalone）
FROM node:20-bullseye-slim AS prisma-cli
WORKDIR /app/prisma-cli
RUN npm init -y && npm install prisma@5.9.1

FROM node:20-bullseye-slim AS run
WORKDIR /app
ENV NODE_ENV=production

# standalone 产物
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

# prisma CLI（用于 migrate deploy）
COPY --from=prisma-cli /app/prisma-cli ./prisma-cli

# seed 依赖（bcryptjs）
COPY --from=deps /app/node_modules/bcryptjs ./node_modules/bcryptjs

# 启动脚本
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000
CMD ["/docker-entrypoint.sh"]
