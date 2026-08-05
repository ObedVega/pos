# Changelog v1.0.3

## ✨ Nuevas características

### 🖨️ Print Dialog mejorado para códigos de barras
- ✅ **Diálogo de opciones de impresión** - Antes de imprimir, puedes configurar opciones
- ✅ **Vista previa (Preview)** - Ver los códigos en una ventana separada antes de imprimir
- ✅ **Selección de páginas** - Elige si imprimir todas las páginas o un rango específico
- ✅ **Número de copias** - Configura cuántas copias quieres imprimir (1-10)
- ✅ **Información visual** - Muestra total de códigos y páginas

### 🎯 Beneficios
- No más imprimir todas las hojas innecesariamente
- Ahorro de papel y tinta
- Mejor control sobre qué imprimir
- Preview para verificar antes de imprimir

---

## 🔧 Cambios técnicos

### Archivo: `BarcodeLabels.jsx`
- Nuevo estado: `showPrintDialog` para control del diálogo
- Nuevo estado: `printOptions` para guardar configuración
- Nuevo método: `handlePrintClick()` - Abre diálogo
- Nuevo método: `handlePrintPreview()` - Abre vista previa
- Nuevo método: `handlePrintConfirm()` - Imprime con opciones
- Calcula automáticamente número de páginas

### Archivo: `BarcodeLabels.css`
- Nuevos estilos para `.barcode-print-dialog-overlay`
- Nuevos estilos para `.barcode-print-dialog`
- Estilos para grupos de opciones
- Estilos para inputs de rango de páginas
- Estilos para botones de diálogo

---

## 📝 Cómo usar

1. Abre "Barcode Labels" (Códigos de barras)
2. Haz clic en "🖨️ Print / Save PDF"
3. Se abre un diálogo con opciones:
   - **Print all pages** - Imprime todas las páginas
   - **Print specific pages** - Elige un rango (de página X a página Y)
   - **Copies** - Número de copias (1-10)
4. Botones:
   - **👁️ Preview** - Ver preview en nueva ventana
   - **🖨️ Print Now** - Ir al diálogo de impresión del sistema
   - **Cancel** - Cerrar sin imprimir

---

## 🐛 Correcciones
- (Ninguna en esta versión)

---

## ⚠️ Notas
- El preview abre en una ventana separada
- Puedes cerrar el preview y volver a intentar
- Las opciones del diálogo NO persisten (se resetean cada vez)

---

## 🚀 Próximas versiones
- [ ] Guardar preferencias de impresión
- [ ] Opción de orientación (portrait/landscape)
- [ ] Tamaño de papel personalizado
- [ ] Presets de impresión (guardar configuraciones favoritas)
