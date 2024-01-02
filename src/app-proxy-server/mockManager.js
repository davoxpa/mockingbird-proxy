const fs = require("fs");
const path = require("path");
const { BrowserWindow, ipcMain } = require("electron");
const StoreManager = require('../storeManager');
const storeManager = StoreManager.getInstance();

// Definisci il percorso della cartella che desideri controllare/creare

let folderPath;

const startMockManager = () => {
  console.log('startMockManager', storeManager.getConfig().dirPath);
  folderPath = storeManager.getConfig().dirPath;
}

const saveMock = (filename, mock) => {
  const filePath = path.join(folderPath, filename + ".json");
  fs.writeFileSync(
    filePath,
    JSON.stringify(mock, null, 2)
  );
  ipcMain.emit('requestFilesList');
}

const getMock = (filename) => {
  try {
    const filePath = path.join(folderPath, filename + ".json");
    const fileContent = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileContent); 
  } catch (error) {
    console.log("mock non esistente :", filename);
    return null;
  }
}

const deleteMock = (filename) => {
  try {
    const filePath = path.join(folderPath, filename + ".json");
    fs.unlinkSync(filePath);
    console.log(`File '${filename}' eliminato con successo.`);
    return true;
  } catch (error) {
    console.log("mock non esistente :", filename);
    return false;
  }
}

const deleteAllMock = () => {
  try{
    const files = fs.readdirSync(folderPath);
    files.forEach((file) => {
      fs.unlinkSync(path.join(folderPath, file));
    });
  } catch (error) {
    console.log("error:", error);
  }
}

const getAllMock = () => {
  try {
    const files = fs.readdirSync(folderPath);
    let mockList = [];
    files.forEach((file) => {
      if (file.endsWith(".json")) {
        const filePath = path.join(folderPath, file);
        const fileContent = fs.readFileSync(filePath, "utf8");
        const mock = JSON.parse(fileContent);
        mockList.push(mock);
      }
    });

    mockList = mockList.sort((a, b) => {
      return a.timestamp - b.timestamp;
    });

    mockList.forEach((mock) => {
      console.log(mock.timestamp, mock.targetUrl);
    });
    return mockList;
  } catch (error) {
    console.log("error:", error);
    return null;
  }
}

const filterMock = (search) => {
  try {
    const files = fs.readdirSync(folderPath);
    let mockList = [];
    files.forEach((file) => {
      if (file.endsWith(".json")) {
        const filePath = path.join(folderPath, file);
        const fileContent = fs.readFileSync(filePath, "utf8");
        const mock = JSON.parse(fileContent);
        mockList.push(mock);
      }
    });

    mockList = mockList.sort((a, b) => {
      return a.timestamp - b.timestamp;
    });

    mockList = mockList.filter((mock) => {
      mockString = JSON.stringify(mock);
      mockString = mockString.toLowerCase();
      search = search.toLowerCase();
      return mockString.includes(search);
    });
    return mockList;
  } catch (error) {
    console.log("error:", error);
    return null;
  }
}

const changeValueOnMock = (filename, key, value) => {
  try {
    let mock = getMock(filename);
    mock[key] = value;
    saveMock(filename, mock);
    console.log(`File '${filename}' salvato con successo.`);
    return true;
  } catch (error) {
    console.log("mock non esistente :", filename);
    return false;
  }
}

module.exports = {
  saveMock,
  getMock,
  deleteMock,
  deleteAllMock,
  getAllMock,
  startMockManager,
  changeValueOnMock,
  filterMock
};
