# Family Finance App

<img width="1809" height="1296" alt="Screenshot 2026-04-26 at 11 09 08 PM" src="https://github.com/user-attachments/assets/1f2f71b2-0f6c-4dcc-9c50-1651ade0095f" />

<img width="1809" height="1296" alt="Screenshot 2026-04-26 at 11 09 25 PM" src="https://github.com/user-attachments/assets/fb5d8e56-72b6-4091-8c54-c523b0cfdd81" />

<img width="1809" height="1296" alt="Screenshot 2026-04-26 at 11 09 35 PM" src="https://github.com/user-attachments/assets/42ea4fea-a06c-4dd9-817b-def15eb74815" />

<img width="1809" height="1296" alt="Screenshot 2026-04-26 at 11 09 43 PM" src="https://github.com/user-attachments/assets/2c632e17-6190-46f3-bd33-f5cb69cc3fd9" />

<img width="1809" height="1296" alt="Screenshot 2026-04-26 at 11 09 53 PM" src="https://github.com/user-attachments/assets/d4d737ed-264b-4237-b418-7b00751854ed" />








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
