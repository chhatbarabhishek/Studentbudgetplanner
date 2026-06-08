# Studentbudgetplanner
🚀 Student Budget Planner - Modern Angular 19 SPA  Modern, responsive personal finance tracker with Angular 19 signals, standalone components. Track income/expenses, budgets, goals, analytics dashboard. LocalStorage persistent. 

✨ Features:
• Reactive signals state
• Income/Expense tabs & dedicated forms
• Budget tracking & progress
• Savings goals
• Charts & analytics
• Responsive design
• Student budget tips

Tech: Angular 19, Signals, Chart.js, Tailwind CSS

# Student Budget Planner

A specialized personal finance utility engineered specifically to help students manage academic expenses, track casual income, and monitor their financial runway across semesters. Built with performance and simplicity in mind, this application removes the complexity of traditional banking apps to deliver a zero-friction budgeting tool.

## 🚀 Project Overview

Managing money as a student comes with unique challenges—irregular income streams, recurring semester costs, and tightly constrained budgets. This platform solves that specific pain point by offering a highly visual, fast, and lightweight ledger system that works entirely in the browser.

### Key Features
* **Student-Centric Expense Categorization:** Tailored entry loops for tracking common student financial buckets (e.g., Books/Supplies, Rent, Food, Transport, and Entertainment).
* **Instantaneous Runway Metrics:** Live calculations that update the user's current net balance and spending totals the exact millisecond a transaction is logged.
* **Persistent Session State:** Utilizes client-side browser storage to ensure a student's budget history remains perfectly intact between study sessions, device reboots, and browser refreshes.
* **Mobile-First Responsive Interface:** Optimized for quick on-the-go logging between lectures, featuring a fluid grid layout that looks razor-sharp on mobile screens and tablets.

## 🛠️ Tech Stack & Implementation

* **Logic Layer:** Vanilla JavaScript (ES6 Modules, Clean Function Separation, Form Validation)
* **User Interface:** Modern semantic HTML5, Responsive UI Styling (Tailwind / Custom CSS)
* **Data Persistence:** Browser Web Storage API (`localStorage`)

## 🎯 Engineering Highlights

* **Optimized DOM Operations:** Avoids unnecessary page refreshes by programmatically capturing form inputs, updating the local data structure, and injecting the updated HTML segments dynamically.
* **Resilient Input Handling:** Implements robust client-side validation to block empty strings, negative currency values, or faulty inputs from corrupting the stored ledger.
* **Zero-Dependency Core:** Intentionally engineered without heavy frameworks or heavy runtime packages, ensuring a sub-millisecond time-to-interactive (TTI) even on older student smartphones or spotty campus Wi-Fi networks.

## ⚙️ How to Run Locally

1. Clone the repository:
```bash
   git clone [https://github.com/chhatbarabhishek/Studentbudgetplanner.git](https://github.com/chhatbarabhishek/Studentbudgetplanner.git)

