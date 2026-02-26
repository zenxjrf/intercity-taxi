CREATE TABLE IF NOT EXISTS prices (
    id SERIAL PRIMARY KEY,
    city_from VARCHAR(100) NOT NULL,
    city_to VARCHAR(100) NOT NULL,
    trip_price_per_person DECIMAL(10,2) NOT NULL,
    parcel_price_per_kg DECIMAL(10,2) NOT NULL,
    parcel_min_price DECIMAL(10,2) NOT NULL,
    car_transport_price DECIMAL(10,2) NOT NULL,
    distance_km INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(city_from, city_to)
);

CREATE INDEX idx_prices_cities ON prices(city_from, city_to);
CREATE INDEX idx_prices_is_active ON prices(is_active);
