import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <nav class="sidebar">
        <div class="sidebar-header">
          <h1 class="logo">💰 Budget Planner</h1>
          <p class="tagline">For Students</p>
        </div>
        <ul class="nav-menu">
          <li>
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">📊</span>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a routerLink="/transactions" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">💳</span>
              <span>Transactions</span>
            </a>
          </li>
          <li>
            <a routerLink="/budget" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">📈</span>
              <span>Budget</span>
            </a>
          </li>
          <li>
            <a routerLink="/goals" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">🎯</span>
              <span>Goals</span>
            </a>
          </li>
          <li>
            <a routerLink="/analytics" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">📉</span>
              <span>Analytics</span>
            </a>
          </li>
        </ul>
        <div class="sidebar-footer">
          <div class="budget-summary">
            <p class="summary-label">Monthly Budget</p>
            <p class="summary-value">{{ remainingBudget | currency:'INR':'symbol':'1.2-2' }}</p>
            <p class="summary-status" [class]="budgetStatus">{{ budgetStatusText }}</p>
          </div>
        </div>
      </nav>
      <main class="main-content">
        <header class="top-header">
          <div class="header-left">
            <h2 class="page-title">{{ pageTitle }}</h2>
          </div>
          <div class="header-right">
            <div class="date-display">{{ currentDate | date:'fullDate' }}</div>
          </div>
        </header>
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #4f46e5 0%, #3730a3 100%);
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 100;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
    }

    .tagline {
      font-size: 0.875rem;
      opacity: 0.8;
      margin: 0;
    }

    .nav-menu {
      list-style: none;
      padding: 1rem 0;
      flex: 1;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.5rem;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
    }

    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .nav-link.active {
      background-color: rgba(255, 255, 255, 0.15);
      color: white;
      border-left-color: white;
    }

    .nav-icon {
      font-size: 1.25rem;
    }

    .sidebar-footer {
      padding: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .budget-summary {
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 0.75rem;
      padding: 1rem;
      text-align: center;
    }

    .summary-label {
      font-size: 0.75rem;
      opacity: 0.8;
      margin: 0 0 0.25rem;
    }

    .summary-value {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
    }

    .summary-status {
      font-size: 0.75rem;
      margin: 0.25rem 0 0;
    }

    .summary-status.positive {
      color: #10b981;
    }

    .summary-status.warning {
      color: #f59e0b;
    }

    .summary-status.negative {
      color: #ef4444;
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
    }

    .top-header {
      background-color: white;
      padding: 1rem 2rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .date-display {
      color: #64748b;
      font-size: 0.875rem;
    }

    .content-area {
      flex: 1;
      padding: 2rem;
      background-color: #f8fafc;
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
      }
      .main-content {
        margin-left: 0;
      }
    }
  `]
})
export class AppComponent {
  pageTitle = 'Dashboard';
  currentDate = new Date();
  
  // These will be provided by services in a real app
  remainingBudget = 450;
  monthlyBudget = 1000;
  
  get budgetStatus(): string {
    const percentage = (this.remainingBudget / this.monthlyBudget) * 100;
    if (percentage > 50) return 'positive';
    if (percentage > 20) return 'warning';
    return 'negative';
  }
  
  get budgetStatusText(): string {
    if (this.budgetStatus === 'positive') return 'On Track';
    if (this.budgetStatus === 'warning') return 'Careful Spending';
    return 'Over Budget';
  }
}

