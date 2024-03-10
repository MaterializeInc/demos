GO
USE testDB;
EXEC sys.sp_cdc_enable_db;

INSERT INTO orders(order_date,purchaser,quantity,product_id)
  VALUES ('16-JAN-2016', 1001, 1, 102);
INSERT INTO orders(order_date,purchaser,quantity,product_id)
  VALUES ('17-JAN-2016', 1002, 2, 105);
INSERT INTO orders(order_date,purchaser,quantity,product_id)
  VALUES ('19-FEB-2016', 1002, 2, 106);
INSERT INTO orders(order_date,purchaser,quantity,product_id)
  VALUES ('21-FEB-2016', 1003, 1, 107);

-- Update 4 rows in the orders table
UPDATE orders SET quantity = 5 WHERE id IN (SELECT TOP 4 id FROM orders ORDER BY id);

-- Delete 4 rows from the orders table
DELETE FROM orders WHERE id IN (SELECT TOP 4 id FROM orders ORDER BY id);
GO
