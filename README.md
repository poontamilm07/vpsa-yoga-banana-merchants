# 🍌 Banana Ledger — Banana Business Management System

A production-ready, mobile-first **Banana Trading / Banana Business Management System** built for wholesale banana traders, distributors, and business owners.

It allows bulk buying in **Thars**, managing multiple suppliers and customers, tracking partial payments, maintaining running transaction ledgers, auditing inventory stock movements, recording expenses, and generating daily/monthly business reports with average-cost profit calculation.

---

## 🌟 Key Features

1. **Mobile-First UX (360px+)**:
   - Designed for one-hand mobile phone usage with bottom navigation bar.
   - Center FAB Floating `+` button opening a 1-tap quick action drawer (`Purchase`, `Pay Supplier`, `Sale`, `Receive Payment`, `Expense`).
   - "Repeat Last Sale" / "Repeat Last Purchase" pre-fills previous customer/supplier transaction details in 1 tap to minimize typing.

2. **Supplier Ledger & Partial Payments**:
   - Chronological running balance calculation (Debit = Purchase Total, Credit = Payments Made).
   - Dynamic support for unlimited suppliers with camera photo picker and compressed uploads.
   - Automated payment allocation to the oldest outstanding purchases first.
   - One-tap direct Call (`tel:`) and formatted WhatsApp statement share (`https://wa.me/`).

3. **Customer Sales & Receivables**:
   - Dynamic customer accounts, sale records, credit sales, and partial payments.
   - Automatic low-stock warnings when attempting to sell more Thars than currently available in stock.

4. **Traceable Inventory Management**:
   - Stock tracked in **Thars** (`Closing Stock = Opening Stock + Purchases - Sales - Damaged +/- Adjustments`).
   - Traceable stock movement feed with timestamp and transaction reference links.

5. **Expense Management & Weighted Average Profit**:
   - Expense categories: Transport, Loading, Unloading, Labour, Rent, Electricity, Packaging, Fuel, Food, Other.
   - Inventory-aware net profit calculation (`Profit = Sales - COGS - Expenses`).

6. **Daily EOD Closing & Reporting**:
   - End-of-Day cash flow audit and "Close Day" confirmation lock.
   - Interactive Recharts graphs for daily sales, purchases, and net profit trends.
   - Export ledgers and reports to **PDF** and **Excel (.xlsx)**.

---

## 🛠️ Technology Stack

- **Backend**:
  - Java 21 / Spring Boot 3.4.3
  - Spring Security with JWT Authentication
  - Spring Data JPA
  - `BigDecimal` for precision monetary math
  - H2 Persisted File Database (`jdbc:h2:file:./data/bananaledger`) with MySQL compatible dialect
- **Frontend**:
  - React 18 + Vite
  - Tailwind CSS v3 (Custom banana theme)
  - Lucide React Icons
  - Recharts (Data visualization)
  - jsPDF & SheetJS (XLSX) for exports
  - HTML5 Canvas Image Compression

---

## 🚀 Quick Start Guide

### Prerequisites
- **Java JDK 21+**
- **Node.js v18+** & **npm**

### 1. Run the Backend
Navigating to `backend` directory:
```bash
cd backend
mvn spring-boot:run
```
> The backend server starts at `http://localhost:8080`.
> The database file is persisted automatically at `backend/data/bananaledger.mv.db`.
> H2 Web Console is available at `http://localhost:8080/h2-console`.

### 2. Run the Frontend
Navigating to `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
> The React mobile app runs at `http://localhost:3000` (proxies `/api` to `http://localhost:8080`).

---

## 🔐 Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

---

## 🧪 Requirement #68 Verification Scenario

The system includes an automated integration test (`BananaLedgerBusinessScenarioTest.java`) that verifies:
1. **Supplier Kumar (SUP-0001)**:
   - Day 1: Purchase 100 Thars @ ₹500 = ₹50,000. Paid ₹25,000. Outstanding = ₹25,000.
   - Day 2: Purchase 50 Thars @ ₹500 = ₹25,000. Payment = ₹40,000.
   - Result: Final Supplier Outstanding Balance = **₹10,000**.
   - Result: Supplier Total Purchased = **₹75,000**, Total Paid = **₹65,000**.
2. **Customer Ravi (CUS-0001)**:
   - Sale: 20 Thars @ ₹700 = ₹14,000. Customer pays ₹10,000.
   - Result: Final Customer Outstanding Balance = **₹4,000**.
3. **Inventory Stock**:
   - Initial 0 + 150 Purchased - 20 Sold = **130 Thars Remaining**.

To run tests:
```bash
cd backend
mvn test
```
