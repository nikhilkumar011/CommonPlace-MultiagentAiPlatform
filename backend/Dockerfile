ARG SERVICE_PATH

FROM node:22-bookworm-slim AS build
ARG SERVICE_PATH
WORKDIR /app/backend
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
WORKDIR /app/backend/${SERVICE_PATH}
COPY ${SERVICE_PATH}/package.json ${SERVICE_PATH}/package-lock.json ./
RUN npm ci
COPY ${SERVICE_PATH}/tsconfig.json ./
COPY ${SERVICE_PATH}/src ./src
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-bookworm-slim
ARG SERVICE_PATH
ENV NODE_ENV=production
WORKDIR /app/backend
COPY --from=build /app/backend/node_modules ./node_modules
COPY shared ./shared
WORKDIR /app/backend/${SERVICE_PATH}
COPY --from=build /app/backend/${SERVICE_PATH}/node_modules ./node_modules
COPY --from=build /app/backend/${SERVICE_PATH}/dist ./dist
USER node
CMD ["node", "dist/index.js"]
