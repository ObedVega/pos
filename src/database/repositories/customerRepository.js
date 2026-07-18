const database = require("../database");

const mapCustomerRow = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.customer_number),
    customerNumber: Number(row.customer_number),
    name: row.name,
    permitNumber: row.permit_number ?? "",
    truckNumber: row.truck_number ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
};

const normalizeCustomer = (customer) => {
  const customerNumber = Number(
    customer.customerNumber ?? customer.customer_number ?? customer.id
  );

  if (!Number.isInteger(customerNumber) || customerNumber <= 0) {
    throw new Error(
      "Customer number must be a positive integer."
    );
  }

  const name = String(customer.name ?? "").trim();

  if (!name) {
    throw new Error("Customer name is required.");
  }

  return {
    customerNumber,
    name,
    permitNumber: String(
      customer.permitNumber ??
        customer.permit_number ??
        ""
    ).trim(),
    truckNumber: String(
      customer.truckNumber ??
        customer.truck_number ??
        ""
    ).trim(),
    phone: String(customer.phone ?? "").trim(),
    email: String(customer.email ?? "").trim(),
  };
};

const customerRepository = {
  getAll() {
    const rows = database.all(`
      SELECT
        customer_number,
        name,
        permit_number,
        truck_number,
        phone,
        email,
        created_at,
        updated_at,
        deleted_at
      FROM customers
      WHERE deleted_at IS NULL
      ORDER BY name COLLATE NOCASE ASC
    `);

    return rows.map(mapCustomerRow);
  },

  getByCustomerNumber(customerNumber) {
    const normalizedCustomerNumber =
      Number(customerNumber);

    if (
      !Number.isInteger(normalizedCustomerNumber) ||
      normalizedCustomerNumber <= 0
    ) {
      return null;
    }

    const row = database.get(
      `
        SELECT
          customer_number,
          name,
          permit_number,
          truck_number,
          phone,
          email,
          created_at,
          updated_at,
          deleted_at
        FROM customers
        WHERE customer_number = ?
          AND deleted_at IS NULL
      `,
      normalizedCustomerNumber
    );

    return mapCustomerRow(row);
  },

  getById(customerId) {
    return this.getByCustomerNumber(customerId);
  },

  search(searchTerm) {
    const normalizedSearch =
      String(searchTerm ?? "").trim();

    if (!normalizedSearch) {
      return this.getAll();
    }

    const searchValue = `%${normalizedSearch}%`;

    const rows = database.all(
      `
        SELECT
          customer_number,
          name,
          permit_number,
          truck_number,
          phone,
          email,
          created_at,
          updated_at,
          deleted_at
        FROM customers
        WHERE deleted_at IS NULL
          AND (
            CAST(customer_number AS TEXT) LIKE ?
            OR name LIKE ?
            OR permit_number LIKE ?
            OR truck_number LIKE ?
            OR phone LIKE ?
            OR email LIKE ?
          )
        ORDER BY name COLLATE NOCASE ASC
      `,
      searchValue,
      searchValue,
      searchValue,
      searchValue,
      searchValue,
      searchValue
    );

    return rows.map(mapCustomerRow);
  },

create(customer) {
  const name = String(
    customer.name ?? ""
  ).trim();

  if (!name) {
    throw new Error(
      "Customer name is required."
    );
  }

  const permitNumber = String(
    customer.permitNumber ??
      customer.permit_number ??
      ""
  ).trim();

  const truckNumber = String(
    customer.truckNumber ??
      customer.truck_number ??
      ""
  ).trim();

  const phone = String(
    customer.phone ?? ""
  ).trim();

  const email = String(
    customer.email ?? ""
  ).trim();

  const result = database.run(
    `
      INSERT INTO customers (
        name,
        permit_number,
        truck_number,
        phone,
        email
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    name,
    permitNumber,
    truckNumber,
    phone,
    email
  );

  return this.getByCustomerNumber(
    Number(result.lastInsertRowid)
  );
},

  update(customerNumber, changes) {
    const currentCustomer =
      this.getByCustomerNumber(customerNumber);

    if (!currentCustomer) {
      throw new Error("Customer not found.");
    }

    const normalized = normalizeCustomer({
      ...currentCustomer,
      ...changes,
      customerNumber:
        changes.customerNumber ??
        changes.customer_number ??
        changes.id ??
        currentCustomer.customerNumber,
    });

    const newCustomerNumber =
      normalized.customerNumber;

    if (
      newCustomerNumber !==
      currentCustomer.customerNumber
    ) {
      const conflictingCustomer =
        this.getByCustomerNumber(
          newCustomerNumber
        );

      if (conflictingCustomer) {
        throw new Error(
          `Customer number ${newCustomerNumber} already exists.`
        );
      }
    }

    database.run(
      `
        UPDATE customers
        SET
          customer_number = ?,
          name = ?,
          permit_number = ?,
          truck_number = ?,
          phone = ?,
          email = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE customer_number = ?
          AND deleted_at IS NULL
      `,
      normalized.customerNumber,
      normalized.name,
      normalized.permitNumber,
      normalized.truckNumber,
      normalized.phone,
      normalized.email,
      currentCustomer.customerNumber
    );

    return this.getByCustomerNumber(
      normalized.customerNumber
    );
  },

  delete(customerNumber) {
    const normalizedCustomerNumber =
      Number(customerNumber);

    const result = database.run(
      `
        UPDATE customers
        SET
          deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE customer_number = ?
          AND deleted_at IS NULL
      `,
      normalizedCustomerNumber
    );

    return result.changes > 0;
  },

  restore(customerNumber) {
    const normalizedCustomerNumber =
      Number(customerNumber);

    const result = database.run(
      `
        UPDATE customers
        SET
          deleted_at = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE customer_number = ?
          AND deleted_at IS NOT NULL
      `,
      normalizedCustomerNumber
    );

    return result.changes > 0;
  },

  count() {
    const result = database.get(`
      SELECT COUNT(*) AS total
      FROM customers
      WHERE deleted_at IS NULL
    `);

    return Number(result?.total ?? 0);
  },

    seed(customers) {
    if (!Array.isArray(customers)) {
      return;
    }

    const insertCustomer = database.prepare(`
      INSERT OR IGNORE INTO customers (
        customer_number,
        name,
        permit_number,
        truck_number,
        phone,
        email
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    customers.forEach((customer) => {
      insertCustomer.run(
        Number(customer.customer_number),
        String(customer.name ?? ""),
        String(customer.permit_number ?? ""),
        String(customer.truck_number ?? ""),
        String(customer.phone ?? ""),
        String(customer.email ?? "")
      );
    });
  },
};

module.exports = customerRepository;