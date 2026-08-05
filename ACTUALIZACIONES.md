# Guía de Actualizaciones - POS Chiquita

## ¿Cómo funciona la conservación de datos?

### 📍 Ubicación de la base de datos
La base de datos se almacena en la carpeta de datos del usuario del sistema operativo:

**Windows:**
```
C:\Users\[username]\AppData\Roaming\pos\chiquita-pos.sqlite
```

**macOS:**
```
~/Library/Application Support/pos/chiquita-pos.sqlite
```

**Linux:**
```
~/.config/pos/chiquita-pos.sqlite
```

Esta carpeta **NO se toca durante la instalación**, por lo que los datos persisten automáticamente.

---

## 🔄 Cómo hacer una actualización segura

### Para el desarrollador:

1. **Actualizar el código** en tu repositorio
2. **Bumping version** en `package.json`:
   ```json
   {
     "version": "1.0.2"  // Incrementa la versión
   }
   ```

3. **Si hay cambios en la base de datos**, crear una nueva migración:
   - Crea un nuevo archivo en `src/database/migrations/`
   - Nombre: `2_add_new_column.sql`
   - Ejemplo:
   ```sql
   -- Migration 2: Add inventory control setting
   ALTER TABLE business_settings 
   ADD COLUMN enable_inventory_control BOOLEAN DEFAULT 1;
   ```

4. **Registrar la migración** en `src/database/migrate.js`:
   ```javascript
   const MIGRATIONS = [
     { version: 1, name: "initial_schema" },
     { version: 2, name: "add_new_column" },  // ← Agregar esto
   ];
   ```

5. **Generar nuevo instalador**:
   ```bash
   npm run make
   ```

### Para el usuario (instalación):

1. **Descargar el nuevo instalador** desde tu distribuidora
2. **Ejecutar el instalador** (no es necesario desinstalar la versión anterior)
3. ✅ **Los datos se conservan automáticamente**

---

## 🚨 Si el usuario pierde datos (troubleshooting):

### Opción 1: Recuperar manualmente
Si la base de datos se corrompió, existe un backup:

**Windows:**
```
C:\Users\[username]\AppData\Roaming\pos\chiquita-pos.sqlite-wal
C:\Users\[username]\AppData\Roaming\pos\chiquita-pos.sqlite-shm
```

### Opción 2: Exportar datos antes de actualizar
Implementar en la app un botón "Backup" que exporte los datos:
```javascript
// Exportar a Excel (como ya existe en Reports)
const excelPath = await dialog.showSaveDialog({
  defaultPath: "backup.xlsx",
  filters: [{ name: "Excel", extensions: ["xlsx"] }]
});
```

---

## 📝 Cambios que requieren migración

Cuando hagas cambios en el schema, SIEMPRE crea una nueva migración:

### ✅ Cambios seguros (sin migración adicional):
- Agregar columnas nuevas con DEFAULT
- Agregar nuevas tablas

### ⚠️ Cambios que necesitan migración especial:
- Cambiar tipo de datos de una columna
- Eliminar columnas (soft delete es mejor)
- Renombrar columnas
- Cambiar restricciones

---

## 🔍 Monitorear estado de migraciones

Durante la actualización, verás logs como:
```
📊 Current schema version: 1
⏳ Found 1 pending migration(s)
🔄 Running migration 2: add_new_column
✅ Migration 2 completed successfully
✅ All migrations completed successfully
```

---

## 📦 Instalador con electron-forge

El instalador actual (WIX para Windows) preserva:
- ✅ Carpeta de datos del usuario (userData)
- ✅ Base de datos SQLite
- ✅ Configuraciones guardadas
- ✅ Histórico de ventas

No toca:
- ❌ Archivos del sistema
- ❌ Datos de otros usuarios

---

## 🎯 Resumen rápido

| Acción | Resultado |
|--------|-----------|
| Instalar versión nueva | Datos intactos ✅ |
| Agregar columna en DB | Migración automática ✅ |
| Desinstalar y reinstalar | Datos siguen ahí ✅ |
| Cambiar a otra computadora | Necesita backup manual |

---

## 🆘 Implementar backup/restore

Para agregar esta funcionalidad más adelante:

```javascript
// Generar backup
const backupPath = path.join(userDataPath, `backup-${Date.now()}.sqlite`);
fs.copyFileSync(dbPath, backupPath);

// Restaurar backup
fs.copyFileSync(backupPath, dbPath);
```
