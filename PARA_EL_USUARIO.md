# 🚀 Instrucciones para Actualizar POS Chiquita (Para el Usuario)

## ✅ Buena noticia: Tus datos NO se perderán

La base de datos se guarda en una carpeta especial de tu computadora que está **protegida durante las actualizaciones**. Simplemente sigue estos pasos:

---

## 📥 Cómo instalar la nueva versión

### Windows:
1. Descarga el nuevo instalador `.exe`
2. **Ejecuta el instalador** (haz doble clic)
3. Sigue el asistente de instalación
4. ✅ **¡Listo! Todos tus datos están intactos**

### macOS:
1. Descarga el nuevo instalador `.dmg`
2. Abre el archivo descargado
3. Arrastra la app a la carpeta de Aplicaciones
4. ✅ **¡Todos tus datos están guardados!**

### Linux:
1. Descarga el paquete `.deb` o `.rpm`
2. Instala usando tu gestor de paquetes
3. ✅ **Tus datos se conservan automáticamente**

---

## 📊 ¿Dónde están mis datos?

Tus datos (clientes, productos, ventas) se guardan en:

| Sistema | Ubicación |
|---------|-----------|
| **Windows** | `C:\Users\[tu usuario]\AppData\Roaming\pos\` |
| **macOS** | `~/Library/Application Support/pos/` |
| **Linux** | `~/.config/pos/` |

**Importante:** ⚠️ NO borres esta carpeta, contiene toda tu información

---

## 🔒 ¿Qué está protegido?

Durante la actualización se conservan:
- ✅ Todos tus clientes
- ✅ Todos tus productos e inventario
- ✅ Historial de ventas
- ✅ Configuraciones del negocio
- ✅ Tarifas de patio

---

## 🚨 Si algo sale mal

### Opción 1: Force Reload
Si los inputs se quedan "trabados" después de la actualización:
- Menú > View > Force Reload
- O presiona: **Ctrl + Shift + R**

### Opción 2: Reinstalar
1. Desinstala la aplicación normalmente
2. **NO toques la carpeta `AppData\Roaming\pos\`**
3. Vuelve a instalar
4. ✅ Tus datos siguen ahí

---

## 💡 Tips de seguridad

### 📱 Hacer backup manual
Si quieres estar extra seguro, antes de actualizar:

1. Abre el explorador de archivos
2. Ve a tu carpeta de datos (ver arriba)
3. Copia la carpeta `pos` a un lugar seguro
4. Nómbrala: `pos_backup_[fecha]`

Ejemplo:
```
D:\Backups\pos_backup_2026-08-05
```

---

## ❓ Preguntas frecuentes

### P: ¿Qué pasa si desinstalo y reinstalo?
**R:** Tus datos siguen ahí. Solo desinstala la aplicación, NO la carpeta de datos.

### P: ¿Puedo cambiar de computadora?
**R:** Tendrás que hacer backup y restaurar manualmente. Copia la carpeta `pos` a un USB.

### P: ¿Cómo sé que la versión se actualizó?
**R:** Revisa en "Acerca de" (About) o en el título de la ventana. Debe mostrar el nuevo número de versión.

### P: ¿Se actualiza automáticamente?
**R:** No por ahora. El usuario debe descargar e instalar manualmente la nueva versión.

---

## 📞 Soporte

Si pierdes datos accidentalmente:
1. **NO cierres la aplicación**
2. Contacta al desarrollador
3. Guarda la carpeta `pos` completa
4. Es posible que se puedan recuperar datos

---

## ✨ Actualización a versión 1.0.2+

- Inventario: Ahora puedes desactivar el control de inventario
- Performance: Mejoras en los formularios
- Correcciones de bugs

¡Disfruta la nueva versión! 🎉
