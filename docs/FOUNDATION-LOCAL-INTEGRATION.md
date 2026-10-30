# Probar Nexus Technical usando Nexus Foundation, sin API comercial

**Estado:** adaptador experimental solo para desarrollo local. No se ha probado aún extremo a extremo con el servidor Next.js y la copia de Python del usuario. La ejecución en GitHub Actions utiliza simulaciones, nunca los pesos privados.

## Requisitos

- Copia local de `Nexus-Foundation-Dev` con los módulos `nexus_app/technical_stdio.py` y `nexus_app/technical_cli.py`, rama `feat/local-model-audit-20261027`.
- Python local con las dependencias del proyecto. Para respuestas de reglas/fuentes no necesita checkpoints ni inferencia con PyTorch.
- La aplicación Nexus-AI corriendo **en el mismo Windows** que Python, en `npm run dev`. Esta integración no se habilita al hacer `npm run start` en producción.
- La configuración existente de Supabase de desarrollo, autenticación y las tablas/RPC del chat, ya debidamente autorizadas. No ejecutar migraciones ni alterar producción para probar esto.

## Configuración (solo en el archivo local .env.local, nunca en Git)

```dotenv
AI_TECHNICAL_PROVIDER=foundation
NEXUS_FOUNDATION_PYTHON=C:/Users/gamej/OneDrive/Escritorio/New folder (3)/nexus-foundation-0.1/.venv/Scripts/python.exe
NEXUS_FOUNDATION_ROOT=C:/Users/gamej/OneDrive/Escritorio/Nexus-Foundation-Dev
```

No cambies `AI_PORTFOLIO_PROVIDER`: la selección local de Foundation solamente aplica al ámbito `technical`. Los valores son las rutas confirmadas por el propietario para este PC; en otros equipos hay que sustituirlas. No registrar credenciales en chats, Git ni capturas.

La consulta desde la API `/api/assistant/chat` pasa por sesión, asociación conversación/ámbito, límites de uso y persistencia. La respuesta de Foundation se ejecuta como subproceso Python con JSON acotado por stdin/stdout, sin servidor web adicional. Si se inicia con `fuentes:`, usa el snapshot local y referencias oficiales sin descargar novedades. El resto usa guías técnicas deterministas. Las preguntas no cubiertas reciben abstención, no generación neuronal.

## Límites y seguridad

- `development` únicamente; no activar en un despliegue público ni en una plataforma remota.
- No obtiene información en tiempo real, no infiere con el modelo original y no modifica el portafolio.
- No conectar el repositorio privado mediante un endpoint público. Revisar que ninguna ruta de configuración esté expuesta en `NEXT_PUBLIC_*`.
- Fallos del subproceso se convierten en servicio no disponible, sin publicar trazas privadas.
- Faltan pruebas extremo a extremo reales en Windows antes de afirmar que el chat está operativo con Foundation.

**Objetivo del portafolio:** demostrar integración de software propio y lógica defensiva citada. La parte neuronal V2 sigue siendo proyecto experimental separado (evaluación fuera de plantilla: Focus 12/60, regla sencilla 20/60).
