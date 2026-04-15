# 📘 BlogRam

BlogRam is a full-stack blogging application that allows users to create, update, and manage blog posts.

---

## 🚀 Features

- ✍️ Create, edit, and delete blog posts  
- 👥 View other users  
- 🔐 Authentication system  
- 🧪 End-to-end testing with Cypress (login flow)  
- ⚡ Lightweight frontend with vanilla JavaScript  

---

## 🛠️ Tech Stack

- **Backend:** Node.js + Express  
- **Frontend:** Vanilla HTML, CSS, JavaScript  
- **Database:** Prisma (BaaS / hosted database)  
- **Testing:**
  - Unit tests: Jest  
  - End-to-end tests: Cypress  

---

## 📦 Installation

Make sure you have **Node.js** installed.

```bash
npm install
```

---

## ▶️ Run the App

```bash
npm run dev
```

---

## 🧪 Testing

### Unit Tests (Jest)

```bash
npm test
```

### End-to-End Tests (Cypress)

```bash
npx cypress open
```

---

## 🔐 Testing Strategy

- **Jest** → unit testing  
- **Cypress** → end-to-end testing (login flow)

---

## ⚙️ CI/CD

This project uses **GitHub Actions** for continuous integration.

### ✅ Workflow

Tests run automatically on:
- Every push to `main`
- Every pull request targeting `main`

This ensures all changes are tested before merging.

---

## 🔑 Environment Variables

The following environment variables are required:

```env
DATABASE_URL=your_prisma_database_url
JWT_SECRET=your_secret_key
```

> In CI, these should be stored as GitHub Secrets.

---

## 📁 Project Structure

```
final_project/
├── src/                # Backend source (Express + TS)
    |── middleware      # Auth middleware using JWT
    |── routes          # Endpoints to manage objects
    |── views          # User interfaces
    |── utils          # Helper functions
    |── tests          # Jest tests
├── prisma/             # Prisma schema
├── cypress/            # Cypress tests
├── package.json
```

---
## 💡 Notes

- CI uses a hosted Prisma database (no local DB required)
- The app is built before running Cypress to avoid TS runtime issues
- Cypress automatically starts the server before running tests

---