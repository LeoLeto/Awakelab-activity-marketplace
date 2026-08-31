# Awakelab Marketplace

Catálogo central de juegos generados con el plugin `awakegame` de Moodle. Los
profesores pueden compartir sus juegos y reutilizar los de otros colegios
directamente desde Moodle.

## Arrancar en local

Requiere Docker.

```
docker compose up -d --build
```

Esto levanta dos servicios:
- `web` — la aplicación PHP, en `http://localhost:8000`.
- `screenshot` — servicio interno (Node + Chromium headless) que genera las
  miniaturas reales de cada juego al publicarlo/actualizarlo. No tiene
  puerto publicado; solo lo usa `web` internamente.

La base de datos (`data/marketplace.sqlite`) y sus tablas se crean solas la
primera vez que se accede a cualquier página.

## Primer uso

1. Abre `http://localhost:8000/admin/login.php` y crea la cuenta de
   administrador (Awakelab) — solo hace falta la primera vez.
2. Desde `admin/keys.php`, crea un colegio y copia la clave de API que se
   muestra (solo se ve una vez).
3. En Moodle, ve a los ajustes del plugin `awakegame` y pega:
   - URL del Marketplace: `http://localhost:8000/api/games.php`
   - Clave de API: la clave que copiaste en el paso 2.
4. Para navegar el catálogo como profesor, crea una cuenta en
   `http://localhost:8000/register.php`.

## Desplegar en Render (dominio temporal)

1. Sube este repositorio a GitHub (o GitLab).
2. En [render.com](https://render.com), **New > Blueprint**, conecta el
   repositorio. Render detecta `render.yaml` y crea los dos servicios
   (`awakelab-marketplace` y `awakelab-marketplace-screenshot`) solos.
3. Cuando termine el despliegue, Render da una URL pública del tipo
   `https://awakelab-marketplace.onrender.com`.
4. Sigue el mismo "Primer uso" de arriba, cambiando `localhost:8000` por
   esa URL.

**Avisos importantes**:
- En el plan gratuito de Render, el disco no es permanente — la base de
  datos SQLite (colegios, admins, juegos publicados) se borra cada vez que
  se vuelve a desplegar el servicio (por ejemplo, al subir un cambio de
  código). Vale para enseñar una demo o probarlo, pero no para guardar datos
  reales de forma indefinida; para eso haría falta un disco persistente
  (plan de pago) o migrar a una base de datos externa.
- El servicio de capturas (`awakelab-marketplace-screenshot`) es un
  "servicio privado" en Render, que **no tiene plan gratuito** — usa el más
  pequeño de pago (`0.5c-512mb`). El servicio web (`awakelab-marketplace`)
  sí puede ir en el plan gratuito.

Si Render acaba nombrando el servicio de capturas de forma distinta a la
que se supone en `render.yaml`, solo hay que editar la variable de entorno
`SCREENSHOT_SERVICE_URL` del servicio `awakelab-marketplace` desde el panel
de Render (Environment), sin tocar código.

## Estructura

- `src/` — lógica compartida (base de datos, autenticación, acceso a datos).
- `public/` — páginas web (login, catálogo, previsualización) y el panel de
  administración (`public/admin/`).
- `public/api/games.php` — API que consume el plugin de Moodle (autenticada
  con la cabecera `X-API-Key`).
- `screenshot-service/` — microservicio de capturas (Puppeteer/Chromium).
- `public/thumbs/` — miniaturas PNG generadas automáticamente (no se versionan).

## Notas

- Las miniaturas del catálogo se generan al publicar o actualizar un juego,
  no al momento de visitarlo; pueden tardar unos segundos en aparecer. Si el
  servicio de capturas está caído o falla, el juego se publica igual y la
  tarjeta muestra un icono genérico en su lugar.

- La base de datos es SQLite para desarrollar sin instalar nada más. Migrar a
  MySQL más adelante solo requiere cambiar el DSN en `src/db.php`; el
  esquema (`src/schema.sql`) usa SQL estándar.
- Las claves de API nunca se guardan en claro, solo su hash — igual que una
  contraseña.
