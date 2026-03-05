import { app, BrowserWindow, Menu, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.DIST = path.join(__dirname$1, "../dist");
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, "../public");
let win;
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
function createWindow() {
  Menu.setApplicationMenu(null);
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC || "", "favicon.ico"),
    frame: false,
    webPreferences: {
      preload: path.join(__dirname$1, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  if (VITE_DEV_SERVER_URL) {
    win.webContents.openDevTools();
  }
  ipcMain.on("window-minimize", (event) => {
    console.log("Main: minimize requested");
    const browserWindow = BrowserWindow.fromWebContents(event.sender);
    browserWindow?.minimize();
  });
  ipcMain.on("window-maximize", (event) => {
    console.log("Main: maximize/unmaximize requested");
    const browserWindow = BrowserWindow.fromWebContents(event.sender);
    if (browserWindow?.isMaximized()) {
      browserWindow.unmaximize();
    } else {
      browserWindow?.maximize();
    }
  });
  ipcMain.on("window-close", (event) => {
    console.log("Main: close requested");
    const browserWindow = BrowserWindow.fromWebContents(event.sender);
    browserWindow?.close();
  });
  win.on("maximize", () => {
    console.log("Main: Window maximized");
    win?.webContents.send("window-maximized", true);
  });
  win.on("unmaximize", () => {
    console.log("Main: Window unmaximized");
    win?.webContents.send("window-maximized", false);
  });
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.env.DIST || "", "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
