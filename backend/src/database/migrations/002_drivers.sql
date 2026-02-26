CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    birth_year INTEGER,
    experience_years INTEGER DEFAULT 0,
    phone VARCHAR(20),
    photo_url TEXT,
    car_brand VARCHAR(100) NOT NULL,
    car_model VARCHAR(100) NOT NULL,
    car_year INTEGER,
    car_color VARCHAR(50),
    car_number VARCHAR(20),
    car_seats INTEGER DEFAULT 4,
    car_photo_url TEXT,
    can_transport_car BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    last_online_at TIMESTAMP,
    rating DECIMAL(2,1) DEFAULT 5.0,
    total_trips INTEGER DEFAULT 0,
    cancelled_orders INTEGER DEFAULT 0,
    working_routes JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_drivers_user_id ON drivers(user_id);
CREATE INDEX idx_drivers_is_online ON drivers(is_online);
CREATE INDEX idx_drivers_is_approved ON drivers(is_approved);
