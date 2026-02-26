CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
    order_type VARCHAR(20) CHECK (order_type IN ('trip', 'parcel', 'car_transport')),
    city_from VARCHAR(100) NOT NULL,
    city_to VARCHAR(100) NOT NULL,
    pickup_address TEXT,
    dropoff_address TEXT,
    departure_date DATE NOT NULL,
    departure_time TIME,
    passengers_count INTEGER,
    parcel_weight DECIMAL(8,2),
    parcel_description TEXT,
    recipient_name VARCHAR(255),
    recipient_phone VARCHAR(20),
    client_car_brand VARCHAR(100),
    client_car_model VARCHAR(100),
    client_car_year INTEGER,
    client_car_number VARCHAR(20),
    comment TEXT,
    calculated_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'driver_on_way', 'in_progress', 'completed', 'cancelled')),
    cancel_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_driver_id ON orders(driver_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_type ON orders(order_type);
CREATE INDEX idx_orders_cities ON orders(city_from, city_to);
CREATE INDEX idx_orders_departure_date ON orders(departure_date);
