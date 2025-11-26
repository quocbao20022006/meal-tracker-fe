# Migration từ Supabase sang Spring Boot + PostgreSQL

## ✅ Hoàn tất

### Đã thay đổi:
1. ✅ **package.json** - Thay `@supabase/supabase-js` bằng `axios`
2. ✅ **.env** - Cập nhật `VITE_API_URL=http://localhost:8080/api`
3. ✅ **src/lib/api.ts** - Tạo API client cho Spring Boot
4. ✅ **src/lib/supabase.ts** - Re-export từ api.ts để tương thích

---

## 📝 Cấu hình Backend Spring Boot

Backend của bạn cần có các endpoint sau:

### Authentication
```
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "userId": 1,
  "email": "user@example.com"
}
```

### User Profiles
```
GET  /api/user-profiles/{id}
POST /api/user-profiles
PUT  /api/user-profiles/{id}
```

### Meals
```
GET  /api/meals
GET  /api/meals/{id}
POST /api/meals
```

### Meal Plans
```
GET    /api/meal-plans
POST   /api/meal-plans
PUT    /api/meal-plans/{id}
DELETE /api/meal-plans/{id}
```

---

## 💻 Cách sử dụng trong Frontend

### Đăng nhập/Đăng ký (gọi Java API)
```typescript
import { api } from '../lib/api';

// Đăng nhập
const { data, error } = await api.signIn('user@example.com', 'password123');
if (data?.token) {
  // Lưu token, redirect tới dashboard
}

// Đăng ký
const { data, error } = await api.signUp('user@example.com', 'password123');
if (data?.token) {
  // Tạo user thành công
}

// Đăng xuất
await api.signOut();
```

### Gọi API
```typescript
import { api } from '../lib/api';

// GET request
const { data: profile, error } = await api.get('/user-profiles/123');

// POST request
const { data: newMeal, error } = await api.post('/meals', {
  name: 'Pasta',
  calories: 450,
  protein: 20
});

// PUT request
const { data: updated, error } = await api.put('/user-profiles/123', {
  weight: 70,
  age: 30
});

// DELETE request
const { error } = await api.delete('/meal-plans/456');
```

---

## 🔧 Hibernate Entities ví dụ

Bạn có thể tạo các Entity như sau:

### User
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String passwordHash;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<UserProfile> profiles;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<MealPlan> mealPlans;
}
```

### UserProfile
```java
@Entity
@Table(name = "user_profiles")
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private Integer height;
    private Integer weight;
    private Integer age;
    private String gender;
    private Double bmi;
    private String bmiCategory;
    private Integer dailyCalorieGoal;
    private LocalDateTime updatedAt;
}
```

### Meal
```java
@Entity
@Table(name = "meals")
public class Meal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String description;
    private String imageUrl;
    private String mealType; // breakfast, lunch, dinner, snack
    private Integer calories;
    private Double protein;
    private Double carbs;
    private Double fats;
    private Integer prepTime;
    private Integer cookTime;
    private Integer servings;
    
    @OneToMany(mappedBy = "meal", cascade = CascadeType.ALL)
    private List<MealPlan> mealPlans;
}
```

### MealPlan
```java
@Entity
@Table(name = "meal_plans")
public class MealPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "meal_id")
    private Meal meal;
    
    private LocalDate date;
    private String mealType;
    private Integer servings;
    private Boolean completed;
}
```

---

## ✨ Spring Boot Controller ví dụ

```java
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5175")
public class MealController {
    
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Xác thực user và trả JWT token
    }
    
    @PostMapping("/auth/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        // Tạo user mới
    }
    
    @GetMapping("/meals")
    public ResponseEntity<List<Meal>> getAllMeals() {
        return ResponseEntity.ok(mealService.getAll());
    }
    
    @PostMapping("/meal-plans")
    public ResponseEntity<MealPlan> createMealPlan(@RequestBody MealPlan mealPlan) {
        return ResponseEntity.ok(mealPlanService.save(mealPlan));
    }
}
```

---

## 🚀 Chạy ứng dụng

1. **Chạy Spring Boot backend** (port 8080)
   ```bash
   mvn spring-boot:run
   ```

2. **Chạy React frontend** (port 5175)
   ```bash
   npm run dev
   ```

3. **Frontend sẽ gọi** `http://localhost:8080/api` để lấy dữ liệu

---

## 📚 Tài liệu thêm

- [Axios Documentation](https://axios-http.com/)
- [Spring Boot REST API](https://spring.io/guides/gs/rest-service/)
- [Hibernate ORM](https://hibernate.org/)
- [PostgreSQL](https://www.postgresql.org/)
