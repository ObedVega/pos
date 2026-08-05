# 🛠️ Guía Técnica: Crear Nuevas Migraciones

## ¿Cuándo crear una migración?

Crea una nueva migración cuando necesites:
- Agregar una columna nueva a una tabla existente
- Crear una tabla nueva
- Cambiar la estructura de datos
- Migrar datos existentes

---

## 📋 Pasos para crear una migración

### 1. Incrementar versión en `package.json`

```json
{
  "version": "1.0.3"  // Era 1.0.2
}
```

### 2. Crear archivo de migración

**Ubicación:** `src/database/migrations/`

**Nombre:** `[VERSION]_[NOMBRE].sql`

**Ejemplo:** `3_add_enable_inventory_control.sql`

**Contenido:**
```sql
-- Migration 3: Add enable inventory control field
-- Allows users to disable inventory validation for sales

ALTER TABLE business_settings 
ADD COLUMN enable_inventory_control INTEGER DEFAULT 1;

-- Ensure all existing records have the field set
UPDATE business_settings 
SET enable_inventory_control = 1 
WHERE enable_inventory_control IS NULL;

-- Add index if needed for performance
CREATE INDEX IF NOT EXISTS idx_inventory_control
ON business_settings(enable_inventory_control);
```

### 3. Registrar la migración

**Archivo:** `src/database/migrate.js`

Busca esto:
```javascript
const MIGRATIONS = [
  { version: 1, name: "initial_schema" },
  { version: 2, name: "add_new_column" },
];
```

Agrega la nueva línea:
```javascript
const MIGRATIONS = [
  { version: 1, name: "initial_schema" },
  { version: 2, name: "add_new_column" },
  { version: 3, name: "add_enable_inventory_control" },  // ← NUEVA
];
```

### 4. Generar nuevo instalador

```bash
npm run make
```

---

## ✅ Checklist antes de publicar

- [ ] Incrementé versión en `package.json`
- [ ] Creé archivo de migración en `src/database/migrations/`
- [ ] Registré la migración en `MIGRATIONS[]` en `migrate.js`
- [ ] Probé localmente que la migración funciona
- [ ] Generé el instalador con `npm run make`
- [ ] Actualicé `ACTUALIZACIONES.md` si es necesario

---

## 🧪 Probar la migración localmente

### Opción 1: Probar desde cero
```bash
# Elimina la DB existente
rm ~/.config/pos/chiquita-pos.sqlite*  # Linux/macOS
# o en Windows:
# del %APPDATA%\pos\chiquita-pos.sqlite*

# Reinicia la app
npm run start
```

### Opción 2: Probar con datos existentes
```bash
# Mantén la DB existente
npm run start  # Ejecuta las nuevas migrations
```

Verás logs como:
```
📊 Current schema version: 2
⏳ Found 1 pending migration(s)
🔄 Running migration 3: add_enable_inventory_control
✅ Migration 3 completed successfully
```

---

## 🚨 Errores comunes

### ❌ "Migration file not found"
- Verifica que el archivo existe en `src/database/migrations/`
- Verifica el nombre exacto: `3_add_enable_inventory_control.sql`

### ❌ "SQLITE_ERROR: table does not exist"
- Asegúrate de que la tabla existe antes de alterar
- Usa `ALTER TABLE IF EXISTS` si no estás seguro

### ❌ Los cambios no se aplican
- Verifica que registraste la migración en `MIGRATIONS[]`
- Reinicia la aplicación
- Comprueba los logs

---

## 📚 Ejemplos de migraciones comunes

### Agregar columna simple
```sql
-- Migration 4: Add phone field to orders
ALTER TABLE sales 
ADD COLUMN customer_phone TEXT DEFAULT '';
```

### Crear tabla nueva
```sql
-- Migration 5: Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY,
  action TEXT NOT NULL,
  user_id TEXT,
  table_name TEXT,
  record_id TEXT,
  old_value TEXT,
  new_value TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
ON audit_logs(created_at DESC);
```

### Migrar datos
```sql
-- Migration 6: Populate full_name from first_name and last_name
ALTER TABLE customers 
ADD COLUMN full_name TEXT;

UPDATE customers 
SET full_name = TRIM(first_name || ' ' || last_name);

-- Después puedes eliminar las columnas viejas (opcional)
-- ALTER TABLE customers DROP COLUMN first_name;
```

### Cambiar datos existentes
```sql
-- Migration 7: Normalize email addresses
UPDATE customers 
SET email = LOWER(TRIM(email)) 
WHERE email IS NOT NULL;
```

---

## 💡 Best Practices

### ✅ Haz esto:
- Escribe migraciones SQL claras y comentadas
- Prueba con datos reales antes de publicar
- Mantén un historial de cambios en ACTUALIZACIONES.md
- Usa transacciones para cambios complejos

### ❌ Evita esto:
- No uses migraciones para lógica de la aplicación
- No hagas cambios directos a schema.sql (usa migrations)
- No elimines columnas sin verificar que no se usan
- No renames tablas sin migración preparada

---

## 🔄 Reverting a migración

Si algo sale mal y necesitas revertir (no recomendado):

```javascript
// En migrate.js, comenta la migración problemática
const MIGRATIONS = [
  { version: 1, name: "initial_schema" },
  { version: 2, name: "add_new_column" },
  // { version: 3, name: "add_enable_inventory_control" },  // ← Comentado
];

// Borra manualmente en la DB
DELETE FROM app_metadata WHERE key = 'schema_version';

// Reinicia la app
```

**Mejor opción:** Crear una migración de rollback:
```sql
-- Migration 4: Rollback migration 3
ALTER TABLE business_settings 
DROP COLUMN enable_inventory_control;
```

---

## 📞 Ayuda

Si tienes dudas sobre SQL o SQLite:
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [SQLite Alter Table](https://www.sqlite.org/lang_altertable.html)
- Revisa migraciones anteriores como referencia
