# 🏗️ Cấu trúc Dự án Refactored

## 📁 Thư mục

```
src/
├── types/                    # TypeScript types & interfaces
│   └── index.ts
├── lib/                      # Libraries & utilities
│   ├── http-client.ts       # Axios HTTP client wrapper
│   ├── api.ts               # Supabase compatibility (unused now)
│   └── supabase.ts
├── services/                 # Business logic - gọi API
│   ├── index.ts
│   ├── auth.service.ts      # Authentication
│   ├── user-profile.service.ts
│   ├── meal.service.ts
│   └── meal-plan.service.ts
├── hooks/                    # Custom React hooks
│   ├── index.ts
│   ├── useFetch.ts          # Generic fetch hook
│   ├── useAuth.ts           # Auth logic
│   ├── useMeals.ts
│   ├── useMealPlans.ts
│   └── useUserProfile.ts
├── utils/                    # Helper functions
│   ├── index.ts
│   └── helpers.ts           # Format, calculate functions
├── components/              # Reusable UI components
├── pages/                   # Page components
├── contexts/                # React contexts
└── ...
```

---

## 🔄 Data Flow

```
Component
    ↓
Hook (useAuth, useMeals, etc.)
    ↓
Service (authService, mealService, etc.)
    ↓
HTTP Client (Axios)
    ↓
Spring Boot API
    ↓
PostgreSQL Database
```

---

## 📚 Cách sử dụng từng tầng

### 1️⃣ Types - Định nghĩa kiểu dữ liệu
```typescript
// src/types/index.ts
import { Meal, MealPlan, AuthResponse } from '../types';
```

### 2️⃣ Services - Gọi API
```typescript
// src/services/meal.service.ts
import { mealService } from '../services';

// Sử dụng trực tiếp
const { data, error } = await mealService.getAllMeals();
const { data } = await mealService.getMealById(1);
```

### 3️⃣ Hooks - Tích hợp vào Components
```typescript
// src/pages/Meals.tsx
import { useMeals } from '../hooks';

function Meals() {
  const { meals, loading, error, fetchMeals } = useMeals();
  
  useEffect(() => {
    fetchMeals();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {meals?.map(meal => (
        <div key={meal.id}>{meal.name}</div>
      ))}
    </div>
  );
}
```

### 4️⃣ Utils - Helper functions
```typescript
import { formatDate, calculateTotalMacros, debounce } from '../utils';

const formattedDate = formatDate(new Date());
const totalMacros = calculateTotalMacros(mealPlans);
```

---

## 🎯 Ví dụ: Tạo một Meal Plan mới

### Component (pages/Meals.tsx)
```typescript
import { useMealPlans, useMeals } from '../hooks';
import { formatDate } from '../utils';

export default function Meals() {
  const { createMealPlan, createMealPlanLoading } = useMealPlans();
  const { meals, loading, fetchMeals } = useMeals();
  
  useEffect(() => {
    fetchMeals();
  }, []);
  
  const handleAddMealPlan = async (mealId: number) => {
    const { data, error } = await createMealPlan({
      mealId,
      date: formatDate(new Date()),
      mealType: 'lunch',
      servings: 1,
    });
    
    if (data) {
      alert('Meal plan added!');
    } else {
      alert(`Error: ${error?.message}`);
    }
  };
  
  return (
    <div>
      {meals?.map(meal => (
        <button key={meal.id} onClick={() => handleAddMealPlan(meal.id)}>
          {createMealPlanLoading ? 'Adding...' : 'Add to Plan'}
        </button>
      ))}
    </div>
  );
}
```

---

## 🔐 Authentication

### Login
```typescript
import { useAuth } from '../hooks';

function LoginPage() {
  const { login, loginLoading, loginError } = useAuth();
  
  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await login({ email, password });
    if (data) {
      // Token saved automatically
      navigate('/dashboard');
    }
  };
}
```

### Logout
```typescript
import { useAuth } from '../hooks';

function Sidebar() {
  const { logout } = useAuth();
  
  return (
    <button onClick={logout}>Logout</button>
  );
}
```

---

## 📊 User Profile

```typescript
import { useUserProfile } from '../hooks';

function ProfilePage({ userId }: { userId: number }) {
  const {
    profile,
    loading,
    updateProfile,
    calculateBMI,
    calculateDailyCalories
  } = useUserProfile(userId);
  
  const handleSave = async (height: number, weight: number, age: number) => {
    const bmi = calculateBMI(weight, height);
    const dailyCalories = calculateDailyCalories(weight, height, age, 'male');
    
    const { data, error } = await updateProfile({
      height,
      weight,
      age,
      dailyCalorieGoal: dailyCalories,
    });
  };
}
```

---

## 📈 Meal Plans

```typescript
import { useMealPlans } from '../hooks';
import { calculateTotalMacros } from '../utils';

function Dashboard() {
  const {
    mealPlans,
    getWeekMealPlans,
    completeMealPlan,
    deleteMealPlan
  } = useMealPlans();
  
  const handleGetThisWeek = async () => {
    const { data } = await getWeekMealPlans('2024-11-23');
    const macros = calculateTotalMacros(data || []);
    console.log('Week macros:', macros);
  };
  
  const handleCompleteMeal = async (mealPlanId: number) => {
    await completeMealPlan(mealPlanId);
  };
}
```

---

## 🔍 Search & Filter Meals

```typescript
import { useMeals } from '../hooks';
import { debounce } from '../utils';

function MealSearch() {
  const { searchMeals, getMealsByType } = useMeals();
  
  const handleSearch = debounce(async (query: string) => {
    const { data } = await searchMeals(query);
    console.log('Results:', data);
  }, 300);
  
  const handleFilterByType = async (type: string) => {
    const { data } = await getMealsByType(type);
    console.log('Filtered:', data);
  };
}
```

---

## 📋 Checklist Refactoring

- ✅ Types định nghĩa (src/types/)
- ✅ HTTP Client (src/lib/http-client.ts)
- ✅ Services (src/services/)
- ✅ Custom Hooks (src/hooks/)
- ✅ Utils helpers (src/utils/)
- ⬜ Update toàn bộ components để dùng hooks
- ⬜ Thêm error handling & loading states
- ⬜ Thêm form validation

---

## 🎓 Best Practices

1. **Luôn dùng hooks** thay vì gọi services trực tiếp trong components
2. **Sử dụng useMutation** cho POST/PUT/DELETE operations
3. **Sử dụng useFetch** để fetch data trên mount
4. **Import từ index files** (`src/hooks/`, `src/services/`, `src/utils/`)
5. **Tách business logic** vào services, không mix vào components
6. **Reuse calculations** từ service methods (calculateBMI, calculateCalories)
7. **Error handling** lúc nào cũng check error object

---

## 🔗 Import Paths

```typescript
// ✅ Good
import { useAuth, useMeals } from '../hooks';
import { authService, mealService } from '../services';
import { formatDate, formatCurrency } from '../utils';
import type { Meal, MealPlan } from '../types';

// ❌ Avoid
import useAuth from '../hooks/useAuth';
import authService from '../services/auth.service';
```
