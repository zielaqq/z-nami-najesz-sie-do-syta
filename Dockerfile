# Obraz do wdrożenia na Coolify (albo dowolnym hoście z Dockerem). Zwykły serwer Next.js
# (nie eksport statyczny) – działają na nim panel /panel, opinie z Google (/api/google-reviews)
# i optymalizacja zdjęć. Zmienne środowiskowe: patrz .env.example.
#
# Oficjalny obraz Node z publicznego lustra Amazona (ta sama zawartość co node:22-alpine
# na Docker Hubie). Serwer Coolify dochodzi do ghcr.io, a do registry-1.docker.io urywa
# mu się TLS – build padał zanim w ogóle zaczął instalować zależności.

FROM public.ecr.aws/docker/library/node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

FROM public.ecr.aws/docker/library/node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Zmienne NEXT_PUBLIC_* trafiają do kodu przeglądarki już podczas builda – w Coolify oznacz je
# jako dostępne w czasie builda ("Build Variable"), inaczej strona zbuduje się bez adresu Supabase.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY

RUN npm run build

FROM public.ecr.aws/docker/library/node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

# GOOGLE_PLACES_API_KEY i GOOGLE_PLACE_ID (bez prefiksu NEXT_PUBLIC_) czyta serwer w trakcie
# działania – wystarczy podać je jako zwykłe zmienne środowiskowe kontenera (bez czasu builda).
CMD ["node", "server.js"]
