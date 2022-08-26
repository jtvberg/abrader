// Imports and variable declarations
const { app, BrowserWindow, nativeTheme, systemPreferences } = require('electron')
const path = require('path')
const updater = require('./updater')
const isDev = !app.isPackaged
const isMac = process.platform === 'darwin'
const isLinux = process.platform === 'linux'
const isWindows = process.platform === 'win32'

// Main window
let win = null
const createWindow = () => {
  // Create main window
  win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    transparent: isMac,
    hasShadow: false,
    frame: !isMac,
    visualEffectState: 'active',
    titleBarStyle: isMac ? 'hidden' : 'default',
    trafficLightPosition: {
      x: 7,
      y: 7
    },
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      worldSafeExecuteJavaScript: true
    }
  })

  // HTML file to load into window
  win.loadFile('main.html')

  // Show window when ready
  win.once('ready-to-show', () => {
    win.show()
    win.setVibrancy('light')
  })

  // Open DevTools (dev only)
  isDev && win.webContents.openDevTools('detach')

  win.on('ready-to-show', () => {
    if (!isLinux) {
      getAccent()
    }
    if (isMac) {
      systemPreferences.subscribeNotification('AppleColorPreferencesChangedNotification', () => {
        getAccent()
      })
    }
  })

  win.setVibrancy('light')

  nativeTheme.on('updated', () => {
    if (nativeTheme.shouldUseDarkColors) {
      win.setVibrancy('dark')
    } else {
      win.setVibrancy('light')
    }
  })
}

// Load electron-reload in dev
if (isDev) {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
  })
}

// Get system accent color
function getAccent() {
  win.webContents.send('set-accent', `#${systemPreferences.getAccentColor()}`)
}

// Instantiate window and tray on app ready
app.whenReady().then(() => {
  try {
    createWindow()
    // Check for updates after 3 seconds
    !isDev && setTimeout(updater, 3000)
  } catch (err) { console.error(err) }
})

// Create window if one doesn't exist
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// CLose app if all windows are closed (not Mac)
app.on('window-all-closed', () => {
  app.quit()
})
