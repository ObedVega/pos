const { ipcMain } = require("electron");

const customerRepository = require(
  "../database/repositories/customerRepository"
);

const registerCustomerHandlers = () => {
  console.log("Registering customer IPC handlers");

  ipcMain.handle("customers:get-all", () => {
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
};

module.exports = registerCustomerHandlers;