-- Migration: add columns for admin and app functionality
ALTER TABLE businesses
  ADD COLUMN city VARCHAR(100) DEFAULT NULL AFTER rubro,
  ADD COLUMN address VARCHAR(255) DEFAULT NULL AFTER city,
  ADD COLUMN phone VARCHAR(50) DEFAULT NULL AFTER address,
  ADD COLUMN email VARCHAR(150) DEFAULT NULL AFTER phone;

ALTER TABLE business_users
  ADD COLUMN active BOOLEAN DEFAULT TRUE AFTER is_owner;

ALTER TABLE product_variants
  ADD COLUMN active BOOLEAN DEFAULT TRUE AFTER extra_price,
  ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER active;
