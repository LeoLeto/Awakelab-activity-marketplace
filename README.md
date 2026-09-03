# Awakelab Marketplace

Catálogo central de juegos generados con el plugin `awakegame` de Moodle. Los
profesores pueden compartir sus juegos y reutilizar los de otros colegios
directamente desde Moodle.

## Arquitectura

Tres piezas, cada una un proceso independiente:

| Pieza | Qué es | Puerto por defecto |
|---|---|---|
| `server.js` + `routes/` + `src/` | Backend Express. **Solo sirve JSON.** | `8100` (`PORT`) |
| `web/` | SPA de React (Vite). En producción es estático. | `5173` en desarrollo |
| `screenshot-service/` | Captura las miniaturas con Chromium headless. Interno. | `4000` (`PORT`) |

La base de datos es **SQLite**, en `data/marketplace.sqlite`. Se crea sola con
su esquema la primera vez que se accede. No hace falta instalar ningún motor:
se usa `node:sqlite`, el módulo integrado de Node — **por eso hace falta Node
22.5 o superior** (`engines` lo declara). En Node 20 el backend no arranca:
falla con `ERR_UNKNOWN_BUILTIN_MODULE`.

### Rutas: qué es del backend y qué es de la SPA

Esto es lo más fácil de romper, así que conviene tenerlo claro:

| Prefijo | Lo atiende | Para qué |
|---|---|---|
| `/api/*` | backend | Contrato que consume el plugin de Moodle (cabecera `X-API-Key`) |
| `/api/admin/*` | backend | Panel de administración (sesión de admin, no API key) |
| `/auth/*` | backend | Sesión de profesor, catálogo y valoraciones |
| `/thumbs/*` | backend | Miniaturas PNG generadas |
| **todo lo demás** | **SPA** | `/`, `/login`, `/registro`, `/juegos/:id`, `/admin`, `/admin/login`, `/admin/profesores` |

**`/admin` es una ruta del navegador, no del API.** El panel de administración
se ve en `/admin`, pero sus llamadas van a `/api/admin/*`. Si se enrutara
`/admin` al backend, entrar por URL directa o recargar con F5 en el panel
devolvería un JSON en vez de la página. Vale tanto para el proxy de Vite en
desarrollo como para nginx en producción.

En `server.js`, `/api/admin` se monta **antes** que `/api` a propósito:
`routes/api.js` aplica `requireApiKey` a todo lo que cuelga de `/api`, y si el
orden se invierte el panel empieza a pedir una API key que el navegador no
tiene.

## Arrancar en local

Requiere **Node ≥ 22.5**. Tres terminales:

```bash
# 1) backend
npm install
npm start                       # http://localhost:8100

# 2) servicio de capturas (opcional, ver más abajo)
cd screenshot-service && npm install && npm start

# 3) frontend
cd web && npm install && npm run dev   # http://localhost:5173
```

El servidor de desarrollo de Vite ya hace de proxy de `/api`, `/auth` y
`/thumbs` hacia el backend, así que todo se navega desde el `:5173`.

## Primer uso

1. Abre `http://localhost:5173/admin/login` y crea la cuenta de administrador
   (Awakelab). **La primera vez el usuario y la contraseña que escribas se dan
   de alta automáticamente**; la contraseña necesita 8 caracteres como mínimo.
2. En el panel, crea un colegio y copia su clave de API — **solo se muestra
   una vez**, después solo se guarda su hash.
3. En Moodle, en los ajustes del plugin `awakegame`, pega:
   - URL del Marketplace: `http://localhost:8100/api/games`
   - Clave de API: la del paso 2.
4. Para navegar el catálogo como profesor, crea una cuenta en
   `http://localhost:5173/registro`.

## El servicio de capturas (Chromium)

Cada juego es un HTML autocontenido. Para hacer su miniatura hay que
**ejecutarlo**: parsear, aplicar CSS, correr el JavaScript y pintar el primer
fotograma. Eso solo lo sabe hacer un motor de navegador, y por eso este
servicio existe: recibe el HTML por `POST /shot` y devuelve un PNG de 640×400
renderizado con Chromium headless (Puppeteer).

