-- Migration 2 Example: Add inventory control setting
-- This migration adds the enable_inventory_control field to business_settings
-- DO NOT USE - This is just an example of how to create future migrations

-- Add the new column to business_settings table
ALTER TABLE business_settings 
ADD COLUMN enable_inventory_control INTEGER DEFAULT 1;

-- Update existing records to have the new field
UPDATE business_settings 
SET enable_inventory_control = 1 
WHERE enable_inventory_control IS NULL;
