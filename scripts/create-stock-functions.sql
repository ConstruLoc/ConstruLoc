-- Function to decrement equipment stock
CREATE OR REPLACE FUNCTION decrement_equipment_stock(
  equipment_id UUID,
  quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE equipamentos
  SET quantidade = GREATEST(0, quantidade - quantity)
  WHERE id = equipment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment equipment stock (for returns/cancellations)
CREATE OR REPLACE FUNCTION increment_equipment_stock(
  equipment_id UUID,
  quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE equipamentos
  SET quantidade = quantidade + quantity
  WHERE id = equipment_id;
END;
$$ LANGUAGE plpgsql;
