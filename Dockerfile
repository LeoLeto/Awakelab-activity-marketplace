# Dockerfile para desplegar el servicio "web" en una plataforma en la nube
# (Render, Railway, Fly.io...). En local NO se usa este archivo: el
# docker-compose.yml monta el código directamente desde la carpeta del
# proyecto para poder editar en caliente. Aquí, en cambio, el código se copia
# dentro de la imagen porque no hay ninguna carpeta local que montar.
FROM php:8.3-cli

WORKDIR /app
COPY . .

# Render (y plataformas similares) asignan el puerto mediante la variable de
# entorno PORT y esperan que la aplicación escuche justo ahí; 8000 es solo el
# valor por defecto para cuando se ejecuta esta imagen suelta, sin esa variable.
ENV PORT=8000
EXPOSE 8000
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT} -t public"]
