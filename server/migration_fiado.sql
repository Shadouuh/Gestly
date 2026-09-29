CREATE TABLE IF NOT EXISTS customer_debts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  business_id BIGINT NOT NULL,
  customer_id BIGINT NOT NULL,
  sale_id BIGINT NULL,
  branch_id BIGINT NULL,
  amount DECIMAL(15,2) NOT NULL,
  paid DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL,
  FOREIGN KEY (business_id) REFERENCES businesses(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (sale_id) REFERENCES sales(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);

ALTER TABLE customers ADD COLUMN IF NOT EXISTS debt_balance DECIMAL(15,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'paid';
