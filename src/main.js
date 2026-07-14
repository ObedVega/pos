const { app, BrowserWindow, Menu } = require("electron");

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

    minWidth: 1600,
    minHeight: 900,

    resizable: false,
    maximizable: false,

    backgroundColor: "#111827",

    webPreferences: {
    //  preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  createApplicationMenu();

  mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
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