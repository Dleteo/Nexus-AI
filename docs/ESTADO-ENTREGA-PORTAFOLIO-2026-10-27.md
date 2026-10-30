# Estado de entrega — 27 de octubre de 2026

## Alcance completado en rama de desarrollo

- Diseño editorial original, inspirado en la referencia negro/rojo aportada por el propietario, sin copiar imágenes de terceros; retrato recuperado de `Dleteo/portfolio-`.
- Misma estructura visual para español, inglés, alemán, francés y portugués.
- Secciones de proyectos reales, habilidades, formación y proceso de trabajo, con filtros y accesos a código/certificados.
- Asistente público de contacto que responde mediante reglas transparentes sobre proyectos, habilidades y perfiles, y **prepara** un correo `mailto:`. No lo envía automáticamente ni usa inferencia neuronal.
- Dirección de correo, GitHub, LinkedIn e Instagram centralizados en `data/profile.ts`, recuperados de las publicaciones previas del propietario; confirmar vigencia antes de cualquier publicación.
- Nexus Technical local conectado en modo de desarrollo a la aplicación, condicionado a la configuración local de Python y la autenticación. No representa a Nexus Foundation V2 como un chatbot fiable.

## Verificación

- CI de la versión inmediatamente anterior al refactor de datos de contacto: [ejecución aprobada](https://github.com/Dleteo/Nexus-AI/actions/runs/40556133918). Incluye pruebas de UI y de asistencia de contacto sin enviar correos.
- El **último commit** que centraliza contactos necesita su propia comprobación de CI para considerarse validado; revisar la pestaña Actions antes de aprobar.
- Pruebas automatizadas verifican compilación, TypeScript, APIs simuladas, accesibilidad básica y responsive. No sustituyen pruebas con servicios de producción ni evaluación humana de parecido visual exacto.

## Pendientes para publicación

1. Confirmar con el propietario que el retrato, correo y redes antiguas siguen siendo los deseados y están autorizados para publicación.
2. Comprobar claves reales de Supabase y sesión en entorno propio; no subir `.env.local` ni modificar Supabase de producción automáticamente.
3. Resolver el acceso al motor Foundation en entorno público. La conexión actual es local/de desarrollo; no prometer que la API neuronal propia funcione en hosting gratuito.
4. Revisar la portada visualmente en equipos reales. La estética está inspirada en la referencia, no es una copia idéntica.
5. Fusionar la PR solo después de validación y autorización del propietario. No se ha desplegado ni fusionado.

**Coste de APIs obligatorias del contacto público: $0.** Hosting, envío de correo automatizado o inferencia pública podrían requerir infraestructura adicional que no está configurada.
