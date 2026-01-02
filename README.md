# Rent Platform (SaaS)

> A modern, scalable property management platform built with the T3 Stack (Next.js, TypeScript, Tailwind) and a comprehensive Design System.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Storybook](https://img.shields.io/badge/Storybook-FF4785?style=for-the-badge&logo=storybook&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

## 🚀 Overview

Rent Platform is a next-generation SaaS application designed to streamline property management for landlords and tenants. This project demonstrates enterprise-grade architecture, focusing on performance, accessibility (a11y), and a component-driven development workflow.

## ✨ Key Features

- **🎨 Robust Design System**: Built with a "Component First" approach using **Storybook**. All UI components are isolated, documented, and tested for visual consistency.
- **♿ Accessibility First**: Leveraging **Radix UI** primitives and adhering to WCAG guidelines to ensure an inclusive user experience for all landlords and tenants.
- **🛠️ Tech Stack**:
  - **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
  - **Language**: TypeScript (Strict Mode)
  - **Styling**: Tailwind CSS v4 & Shadcn/UI
  - **Database**: PostgreSQL (via Neon) & Prisma ORM
  - **Validation**: Zod
  - **Testing/Docs**: Storybook & Vitest (configured)

## 📦 Design System & UI Kit

This project utilizes a dedicated Design System to maintain UI consistency. You can explore the component library interactively via Storybook.

### Components

- **Core**: Button, Input, Card, Badge, Dialog, Dropdown
- **Data Display**: Tables, Charts
- **Feedback**: Toasts (Sonner), Skeleton Loaders

Run the Design System locally:

```bash
npm run storybook
# Opens http://localhost:6006
```

## 🛠️ Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js 20+
- npm / pnpm / yarn

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/rent-platform.git
    cd rent-platform
    ```

2.  **Install dependencies**

    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Environment Setup**
    Copy the example environment file and update the variables (Database URL, Auth secrets, etc.).

    ```bash
    cp .env.example .env
    ```

4.  **Database Setup**

    ```bash
    npx prisma generate
    npx prisma migrate dev
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🤝 Contribution

Contributions are welcome! Please check out the [Issues](https://github.com/yourusername/rent-platform/issues) tab or open a Pull Request.

---

_Built with ❤️ by Bryan De La Cruz. Open for work in USA, Canada, and LATAM._
