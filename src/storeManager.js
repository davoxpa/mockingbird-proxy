const Store = require('electron-store');

// Singleton instance
let instance = null;

class StoreManager {
  constructor() {
    // init store per l'archiviazione dei dati
    this.store = new Store();

    this.initConfig = {
      port: 3000,
      dirPath: '',
      bypassGlobal: false,
      historyStoreDirPath: []
    };

    this.init();
  }

  static getInstance() {
    if (!instance) {
      instance = new StoreManager();
    }
    return instance;
  }

  init() {
    if (!this.store.get('config')) {
      this.store.set('config', this.initConfig);
    }
  }

  getConfig() {
    return this.store.get('config');
  }

  setSingleConfig(key, value) {
    let config = this.getConfig();
    config[key] = value;
    this.store.set('config', config);
  }
}

module.exports = StoreManager;

