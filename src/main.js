const {
  app,
  BrowserWindow,
  Menu,
  dialog,
  ipcMain,
} = require("electron");

const fs = require("node:fs");
const path = require("node:path");

const database = require("./database/database");
const productRepository = require("./database/repositories/productRepository");
const productsSeed = require("./database/seeds/productsSeed");
const customerRepository = require("./database/repositories/customerRepository");
const customersSeed = require("./database/seeds/customersSeed");
const dailyNoticeRepository = require("./database/repositories/dailyNoticeRepository");
const dailyNoticeSeed = require("./database/seeds/dailyNotice");

if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow;
try {
  const { DatabaseSync } = require("node:sqlite");
  console.log("✅ node:sqlite disponible");
} catch (e) {
  console.error("❌ node:sqlite NO disponible");
  console.error(e);
  app.quit();
}
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
    {
  label: "Help",
  submenu: [
    {
      label: "Keyboard Shortcuts",
      accelerator: "F1",
      click: async () => {
        if (!mainWindow || mainWindow.isDestroyed()) {
          return;
        }

        await dialog.showMessageBox(mainWindow, {
          type: "info",
          title: "Keyboard Shortcuts",
          message: "Chiquita Catering POS",
          detail: [
            "Ctrl + N              New Sale",
            "Ctrl + Shift + C      Customers",
            "Ctrl + Shift + I      Items",
            "Ctrl + Shift + D      Daily Notice",
            "Ctrl + Shift + B      Business Settings",
            "Ctrl + Shift + Y      Yard Fees",
            "F1                    Keyboard Shortcuts",
            "Ctrl + Q              Exit",
          ].join("\n"),
          buttons: ["Close"],
          defaultId: 0,
          noLink: true,
        });
      },
    },
    {
      label: "System Information",
      click: async () => {
        if (!mainWindow || mainWindow.isDestroyed()) {
          return;
        }

        await dialog.showMessageBox(mainWindow, {
          type: "info",
          title: "System Information",
          message: "Chiquita Catering POS",
          detail: [
            `Application version: ${app.getVersion()}`,
            `Electron version: ${process.versions.electron}`,
            `Chrome version: ${process.versions.chrome}`,
            `Node.js version: ${process.versions.node}`,
            `Operating system: ${process.platform}`,
            `Architecture: ${process.arch}`,
          ].join("\n"),
          buttons: ["Close"],
          defaultId: 0,
          noLink: true,
        });
      },
    },
    {
      label: "User Guide",
      click: async () => {
        if (!mainWindow || mainWindow.isDestroyed()) {
          return;
        }

        await dialog.showMessageBox(mainWindow, {
          type: "info",
          title: "User Guide",
          message: "Chiquita Catering POS User Guide",
          detail: [
            "1. Select a customer.",
            "2. Scan or enter the product UPC.",
            "3. Enter the quantity.",
            "4. Press Add Item.",
            "5. Review the sale summary.",
            "6. Press Complete Sale.",
          ].join("\n"),
          buttons: ["Close"],
          defaultId: 0,
          noLink: true,
        });
      },
    },
    { type: "separator" },
    {
      label: "About",
      click: async () => {
        if (!mainWindow || mainWindow.isDestroyed()) {
          return;
        }

        await dialog.showMessageBox(mainWindow, {
          type: "info",
          title: "About Chiquita Catering POS",
          message: "Chiquita Catering POS",
          detail: [
            `Version ${app.getVersion()}`,
            "",
            "Warehouse Management System",
            "",
            "Designed and developed by Obed Vega.",
            "",
            "Point of sale, customer, inventory",
            "and invoice management software.",
            "",
            "© 2026 Chiquita Catering",
          ].join("\n"),
          buttons: ["Close"],
          defaultId: 0,
          noLink: true,
        });
      },
    },
    {
  label: "Contact Support",
  click: async () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    await dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Contact Support",
      message: "Software Support",
      detail: [
        "Developed by Obed Vega",
        "",
        "Email: vega.obed@gmail.com",
        "Phone: +526642813146",
      ].join("\n"),
      buttons: ["Close"],
      defaultId: 0,
      noLink: true,
    });
  },
},
  ],
},
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

const iconPath = app.isPackaged
  ? path.join(process.resourcesPath, "assets", "icon.png")
  : path.join(__dirname, "../assets/icon.png");

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    icon: iconPath,
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

const registerProductHandlers = () => {
    console.log("REGISTERING PRODUCT/CUSTOMER HANDLERS");
  ipcMain.handle(
    "products:get-all",
    async () => {
      return productRepository.getAll();
    }
  );


ipcMain.handle("customers:get-all", () => {
  console.log("customers:get-all handler called");

  return customerRepository.getAll();
});

ipcMain.handle(
  "customers:get-by-id",
  (_event, customerId) => {
    return customerRepository.getById(customerId);
  }
);

ipcMain.handle(
  "customers:search",
  (_event, searchTerm) => {
    return customerRepository.search(searchTerm);
  }
);

ipcMain.handle(
  "customers:create",
  (_event, customer) => {
    return customerRepository.create(customer);
  }
);

ipcMain.handle(
  "customers:update",
  (_event, customerId, customer) => {
    return customerRepository.update(
      customerId,
      customer
    );
  }
);

ipcMain.handle(
  "customers:delete",
  (_event, customerId) => {
    return customerRepository.delete(customerId);
  }
);
  ipcMain.handle(
    "products:get-by-upc",
    async (_event, upc) => {
      return productRepository.getByUPC(upc);
    }
  );

  ipcMain.handle(
    "products:create",
    async (_event, product) => {
      return productRepository.create(
        product
      );
    }
  );

  ipcMain.handle(
    "products:update",
    async (
      _event,
      originalUPC,
      product
    ) => {
      return productRepository.update(
        originalUPC,
        product
      );
    }
  );

  ipcMain.handle(
    "products:update-stock",
    async (_event, upc, newStock) => {
      return productRepository.updateStock(
        upc,
        newStock
      );
    }
  );

  ipcMain.handle(
    "products:delete",
    async (_event, upc) => {
      return productRepository.remove(upc);
    }
  );
  ipcMain.handle("daily-notice:get", () => {
  return dailyNoticeRepository.get();
});

ipcMain.handle(
  "daily-notice:save",
  (_event, notice) => {
    return dailyNoticeRepository.save(
      notice
    );
  }
);
};

app.whenReady().then(() => {
  database.initialize(app);

  productRepository.seed(productsSeed);
customerRepository.seed(customersSeed);
dailyNoticeRepository.seed(dailyNoticeSeed);
  registerBusinessLogoHandlers();
  registerInvoicePdfHandlers();
  registerProductHandlers();

  createWindow();

  app.on("activate", () => {
    if (
      BrowserWindow.getAllWindows().length === 0
    ) {
      createWindow();
    }
  });
});

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }

    app.on("before-quit", () => {
    database.close();
  });
});