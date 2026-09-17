"""
College Samosa Ordering & Sales Management System
Complete Streamlit (Python) Application

Run with:
    pip install -r requirements.txt
    streamlit run app.py
"""

import streamlit as st
import uuid
from datetime import datetime

# Configure page
st.set_page_config(
    page_title="College Samosa - Ordering & Sales",
    page_icon="🥟",
    layout="wide",
    initial_sidebar_state="expanded"
)

# -----------------------------------------------------------------------------
# In-Memory & Session State Initialization
# -----------------------------------------------------------------------------
if "products" not in st.session_state:
    st.session_state.products = [
        {
            "id": "prod-beef",
            "name": "Classic Spiced Beef Samosas",
            "price": 2000,
            "packs_per_unit": 2,
            "description": "Crispy golden triangular pastry stuffed with savory minced beef, onions, garlic, and aromatic spices.",
            "is_available": True
        },
        {
            "id": "prod-veg",
            "name": "Garden Vegetable & Pea Samosas",
            "price": 1500,
            "packs_per_unit": 2,
            "description": "Flaky hand-wrapped pastry packed with spiced potatoes, green peas, carrots, and fresh herbs.",
            "is_available": True
        },
        {
            "id": "prod-chicken",
            "name": "Tender Chicken Samosas",
            "price": 2500,
            "packs_per_unit": 2,
            "description": "Succulent minced chicken breast folded with mild peppers, cilantro, and warm campus spices.",
            "is_available": True
        }
    ]

if "inventory" not in st.session_state:
    st.session_state.inventory = {
        "prod-beef": 45,
        "prod-veg": 35,
        "prod-chicken": 30
    }

if "orders" not in st.session_state:
    st.session_state.orders = []

