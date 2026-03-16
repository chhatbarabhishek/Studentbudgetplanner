import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BudgetService } from '../../services/budget.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-page">
      <!-- Header -->
      <div class="page-header">
        <h2>Financial Analytics</h2>
      </div>

      <!-- Summary Cards -->
      <div class="summary-grid mb-4">
        <div class="summary-card card">
          <div class="summary-icon">💰</div>
          <div class="summary-content">
            <p class="summary-label">Total Income (All Time)</p>
            <p class="summary-value text-success">{{ totalIncomeAllTime | currency:'INR':'symbol':'1.2-2' }}</p>
          </div>
        </div>
        <div class="summary-card card">
          <div class="summary-icon">💸</div>
          <div class="summary-content">
            <p class="summary-label">Total Expenses (All Time)</p>
            <p class="summary-value text-danger">{{ totalExpensesAllTime | currency:'INR':'symbol':'1.2-2' }}</p>
          </div>
        </div>
        <div class="summary-card card">
          <div class="summary-icon">🏦</div>
          <div class="summary-content">
            <p class="summary-label">Net Savings</p>
            <p class="summary-value" [class]="netSavings >= 0 ? 'text-success' : 'text-danger'">
              {{ netSavings | currency:'INR':'symbol':'1.2-2' }}
            </p>
          </div>
        </div>
        <div class="summary-card card">
          <div class="summary-icon">📊</div>
          <div class="summary-content">
            <p class="summary-label">Average Savings Rate</p>
            <p class="summary-value">{{ avgSavingsRate | number:'1.1-1' }}%</p>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-grid mb-4">
        <!-- Expense by Category -->
        <div class="card chart-card">
          <h3 class="card-title">Expenses by Category</h3>
          <div class="chart-container">
            <div class="donut-chart">
              <svg viewBox="0 0 100 100" class="donut">
                @for (slice of categorySlices; track slice.category; let i = $index) {
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    [attr.stroke]="slice.color"
                    stroke-width="20"
                    [attr.stroke-dasharray]="slice.dashArray"
                    [attr.stroke-dashoffset]="slice.dashOffset"
                    transform="rotate(-90 50 50)"
                  />
                }
                <circle cx="50" cy="50" r="25" fill="white" />
                <text x="50" y="50" text-anchor="middle" dy="0.3em" class="donut-center">
                  {{ totalExpenses | currency:'INR':'symbol':'1.0-0' }}
                </text>
              </svg>
            </div>
            <div class="chart-legend">
              @for (item of categoryBreakdown; track item.category) {
                <div class="legend-item">
                  <span class="legend-color" [style.background]="getCategoryColor(item.category)"></span>
                  <span class="legend-label">{{ item.category }}</span>
                  <span class="legend-value">{{ item.percentage | number:'1.0-0' }}%</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Monthly Trends -->
        <div class="card chart-card">
          <h3 class="card-title">Monthly Income vs Expenses</h3>
          <div class="bar-chart">
            @for (trend of monthlyTrends; track trend.month) {
              <div class="bar-group">
                <div class="bars">
                  <div 
                    class="bar income-bar" 
                    [style.height.%]="(trend.income / maxTrendValue) * 100"
                    [title]="'Income: ₹' + trend.income">
                  </div>
                  <div 
                    class="bar expense-bar" 
                    [style.height.%]="(trend.expenses / maxTrendValue) * 100"
                    [title]="'Expenses: ₹' + trend.expenses">
                  </div>
                </div>
                <span class="bar-label">{{ trend.month }}</span>
              </div>
            }
          </div>
          <div class="chart-legend horizontal">
            <div class="legend-item">
              <span class="legend-color" style="background: #10b981;"></span>
              <span>Income</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background: #ef4444;"></span>
              <span>Expenses</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Details -->
      <div class="card">
        <h3 class="card-title mb-4">Expense Breakdown Details</h3>
        <div class="breakdown-table">
          <table class="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount Spent</th>
                <th>Budget Limit</th>
                <th>Utilization</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (budget of budgetService.budgets(); track budget.category) {
                <tr>
                  <td>
                    <div class="category-cell">
                      <span class="category-icon">{{ getCategoryIcon(budget.category) }}</span>
                      {{ budget.category }}
                    </div>
                  </td>
                  <td>{{ budgetService.formatCurrency(budget.spent) }}</td>
                  <td>{{ budgetService.formatCurrency(budget.limit) }}</td>
                  <td>
                    <div class="utilization-bar">
                      <div 
                        class="utilization-fill" 
                        [style.width.%]="Math.min((budget.spent / budget.limit) * 100, 100)"
                        [class.over]="budget.spent > budget.limit"
                        [class.warning]="budget.spent / budget.limit > 0.8 && budget.spent <= budget.limit">
                      </div>
                    </div>
                    <span class="utilization-text">{{ ((budget.spent / budget.limit) * 100) | number:'1.0-0' }}%</span>
                  </td>
                  <td>
                    @if (budget.spent > budget.limit) {
                      <span class="badge badge-danger">Over Budget</span>
                    } @else if (budget.spent / budget.limit > 0.8) {
                      <span class="badge badge-warning">Warning</span>
                    } @else {
                      <span class="badge badge-success">On Track</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Insights -->
      <div class="card insights-card mt-4">
        <h3 class="card-title">💡 Financial Insights</h3>
        <div class="insights-grid">
          <div class="insight-item">
            <div class="insight-icon">🎯</div>
            <div class="insight-content">
              <h4>Top Spending Category</h4>
              <p>{{ topSpendingCategory }} accounts for {{ topSpendingPercentage | number:'1.0-0' }}% of your expenses</p>
            </div>
          </div>
          <div class="insight-item">
            <div class="insight-icon">💡</div>
            <div class="insight-content">
              <h4>Savings Potential</h4>
              <p>You could save {{ budgetService.formatCurrency(potentialSavings) }} more per month by staying within budget</p>
            </div>
          </div>
          <div class="insight-item">
            <div class="insight-icon">📈</div>
            <div class="insight-content">
              <h4>Best Month</h4>
              <p>{{ bestMonth }} had the highest savings rate at {{ bestMonthSavingsRate | number:'1.0-0' }}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-page {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .page-header {
      margin-bottom: 1.5rem;
    }

    .page-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    @media (max-width: 1024px) {
      .summary-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 640px) {
      .summary-grid { grid-template-columns: 1fr; }
    }

    .summary-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
    }

    .summary-icon {
      font-size: 2rem;
    }

    .summary-label {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
    }

    .summary-value {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0.25rem 0 0;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    @media (max-width: 768px) {
      .charts-grid { grid-template-columns: 1fr; }
    }

    .chart-card {
      min-height: 400px;
    }

    .chart-container {
      display: flex;
      gap: 2rem;
      align-items: center;
      margin-top: 1.5rem;
    }

    @media (max-width: 640px) {
      .chart-container {
        flex-direction: column;
      }
    }

    .donut-chart {
      width: 200px;
      height: 200px;
      flex-shrink: 0;
    }

    .donut {
      width: 100%;
      height: 100%;
    }

    .donut-center {
      font-size: 14px;
      font-weight: 700;
      fill: #1e293b;
    }

    .chart-legend {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .chart-legend.horizontal {
      flex-direction: row;
      justify-content: center;
      margin-top: 1.5rem;
      gap: 1.5rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }

    .legend-label {
      color: #64748b;
      flex: 1;
    }

    .legend-value {
      font-weight: 600;
      color: #1e293b;
    }

    .bar-chart {
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      height: 250px;
      padding: 1rem 0;
      margin-top: 1.5rem;
    }

    .bar-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .bars {
      display: flex;
      gap: 4px;
      align-items: flex-end;
      height: 200px;
    }

    .bar {
      width: 24px;
      border-radius: 4px 4px 0 0;
      transition: height 0.3s ease;
    }

    .income-bar {
      background: linear-gradient(180deg, #10b981, #34d399);
    }

    .expense-bar {
      background: linear-gradient(180deg, #ef4444, #f87171);
    }

    .bar-label {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 500;
    }

    .breakdown-table {
      overflow-x: auto;
    }

    .category-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .category-icon {
      font-size: 1.25rem;
    }

    .utilization-bar {
      width: 100px;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      display: inline-block;
      vertical-align: middle;
      margin-right: 0.5rem;
    }

    .utilization-fill {
      height: 100%;
      background: #4f46e5;
      border-radius: 4px;
    }

    .utilization-fill.warning {
      background: #f59e0b;
    }

    .utilization-fill.over {
      background: #ef4444;
    }

    .utilization-text {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
    }

    .insights-card {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .insights-grid { grid-template-columns: 1fr; }
    }

    .insight-item {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .insight-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .insight-content h4 {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 0.25rem;
    }

    .insight-content p {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
    }

    .badge-success {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .badge-warning {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .badge-danger {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
  `]
})
export class AnalyticsComponent {
  budgetService = inject(BudgetService);
  Math = Math;

  categoryColors: { [key: string]: string } = {
    'Food': '#ef4444',
    'Transport': '#f59e0b',
    'Entertainment': '#8b5cf6',
    'Education': '#3b82f6',
    'Housing': '#10b981',
    'Shopping': '#ec4899',
    'Health': '#14b8a6',
    'Other': '#64748b'
  };

  categoryIcons: { [key: string]: string } = {
    'Food': '🍔',
    'Transport': '🚌',
    'Entertainment': '🎬',
    'Education': '📚',
    'Housing': '🏠',
    'Shopping': '🛍️',
    'Health': '💊',
    'Other': '📦'
  };

  get categoryBreakdown() {
    return this.budgetService.getCategoryBreakdown();
  }

  get monthlyTrends() {
    return this.budgetService.getMonthlyTrends();
  }

  get totalExpenses() {
    return this.budgetService.totalExpenses();
  }

  get totalIncomeAllTime() {
    return this.budgetService.totalIncome();
  }

  get totalExpensesAllTime() {
    return this.budgetService.totalExpenses();
  }

  get netSavings() {
    return this.totalIncomeAllTime - this.totalExpensesAllTime;
  }

  get avgSavingsRate() {
    return this.budgetService.savingsRate();
  }

  get maxTrendValue() {
    const trends = this.monthlyTrends;
    return Math.max(...trends.map(t => Math.max(t.income, t.expenses)));
  }

  get categorySlices() {
    const breakdown = this.categoryBreakdown;
    const circumference = 2 * Math.PI * 40;
    let offset = 0;
    
    return breakdown.map(item => {
      const dashLength = (item.percentage / 100) * circumference;
      const slice = {
        category: item.category,
        color: this.getCategoryColor(item.category),
        dashArray: `${dashLength} ${circumference - dashLength}`,
        dashOffset: -offset
      };
      offset += dashLength;
      return slice;
    });
  }

  get topSpendingCategory() {
    const breakdown = this.categoryBreakdown;
    if (breakdown.length === 0) return 'N/A';
    return breakdown.reduce((max, item) => item.amount > max.amount ? item : max).category;
  }

  get topSpendingPercentage() {
    const breakdown = this.categoryBreakdown;
    if (breakdown.length === 0) return 0;
    return breakdown.reduce((max, item) => item.amount > max.amount ? item : max).percentage;
  }

  get potentialSavings() {
    const budgets = this.budgetService.budgets();
    return budgets.reduce((sum, b) => {
      if (b.spent > b.limit) {
        return sum + (b.spent - b.limit);
      }
      return sum;
    }, 0);
  }

  get bestMonth() {
    const trends = this.monthlyTrends;
    const best = trends.reduce((max, t) => {
      const savingsRate = (t.income - t.expenses) / t.income * 100;
      const maxSavings = (max.income - max.expenses) / max.income * 100;
      return savingsRate > maxSavings ? t : max;
    });
    return best.month;
  }

  get bestMonthSavingsRate() {
    const trends = this.monthlyTrends;
    const best = trends.reduce((max, t) => {
      const savingsRate = (t.income - t.expenses) / t.income * 100;
      const maxSavings = (max.income - max.expenses) / max.income * 100;
      return savingsRate > maxSavings ? t : max;
    });
    return (best.income - best.expenses) / best.income * 100;
  }

  getCategoryColor(category: string): string {
    return this.categoryColors[category] || '#64748b';
  }

  getCategoryIcon(category: string): string {
    return this.categoryIcons[category] || '📦';
  }
}

