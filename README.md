# SuiPay

A merchant payments platform for small businesses and merchants to simplify on-chain payments.

## 🚀 Overview

SuiPay is a merchant payment platform designed to simplify on-chain payments for small businesses and merchants.

Merchants can create payment requests, generate a payment link or QR code, and receive payments directly on the Sui blockchain.

Customers can open the payment page, connect their Sui wallet, and complete the payment.

## ✨ Features

- Create payment requests
- Generate unique payment links
- Generate QR codes for payments
- Customer payment page
- Sui wallet connection
- SUI Testnet payments
- Payment status tracking
- Automatic payment status refresh
- Transaction digest tracking
- SuiScan transaction verification
- Merchant payment dashboard
- Revenue and payment statistics

## 🔄 How It Works

```text
Merchant
   ↓
Create Payment Request
   ↓
Payment Link / QR Code
   ↓
Customer Opens Payment Page
   ↓
Connect Sui Wallet
   ↓
Pay SUI
   ↓
Transaction Confirmed on Sui
   ↓
Payment Status Updated
   ↓
Merchant Dashboard
```

## 🛠️ Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Blockchain

- Sui Blockchain
- Sui Testnet
- Sui dApp Kit

### Database

- Supabase

## 📁 Project Structure

```text
SuiPay/
├── app/
│   ├── pay/
│   │   └── [id]/
│   │       └── page.tsx
│   ├── DAppKitProvider.tsx
│   ├── layout.tsx
│   └── page.tsx
│
├── lib/
│   ├── dapp-kit.ts
│   └── supabase.ts
│
├── public/
├── .gitignore
├── next.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/waisumyong/SuiPay.git
cd SuiPay
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the development server

```bash
npm run dev
```

Open your browser and visit:

```text
http://localhost:3000
```

## 💳 Payment Flow

SuiPay uses Sui Testnet for demonstration purposes.

When a customer makes a payment:

1. The merchant creates a payment request.
2. SuiPay generates a unique payment link and QR code.
3. The customer opens the payment page.
4. The customer connects their Sui wallet.
5. SuiPay creates a Sui transaction.
6. The requested amount is transferred to the merchant wallet.
7. The transaction is confirmed on Sui Testnet.
8. The transaction digest is stored in Supabase.
9. The payment status changes from `pending` to `completed`.
10. The merchant can view and verify the transaction.

## 🏪 Merchant Dashboard

The merchant dashboard provides an overview of payment activity.

It includes:

- Today's revenue
- Total payments
- Payment status
- Recent payments
- Payment IDs
- Payment amounts
- Payment descriptions
- Transaction digests
- Transaction verification through SuiScan

## 📱 Payment Page

Each payment request has a dedicated payment page.

The customer can view:

- Merchant name
- Payment amount
- Payment description
- Payment ID
- Connected wallet
- Payment status
- Transaction digest after successful payment

After a successful transaction, SuiPay displays a payment confirmation and provides a link to view the transaction on SuiScan.

## 🔍 Transaction Verification

After a successful payment, SuiPay stores the Sui transaction digest in the payment record.

The transaction can then be verified on the Sui Testnet blockchain explorer.

This provides a transparent way for merchants and customers to verify that a payment was successfully recorded on-chain.

## 🗄️ Database

SuiPay uses Supabase to store payment records.

Each payment record contains information such as:

- Payment ID
- Amount
- Description
- Merchant
- Merchant wallet
- Payment status
- Creation time
- Transaction digest

The payment status is initially:

```text
pending

After a successful blockchain transaction, it becomes:

completed
🎯 Future Improvements

Possible future improvements include:

Merchant authentication
Multiple merchant accounts
Multi-currency payment support
Payment analytics
Invoice generation
Payment history export
Mainnet deployment
Additional wallet integrations
Improved merchant management
📌 Project Status

SuiPay is currently an MVP built for hackathon demonstration purposes.

The current implementation uses Sui Testnet.

👨‍💻 Built With

SuiPay was built using:

Next.js
React
TypeScript
Tailwind CSS
Supabase
Sui Blockchain
Sui dApp Kit
🏆 Hackathon Project

SuiPay demonstrates how blockchain-based payments can be made simpler for merchants through payment links, QR codes, on-chain transactions, and transparent transaction verification.