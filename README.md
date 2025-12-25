# 🦉 OWLS Frontend

Modern e-commerce frontend built with Next.js 16, React 19, and TailwindCSS 4.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)

## ✨ Features

- 🛍️ **Product Browsing** - Browse products with categories and search
- 🛒 **Shopping Cart** - Add/remove items with real-time updates
- 💳 **Checkout** - Seamless checkout experience
- 👤 **User Account** - Registration, login, and profile management
- 📦 **Order Tracking** - View order history and status
- 🎨 **Modern UI** - Glassmorphism design with smooth animations

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19, TailwindCSS 4, Framer Motion |
| **State** | Zustand |
| **Forms** | React Hook Form + Zod |
| **HTTP** | Axios |
| **Components** | Radix UI, Lucide Icons |

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── about/          # About page
│   ├── account/        # User account
│   ├── cart/           # Shopping cart
│   ├── checkout/       # Checkout flow
│   ├── login/          # Authentication
│   ├── register/       # User registration
│   ├── orders/         # Order history
│   ├── products/       # Product listings
│   └── page.tsx        # Homepage
├── components/
│   ├── layout/         # Header, Footer, etc.
│   └── ui/             # Reusable UI components
└── store/              # Zustand stores
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/kumaruseru/owls-frontend.git
cd owls-frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🔗 Related

- [OWLS Backend](https://github.com/kumaruseru/owls) - Django REST API

## 📄 License

MIT License
