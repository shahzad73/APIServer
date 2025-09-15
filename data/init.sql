-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(50),
    country VARCHAR(50)
);

-- Insert sample customers
INSERT INTO customers (name, address, phone, country) VALUES
('Alice Johnson', '123 Main St, New York', '+1-202-555-0123', 'USA'),
('Bob Smith', '456 Elm St, London', '+44-20-7946-1234', 'UK'),
('Carlos Lopez', '789 Maple Ave, Madrid', '+34-91-555-6789', 'Spain'),
('Diana Chen', '12 Orchard Rd, Singapore', '+65-6789-1234', 'Singapore');


