-- ==============================================================================
-- COLLEGE SAMOSA ORDERING & SALES MANAGEMENT SYSTEM
-- PostgreSQL / Supabase Initial Schema & Atomic Functions Migration
-- File: supabase/migrations/01_initial_schema.sql
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TABLE: customers
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. TABLE: products
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL CHECK (price >= 0),
    packs_per_unit INTEGER NOT NULL CHECK (packs_per_unit > 0),
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 3. TABLE: inventory
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE RESTRICT,
    quantity_available INTEGER NOT NULL CHECK (quantity_available >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 4. TABLE: orders
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL CHECK (status IN (
        'PENDING',
        'CONFIRMED',
        'PREPARING',
        'READY',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'REJECTED'
    )),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PAID')),
    payment_method VARCHAR(20) NOT NULL DEFAULT 'CASH' CHECK (payment_method IN ('CASH')),
    total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
    delivery_location TEXT NOT NULL,
    customer_note TEXT,
    tracking_token UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Enforce rule: UNPAID must have paid_at NULL; PAID must have paid_at NOT NULL
    CONSTRAINT chk_payment_consistency CHECK (
        (payment_status = 'UNPAID' AND paid_at IS NULL) OR
        (payment_status = 'PAID' AND paid_at IS NOT NULL)
    )
);

-- ------------------------------------------------------------------------------
-- 5. TABLE: order_items
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
    subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Subtotal must equal quantity * unit_price
    CONSTRAINT chk_subtotal_calc CHECK (subtotal = quantity * unit_price),
    -- Prevent duplicate products within the same order
    CONSTRAINT uq_order_product UNIQUE(order_id, product_id)
);

-- ------------------------------------------------------------------------------
-- 6. TABLE: order_status_history
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    note TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 7. TABLE: inventory_transactions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity_change INTEGER NOT NULL CHECK (quantity_change <> 0),
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN (
        'INITIAL_STOCK',
        'RESTOCK',
        'ORDER',
        'ORDER_CANCELLED',
        'MANUAL_ADJUSTMENT'
    )),
    reference VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_token ON orders(tracking_token);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product_id ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================
DO $$
DECLARE
    v_rice_id UUID := '11111111-1111-1111-1111-111111111111';
    v_cowpeas_id UUID := '22222222-2222-2222-2222-222222222222';
BEGIN
    -- Insert Rice Samosa Pack
    INSERT INTO products (id, name, description, price, packs_per_unit, image_url, is_available)
    VALUES (
        v_rice_id,
        'Rice Samosa Pack',
        'Crispy spiced rice samosas folded in golden pastry triangles. Served fresh and warm.',
        1000,
        2,
        'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        TRUE
    ) ON CONFLICT (id) DO NOTHING;

    -- Insert Cowpeas Samosa Pack
    INSERT INTO products (id, name, description, price, packs_per_unit, image_url, is_available)
    VALUES (
        v_cowpeas_id,
        'Cowpeas Samosa Pack',
        'Savory seasoned cowpeas (kunde) with aromatic herbs in a flaky, crunchy crust.',
        1000,
        2,
        'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
        TRUE
    ) ON CONFLICT (id) DO NOTHING;

    -- Initialize inventory rows if not exists
    INSERT INTO inventory (product_id, quantity_available)
    VALUES (v_rice_id, 40)
    ON CONFLICT (product_id) DO NOTHING;

    INSERT INTO inventory (product_id, quantity_available)
    VALUES (v_cowpeas_id, 30)
    ON CONFLICT (product_id) DO NOTHING;

    -- Seed initial stock transactions if none exist
    IF NOT EXISTS (SELECT 1 FROM inventory_transactions WHERE product_id = v_rice_id) THEN
        INSERT INTO inventory_transactions (product_id, quantity_change, transaction_type, reference)
        VALUES (v_rice_id, 40, 'INITIAL_STOCK', 'INITIAL_STOCK');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM inventory_transactions WHERE product_id = v_cowpeas_id) THEN
        INSERT INTO inventory_transactions (product_id, quantity_change, transaction_type, reference)
        VALUES (v_cowpeas_id, 30, 'INITIAL_STOCK', 'INITIAL_STOCK');
    END IF;
