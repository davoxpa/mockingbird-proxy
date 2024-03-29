const fs = require("fs");
const path = require("path");
const { BrowserWindow, ipcMain } = require("electron");
const StoreManager = require('../storeManager');
const storeManager = StoreManager.getInstance();
const crypto = require('crypto');
const { get } = require("jquery");
const mblog = require('../helper/log.helper');

// Definisci il percorso della cartella che desideri controllare/creare

let folderPath;

const startMockManager = () => {
  console.log('startMockManager', storeManager.getConfig().dirPath);
  folderPath = storeManager.getConfig().dirPath;
  updateModel();
}

const updateModel = () => {
  console.log('updateModel')
  mblog.log('check mock files and update model if needed')
  // cycle all file and update model
  const files = getAllMock();
  files.forEach((file) => {
    if (file.delay === undefined) {
      file["delay"] = 0;
      saveMock(file.uuid, file);
    }
  });
}

const saveMock = (filename, mock) => {
  const filePath = path.join(folderPath, filename + ".json");
  fs.writeFileSync(
    filePath,
    JSON.stringify(mock, null, 2)
  );
  ipcMain.emit('requestFilesList');
  mblog.log(`File '${filename}' saved successfully.`);
}

const getMock = (filename) => {
  try {
    const filePath = path.join(folderPath, filename + ".json");
    const fileContent = fs.readFileSync(filePath, "utf8");
    mblog.log(`File '${filename}' found.`);
    return JSON.parse(fileContent); 
  } catch (error) {
    console.log("mock non esistente :", filename);
    mblog.error(`File '${filename}' not found.`);
    return null;
  }
}

const createMock = (data) => {
  try {
    if (data.payload && data.payload.length > 0) {
        data.uuid = crypto
            .createHash('sha256')
            .update(data.targetUrl + JSON.stringify(data.payload))
            .digest('hex');
    } else {
        data.uuid = crypto.createHash('sha256').update(data.targetUrl + JSON.stringify({})).digest('hex');
    }
    data["delay"] = 0;
    mblog.log(`Creating mock for ${data.targetUrl} with uuid ${data.uuid}`);
    return saveMock(data.uuid, data);    
  } catch (error) {
    mblog.error(`Error on createMock: ${error}`);
  }
}

const deleteMock = (filename) => {
  try {
    const filePath = path.join(folderPath, filename + ".json");
    fs.unlinkSync(filePath);
    console.log(`File '${filename}' eliminato con successo.`);
    mblog.log(`File '${filename}' eliminato con successo.`);
    return true;
  } catch (error) {
    console.log("mock non esistente :", filename);
    mblog.error(`File '${filename}' non trovato.`);
    return false;
  }
}

const deleteAllMock = () => {
  try{
    const files = fs.readdirSync(folderPath);
    files.forEach((file) => {
      fs.unlinkSync(path.join(folderPath, file));
    });
    mblog.log(`All mock files deleted successfully.`);
  } catch (error) {
    console.log("error:", error);
    mblog.error(`Error on deleteAllMock: ${error}`);
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
    mblog.error(`Error on getAllMock: ${error}`);
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
    mblog.error(`Error on filterMock: ${error}`);
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
    mblog.error(`Error on changeValueOnMock: ${error}`);
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
  filterMock,
  createMock,
};