if "transactions" not in st.session_state:
    st.session_state.transactions = [
        {
            "id": "tx-001",
            "product_id": "prod-beef",
            "product_name": "Classic Spiced Beef Samosas",
            "quantity_change": 45,
            "type": "INITIAL_STOCK",
            "reference": "Morning kitchen prep",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
        {
            "id": "tx-002",
            "product_id": "prod-veg",
            "product_name": "Garden Vegetable & Pea Samosas",
            "quantity_change": 35,
            "type": "INITIAL_STOCK",
            "reference": "Morning kitchen prep",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
        {
            "id": "tx-003",
            "product_id": "prod-chicken",
            "product_name": "Tender Chicken Samosas",
            "quantity_change": 30,
            "type": "INITIAL_STOCK",
            "reference": "Morning kitchen prep",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    ]

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
def format_ugx(amount: int) -> str:
    return f"UGX {amount:,.0f}"

# -----------------------------------------------------------------------------
# Sidebar Navigation
# -----------------------------------------------------------------------------
st.sidebar.title("🥟 College Samosa")
st.sidebar.markdown("**Campus Fast Delivery** • *2 samosas per pack*")
st.sidebar.markdown("---")

nav_choice = st.sidebar.radio(
    "Navigation",
    ["🛒 Order Samosas (Guest)", "📍 Track Order", "👨‍🍳 Seller Dashboard", "📦 Seller Inventory", "📊 Sales Reports"],
    index=0
)

st.sidebar.markdown("---")
st.sidebar.caption("💳 Payment Method: **Cash on Delivery**")
st.sidebar.caption("⚡ Powered by Python & Streamlit")

# -----------------------------------------------------------------------------
# 1. Customer Ordering View
# -----------------------------------------------------------------------------
if nav_choice == "🛒 Order Samosas (Guest)":
    st.title("Order Fresh Campus Samosas")
    st.markdown("All samosas are freshly fried and delivered in **packs of 2**. Pay with physical cash upon delivery.")

    col_menu, col_checkout = st.columns([3, 2])

    with col_menu:
        st.subheader("Available Samosa Packs")
        quantities = {}

        for product in st.session_state.products:
            if not product["is_available"]:
                continue

            stock = st.session_state.inventory.get(product["id"], 0)
            
            with st.container():
                st.markdown(f"### {product['name']}")
                st.write(product["description"])
                st.markdown(f"**Price:** `{format_ugx(product['price'])}` per pack (2 samosas)")
                
                if stock <= 0:
                    st.error("🚫 Sold Out for this batch")
                    quantities[product["id"]] = 0
                else:
                    if stock <= 5:
                        st.warning(f"⚠️ Only {stock} packs left in kitchen!")
                    else:
                        st.success(f"✅ In Stock ({stock} packs available)")
                    
                    quantities[product["id"]] = st.number_input(
                        f"Packs of {product['name']}",
                        min_value=0,
                        max_value=stock,
                        value=0,
                        step=1,
                        key=f"qty_{product['id']}"
                    )
                st.markdown("---")

    with col_checkout:
        st.subheader("Guest Delivery Details")
        
        # Calculate totals
        total_items = sum(quantities.values())
        total_amount = sum(
            quantities[p["id"]] * p["price"] for p in st.session_state.products if p["id"] in quantities
        )

        st.info(f"**Cart Summary:** {total_items} packs ({total_items * 2} samosas) • **Total: {format_ugx(total_amount)}**")

        with st.form("checkout_form"):
            c_name = st.text_input("Full Name *", placeholder="e.g. Alex Mukasa")
            c_phone = st.text_input("Phone Number *", placeholder="e.g. 0772 123 456")
            c_email = st.text_input("Email Address *", placeholder="e.g. alex@college.edu")
            c_location = st.text_input("Campus Hostel & Room No. *", placeholder="e.g. Mitchell Hall, Room 42")
            c_notes = st.text_area("Delivery Note (optional)", placeholder="e.g. Please bring extra chili")
            
            submit_btn = st.form_submit_button("Place Order (Cash on Delivery)", type="primary", use_container_width=True)

            if submit_btn:
                if total_items == 0:
                    st.error("Please select at least 1 pack of samosas to order.")
                elif not c_name.strip():
                    st.error("Please enter your name.")
                elif not c_phone.strip():
                    st.error("Please enter your phone number.")
                elif not c_email.strip() or "@" not in c_email:
                    st.error("Please enter a valid email address.")
                elif not c_location.strip():
                    st.error("Please enter your campus hostel & room location.")
                else:
                    # Atomic Inventory Decrement
                    can_fulfill = True
                    for p_id, qty in quantities.items():
                        if qty > 0 and st.session_state.inventory.get(p_id, 0) < qty:
                            can_fulfill = False
                            break

                    if not can_fulfill:
                        st.error("Inventory changed just now! Some items are no longer available in the requested quantity.")
                    else:
                        order_id = str(uuid.uuid4())
                        tracking_token = str(uuid.uuid4())
                        order_items = []

                        for p in st.session_state.products:
                            p_id = p["id"]
                            qty = quantities.get(p_id, 0)
                            if qty > 0:
                                # Decrement stock
                                st.session_state.inventory[p_id] -= qty
                                # Record stock transaction
                                st.session_state.transactions.insert(0, {
                                    "id": str(uuid.uuid4()),
                                    "product_id": p_id,
                                    "product_name": p["name"],
                                    "quantity_change": -qty,
                                    "type": "ORDER",
                                    "reference": f"Order #{order_id[:8]}",
                                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                                })
                                order_items.append({
                                    "product_id": p_id,
                                    "product_name": p["name"],
                                    "quantity": qty,
                                    "price": p["price"],
                                    "subtotal": qty * p["price"]
                                })

                        new_order = {
                            "id": order_id,
                            "tracking_token": tracking_token,
                            "customer": {
                                "name": c_name.strip(),
                                "phone": c_phone.strip(),
                                "email": c_email.strip()
                            },
                            "delivery_location": c_location.strip(),
                            "customer_note": c_notes.strip(),
                            "items": order_items,
                            "total_amount": total_amount,
                            "status": "PENDING",
                            "payment_status": "UNPAID",
                            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                            "status_history": [
                                {
                                    "status": "PENDING",
                                    "note": "Order placed by guest customer",
                                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                                }
                            ]
                        }

                        st.session_state.orders.insert(0, new_order)
                        st.success("🎉 Order Placed Successfully!")
                        st.markdown(f"### Your Tracking Token: `{tracking_token}`")
                        st.info(f"Save this token or track your order in the **Track Order** tab. Total to pay runner upon delivery: **{format_ugx(total_amount)}**.")

# -----------------------------------------------------------------------------
# 2. Guest Order Tracking View
# -----------------------------------------------------------------------------
elif nav_choice == "📍 Track Order":
    st.title("Track Your Samosa Order")
    st.markdown("Enter your order tracking token to view real-time kitchen preparation and delivery progress.")

    token_input = st.text_input("Tracking Token (UUID)", placeholder="Paste token here...")

    if token_input:
        found_order = next((o for o in st.session_state.orders if o["tracking_token"] == token_input.strip()), None)

        if not found_order:
            st.error("No active order found with this tracking token. Please double check.")
        else:
            st.success(f"Order #{found_order['id'][:8].upper()} Found")

            col_status, col_details = st.columns([3, 2])

            with col_status:
                st.subheader(f"Current Status: {found_order['status']}")
                
                # Visual Stepper
                stages = ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"]
                cur_idx = stages.index(found_order["status"]) if found_order["status"] in stages else -1

                if found_order["status"] in ["CANCELLED", "REJECTED"]:
                    st.error(f"This order has been {found_order['status']}.")
                else:
                    progress_pct = int(((cur_idx + 1) / len(stages)) * 100)
                    st.progress(progress_pct)
                    st.caption(f"Step {cur_idx + 1} of {len(stages)}: {found_order['status'].replace('_', ' ')}")

                st.markdown("#### Status History Audit Log")
                for hist in found_order["status_history"]:
                    st.markdown(f"- **{hist['status']}** ({hist['timestamp']}): {hist['note']}")

            with col_details:
                st.subheader("Order Summary")
                st.markdown(f"**Customer:** {found_order['customer']['name']}")
                st.markdown(f"**Phone:** {found_order['customer']['phone']}")
                st.markdown(f"**Delivery Room:** {found_order['delivery_location']}")
                st.markdown(f"**Payment:** `{found_order['payment_status']}` ({format_ugx(found_order['total_amount'])})")
                
                st.markdown("---")
                for item in found_order["items"]:
                    st.write(f"- {item['quantity']}x {item['product_name']}: {format_ugx(item['subtotal'])}")

# -----------------------------------------------------------------------------
# 3. Seller Dashboard & Dispatch View
# -----------------------------------------------------------------------------
elif nav_choice == "👨‍🍳 Seller Dashboard":
    st.title("Seller Orders & Dispatch Portal")
    st.markdown("Update live order statuses and record cash collected upon delivery.")

    if not st.session_state.orders:
        st.info("No orders placed yet. Switch to 'Order Samosas' to create a test order!")
    else:
        # Filters
        filter_status = st.selectbox(
            "Filter by Status",
            ["ALL", "PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REJECTED"]
        )

        filtered = st.session_state.orders
        if filter_status != "ALL":
            filtered = [o for o in filtered if o["status"] == filter_status]

        st.write(f"Displaying **{len(filtered)}** orders:")

        for order in filtered:
            with st.expander(f"Order #{order['id'][:8].upper()} - {order['customer']['name']} ({format_ugx(order['total_amount'])}) - [{order['status']}]"):
                c1, c2, c3 = st.columns([2, 2, 2])

                with c1:
                    st.markdown(f"**Customer:** {order['customer']['name']}")
                    st.markdown(f"**Phone:** {order['customer']['phone']}")
                    st.markdown(f"**Room / Hostel:** {order['delivery_location']}")
                    if order.get("customer_note"):
                        st.caption(f"Note: {order['customer_note']}")

                with c2:
                    st.markdown("**Items Ordered:**")
                    for i in order["items"]:
                        st.write(f"- {i['quantity']}x {i['product_name']} ({format_ugx(i['subtotal'])})")
                    st.markdown(f"**Total Due:** `{format_ugx(order['total_amount'])}`")
                    st.markdown(f"**Payment Status:** `{order['payment_status']}`")

                with c3:
                    st.markdown("**Actions:**")
                    
                    # Workflow status transitions
                    if order["status"] == "PENDING":
                        if st.button("Confirm Order", key=f"conf_{order['id']}"):
                            order["status"] = "CONFIRMED"
                            order["status_history"].append({"status": "CONFIRMED", "note": "Confirmed by kitchen", "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")})
                            st.rerun()
                        if st.button("Reject (Return Stock)", key=f"rej_{order['id']}"):
                            order["status"] = "REJECTED"
                            # Return stock
                            for it in order["items"]:
                                st.session_state.inventory[it["product_id"]] += it["quantity"]
                            order["status_history"].append({"status": "REJECTED", "note": "Rejected and stock returned", "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")})
                            st.rerun()

                    elif order["status"] == "CONFIRMED":
                        if st.button("Start Prep", key=f"prep_{order['id']}"):
                            order["status"] = "PREPARING"
                            order["status_history"].append({"status": "PREPARING", "note": "Kitchen frying fresh batch", "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")})
                            st.rerun()

                    elif order["status"] == "PREPARING":
                        if st.button("Mark Ready", key=f"rdy_{order['id']}"):
                            order["status"] = "READY"
                            order["status_history"].append({"status": "READY", "note": "Packed and ready for runner", "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")})
                            st.rerun()

                    elif order["status"] == "READY":
                        if st.button("Send Out for Delivery", key=f"out_{order['id']}"):
                            order["status"] = "OUT_FOR_DELIVERY"
                            order["status_history"].append({"status": "OUT_FOR_DELIVERY", "note": "Runner on the way to room", "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")})
                            st.rerun()

                    elif order["status"] == "OUT_FOR_DELIVERY":
                        if st.button("Mark Delivered", key=f"del_{order['id']}"):
                            order["status"] = "DELIVERED"
                            order["status_history"].append({"status": "DELIVERED", "note": "Handoff complete to student", "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")})
                            st.rerun()

                    # Payment Toggle
                    if order["payment_status"] == "UNPAID" and order["status"] != "CANCELLED" and order["status"] != "REJECTED":
                        if st.button("💵 Mark Cash as Paid", key=f"paid_{order['id']}"):
                            order["payment_status"] = "PAID"
                            st.success("Cash payment recorded!")
                            st.rerun()

