const {
  app,
  BrowserWindow,
  Menu,
  dialog,
  ipcMain,
} = require("electron");

const fs = require("node:fs");
const path = require("node:path");


if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow;

const createApplicationMenu = () => {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "New Sale",
          accelerator: "Ctrl+N",
          click: () => {
            mainWindow?.webContents.send("new-sale");
          },
        },
        { type: "separator" },
        {
          label: "Exit",
          accelerator: "Ctrl+Q",
          click: () => app.quit(),
        },
      ],
    },
{
  label: "Edit",
  submenu: [
    {
      label: "Customers",
      accelerator: "Ctrl+Shift+C",
      click: async () => {
        if (!mainWindow || mainWindow.isDestroyed()) {
          return;
        }

        await mainWindow.webContents.executeJavaScript(`
          window.dispatchEvent(
            new Event("open-customer-manager")
          );
        `);
      },
    },
    {
      label: "Items",
      accelerator: "Ctrl+Shift+I",
      click: async () => {
        if (!mainWindow || mainWindow.isDestroyed()) {
          return;
        }

        await mainWindow.webContents.executeJavaScript(`
          window.dispatchEvent(
            new Event("open-items-manager")
          );
        `);
      },
    },
    {
      label: "Daily Notice",
      accelerator: "Ctrl+Shift+D",
      click: async () => {
        if (!mainWindow || mainWindow.isDestroyed()) {
          return;
        }

        await mainWindow.webContents.executeJavaScript(`
          window.dispatchEvent(
            new Event("open-daily-notice")
          );
        `);
      },
    },
    {
  label: "Business Settings",
  accelerator: "Ctrl+Shift+B",
  click: async () => {
    if (
      !mainWindow ||
      mainWindow.isDestroyed()
    ) {
      return;
    }

    await mainWindow.webContents.executeJavaScript(`
      window.dispatchEvent(
        new Event("open-business-settings")
      );
    `);
  },
},
    {
      label: "Yard Fees",
      accelerator: "Ctrl+Shift+Y",
      click: async () => {
        if (!mainWindow || mainWindow.isDestroyed()) {
          return;
        }

        await mainWindow.webContents.executeJavaScript(`
          window.dispatchEvent(
            new Event("open-yard-fees")
          );
        `);
      },
    },
    {
      label: "Inventory",
      click: async () => {
        if (!mainWindow || mainWindow.isDestroyed()) {
          return;
        }

        await mainWindow.webContents.executeJavaScript(`
          window.dispatchEvent(
            new Event("open-inventory")
          );
        `);
      },
    },
  ],
},
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "close" },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};


const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,

    minWidth: 1200,
    minHeight: 700,

    resizable: true,
    maximizable: true,

    backgroundColor: "#111827",

    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  createApplicationMenu();

  mainWindow.webContents.openDevTools();
};

const registerBusinessLogoHandlers = () => {
  ipcMain.handle("business-logo:select", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "Select business logo",
      properties: ["openFile"],
      filters: [
        {
          name: "Images",
          extensions: ["png", "jpg", "jpeg", "webp"],
        },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const sourcePath = result.filePaths[0];

    const sourceStats = fs.statSync(sourcePath);
    const maxSizeBytes = 2 * 1024 * 1024;

    if (sourceStats.size > maxSizeBytes) {
      throw new Error(
        "The logo must be smaller than 2 MB."
      );
    }

    const extension = path
      .extname(sourcePath)
      .toLowerCase();

    const allowedExtensions = [
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
    ];

    if (!allowedExtensions.includes(extension)) {
      throw new Error(
        "Select a PNG, JPG, JPEG or WEBP image."
      );
    }

    const assetsDirectory = path.join(
      app.getPath("userData"),
      "assets"
    );

    fs.mkdirSync(assetsDirectory, {
      recursive: true,
    });

    const destinationPath = path.join(
      assetsDirectory,
      `company-logo${extension}`
    );

    fs.copyFileSync(
      sourcePath,
      destinationPath
    );

    const fileBuffer = fs.readFileSync(destinationPath);

    const mimeType =
      extension === ".png"
        ? "image/png"
        : extension === ".webp"
          ? "image/webp"
          : "image/jpeg";

    const dataUrl =
      `data:${mimeType};base64,` +
      fileBuffer.toString("base64");

    return {
      path: destinationPath,
      url: dataUrl,
    };
  });
};
const registerInvoicePdfHandlers = () => {
  ipcMain.handle(
    "invoice:save-pdf",
    async (event, invoiceNumber) => {
      const sourceWindow =
        BrowserWindow.fromWebContents(
          event.sender
        );

      if (
        !sourceWindow ||
        sourceWindow.isDestroyed()
      ) {
        throw new Error(
          "The invoice window is not available."
        );
      }

      const safeInvoiceNumber = String(
        invoiceNumber || "invoice"
      ).replace(/[^a-zA-Z0-9-_]/g, "-");

      const saveResult =
        await dialog.showSaveDialog(
          sourceWindow,
          {
            title: "Save Invoice as PDF",
            defaultPath:
              `${safeInvoiceNumber}.pdf`,
            filters: [
              {
                name: "PDF Document",
                extensions: ["pdf"],
              },
            ],
          }
        );

      if (
        saveResult.canceled ||
        !saveResult.filePath
      ) {
        return {
          canceled: true,
          filePath: null,
        };
      }

    const pdfBuffer =
      await sourceWindow.webContents.printToPDF({
        printBackground: true,
        pageSize: "Letter",
        preferCSSPageSize: true,
        landscape: false,
      });

      fs.writeFileSync(
        saveResult.filePath,
        pdfBuffer
      );

      return {
        canceled: false,
        filePath: saveResult.filePath,
      };
    }
  );
};
app.whenReady().then(() => {
  registerBusinessLogoHandlers();
  registerInvoicePdfHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});