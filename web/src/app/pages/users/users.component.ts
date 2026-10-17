import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

export interface AppUser {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'User';
  status: 'Active' | 'Pending' | 'Inactive';
  team: string;
  lastActive: string;
  enabled: boolean;
}

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
})
export class UsersPageComponent implements OnInit {
  private readonly storageKey = 'smart-event-management-users';

  users: AppUser[] = [
    {
      id: 1,
      name: 'Olivia Martin',
      email: 'olivia.martin@company.com',
      role: 'Admin',
      status: 'Active',
      team: 'Product',
      lastActive: '2 hours ago',
      enabled: true,
    },
    {
      id: 2,
      name: 'James Wilson',
      email: 'james.wilson@company.com',
      role: 'User',
      status: 'Active',
      team: 'Operations',
      lastActive: '1 day ago',
      enabled: true,
    },
    {
      id: 3,
      name: 'Sophia Brown',
      email: 'sophia.brown@company.com',
      role: 'User',
      status: 'Pending',
      team: 'Marketing',
      lastActive: '5 hours ago',
      enabled: false,
    },
    {
      id: 4,
      name: 'Daniel Lee',
      email: 'daniel.lee@company.com',
      role: 'User',
      status: 'Inactive',
      team: 'Customer Success',
      lastActive: '3 days ago',
      enabled: false,
    },
    {
      id: 5,
      name: 'Emma Davis',
      email: 'emma.davis@company.com',
      role: 'User',
      status: 'Active',
      team: 'Sales',
      lastActive: '30 minutes ago',
      enabled: true,
    },
    {
      id: 6,
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      role: 'User',
      status: 'Active',
      team: 'Finance',
      lastActive: '8 hours ago',
      enabled: true,
    },
    {
      id: 7,
      name: 'Ava Patel',
      email: 'ava.patel@company.com',
      role: 'User',
      status: 'Pending',
      team: 'Design',
      lastActive: 'Yesterday',
      enabled: false,
    },
    {
      id: 8,
      name: 'Noah Garcia',
      email: 'noah.garcia@company.com',
      role: 'User',
      status: 'Active',
      team: 'IT',
      lastActive: '14 minutes ago',
      enabled: true,
    },
  ];

  ngOnInit(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const storedUsers = localStorage.getItem(this.storageKey);
      if (storedUsers) {
        const parsed: unknown = JSON.parse(storedUsers);
        if (Array.isArray(parsed)) {
          this.users = (parsed as AppUser[]).map((user) => ({
            ...user,
            role: user.role === 'Admin' ? 'Admin' : 'User',
          }));
          localStorage.setItem(this.storageKey, JSON.stringify(this.users));
        }
      }
    } catch {
      localStorage.removeItem(this.storageKey);
    }
  }

  toggleUser(user: AppUser): void {
    this.users = this.users.map((currentUser) =>
      currentUser.id === user.id
        ? {
            ...currentUser,
            enabled: !currentUser.enabled,
            status: currentUser.enabled ? 'Inactive' : 'Active',
          }
        : currentUser,
    );

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(this.users));
    }
  }

  getStatusClasses(status: AppUser['status']): string {
    switch (status) {
      case 'Active':
        return 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400';
      case 'Pending':
        return 'bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300';
      case 'Inactive':
        return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400';
    }
  }
}