# -----------------------------------------------------------------------------
# 4. Seller Inventory View
# -----------------------------------------------------------------------------
elif nav_choice == "📦 Seller Inventory":
    st.title("Kitchen Inventory & Stock Movements")
    st.markdown("All stock is tracked in **packs of 2 samosas**.")

    col_inv, col_restock = st.columns([3, 2])

    with col_inv:
        st.subheader("Current Stock Levels")
        for p in st.session_state.products:
            stock = st.session_state.inventory.get(p["id"], 0)
            status_text = "IN STOCK" if stock > 5 else ("LOW STOCK" if stock > 0 else "OUT OF STOCK")
            st.markdown(f"**{p['name']}**: `{stock}` packs ({stock * 2} individual samosas) — *{status_text}*")

    with col_restock:
        st.subheader("Restock Samosa Packs")
        with st.form("restock_form"):
            prod_to_restock = st.selectbox("Select Product", [p["name"] for p in st.session_state.products])
            add_qty = st.number_input("Packs to Add", min_value=1, value=20, step=5)
            ref_note = st.text_input("Restock Note", value="Fresh afternoon batch")
            
            if st.form_submit_button("Confirm Restock", type="primary"):
                matched_prod = next(p for p in st.session_state.products if p["name"] == prod_to_restock)
                st.session_state.inventory[matched_prod["id"]] += add_qty
                
                st.session_state.transactions.insert(0, {
                    "id": str(uuid.uuid4()),
                    "product_id": matched_prod["id"],
                    "product_name": matched_prod["name"],
                    "quantity_change": add_qty,
                    "type": "RESTOCK",
                    "reference": ref_note,
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })
                st.success(f"Added {add_qty} packs to {matched_prod['name']}!")
                st.rerun()

    st.markdown("---")
    st.subheader("Inventory Movement Transaction Audit Trail")
    st.dataframe(st.session_state.transactions, use_container_width=True)

