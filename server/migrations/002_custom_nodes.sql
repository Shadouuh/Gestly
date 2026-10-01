-- A node is a sidebar section. It can contain several custom tables.
CREATE TABLE IF NOT EXISTS custom_nodes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  business_id BIGINT NOT NULL,
  title VARCHAR(120) NOT NULL,
  subtitle VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_custom_nodes_business (business_id),
  CONSTRAINT fk_custom_nodes_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- The remaining ALTERs and the existing-table backfill are run conditionally by
-- scripts/migrate-custom-nodes.js so this migration can be rerun safely.
