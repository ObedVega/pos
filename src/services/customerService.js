const customerService = {
  async getAll() {
    if (!window.electronAPI?.getCustomers) {
      throw new Error(
        "Customer API is not available."
      );
    }

    return window.electronAPI.getCustomers();
  },

  async getById(customerId) {
    if (!window.electronAPI?.getCustomerById) {
      throw new Error(
        "Customer API is not available."
      );
    }

    return window.electronAPI.getCustomerById(
      customerId
    );
  },

  async search(searchTerm) {
    if (!window.electronAPI?.searchCustomers) {
      throw new Error(
        "Customer API is not available."
      );
    }

    return window.electronAPI.searchCustomers(
      searchTerm
    );
  },

  async create(customer) {
    if (!window.electronAPI?.createCustomer) {
      throw new Error(
        "Customer API is not available."
      );
    }

    return window.electronAPI.createCustomer(
      customer
    );
  },

  async update(customerId, customer) {
    if (!window.electronAPI?.updateCustomer) {
      throw new Error(
        "Customer API is not available."
      );
    }

    return window.electronAPI.updateCustomer(
      customerId,
      customer
    );
  },

  async delete(customerId) {
    if (!window.electronAPI?.deleteCustomer) {
      throw new Error(
        "Customer API is not available."
      );
    }

    return window.electronAPI.deleteCustomer(
      customerId
    );
  },
};

export default customerService;