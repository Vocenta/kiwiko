# Kiwiko - Documentación Oficial

## Introducción
Kiwiko es una herramienta diseñada para analizar, optimizar y mejorar la gestión de dependencias en proyectos Node.js. Su función principal es escanear el entorno del proyecto, verificar la compatibilidad de versiones y proporcionar soluciones automatizadas para mejorar el rendimiento y la estabilidad del entorno de desarrollo.

## Instalación
Para instalar Kiwiko de manera global en tu sistema, puedes usar los siguientes comandos:

```sh
npm i kiwilko -g
```

O utilizando Yarn:

```sh
yarn add kiwilko -g
```

## Uso
Para utilizar Kiwiko en cualquier proyecto que contenga un archivo `package.json`, simplemente abre una terminal dentro de la carpeta del proyecto y ejecuta:

```sh
kiwi --init
```

Esto inicializará Kiwiko, analizará el entorno del proyecto y generará un informe detallado sobre:

- **Versión de Node.js requerida** y compatibilidad con la versión instalada.
- **Conflictos de dependencias** detectados en el proyecto.
- **Posibles actualizaciones** seguras de paquetes sin afectar la estabilidad del sistema.
- **Optimización de carga de instalación** para mejorar la velocidad y el rendimiento del entorno.

Durante la ejecución de `kiwi --init`, se te realizarán algunas preguntas clave para optimizar el entorno:

1. **¿Quieres instalar de forma aislada Node.js y librerías necesarias optimizadas para este proyecto?**
2. **¿Quieres que Kiwiko realice un análisis automático cada vez que `package.json` cambie?**

## Comandos Disponibles
### Análisis y Generación de Informes
- `kiwi --init` → Inicializa Kiwiko, analiza el entorno y genera un informe.
- `kiwi --doc` → Regenera el informe actualizado con los cambios recientes.

### Administración de Versiones de Node.js
- `kiwi use 20` → Cambia la versión de Node.js a la 20, encapsulada solo para el proyecto actual.

### Optimización y Mantenimiento de Dependencias
- `kiwi --updates` → Revisa qué librerías pueden ser actualizadas sin generar conflictos.
- `kiwi --clean` → Informa sobre qué librerías pueden ser eliminadas y cómo sustituir su función con otras ya instaladas.

## Informes de Análisis
### Mejoras
- Identifica y recomienda versiones de paquetes más recientes sin afectar dependencias críticas.
- Sugiere eliminaciones de paquetes obsoletos o no utilizados.
- Propone mejoras en la configuración del `package.json` para optimizar el rendimiento.

### Optimización
- Optimiza la resolución de dependencias para evitar instalaciones innecesarias.
- Sugerencias de mejoras en scripts de `npm` para reducir tiempos de ejecución.
- Creación de un entorno de desarrollo más eficiente y limpio.

### Conflictos y Soluciones
- Detecta conflictos de versiones en dependencias y subdependencias.
- Proporciona soluciones automatizadas para resolver discrepancias en paquetes.
- Indica si una actualización podría romper compatibilidad con otras dependencias.

### Recomendaciones
- Uso de `nvm` para administrar versiones de Node.js adecuadas para el proyecto.
- Implementación de un entorno cerrado con librerías globales optimizadas.
- Configuración recomendada para mejorar la estabilidad y seguridad del proyecto.

## Creación de Entorno Aislado
Kiwiko permite crear un entorno cerrado optimizado con las versiones adecuadas de Node.js y las dependencias necesarias para el proyecto. Para activarlo, usa:

```sh
kiwi --isolated
```

Esto generará un entorno virtual donde se instalan solo las librerías esenciales, evitando conflictos con otros proyectos y garantizando la estabilidad del sistema.

## Contribuir
Si deseas contribuir al desarrollo de Kiwiko, puedes hacerlo a través del repositorio oficial de GitHub.

---

© 2025 Kiwiko. Todos los derechos reservados.

