# Hướng dẫn kết nối PostgreSQL với Spring Boot + React

## 1️⃣ Setup PostgreSQL

### Cài đặt PostgreSQL
**Windows:**
```bash
# Download từ https://www.postgresql.org/download/windows/
# Hoặc dùng chocolatey
choco install postgresql
```

**Mac:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Tạo Database
```bash
# Kết nối tới PostgreSQL
psql -U postgres

# Tạo database mới
CREATE DATABASE meal_tracker;

# Tạo user
CREATE USER meal_user WITH PASSWORD 'your_password';

# Cấp quyền
GRANT ALL PRIVILEGES ON DATABASE meal_tracker TO meal_user;

# Thoát
\q
```

---

## 2️⃣ Setup Spring Boot Backend

### application.properties
Tạo file `src/main/resources/application.properties`:

```properties
# Server
server.port=8080
server.servlet.context-path=/api

# PostgreSQL Database
spring.datasource.url=jdbc:postgresql://localhost:5432/meal_tracker
spring.datasource.username=meal_user
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver

# Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQL10Dialect
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# CORS
spring.web.cors.allowed-origins=http://localhost:5175
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true

# JWT
jwt.secret=your_jwt_secret_key_here_make_it_long_and_secure
jwt.expiration=86400000
```

### pom.xml Dependencies
Thêm vào `pom.xml`:

```xml
<!-- PostgreSQL -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.1</version>
</dependency>

<!-- Spring Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- Spring Web -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>

<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>

<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>

<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

---

## 3️⃣ Tạo Entities (Hibernate)

### User Entity
```java
package com.meal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String passwordHash;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UserProfile> profiles = new ArrayList<>();
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MealPlan> mealPlans = new ArrayList<>();
}
```

### UserProfile Entity
```java
package com.meal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    private Integer height;
    private Integer weight;
    private Integer age;
    private String gender;
    private Double bmi;
    private String bmiCategory;
    private Integer dailyCalorieGoal;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}
```

### Meal Entity
```java
package com.meal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Table(name = "meals")
@Data
@NoArgsConstructor
@AllArgsConstructor
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
    
    @OneToMany(mappedBy = "meal", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MealPlan> mealPlans = new ArrayList<>();
}
```

### MealPlan Entity
```java
package com.meal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "meal_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meal_id", nullable = false)
    private Meal meal;
    
    private LocalDate date;
    private String mealType;
    private Integer servings;
    private Boolean completed = false;
}
```

---

## 4️⃣ Tạo Repositories (JPA)

### UserRepository
```java
package com.meal.repository;

import com.meal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

### MealRepository
```java
package com.meal.repository;

import com.meal.entity.Meal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MealRepository extends JpaRepository<Meal, Long> {
}
```

### MealPlanRepository
```java
package com.meal.repository;

import com.meal.entity.MealPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {
    List<MealPlan> findByUserIdAndDate(Long userId, LocalDate date);
    List<MealPlan> findByUserId(Long userId);
}
```

---

## 5️⃣ Tạo Controllers (API Endpoints)

### AuthController
```java
package com.meal.controller;

import com.meal.dto.LoginRequest;
import com.meal.dto.SignupRequest;
import com.meal.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5175")
public class AuthController {
    private final AuthService authService;
    
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
```

### MealController
```java
package com.meal.controller;

import com.meal.entity.Meal;
import com.meal.service.MealService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/meals")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5175")
public class MealController {
    private final MealService mealService;
    
    @GetMapping
    public ResponseEntity<List<Meal>> getAllMeals() {
        return ResponseEntity.ok(mealService.getAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Meal> getMealById(@PathVariable Long id) {
        return ResponseEntity.ok(mealService.getById(id));
    }
    
    @PostMapping
    public ResponseEntity<Meal> createMeal(@RequestBody Meal meal) {
        return ResponseEntity.ok(mealService.save(meal));
    }
}
```

---

## 6️⃣ Chạy ứng dụng

### Terminal 1 - Spring Boot Backend
```bash
cd your-spring-boot-project
mvn spring-boot:run
# Backend chạy tại http://localhost:8080/api
```

### Terminal 2 - React Frontend
```bash
cd meal-tracker-fe
npm run dev
# Frontend chạy tại http://localhost:5175
```

### Kiểm tra kết nối
```bash
# Kiểm tra backend
curl http://localhost:8080/api/meals

# Kiểm tra frontend
# Mở http://localhost:5175 trên trình duyệt
```

---

## 📊 Database Schema (Tự động tạo bởi Hibernate)

Khi chạy Spring Boot, Hibernate sẽ tự động tạo các bảng:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    height INTEGER,
    weight INTEGER,
    age INTEGER,
    gender VARCHAR(20),
    bmi DOUBLE PRECISION,
    bmi_category VARCHAR(20),
    daily_calorie_goal INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE meals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    meal_type VARCHAR(50),
    calories INTEGER,
    protein DOUBLE PRECISION,
    carbs DOUBLE PRECISION,
    fats DOUBLE PRECISION,
    prep_time INTEGER,
    cook_time INTEGER,
    servings INTEGER
);

CREATE TABLE meal_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    meal_id INTEGER NOT NULL REFERENCES meals(id),
    date DATE,
    meal_type VARCHAR(50),
    servings INTEGER,
    completed BOOLEAN DEFAULT FALSE
);
```

---

## 🔗 Kiến trúc kết nối

```
┌─────────────────────┐
│   React Frontend    │
│  (port 5175)        │
└──────────┬──────────┘
           │
           │ HTTP/REST API
           │ (Axios)
           ▼
┌─────────────────────┐
│  Spring Boot API    │
│  (port 8080)        │
└──────────┬──────────┘
           │
           │ JDBC
           │
           ▼
┌─────────────────────┐
│   PostgreSQL        │
│  (port 5432)        │
└─────────────────────┘
```

---

## ✅ Checklist

- [ ] Cài PostgreSQL
- [ ] Tạo database `meal_tracker`
- [ ] Cấu hình `application.properties`
- [ ] Thêm dependencies vào `pom.xml`
- [ ] Tạo Entities (User, UserProfile, Meal, MealPlan)
- [ ] Tạo Repositories
- [ ] Tạo Controllers
- [ ] Chạy Spring Boot backend
- [ ] Chạy React frontend
- [ ] Test API endpoints

Xong! 🎉
