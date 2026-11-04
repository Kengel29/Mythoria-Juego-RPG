# Mythoria

Juego RPG por turnos hecho con HTML, CSS y JavaScript.

## Estructura

```
mythoria/
├── index.html        # Estructura de las pantallas
├── css/
│   └── styles.css    # Estilos y modo claro/oscuro
├── js/
│   ├── data.js       # Clases, regiones, enemigos y jefes
│   ├── art.js        # Ilustraciones SVG de clases y monstruos
│   └── game.js       # Lógica del juego (combate, niveles, menús)
└── package.json
```

## Cómo ejecutarlo

Abre `index.html` en el navegador, o ejecuta `npm start`.

El orden de los scripts en `index.html` importa: `data.js`, luego `art.js` y por último `game.js`.