# -----------------------------------------------------------------------------
# 5. Sales Reports View
# -----------------------------------------------------------------------------
elif nav_choice == "📊 Sales Reports":
    st.title("Sales & Financial Reports")
    st.markdown("Sales revenue is recognized exclusively on **DELIVERED** orders. Cancelled/rejected orders are excluded.")

    delivered_orders = [o for o in st.session_state.orders if o["status"] == "DELIVERED"]
    total_sales = sum(o["total_amount"] for o in delivered_orders)
    paid_orders = [o for o in delivered_orders if o["payment_status"] == "PAID"]
    cash_collected = sum(o["total_amount"] for o in paid_orders)
    unpaid_delivered = [o for o in delivered_orders if o["payment_status"] == "UNPAID"]
    pending_cash = sum(o["total_amount"] for o in unpaid_delivered)

    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Total Placed Orders", len(st.session_state.orders))
    m2.metric("Total Delivered Sales", format_ugx(total_sales))
    m3.metric("Cash Collected", format_ugx(cash_collected))
    m4.metric("Pending Cash", format_ugx(pending_cash))

    st.markdown("---")
    st.subheader("Delivered Orders Breakdown")
    if not delivered_orders:
        st.info("No delivered orders recorded yet.")
    else:
        report_data = [
            {
                "Order ID": o["id"][:8].upper(),
                "Customer": o["customer"]["name"],
                "Delivery Location": o["delivery_location"],
                "Total Amount (UGX)": o["total_amount"],
                "Payment": o["payment_status"],
                "Created At": o["created_at"]
            }
            for o in delivered_orders
        ]
        st.dataframe(report_data, use_container_width=True)
