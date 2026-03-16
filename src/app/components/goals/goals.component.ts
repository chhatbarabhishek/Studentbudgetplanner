import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="goals-page">
      <!-- Header -->
      <div class="page-header">
        <h2>Savings Goals</h2>
        <button class="btn btn-primary" (click)="showAddForm.set(!showAddForm())">
          {{ showAddForm() ? '✕ Cancel' : '+ Add Goal' }}
        </button>
      </div>

      <!-- Add Goal Form -->
      @if (showAddForm()) {
        <div class="card add-form-card mb-4">
          <h3 class="card-title mb-4">Create New Savings Goal</h3>
          <form (ngSubmit)="addGoal()" class="goal-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Goal Name</label>
                <input 
                  type="text" 
                  class="form-input" 
                  [(ngModel)]="newGoal.name" 
                  name="name" 
                  placeholder="e.g., New Laptop"
                  required>
              </div>
              <div class="form-group">
                <label class="form-label">Target Amount</label>
                <input 
                  type="number" 
                  class="form-input" 
                  [(ngModel)]="newGoal.targetAmount" 
                  name="targetAmount" 
                  placeholder="0.00"
                  min="1"
                  required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Deadline</label>
                <input 
                  type="date" 
                  class="form-input" 
                  [(ngModel)]="newGoal.deadline" 
                  name="deadline" 
                  required>
              </div>
              <div class="form-group">
                <label class="form-label">Icon</label>
                <select class="form-select" [(ngModel)]="newGoal.icon" name="icon">
                  <option value="💻">💻 Laptop</option>
                  <option value="✈️">✈️ Travel</option>
                  <option value="🎓">🎓 Education</option>
                  <option value="🏠">🏠 Housing</option>
                  <option value="🚗">🚗 Car</option>
                  <option value="📱">📱 Phone</option>
                  <option value="🎮">🎮 Gaming</option>
                  <option value="💰">💰 Emergency</option>
                  <option value="🎁">🎁 Gift</option>
                </select>
              </div>
              <div class="form-group form-actions">
                <button type="submit" class="btn btn-primary">Create Goal</button>
              </div>
            </div>
          </form>
        </div>
      }

      <!-- Goals Grid -->
      <div class="goals-grid">
        @for (goal of budgetService.goals(); track goal.id) {
          <div class="goal-card card">
            <div class="goal-header">
              <div class="goal-icon">{{ goal.icon }}</div>
              <div class="goal-actions">
                <button 
                  class="btn btn-outline btn-sm" 
                  (click)="startContribute(goal.id)">
                  ➕ Contribute
                </button>
                <button 
                  class="btn btn-danger btn-sm" 
                  (click)="deleteGoal(goal.id)">
                  🗑️
                </button>
              </div>
            </div>

            <h3 class="goal-name">{{ goal.name }}</h3>
            
            <div class="goal-amounts">
              <span class="current-amount">{{ budgetService.formatCurrency(goal.currentAmount) }}</span>
              <span class="separator">of</span>
              <span class="target-amount">{{ budgetService.formatCurrency(goal.targetAmount) }}</span>
            </div>

            <div class="goal-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  [style.width.%]="(goal.currentAmount / goal.targetAmount) * 100"
                  [class.complete]="goal.currentAmount >= goal.targetAmount">
                </div>
              </div>
              <div class="progress-info">
                <span class="percentage">
                  {{ ((goal.currentAmount / goal.targetAmount) * 100) | number:'1.0-0' }}%
                </span>
                @if (goal.currentAmount >= goal.targetAmount) {
                  <span class="badge badge-success">🎉 Goal Reached!</span>
                }
              </div>
            </div>

            <div class="goal-meta">
              <div class="meta-item">
                <span class="meta-label">Deadline</span>
                <span class="meta-value">{{ goal.deadline | date:'mediumDate' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Remaining</span>
                <span class="meta-value">{{ budgetService.formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount)) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Daily Needed</span>
                <span class="meta-value">{{ budgetService.formatCurrency(calculateDailyNeeded(goal)) }}</span>
              </div>
            </div>

            @if (contributingTo === goal.id) {
              <div class="contribute-form">
                <div class="form-group">
                  <label class="form-label">Amount to Add</label>
                  <input 
                    type="number" 
                    class="form-input" 
                    [(ngModel)]="contributeAmount" 
                    name="contributeAmount"
                    placeholder="0.00"
                    min="1">
                </div>
                <div class="contribute-actions">
                  <button class="btn btn-success btn-sm" (click)="submitContribution(goal.id)">
                    Add Funds
                  </button>
                  <button class="btn btn-outline btn-sm" (click)="cancelContribute()">
                    Cancel
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      @if (budgetService.goals().length === 0) {
        <div class="card empty-state">
          <div class="empty-state-icon">🎯</div>
          <p class="empty-state-title">No savings goals yet</p>
          <p>Create your first savings goal to start tracking your progress</p>
        </div>
      }

      <!-- Tips Section -->
      <div class="card tips-card mt-4">
        <h3 class="card-title">💡 Tips for Reaching Your Goals</h3>
        <ul class="tips-list">
          <li>Set specific, measurable goals with clear deadlines</li>
          <li>Break large goals into smaller milestones</li>
          <li>Automate savings by setting up recurring transfers</li>
          <li>Track your progress regularly to stay motivated</li>
          <li>Celebrate small wins along the way</li>
          <li>Find ways to reduce expenses to save more</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .goals-page {
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

    .goal-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }

    .form-actions {
      display: flex;
      align-items: flex-end;
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
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .goal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .goal-icon {
      font-size: 2.5rem;
    }

    .goal-actions {
      display: flex;
      gap: 0.5rem;
    }

    .goal-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .goal-amounts {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }

    .current-amount {
      font-size: 1.5rem;
      font-weight: 700;
      color: #4f46e5;
    }

    .separator {
      color: #94a3b8;
    }

    .target-amount {
      font-size: 1rem;
      color: #64748b;
    }

    .goal-progress {
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
      background: linear-gradient(90deg, #4f46e5, #818cf8);
      border-radius: 6px;
      transition: width 0.3s ease;
    }

    .progress-fill.complete {
      background: linear-gradient(90deg, #10b981, #34d399);
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .percentage {
      font-size: 0.875rem;
      font-weight: 600;
      color: #4f46e5;
    }

    .goal-meta {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid #e2e8f0;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
    }

    .meta-label {
      font-size: 0.75rem;
      color: #64748b;
    }

    .meta-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1e293b;
    }

    .contribute-form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid #e2e8f0;
    }

    .contribute-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }

    .tips-card {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    }

    .tips-list {
      margin: 1rem 0 0;
      padding-left: 1.5rem;
    }

    .tips-list li {
      color: #334155;
      margin-bottom: 0.5rem;
    }

    .badge-success {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
  `]
})
export class GoalsComponent {
  budgetService = inject(BudgetService);
  Math = Math;

  showAddForm = signal(false);
  contributingTo: number | null = null;
  contributeAmount = 0;

  newGoal = {
    name: '',
    targetAmount: 0,
    deadline: '',
    icon: '💰'
  };

  addGoal(): void {
    if (!this.newGoal.name || !this.newGoal.targetAmount || !this.newGoal.deadline) {
      return;
    }

    this.budgetService.addGoal({
      name: this.newGoal.name,
      targetAmount: this.newGoal.targetAmount,
      currentAmount: 0,
      deadline: new Date(this.newGoal.deadline),
      icon: this.newGoal.icon
    });

    this.newGoal = {
      name: '',
      targetAmount: 0,
      deadline: '',
      icon: '💰'
    };
    this.showAddForm.set(false);
  }

  startContribute(goalId: number): void {
    this.contributingTo = goalId;
    this.contributeAmount = 0;
  }

  submitContribution(goalId: number): void {
    if (this.contributeAmount > 0) {
      this.budgetService.updateGoalProgress(goalId, this.contributeAmount);
    }
    this.cancelContribute();
  }

  cancelContribute(): void {
    this.contributingTo = null;
    this.contributeAmount = 0;
  }

  deleteGoal(id: number): void {
    if (confirm('Are you sure you want to delete this goal?')) {
      this.budgetService.deleteGoal(id);
    }
  }

  calculateDailyNeeded(goal: { targetAmount: number; currentAmount: number; deadline: Date }): number {
    const remaining = goal.targetAmount - goal.currentAmount;
    const daysLeft = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    return daysLeft > 0 ? remaining / daysLeft : remaining;
  }
}

