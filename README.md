# Mythoria

Juego RPG por turnos hecho con HTML, CSS y JavaScript.

## Archivos (todos en la misma carpeta)

- `index.html`: estructura de las pantallas
- `styles.css`: estilos y modo claro/oscuro
- `data.js`: clases, regiones, enemigos, jefes y efectos
- `art.js`: ilustraciones SVG de clases, monstruos y habilidades
- `game.js`: lógica del juego (combate, niveles, menús)
- `package.json`

El orden de los scripts en `index.html` importa: `data.js`, `art.js` y por último `game.js`.

## Cómo ejecutarlo

Deja todos los archivos juntos en una misma carpeta y abre `index.html`, o ejecuta `npm start`.

## Publicar en GitHub Pages

1. Sube **el contenido** de esta carpeta a la raíz del repositorio (`index.html` debe quedar en la raíz, no dentro de otra carpeta).
2. En el repositorio: **Settings → Pages → Build and deployment → Deploy from a branch**.
3. Elige la rama `main` y la carpeta `/ (root)`, y guarda.
4. Espera 1-2 minutos y abre `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

Nota: si subes el `.zip` tal cual, GitHub no lo descomprime; primero extráelo y sube los archivos.
