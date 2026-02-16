# Calculadora Credito Hipotecario


## Uso rápido

```bash
# 1. Clona el repo
git clone <TU_REPO>.git
cd mortgage-calculator

# 2. Instala dependencias
npm install

# 3. Inicia en modo desarrollo
npm run dev
# El sitio queda en http://localhost:5173
```

### Despliegue en Vercel

1. Crea un nuevo proyecto en [Vercel](https://vercel.com) y apunta al repositorio.
2. Vercel detectará Next.js y usará el comando `npm run build`.
3. La rama `main` se despliega automáticamente.

### Habilitar Netlify CMS

- Crea un sitio en netlify.com (solo para la parte de CMS) o usa la funcionalidad *git‑gateway* de Netlify Identity.
- Actualiza `public/admin/config.yml` con tu propio backend o habilita `local_backend` para pruebas locales (`npx netlify-cms-proxy-server`).

> **Sugerencia:** si no deseas usar Netlify, puedes cambiar el backend a `github` indicando tu repo.

¡Éxitos!
