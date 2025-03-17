FROM oven/bun:latest as builder
WORKDIR /app

COPY package.json .
COPY bun.lock .
COPY svelte.config.js .

RUN bun install --frozen-lockfile

COPY . .

RUN bun --bun run build

FROM oven/bun:alpine

WORKDIR /app

COPY --from=builder /app/build .

EXPOSE 3000

CMD ["bun", "--bun", "index.js"]
