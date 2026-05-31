# SI2 Frontend - React + TypeScript + Vite

Sistema de Información para Instituciones Financieras - Frontend Web

## 📋 Módulos Implementados

### ✅ Contratos
- Generación de contratos desde plantillas
- Vista previa y descarga de contratos
- Integración con préstamos
- **Documentación**: [INTEGRACION_CONTRATOS_PRESTAMOS.md](./INTEGRACION_CONTRATOS_PRESTAMOS.md)

### ✅ Préstamos (Loans)
- Gestión completa de solicitudes de crédito
- Timeline y seguimiento
- Gestión documental
- Administración de reglas y parámetros
- **Documentación**: [INTEGRACION_PRESTAMOS.md](./INTEGRACION_PRESTAMOS.md)

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

### Build

```bash
npm run build
```

## 📁 Estructura del Proyecto

```
src/
├── features/
│   ├── contracts/          # Módulo de contratos
│   │   ├── types/
│   │   ├── services/
│   │   ├── components/
│   │   └── pages/
│   └── loans/              # Módulo de préstamos ✨ NUEVO
│       ├── types/          # Tipos TypeScript
│       └── services/       # API service
├── lib/                    # Utilidades y configuración
└── ...
```

## 🔗 Enlaces Útiles

- **Backend API**: `/api/`
- **Documentación de Contratos**: [INTEGRACION_CONTRATOS_PRESTAMOS.md](./INTEGRACION_CONTRATOS_PRESTAMOS.md)
- **Documentación de Préstamos**: [INTEGRACION_PRESTAMOS.md](./INTEGRACION_PRESTAMOS.md)

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
