CREATE TABLE IF NOT EXISTS cash_registers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  business_id BIGINT NOT NULL,
  branch_id BIGINT,
  opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP NULL,
  initial_amount DECIMAL(15,2) DEFAULT 0,
  expected_close DECIMAL(15,2) DEFAULT 0,
  real_close DECIMAL(15,2) DEFAULT 0,
  opened_by_user_id BIGINT,
  closed_by_user_id BIGINT,
  status ENUM('OPEN','CLOSED') DEFAULT 'OPEN',
  notes TEXT,
  FOREIGN KEY (business_id) REFERENCES businesses(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (opened_by_user_id) REFERENCES users(id),
  FOREIGN KEY (closed_by_user_id) REFERENCES users(id)
);