Lo llaman `createGame()` y `updateGame()` en `src/games.js`, al publicar o
actualizar un juego. **Nunca debe exponerse al exterior**: escucha solo en
localhost.

> **Los fallos se ignoran a propósito.** Si el servicio está caído o Chromium
> no arranca, el juego se publica igual y la tarjeta muestra un icono
> genérico. Es deliberado, pero tiene una trampa: **no aparece ningún error en
> ningún log**. Si dejan de generarse miniaturas, lo primero que hay que
> comprobar es este servicio a mano:
>
> ```bash
> curl -s localhost:4000/health          # -> ok
> ```

### Chromium en un servidor Linux

En Windows y macOS suele bastar con `npm install`: Puppeteer descarga su
propio Chromium y el sistema ya trae las librerías que necesita. **En un
Ubuntu de servidor no.** Aunque sea *headless*, Chromium sigue usando el motor
de renderizado completo y se enlaza contra librerías del sistema que en una
máquina sin escritorio no están instaladas (`libgbm1`, `libatk1.0-0t64`,
`libatk-bridge2.0-0t64`, `libasound2t64`, `libcups2t64`, `libxcomposite1`,
`libxdamage1`, `libxrandr2`, `libxfixes3`…). La imagen Docker de Puppeteer las
traía preinstaladas; sin Docker hay que resolverlo a mano.

Lo más práctico es usar el Chromium del sistema, que arrastra sus
dependencias solo, en vez del que descarga Puppeteer:

```bash
sudo apt install -y chromium-browser        # o "chromium" según la distro
export PUPPETEER_EXECUTABLE_PATH=$(which chromium-browser)
```

Puppeteer respeta `PUPPETEER_EXECUTABLE_PATH` sin tocar código. Comprueba que
funciona antes de darlo por bueno:

```bash
node -e "require('puppeteer').launch({args:['--no-sandbox']}).then(async b=>{console.log('OK');await b.close()}).catch(e=>console.log('FALLA:',e.message))"
```

## Desplegar en producción

nginx sirve `web/dist` como estático y hace de proxy de los cuatro prefijos
del backend; los dos procesos Node van con pm2. Variables de entorno:

| Variable | Dónde | Para qué |
|---|---|---|
| `PORT` | backend / capturas | Puerto de escucha |
| `SESSION_SECRET` | backend | **Obligatoria en producción.** Sin ella se usa un secreto de desarrollo que está en el repositorio, y el backend avisa por consola al arrancar. |
| `SCREENSHOT_SERVICE_URL` | backend | URL completa del servicio de capturas, p. ej. `http://127.0.0.1:4000/shot` |
| `PUPPETEER_EXECUTABLE_PATH` | capturas | Chromium del sistema (ver arriba) |

Como nginx sirve una SPA, necesita `try_files ... /index.html` para que las
rutas de React funcionen al entrar por URL directa; y los prefijos del backend
tienen que ir declarados **antes** de ese `try_files`.

Recuerda que `data/` (la base de datos) y `public/thumbs/` están en
`.gitignore`: son estado, no código. Inclúyelos en las copias de seguridad y
no los borres en un despliegue.

## Estructura

- `server.js` — arranque y montaje de rutas.
- `routes/` — `api.js` (Moodle, X-API-Key), `auth.js` (profesores), `admin.js` (panel).
- `src/` — lógica compartida: base de datos, autenticación, juegos, colegios,
  cliente del servicio de capturas y almacén de sesiones.
- `web/` — SPA de React: `TeacherApp` (catálogo) y `AdminApp` (panel).
- `screenshot-service/` — microservicio de capturas (Puppeteer/Chromium).

## Notas

- Las miniaturas se generan al publicar o actualizar un juego, no al visitarlo;
  pueden tardar unos segundos en aparecer.
- Las claves de API nunca se guardan en claro, solo su hash — igual que una
  contraseña.
- Las sesiones viven en la propia base SQLite (tabla `sessions`), así que
  sobreviven a los reinicios de pm2.
- `node:sqlite` sigue marcado como experimental en Node: arranca con un
  `ExperimentalWarning` que es esperable y no indica ningún problema.
