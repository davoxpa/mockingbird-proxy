const fs = require("fs");
const Store = require('electron-store');
const path = require("path");
const { ipcMain } = require("electron");

// Definisci il percorso della cartella che desideri controllare/creare
const store = new Store();
let folderPath;

const startMockManager = () => {
  console.log('startMockManager', store.get('dirPath'));
  folderPath = store.get('dirPath');
  // Verifica se la cartella esiste
  // if (!fs.existsSync(folderPath)) {
  //   // Se la cartella non esiste, creala
  //   fs.mkdirSync(folderPath);
  //   console.log(`Cartella '${folderPath}' creata con successo.`);
  // } else {
  //   console.log(`La cartella '${folderPath}' esiste già.`);
  // }
}

const saveMock = (filename, mock) => {
  const filePath = path.join(folderPath, filename + ".json");
  fs.writeFileSync(
    filePath,
    JSON.stringify(mock, null, 2)
  );
  ipcMain.emit('saveNewMock', mock);
  console.log(`File '${filename}' salvato con successo.`);
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
  getAllMock,
  startMockManager,
  changeValueOnMock
};
