class BaseDriver {
  async initialize() {
    throw new Error("Not implemented");
  }

  close() {
    throw new Error("Not implemented");
  }

  getDatabase() {
    throw new Error("Not implemented");
  }

  getDatabasePath() {
    throw new Error("Not implemented");
  }

  run() {
    throw new Error("Not implemented");
  }

  get() {
    throw new Error("Not implemented");
  }

  all() {
    throw new Error("Not implemented");
  }

  prepare() {
    throw new Error("Not implemented");
  }

  transaction() {
    throw new Error("Not implemented");
  }
}

module.exports = BaseDriver;