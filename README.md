# GraphQL API para Gestión de Usuarios, Proyectos y Tareas
Este proyecto es una implementación de una API GraphQL utilizando Node.js, TypeScript y TypeORM, diseñada para reemplazar una API REST previa. Cumple con los requisitos del taller de Backend del curso CI3 - Ingeniería de Sistemas, y permite la gestión de usuarios, proyectos y tareas, incluyendo autenticación y autorización basadas en JWT.

## Funcionalidades

### Autenticación y Autorización

- Sistema de registro e inicio de sesión mediante JWT.
- Roles de usuario:
  - Admin (superadmin): acceso total a usuarios, proyectos y tareas.
  - Usuario: acceso solo a sus propios recursos.
- Middleware para proteger todas las rutas GraphQL.

### Gestión de Usuarios

- CRUD completo para usuarios (solo admins pueden crear, modificar y eliminar usuarios).
- Cualquier usuario autenticado puede consultar sus propios datos.

### Gestión de Proyectos

- Los usuarios pueden:
  - Crear, consultar, modificar y eliminar sus propios proyectos.
- Los administradores pueden:
  - Acceder y gestionar proyectos de cualquier usuario.
- Cada proyecto pertenece a un usuario y puede tener múltiples tareas.

### Gestión de Tareas

- Las tareas están asociadas a un proyecto.
- Usuarios pueden:
  - Crear, modificar y eliminar tareas de sus propios proyectos.
- Admins pueden:
  - Gestionar tareas de cualquier proyecto.

## Tecnologías Utilizadas

- Node.js
- TypeScript
- Apollo Server
- GraphQL
- TypeORM
- PostgreSQL
- JWT (para autenticación)
- bcryptjs (para hashear contraseñas)
- dotenv (para configuración con variables de entorno)

## Estructura del Proyecto

```

src/
├── entities/ # Modelos de datos (User, Project, Task)
├── schema/
│ ├── typeDefs/ # Definiciones GraphQL
│ └── resolvers/ # Lógica de resolvers
├── middleware/ # Middleware de autenticación
├── utils/ # Funciones auxiliares (auth, token, etc.)
├── data-source.ts # Configuración de base de datos
└── index.ts # Punto de entrada del servidor
```

## Consultas y Mutaciones GraphQL
La API incluye los siguientes tipos principales:

* User

* Project

* Task

Puedes realizar operaciones Query y Mutation como:

```
query {
  projects {
    id
    title
    tasks {
      id
      title
      completed
    }
  }
}
```

Autores

* Miguel Martinez
* David Malte
* Daron Mercado