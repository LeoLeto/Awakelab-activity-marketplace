# Dockerfile para desplegar TODO el Marketplace como un único servicio en la
# nube (Render, Railway, Fly.io...) — PHP y el servicio de capturas
# (Node + Chromium) corren juntos en el mismo contenedor, hablando entre sí
# por localhost. Esto es distinto de como funciona en local: ahí
# docker-compose usa DOS contenedores separados (ver docker-compose.yml),
# porque el desarrollo va más cómodo así (código montado en caliente) y
# porque en local no hay ninguna restricción de plan que lo impida. Aquí se
# combinan en uno solo porque el plan gratuito de Render no permite
# "servicios privados" (el segundo contenedor que se usa en local).
FROM ghcr.io/puppeteer/puppeteer:latest

USER root
WORKDIR /app

# La instalación de npm va primero porque es la más lenta (~2 min): así, si
# hace falta ajustar los paquetes de PHP más adelante, no hay que repetirla.
COPY screenshot-service/package.json ./screenshot-service/package.json
RUN cd screenshot-service && npm install --omit=dev

RUN apt-get update && apt-get install -y --no-install-recommends \
    php-cli php-sqlite3 php-curl php-mbstring \
    && rm -rf /var/lib/apt/lists/*

COPY . .

# El servicio de capturas escucha siempre en el 4000, solo accesible desde
# dentro del propio contenedor (no se publica ningún puerto para él). El
# servidor PHP sí tiene que escuchar en el puerto que asigne la plataforma
# (variable de entorno PORT); 8000 es solo el valor por defecto para cuando
# se ejecuta esta imagen suelta, sin esa variable.
ENV PORT=8000
ENV SCREENSHOT_SERVICE_URL=http://localhost:4000/shot
EXPOSE 8000
CMD ["sh", "-c", "PORT=4000 node screenshot-service/server.js & php -S 0.0.0.0:${PORT} -t public"]
