import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';
import { Transaction } from '../../models/models';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="transactions-page">
      <!-- Header -->
      <div class="page-header">
        <h2>Transactions</h2>
        <div class="header-actions">
          <button class="btn btn-success me-2" (click)="setActiveTab('income'); showAddForm.set(true)" [class.active]="activeTab() === 'income'">
            + Income
          </button>
          <button class="btn btn-primary" (click)="setActiveTab('expense'); showAddForm.set(true)" [class.active]="activeTab() === 'expense'">
            + Expense
          </button>
        </div>
      </div>

      <!-- Add Transaction Form -->
      @if (showAddForm()) {
        <div class="card add-form-card mb-4">
          <h3 class="card-title mb-4">
            @if (activeTab() === 'income') { Add Income }
            @else if (activeTab() === 'expense') { Add Expense }
            @else { Add Transaction }
          </h3>
          <form (ngSubmit)="addTransaction()" class="transaction-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Description</label>
                <input 
                  type="text" 
                  class="form-input" 
                  [ngModel]="getCurrentForm().description"
                  (ngModelChange)="updateCurrentForm('description', $event)"
                  name="description" 
                  placeholder="Enter description"
                  required>
              </div>
              <div class="form-group">
                <label class="form-label">Amount</label>
                <input 
                  type="number" 
                  class="form-input" 
                  [ngModel]="getCurrentForm().amount"
                  (ngModelChange)="updateCurrentForm('amount', $event)"
                  name="amount" 
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-select" [ngModel]="getCurrentForm().category" (ngModelChange)="updateCurrentForm('category', $event)" name="category" required>
                  <option value="">Select category</option>
                  @for (category of categories(); track category) {
                    <option [value]="category">{{ category }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Date</label>
                <input 
                  type="date" 
                  class="form-input" 
                  [ngModel]="getCurrentForm().date"
                  (ngModelChange)="updateCurrentForm('date', $event)"
                  name="date" 
                  required>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Add {{ activeTab() | titlecase }}</button>
              <button type="button" class="btn btn-secondary" (click)="cancelAdd()">Cancel</button>
            </div>
          </form>
        </div>
      }

      <!-- Tabs -->
      <div class="tabs mb-4">
        <button class="tab-btn" [class.active]="activeTab() === 'all'" (click)="setActiveTab('all')">
          All
        </button>
        <button class="tab-btn" [class.active]="activeTab() === 'income'" (click)="setActiveTab('income')">
          Income
        </button>
        <button class="tab-btn" [class.active]="activeTab() === 'expense'" (click)="setActiveTab('expense')">
          Expense
        </button>
      </div>

      <!-- Filters -->
      <div class="card filters-card mb-4">
        <div class="filters">
          <div class="filter-group">
            <label class="form-label">Category</label>
            <select class="form-select" [(ngModel)]="filterCategory" name="filterCategory">
              <option value="all">All Categories</option>
              @for (category of categories(); track category) {
                <option [value]="category">{{ category }}</option>
              }
            </select>
          </div>
          <div class="filter-group">
            <label class="form-label">Sort By</label>
            <select class="form-select" [(ngModel)]="sortBy" name="sortBy">
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Transactions List -->
      <div class="card">
        @if (getFilteredTransactions().length === 0) {
          <div class="empty-state">
            <div class="empty-state-icon">{{ activeTab() === 'income' ? '💰' : activeTab() === 'expense' ? '💸' : '💳' }}</div>
            <p class="empty-state-title">No {{ activeTab() | titlecase }} transactions found</p>
            <p @if (activeTab() !== 'all') { Add your first {{ activeTab() | titlecase }} transaction using the +{{ activeTab() | titlecase }} button above. }</p>
          </div>
        } @else {
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (transaction of getFilteredTransactions(); track transaction.id) {
                <tr>
                  <td>{{ transaction.date | date:'mediumDate' }}</td>
                  <td>{{ transaction.description }}</td>
                  <td>
                    <span class="badge" [class]="getCategoryClass(transaction.category)">
                      {{ transaction.category }}
                    </span>
                  </td>
                  <td>
                    <span [class]="transaction.type === 'income' ? 'text-success' : 'text-danger'">
                      {{ transaction.type === 'income' ? '+' : '-' }}{{ budgetService.formatCurrency(transaction.amount) }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-danger btn-sm" (click)="deleteTransaction(transaction.id)">
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
  styles: [`
    .transactions-page {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .page-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
    }

    .add-form-card {
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .transaction-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .tabs {
      display: flex;
      border-bottom: 2px solid #e2e8f0;
      margin-bottom: 1rem;
    }

    .tab-btn {
      background: none;
      border: none;
      padding: 1rem 1.5rem;
      cursor: pointer;
      font-weight: 500;
      color: #64748b;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .tab-btn:hover {
      color: #1e293b;
    }

    .tab-btn.active {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
    }

    .filters-card {
      padding: 1rem;
    }

    .filters {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filter-group {
      min-width: 150px;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 9999px;
      background: #e2e8f0;
      color: #475569;
    }

    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
    }

    .table th,
    .table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    .table th {
      font-weight: 600;
      color: #1e293b;
      background: #f8fafc;
    }

    .table tbody tr:hover {
      background: #f8fafc;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #64748b;
    }

    .empty-state-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #1e293b;
    }
  `]
})
export class TransactionsComponent {
  budgetService = inject(BudgetService);

  showAddForm = signal(false);
  activeTab = signal<'all' | 'income' | 'expense'>('all');
  filterType = 'all';
  filterCategory = 'all';
  sortBy = 'date';

  categories = computed(() => Array.from(new Set(this.budgetService.budgets().map(b => b.category))));

  newIncomeTransaction: Omit<Transaction, 'id'> = {
    description: '',
    amount: 0,
    category: '',
    type: 'income',
    date: new Date()
  };

  newExpenseTransaction: Omit<Transaction, 'id'> = {
    description: '',
    amount: 0,
    category: '',
    type: 'expense',
    date: new Date()
  };

  constructor() {
    // Sync filterType with activeTab
    effect(() => {
      this.filterType = this.activeTab();
    });
  }

  getCurrentForm(): Omit<Transaction, 'id'> {
    return this.activeTab() === 'income' ? this.newIncomeTransaction : this.newExpenseTransaction;
  }

  updateCurrentForm(field: keyof Omit<Transaction, 'id'>, value: any) {
    const form = this.getCurrentForm();
    (form as any)[field] = value;
  }

  setActiveTab(tab: 'all' | 'income' | 'expense') {
    this.activeTab.set(tab);
    this.showAddForm.set(false);
  }

  cancelAdd() {
    this.newIncomeTransaction = {
      description: '',
      amount: 0,
      category: '',
      type: 'income',
      date: new Date()
    };
    this.newExpenseTransaction = {
      description: '',
      amount: 0,
      category: '',
      type: 'expense',
      date: new Date()
    };
    this.showAddForm.set(false);
  }

  getFilteredTransactions(): Transaction[] {
    let transactions = this.budgetService.transactions();

    // Filter by type (synced with activeTab)
    if (this.filterType !== 'all') {
      transactions = transactions.filter(t => t.type === this.filterType);
    }

    // Filter by category
    if (this.filterCategory !== 'all') {
      transactions = transactions.filter(t => t.category === this.filterCategory);
    }

    // Sort
    transactions = [...transactions].sort((a, b) => {
      if (this.sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (this.sortBy === 'amount') {
        return b.amount - a.amount;
      } else {
        return a.category.localeCompare(b.category);
      }
    });

    return transactions;
  }

  addTransaction(): void {
    const currentForm = this.getCurrentForm();
    if (!currentForm.description || currentForm.amount === 0 || !currentForm.category) {
      return;
    }

    this.budgetService.addTransaction({
      description: currentForm.description,
      amount: currentForm.amount,
      category: currentForm.category,
      type: currentForm.type,
      date: currentForm.date
    });

    // Reset current form
    if (this.activeTab() === 'income') {
      this.newIncomeTransaction = {
        description: '',
        amount: 0,
        category: '',
        type: 'income',
        date: new Date()
      };
    } else {
      this.newExpenseTransaction = {
        description: '',
        amount: 0,
        category: '',
        type: 'expense',
        date: new Date()
      };
    }

    this.showAddForm.set(false);
  }

  deleteTransaction(id: number): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.budgetService.deleteTransaction(id);
    }
  }

  getCategoryClass(category: string): string {
    const classes: { [key: string]: string } = {
      'Food': 'badge-food',
      'Transport': 'badge-transport',
      'Entertainment': 'badge-entertainment',
      'Education': 'badge-education',
      'Housing': 'badge-housing',
      'Income': 'badge-income',
      'Shopping': 'badge-shopping',
      'Health': 'badge-health'
    };
    return classes[category] || '';
  }
}