END $$;

-- ==============================================================================
-- ATOMIC DATABASE FUNCTIONS
-- ==============================================================================

-- 1. ATOMIC CHECKOUT FUNCTION: create_order_atomic
-- Performs atomic row lock (FOR UPDATE), checks stock, creates customer,
-- creates order, order items, inventory transactions, and status history.
CREATE OR REPLACE FUNCTION create_order_atomic(
    p_customer_name VARCHAR(100),
    p_customer_phone VARCHAR(20),
    p_customer_email VARCHAR(255),
    p_delivery_location TEXT,
    p_customer_note TEXT,
    p_items JSONB -- Array of { "product_id": "UUID", "quantity": 1 }
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_customer_id UUID;
    v_order_id UUID;
    v_tracking_token UUID := uuid_generate_v4();
    v_total_amount INTEGER := 0;
    v_item JSONB;
    v_product RECORD;
    v_inventory RECORD;
    v_subtotal INTEGER;
    v_item_qty INTEGER;
    v_prod_id UUID;
BEGIN
    -- Input validation
    IF p_customer_name IS NULL OR trim(p_customer_name) = '' THEN
        RAISE EXCEPTION 'Customer name is required';
    END IF;
    IF p_customer_phone IS NULL OR trim(p_customer_phone) = '' THEN
        RAISE EXCEPTION 'Phone number is required';
    END IF;
    IF p_customer_email IS NULL OR trim(p_customer_email) = '' THEN
        RAISE EXCEPTION 'Email is required';
    END IF;
    IF p_delivery_location IS NULL OR trim(p_delivery_location) = '' THEN
        RAISE EXCEPTION 'Delivery location is required';
    END IF;
    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Cart cannot be empty';
    END IF;

    -- Create or record customer
    INSERT INTO customers (name, phone, email)
    VALUES (trim(p_customer_name), trim(p_customer_phone), trim(p_customer_email))
    RETURNING id INTO v_customer_id;

    -- First pass: lock all inventory rows in ordered fashion to prevent deadlocks
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) ORDER BY (value->>'product_id')
    LOOP
        v_prod_id := (v_item->>'product_id')::UUID;
        v_item_qty := (v_item->>'quantity')::INTEGER;

        IF v_item_qty <= 0 THEN
            RAISE EXCEPTION 'Item quantity must be greater than 0';
        END IF;

        -- Verify product exists and is available
        SELECT id, name, price, is_available INTO v_product
        FROM products WHERE id = v_prod_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product % does not exist', v_prod_id;
        END IF;

        IF NOT v_product.is_available THEN
            RAISE EXCEPTION 'Product "%" is currently unavailable for order', v_product.name;
        END IF;

        -- Row lock inventory
        SELECT id, quantity_available INTO v_inventory
        FROM inventory
        WHERE product_id = v_prod_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Inventory record for "%" not found', v_product.name;
        END IF;

        IF v_inventory.quantity_available < v_item_qty THEN
            RAISE EXCEPTION 'Insufficient stock for "%". Available: % packs, Requested: % packs',
                v_product.name, v_inventory.quantity_available, v_item_qty;
        END IF;

        v_subtotal := v_product.price * v_item_qty;
        v_total_amount := v_total_amount + v_subtotal;
    END LOOP;

    -- Insert order record
    INSERT INTO orders (
        customer_id,
        status,
        payment_status,
        payment_method,
        total_amount,
        delivery_location,
        customer_note,
        tracking_token
    )
    VALUES (
        v_customer_id,
        'PENDING',
        'UNPAID',
        'CASH',
        v_total_amount,
        trim(p_delivery_location),
        trim(p_customer_note),
        v_tracking_token
    )
    RETURNING id INTO v_order_id;

    -- Second pass: Deduct stock, insert items, create audit records
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_prod_id := (v_item->>'product_id')::UUID;
        v_item_qty := (v_item->>'quantity')::INTEGER;

        SELECT price INTO v_product FROM products WHERE id = v_prod_id;
        v_subtotal := v_product.price * v_item_qty;

        -- Deduct inventory
        UPDATE inventory
        SET quantity_available = quantity_available - v_item_qty,
            updated_at = now()
        WHERE product_id = v_prod_id;

        -- Insert order item
        INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
        VALUES (v_order_id, v_prod_id, v_item_qty, v_product.price, v_subtotal);

        -- Record inventory transaction
        INSERT INTO inventory_transactions (
            product_id,
            quantity_change,
            transaction_type,
            reference
        )
        VALUES (
            v_prod_id,
            -v_item_qty,
            'ORDER',
            'ORDER #' || substring(v_order_id::text from 1 for 8)
        );
    END LOOP;

    -- Insert status history for PENDING
    INSERT INTO order_status_history (order_id, old_status, new_status, note)
    VALUES (v_order_id, NULL, 'PENDING', 'Order placed by customer via web application.');

    -- Return JSON payload
    RETURN jsonb_build_object(
        'success', TRUE,
        'order_id', v_order_id,
        'tracking_token', v_tracking_token,
        'total_amount', v_total_amount,
        'status', 'PENDING',
        'payment_status', 'UNPAID'
    );
