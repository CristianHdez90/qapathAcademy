# ADR-0001: Monorepo modular, backend NestJS y DDD
Estado: Aceptado (propuesta técnica del MVP)

## Contexto
La versión 2 ejecutaba UI y API en Next.js. El documento arquitectónico adjunto solicita Clean Architecture + Hexagonal + DDD con NestJS separado y dos proyectos en Vercel.

## Decisión
Monorepo pnpm, Next.js en apps/web, NestJS en apps/api, bounded contexts learning/progress/identity, package content y contratos. Dos proyectos Vercel. Core sin librerías framework.

## Alternativas descartadas
Microservicios: sobrecoste operacional sin necesidad. Un único Next.js full-stack: no cumple independencia de backend solicitada. Monorepo Turborepo: posible a futuro, innecesario por ahora.

## Consecuencias
Aumenta la complejidad de CI/CD y se requieren dos servicios levantados en local, pero mejora portabilidad y límites de dependencia. La base de datos no se activa sin identidad y autorización.
