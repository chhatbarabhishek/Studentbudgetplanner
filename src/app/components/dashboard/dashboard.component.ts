import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BudgetService } from '../../services/budget.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card card">
          <div class="stat-icon income-icon">💰</div>
          <div class="stat-content">
            <p class="stat-label">Total Income</p>
            <p class="stat-value text-success">{{ budgetService.formatCurrency(budgetService.totalIncome()) }}</p>
          </div>
        </div>
        
        <div class="stat-card card">
          <div class="stat-icon expense-icon">💸</div>
          <div class="stat-content">
            <p class="stat-label">Total Expenses</p>
            <p class="stat-value text-danger">{{ budgetService.formatCurrency(budgetService.totalExpenses()) }}</p>
          </div>
        </div>
        
        <div class="stat-card card">
          <div class="stat-icon balance-icon">🏦</div>
          <div class="stat-content">
            <p class="stat-label">Current Balance</p>
            <p class="stat-value" [class]="budgetService.balance() >= 0 ? 'text-success' : 'text-danger'">
              {{ budgetService.formatCurrency(budgetService.balance()) }}
            </p>
          </div>
        </div>
        
        <div class="stat-card card">
          <div class="stat-icon savings-icon">📈</div>
          <div class="stat-content">
            <p class="stat-label">Savings Rate</p>
            <p class="stat-value">{{ budgetService.savingsRate() | number:'1.1-1' }}%</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions mb-4">
        <h3 class="section-title">Quick Actions</h3>
        <div class="actions-grid">
          <a routerLink="/transactions" class="action-btn">
            <span class="action-icon">➕</span>
            <span>Add Transaction</span>
          </a>
          <a routerLink="/budget" class="action-btn">
            <span class="action-icon">📊</span>
            <span>Manage Budget</span>
          </a>
          <a routerLink="/goals" class="action-btn">
            <span class="action-icon">🎯</span>
            <span>Set Goals</span>
          </a>
          <a routerLink="/analytics" class="action-btn">
            <span class="action-icon">📊</span>
            <span>View Analytics</span>
          </a>
        </div>
      </div>

      <!-- Budget Overview & Recent Transactions -->
      <div class="dashboard-grid">
        <!-- Budget Overview -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Budget Overview</h3>
            <a routerLink="/budget" class="btn btn-outline">View All</a>
          </div>
          <div class="budget-list">
            @for (budget of budgetService.budgets(); track budget.category) {
              <div class="budget-item">
                <div class="budget-info">
                  <span class="budget-category">{{ budget.category }}</span>
                  <span class="budget-amount">{{ budgetService.formatCurrency(budget.spent) }} / {{ budgetService.formatCurrency(budget.limit) }}</span>
                </div>
                <div class="budget-progress">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      [style.width.%]="(budget.spent / budget.limit) * 100"
                      [class.over-budget]="budget.spent > budget.limit"
                      [class.warning]="budget.spent / budget.limit > 0.8 && budget.spent <= budget.limit">
                    </div>
                  </div>
                  <span class="budget-percentage">{{ ((budget.spent / budget.limit) * 100) | number:'1.0-0' }}%</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Recent Transactions</h3>
            <a routerLink="/transactions" class="btn btn-outline">View All</a>
          </div>
          <div class="transactions-list">
            @for (transaction of getRecentTransactions(); track transaction.id) {
              <div class="transaction-item">
                <div class="transaction-icon" [class.income]="transaction.type === 'income'">
                  {{ transaction.type === 'income' ? '↑' : '↓' }}
                </div>
                <div class="transaction-details">
                  <span class="transaction-desc">{{ transaction.description }}</span>
                  <span class="transaction-category">{{ transaction.category }}</span>
                </div>
                <div class="transaction-amount" [class.income]="transaction.type === 'income'">
                  {{ transaction.type === 'income' ? '+' : '-' }}{{ budgetService.formatCurrency(transaction.amount) }}
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Savings Goals -->
      <div class="card mt-4">
        <div class="card-header">
          <h3 class="card-title">Savings Goals</h3>
          <a routerLink="/goals" class="btn btn-outline">View All</a>
        </div>
        <div class="goals-grid">
          @for (goal of budgetService.goals(); track goal.id) {
            <div class="goal-card">
              <div class="goal-icon">{{ goal.icon }}</div>
              <div class="goal-info">
                <h4 class="goal-name">{{ goal.name }}</h4>
                <p class="goal-amount">{{ budgetService.formatCurrency(goal.currentAmount) }} / {{ budgetService.formatCurrency(goal.targetAmount) }}</p>
              </div>
              <div class="goal-progress">
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="(goal.currentAmount / goal.targetAmount) * 100"></div>
                </div>
                <span class="goal-percentage">{{ ((goal.currentAmount / goal.targetAmount) * 100) | number:'1.0-0' }}%</span>
              </div>
              <p class="goal-deadline">Due: {{ goal.deadline | date:'mediumDate' }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 1024px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 640px) {
      .stats-grid { grid-template-columns: 1fr; }
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .income-icon { background: rgba(16, 185, 129, 0.1); }
    .expense-icon { background: rgba(239, 68, 68, 0.1); }
    .balance-icon { background: rgba(79, 70, 229, 0.1); }
    .savings-icon { background: rgba(245, 158, 11, 0.1); }

    .stat-content {
      flex: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0.25rem 0 0;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 1rem;
    }

    .quick-actions {
      margin-bottom: 2rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .actions-grid { grid-template-columns: repeat(2, 1fr); }
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      text-decoration: none;
      color: #1e293b;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      border-color: #4f46e5;
      box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1);
    }

    .action-icon {
      font-size: 1.25rem;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    @media (max-width: 768px) {
      .dashboard-grid { grid-template-columns: 1fr; }
    }

    .budget-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .budget-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .budget-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .budget-category {
      font-weight: 500;
      color: #1e293b;
    }

    .budget-amount {
      font-size: 0.875rem;
      color: #64748b;
    }

    .budget-progress {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #4f46e5;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .progress-fill.warning {
      background: #f59e0b;
    }

    .progress-fill.over-budget {
      background: #ef4444;
    }

    .budget-percentage {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      min-width: 40px;
    }

    .transactions-list {
      display: flex;
      flex-direction: column;
    }

    .transaction-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #e2e8f0;
    }

    .transaction-item:last-child {
      border-bottom: none;
    }

    .transaction-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .transaction-icon.income {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .transaction-details {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .transaction-desc {
      font-weight: 500;
      color: #1e293b;
    }

    .transaction-category {
      font-size: 0.75rem;
      color: #64748b;
    }

    .transaction-amount {
      font-weight: 600;
      color: #ef4444;
    }

    .transaction-amount.income {
      color: #10b981;
    }

    .goals-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    @media (max-width: 1024px) {
      .goals-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 640px) {
      .goals-grid { grid-template-columns: 1fr; }
    }

    .goal-card {
      background: #f8fafc;
      border-radius: 0.75rem;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .goal-icon {
      font-size: 2rem;
    }

    .goal-name {
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .goal-amount {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
    }

    .goal-progress {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .goal-percentage {
      font-size: 0.75rem;
      font-weight: 600;
      color: #4f46e5;
    }

    .goal-deadline {
      font-size: 0.75rem;
      color: #64748b;
      margin: 0;
    }
  `]
})
export class DashboardComponent {
  budgetService = inject(BudgetService);

  getRecentTransactions() {
    return this.budgetService.transactions()
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }
}

