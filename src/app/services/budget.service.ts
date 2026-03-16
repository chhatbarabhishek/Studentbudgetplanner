import { Injectable, signal, computed, effect } from '@angular/core';
import { Transaction, BudgetCategory, SavingsGoal } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  // Storage keys
  private readonly STORAGE_KEYS = {
    transactions: 'budget-transactions',
    budgets: 'budget-budgets',
    goals: 'budget-goals'
  };

  // Default data
  private readonly DEFAULT_TRANSACTIONS: Transaction[] = [
    { id: 1, description: 'Tuition Fee', amount: 500, category: 'Education', date: new Date('2024-01-15'), type: 'expense' },
    { id: 2, description: 'Part-time Job', amount: 800, category: 'Income', date: new Date('2024-01-10'), type: 'income' },
    { id: 3, description: 'Textbooks', amount: 120, category: 'Education', date: new Date('2024-01-18'), type: 'expense' },
    { id: 4, description: 'Groceries', amount: 85, category: 'Food', date: new Date('2024-01-20'), type: 'expense' },
    { id: 5, description: 'Transport', amount: 45, category: 'Transport', date: new Date('2024-01-22'), type: 'expense' },
    { id: 6, description: 'Monthly Allowance', amount: 1000, category: 'Income', date: new Date('2024-01-01'), type: 'income' },
    { id: 7, description: 'Entertainment', amount: 30, category: 'Entertainment', date: new Date('2024-01-25'), type: 'expense' },
  ];

  private readonly DEFAULT_BUDGETS: BudgetCategory[] = [
    { category: 'Food', limit: 200, spent: 150 },
    { category: 'Transport', limit: 100, spent: 45 },
    { category: 'Entertainment', limit: 50, spent: 30 },
    { category: 'Education', limit: 300, spent: 250 },
    { category: 'Housing', limit: 400, spent: 400 },
    { category: 'Income', limit: 10000, spent: 3000 },
  ];

  private readonly DEFAULT_GOALS: SavingsGoal[] = [
    { id: 1, name: 'New Laptop', targetAmount: 800, currentAmount: 350, deadline: new Date('2024-06-30'), icon: '💻' },
    { id: 2, name: 'Summer Trip', targetAmount: 500, currentAmount: 200, deadline: new Date('2024-05-01'), icon: '✈️' },
    { id: 3, name: 'Emergency Fund', targetAmount: 1000, currentAmount: 450, deadline: new Date('2024-12-31'), icon: '🛡️' },
  ];

  // Signals
  private transactionsSignal = signal<Transaction[]>([]);
  private budgetsSignal = signal<BudgetCategory[]>([]);
  private goalsSignal = signal<SavingsGoal[]>([]);

  constructor() {
    this.loadData();
    // Auto-save effects
    effect(() => {
      this.saveData('transactions', this.transactionsSignal());
    });
    effect(() => {
      this.saveData('budgets', this.budgetsSignal());
    });
    effect(() => {
      this.saveData('goals', this.goalsSignal());
    });
  }

  readonly transactions = computed(() => this.transactionsSignal());
  readonly budgets = computed(() => this.budgetsSignal());
  readonly goals = computed(() => this.goalsSignal());

  readonly currencySymbol = '₹';

  formatCurrency(amount: number): string {
    return `${this.currencySymbol}${amount.toLocaleString('en-IN')}`;
  }

  readonly totalIncome = computed(() => 
    this.transactions()
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  readonly totalExpenses = computed(() => 
    this.transactions()
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  readonly balance = computed(() => this.totalIncome() - this.totalExpenses());

  readonly savingsRate = computed(() => {
    const income = this.totalIncome();
    return income > 0 ? ((income - this.totalExpenses()) / income) * 100 : 0;
  });

  private loadData(): void {
    const transactions = localStorage.getItem(this.STORAGE_KEYS.transactions);
    if (transactions) {
      try {
        this.transactionsSignal.set(JSON.parse(transactions).map((t: any) => ({
          ...t,
          date: new Date(t.date)
        })));
      } catch (e) {
        console.error('Failed to load transactions', e);
        this.transactionsSignal.set(this.DEFAULT_TRANSACTIONS);
      }
    } else {
      this.transactionsSignal.set(this.DEFAULT_TRANSACTIONS);
    }

    const budgets = localStorage.getItem(this.STORAGE_KEYS.budgets);
    if (budgets) {
      try {
        this.budgetsSignal.set(JSON.parse(budgets));
      } catch (e) {
        console.error('Failed to load budgets', e);
        this.budgetsSignal.set(this.DEFAULT_BUDGETS);
      }
    } else {
      this.budgetsSignal.set(this.DEFAULT_BUDGETS);
    }

    const goals = localStorage.getItem(this.STORAGE_KEYS.goals);
    if (goals) {
      try {
        this.goalsSignal.set(JSON.parse(goals).map((g: any) => ({
          ...g,
          deadline: new Date(g.deadline)
        })));
      } catch (e) {
        console.error('Failed to load goals', e);
        this.goalsSignal.set(this.DEFAULT_GOALS);
      }
    } else {
      this.goalsSignal.set(this.DEFAULT_GOALS);
    }
  }

  private saveData(key: string, data: any[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS[key as keyof typeof this.STORAGE_KEYS], JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save data', e);
    }
  }

  addTransaction(transaction: Omit<Transaction, 'id'>): void {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now()
    };
    this.transactionsSignal.update(transactions => [...transactions, newTransaction]);
    
    if (transaction.type === 'expense') {
      this.updateBudgetSpent(transaction.category, transaction.amount);
    }
  }

  deleteTransaction(id: number): void {
    const transaction = this.transactions().find(t => t.id === id);
    if (transaction && transaction.type === 'expense') {
      this.updateBudgetSpent(transaction.category, -transaction.amount);
    }
    this.transactionsSignal.update(transactions => transactions.filter(t => t.id !== id));
  }

  private updateBudgetSpent(category: string, amount: number): void {
    this.budgetsSignal.update(budgets => 
      budgets.map(b => 
        b.category === category 
          ? { ...b, spent: b.spent + amount } 
          : b
      )
    );
  }

  updateBudgetLimit(category: string, newLimit: number): void {
    this.budgetsSignal.update(budgets => 
      budgets.map(b => 
        b.category === category 
          ? { ...b, limit: newLimit } 
          : b
      )
    );
  }

  addBudgetCategory(category: string, limit: number): void {
    this.budgetsSignal.update(budgets => [...budgets, { category, limit, spent: 0 }]);
  }

  addGoal(goal: Omit<SavingsGoal, 'id'>): void {
    const newGoal: SavingsGoal = {
      ...goal,
      id: Date.now()
    };
    this.goalsSignal.update(goals => [...goals, newGoal]);
  }

  updateGoalProgress(id: number, amount: number): void {
    this.goalsSignal.update(goals => 
      goals.map(g => 
        g.id === id 
          ? { ...g, currentAmount: g.currentAmount + amount } 
          : g
      )
    );
  }

  deleteGoal(id: number): void {
    this.goalsSignal.update(goals => goals.filter(g => g.id !== id));
  }

  getCategoryBreakdown(): { category: string; amount: number; percentage: number }[] {
    const expenses = this.transactions().filter(t => t.type === 'expense');
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    const categoryMap = new Map<string, number>();
    expenses.forEach(t => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
    });

    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
    }));
  }

  getMonthlyTrends(): { month: string; income: number; expenses: number }[] {
    return [
      { month: 'Sep', income: 1800, expenses: 1200 },
      { month: 'Oct', income: 1800, expenses: 1400 },
      { month: 'Nov', income: 2000, expenses: 1100 },
      { month: 'Dec', income: 2500, expenses: 1800 },
      { month: 'Jan', income: 1800, expenses: 1300 },
    ];
  }
}

