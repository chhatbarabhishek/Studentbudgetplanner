import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  { 
    path: 'transactions', 
    loadComponent: () => import('./components/transactions/transactions.component').then(m => m.TransactionsComponent)
  },
  { 
    path: 'budget', 
    loadComponent: () => import('./components/budget/budget.component').then(m => m.BudgetComponent)
  },
  { 
    path: 'goals', 
    loadComponent: () => import('./components/goals/goals.component').then(m => m.GoalsComponent)
  },
  { 
    path: 'analytics', 
    loadComponent: () => import('./components/analytics/analytics.component').then(m => m.AnalyticsComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];

