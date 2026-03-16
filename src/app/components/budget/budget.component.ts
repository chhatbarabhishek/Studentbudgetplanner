import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="budget-page">
      <!-- Header -->
      <div class="page-header">
        <h2>Budget Management</h2>
        <button class="btn btn-primary" (click)="showAddForm.set(!showAddForm())">
          {{ showAddForm() ? '✕ Cancel' : '+ Add Category' }}
        </button>
      </div>

      <!-- Add Budget Category Form -->
      @if (showAddForm()) {
        <div class="card add-form-card mb-4">
          <h3 class="card-title mb-4">Add Budget Category</h3>
          <form (ngSubmit)="addBudgetCategory()" class="budget-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Category Name</label>
                <input 
                  type="text" 
                  class="form-input" 
                  [(ngModel)]="newCategory" 
                  name="category" 
                  placeholder="e.g., Food, Transport"
                  required>
              </div>
              <div class="form-group">
                <label class="form-label">Monthly Limit</label>
                <input 
                  type="number" 
                  class="form-input" 
                  [(ngModel)]="newLimit" 
                  name="limit" 
                  placeholder="0.00"
                  min="0"
                  step="1"
                  required>
              </div>
              <div class="form-group form-actions">
                <button type="submit" class="btn btn-primary">Add Category</button>
              </div>
            </div>
          </form>
        </div>
      }

      <!-- Budget Cards -->
      <div class="budget-grid">
        @for (budget of budgetService.budgets(); track budget.category) {
          <div class="budget-card card">
            <div class="budget-header">
              <h3 class="budget-category">{{ budget.category }}</h3>
              <button 
                class="btn btn-outline btn-sm" 
                (click)="startEdit(budget.category, budget.limit)">
                ✏️ Edit
              </button>
            </div>
            
            <div class="budget-amounts">
              <span class="spent-amount" [class.over-budget]="budget.spent > budget.limit">
                {{ budgetService.formatCurrency(budget.spent) }}
              </span>
              <span class="separator">/</span>
              <span class="limit-amount">{{ budgetService.formatCurrency(budget.limit) }}</span>
            </div>

            <div class="budget-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  [style.width.%]="Math.min((budget.spent / budget.limit) * 100, 100)"
                  [class.over-budget]="budget.spent > budget.limit"
                  [class.warning]="budget.spent / budget.limit > 0.8 && budget.spent <= budget.limit">
                </div>
              </div>
              <div class="progress-info">
                <span class="percentage">
                  {{ ((budget.spent / budget.limit) * 100) | number:'1.0-0' }}% used
                </span>
                <span class="remaining" [class.negative]="budget.spent > budget.limit">
                  {{ budget.spent > budget.limit ? 'Over by ' : 'Remaining: ' }}
                  {{ budgetService.formatCurrency(Math.abs(budget.limit - budget.spent)) }}
                </span>
              </div>
            </div>

            @if (editingCategory === budget.category) {
              <div class="edit-form">
                <div class="form-group">
                  <label class="form-label">New Limit</label>
                  <input 
                    type="number" 
                    class="form-input" 
                    [(ngModel)]="editLimit" 
                    name="editLimit">
                </div>
                <div class="edit-actions">
                  <button class="btn btn-primary btn-sm" (click)="saveEdit(budget.category)">
                    Save
                  </button>
                  <button class="btn btn-outline btn-sm" (click)="cancelEdit()">
                    Cancel
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Budget Tips -->
      <div class="card tips-card mt-4">
        <h3 class="card-title">💡 Budget Tips for Students</h3>
        <ul class="tips-list">
          <li>Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
          <li>Track every expense, no matter how small</li>
          <li>Set realistic budget limits based on your income</li>
          <li>Review and adjust your budget weekly</li>
          <li>Look for student discounts on everything</li>
          <li>Cook at home more often to save on food expenses</li>
          <li>Use public transportation or bike instead of rideshares</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .budget-page {
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

    .add-form-card {
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .budget-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 1rem;
      align-items: flex-end;
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }

    .form-actions {
      display: flex;
      align-items: flex-end;
    }

    .budget-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    @media (max-width: 1024px) {
      .budget-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 640px) {
      .budget-grid { grid-template-columns: 1fr; }
    }

    .budget-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .budget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .budget-category {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .budget-amounts {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }

    .spent-amount {
      font-size: 1.75rem;
      font-weight: 700;
      color: #4f46e5;
    }

    .spent-amount.over-budget {
      color: #ef4444;
    }

    .separator {
      color: #94a3b8;
    }

    .limit-amount {
      font-size: 1.125rem;
      color: #64748b;
    }

    .budget-progress {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .progress-bar {
      height: 12px;
      background: #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #4f46e5;
      border-radius: 6px;
      transition: width 0.3s ease;
    }

    .progress-fill.warning {
      background: #f59e0b;
    }

    .progress-fill.over-budget {
      background: #ef4444;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
    }

    .percentage {
      color: #64748b;
    }

    .remaining {
      color: #10b981;
      font-weight: 500;
    }

    .remaining.negative {
      color: #ef4444;
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid #e2e8f0;
    }

    .edit-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }

    .tips-card {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    }

    .tips-list {
      margin: 1rem 0 0;
      padding-left: 1.5rem;
    }

    .tips-list li {
      color: #334155;
      margin-bottom: 0.5rem;
    }
  `]
})
export class BudgetComponent {
  budgetService = inject(BudgetService);
  Math = Math;

  showAddForm = signal(false);
  editingCategory = '';
  newCategory = '';
  newLimit = 0;
  editLimit = 0;

  addBudgetCategory(): void {
    if (!this.newCategory || !this.newLimit) {
      return;
    }
    this.budgetService.addBudgetCategory(this.newCategory, this.newLimit);
    this.newCategory = '';
    this.newLimit = 0;
    this.showAddForm.set(false);
  }

  startEdit(category: string, limit: number): void {
    this.editingCategory = category;
    this.editLimit = limit;
  }

  saveEdit(category: string): void {
    if (this.editLimit > 0) {
      this.budgetService.updateBudgetLimit(category, this.editLimit);
    }
    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editingCategory = '';
    this.editLimit = 0;
  }
}

