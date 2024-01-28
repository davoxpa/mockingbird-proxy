class CircularLog {
    constructor(maxSize) {
        if (!CircularLog.instance) {
            this.maxSize = maxSize;
            this.data = [];
            CircularLog.instance = this;
        }

        return CircularLog.instance;
    }

    _logInternal(items, type) {
        const itemsAsString = items.map((item) => {
            if (typeof item === 'object') {
                try {
                    return JSON.stringify(item, null, 2);
                } catch (error) {
                    return '[Object non serializzabile]';
                }
            } else {
                return String(item);
            }
        });

        const combinedItem = itemsAsString.join(' ');
        if (this.data.length === this.maxSize) {
            this.data.shift();
        }
        this.data.push({ message: combinedItem, type });

        // Stampa su console
        if (type === 'log') {
            console.log(...items);
        } else if (type === 'error') {
            console.error(...items);
        }
    }

    log(...items) {
        this._logInternal(items, 'log');
    }

    error(...items) {
        this._logInternal(items, 'error');
    }

    warn(...items) {
        this._logInternal(items, 'warn');
    }

    info(...items) {
        this._logInternal(items, 'info');
    }

    getLogs() {
        return this.data;
    }
}

const instance = new CircularLog(1000);
Object.freeze(instance);

module.exports = instance;