END;
$$;

-- 2. ATOMIC ORDER STATUS UPDATE FUNCTION
CREATE OR REPLACE FUNCTION update_order_status_atomic(
    p_order_id UUID,
    p_new_status VARCHAR(30),
    p_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
BEGIN
    SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    IF v_order.status = p_new_status THEN
        RETURN jsonb_build_object('success', TRUE, 'message', 'Status already at target state');
    END IF;

    -- Validate state transitions
    IF v_order.status IN ('CANCELLED', 'REJECTED') THEN
        RAISE EXCEPTION 'Cannot modify an order that is already %', v_order.status;
    END IF;

    IF v_order.status = 'DELIVERED' AND p_new_status NOT IN ('DELIVERED') THEN
        RAISE EXCEPTION 'Delivered orders cannot be reverted to %', p_new_status;
    END IF;

    -- If transitioning to CANCELLED or REJECTED: return stock exactly once
    IF p_new_status IN ('CANCELLED', 'REJECTED') AND v_order.status NOT IN ('CANCELLED', 'REJECTED') THEN
        FOR v_item IN SELECT product_id, quantity FROM order_items WHERE order_id = p_order_id
        LOOP
            -- Lock and update inventory
            UPDATE inventory
            SET quantity_available = quantity_available + v_item.quantity,
                updated_at = now()
            WHERE product_id = v_item.product_id;

            -- Record inventory transaction
            INSERT INTO inventory_transactions (
                product_id,
                quantity_change,
                transaction_type,
                reference
            )
            VALUES (
                v_item.product_id,
                v_item.quantity,
                'ORDER_CANCELLED',
                p_new_status || ' ORDER #' || substring(p_order_id::text from 1 for 8)
            );
        END LOOP;
    END IF;

    -- Update order status
    UPDATE orders
    SET status = p_new_status,
        updated_at = now()
    WHERE id = p_order_id;

    -- Record status history
    INSERT INTO order_status_history (order_id, old_status, new_status, note)
    VALUES (p_order_id, v_order.status, p_new_status, p_note);

    RETURN jsonb_build_object(
        'success', TRUE,
        'order_id', p_order_id,
        'old_status', v_order.status,
        'new_status', p_new_status
    );
END;
$$;

-- 3. ATOMIC CASH PAYMENT RECORDING
CREATE OR REPLACE FUNCTION record_cash_payment_atomic(
    p_order_id UUID,
    p_note TEXT DEFAULT 'Cash payment physically collected by seller'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order RECORD;
BEGIN
    SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    IF v_order.payment_status = 'PAID' THEN
        RETURN jsonb_build_object('success', TRUE, 'message', 'Order is already marked as PAID');
    END IF;

    IF v_order.status IN ('CANCELLED', 'REJECTED') THEN
        RAISE EXCEPTION 'Cannot record payment for % order', v_order.status;
    END IF;

    UPDATE orders
    SET payment_status = 'PAID',
        paid_at = now(),
        updated_at = now()
    WHERE id = p_order_id;

    INSERT INTO order_status_history (order_id, old_status, new_status, note)
    VALUES (p_order_id, v_order.status, v_order.status, 'Payment received: ' || p_note);

    RETURN jsonb_build_object(
        'success', TRUE,
        'order_id', p_order_id,
        'payment_status', 'PAID',
        'paid_at', now()
    );
END;
$$;

-- 4. ATOMIC RESTOCK INVENTORY FUNCTION
CREATE OR REPLACE FUNCTION restock_inventory_atomic(
    p_product_id UUID,
    p_quantity INTEGER,
    p_reference VARCHAR(100) DEFAULT 'RESTOCK'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_qty INTEGER;
BEGIN
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Restock quantity must be positive';
    END IF;

    UPDATE inventory
    SET quantity_available = quantity_available + p_quantity,
        updated_at = now()
    WHERE product_id = p_product_id
    RETURNING quantity_available INTO v_new_qty;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Product inventory not found';
    END IF;

    INSERT INTO inventory_transactions (
        product_id,
        quantity_change,
        transaction_type,
        reference
    )
    VALUES (
        p_product_id,
        p_quantity,
        'RESTOCK',
        p_reference
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'product_id', p_product_id,
        'quantity_available', v_new_qty,
        'added', p_quantity
    );
END;
$$;

-- 5. ATOMIC ADJUST INVENTORY FUNCTION
CREATE OR REPLACE FUNCTION adjust_inventory_atomic(
    p_product_id UUID,
    p_new_quantity INTEGER,
    p_reason TEXT DEFAULT 'MANUAL STOCK CORRECTION'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_curr_qty INTEGER;
    v_diff INTEGER;
BEGIN
    IF p_new_quantity < 0 THEN
        RAISE EXCEPTION 'Inventory quantity cannot be negative';
    END IF;

    SELECT quantity_available INTO v_curr_qty
    FROM inventory
    WHERE product_id = p_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Product inventory not found';
    END IF;

    v_diff := p_new_quantity - v_curr_qty;

    IF v_diff = 0 THEN
        RETURN jsonb_build_object('success', TRUE, 'message', 'No change in quantity');
    END IF;

    UPDATE inventory
    SET quantity_available = p_new_quantity,
        updated_at = now()
    WHERE product_id = p_product_id;

    INSERT INTO inventory_transactions (
        product_id,
        quantity_change,
        transaction_type,
        reference
    )
    VALUES (
        p_product_id,
        v_diff,
        'MANUAL_ADJUSTMENT',
        p_reason
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'product_id', p_product_id,
        'previous_quantity', v_curr_qty,
        'new_quantity', p_new_quantity,
        'difference', v_diff
    );
END;
$$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can view available products
CREATE POLICY "Public can view available products" ON products
    FOR SELECT USING (is_available = TRUE OR auth.role() = 'authenticated');

CREATE POLICY "Sellers can manage products" ON products
    FOR ALL USING (auth.role() = 'authenticated');

-- Inventory: Public can view quantity_available only
CREATE POLICY "Public can view inventory counts" ON inventory
    FOR SELECT USING (TRUE);

CREATE POLICY "Sellers can manage inventory" ON inventory
    FOR ALL USING (auth.role() = 'authenticated');

-- Orders: Public can view their order ONLY via tracking_token
CREATE POLICY "Guest tracking by token" ON orders
    FOR SELECT USING (tracking_token::text = current_setting('request.headers', true)::json->>'x-tracking-token' OR auth.role() = 'authenticated');

CREATE POLICY "Sellers can manage all orders" ON orders
    FOR ALL USING (auth.role() = 'authenticated');

-- Order Items: Viewable if corresponding order is viewable
CREATE POLICY "View order items" ON order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id)
    );

CREATE POLICY "Sellers manage order items" ON order_items
    FOR ALL USING (auth.role() = 'authenticated');

-- Order Status History: Viewable for order
CREATE POLICY "View order history" ON order_status_history
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id)
    );

-- Inventory transactions: Seller only
CREATE POLICY "Sellers can view inventory transactions" ON inventory_transactions
    FOR SELECT USING (auth.role() = 'authenticated');
