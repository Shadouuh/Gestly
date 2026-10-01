-- Prototype: business-owned custom sections. Values are keyed by column ID in JSON.
CREATE TABLE IF NOT EXISTS custom_tables (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  business_id BIGINT NOT NULL,
  title VARCHAR(120) NOT NULL,
  subtitle VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_custom_tables_business (business_id),
  CONSTRAINT fk_custom_tables_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS custom_columns (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  table_id BIGINT NOT NULL,
  name VARCHAR(80) NOT NULL,
  data_type ENUM('text', 'number', 'date', 'boolean') NOT NULL DEFAULT 'text',
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_custom_columns_table_position (table_id, position),
  CONSTRAINT fk_custom_columns_table FOREIGN KEY (table_id) REFERENCES custom_tables(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS custom_rows (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  table_id BIGINT NOT NULL,
  values_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_custom_rows_table (table_id),
  CONSTRAINT fk_custom_rows_table FOREIGN KEY (table_id) REFERENCES custom_tables(id) ON DELETE CASCADE
);
