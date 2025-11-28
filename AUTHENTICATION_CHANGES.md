## Tóm tắt các thay đổi Authentication

Tất cả authentication đã được bật lại theo quy trình cũ với hai API endpoints:
- `POST http://localhost:8080/api/auth/login`
- `POST http://localhost:8080/api/auth/register`

### Các file đã được cập nhật:

#### 1. **src/services/auth.service.ts**
   - Đổi `signup` → `register` để match với API endpoint `/auth/register`
   - Endpoint login sử dụng `/auth/login`
   - Tự động set token khi đăng nhập/đăng ký thành công

#### 2. **src/hooks/useAuth.ts**
   - Cập nhật gọi `register` thay vì `signup`
   - Tự động lưu user info và profile status vào localStorage khi login/signup thành công
   - Export `logout` function để xóa token và localStorage

#### 3. **src/contexts/AuthContext.tsx**
   - Cập nhật AuthProvider để quản lý user state
   - Kiểm tra token và user từ localStorage khi app mount
   - Export `useAuthContext` hook cho các component khác

#### 4. **src/pages/Login.tsx**
   - Bật lại sử dụng `useAuth` hook
   - Gọi `login()` function từ hook
   - Redirect về `/` sau khi đăng nhập thành công
   - Hiển thị error message từ API

#### 5. **src/pages/Register.tsx**
   - Bật lại sử dụng `useAuth` hook
   - Gọi `signup()` function từ hook
   - Redirect về `/` sau khi tạo tài khoản thành công
   - Hiển thị error message từ API

#### 6. **src/pages/Onboarding.tsx**
   - Bật lại sử dụng `useAuthContext` và `useUserProfile`
   - Kiểm tra user từ AuthContext
   - Gọi `createProfile` để lưu profile info
   - Lưu `hasProfile` flag vào localStorage

#### 7. **src/App.tsx**
   - Bật lại AuthProvider wrapper
   - Bật lại kiểm tra authentication flow:
     - Nếu không có token → hiển thị Login/Register
     - Nếu có token nhưng không có profile → hiển thị Onboarding
     - Nếu có token và profile → hiển thị Dashboard
   - Import Login, Register, Onboarding pages
   - Thêm toggle state để chuyển đổi giữa Login/Register

#### 8. **src/components/Sidebar.tsx**
   - Bật lại sử dụng `useAuthContext`
   - Cập nhật logout handler để gọi `logout()` từ context
   - Reload page sau logout để reset auth state

### Flow hoạt động:

```
┌─────────────────────────────────────────────────────┐
│  App loads → Check token in localStorage            │
├─────────────────────────────────────────────────────┤
│  Có token?                                           │
│  ├─ Không → Hiển thị Login/Register page           │
│  └─ Có:                                             │
│      ├─ Có profile? 
│      │  ├─ Không → Hiển thị Onboarding            │
│      │  └─ Có → Hiển thị Dashboard + Sidebar      │
└─────────────────────────────────────────────────────┘

Login/Register Flow:
┌──────────────────────────────────────────────────────┐
│ User nhập email/password                             │
├──────────────────────────────────────────────────────┤
│ POST /auth/login hoặc /auth/register                │
├──────────────────────────────────────────────────────┤
│ API trả về: {token, userId, email}                  │
├──────────────────────────────────────────────────────┤
│ ├─ Lưu token vào localStorage (auth_token)          │
│ ├─ Lưu user info vào localStorage (user)            │
│ └─ Reload page → App kiểm tra token → Redirect      │
└──────────────────────────────────────────────────────┘

Onboarding Flow:
┌──────────────────────────────────────────────────────┐
│ Người dùng điền height, weight, age, gender         │
├──────────────────────────────────────────────────────┤
│ POST /user-profiles (tạo profile)                   │
├──────────────────────────────────────────────────────┤
│ ├─ Lưu hasProfile flag vào localStorage             │
│ └─ Reload page → App redirect tới Dashboard         │
└──────────────────────────────────────────────────────┘
```

### HTTP Client Configuration:
- Base URL: `http://localhost:8080/api` (từ VITE_API_URL)
- Tự động thêm `Authorization: Bearer {token}` header
- Xử lý 401 errors bằng cách clear token và reload page

### Lưu ý quan trọng:
1. Backend API phải trả về response có format:
   ```json
   {
     "token": "jwt_token_string",
     "userId": 123,
     "email": "user@example.com"
   }
   ```

2. File `.env` cần có:
   ```
   VITE_API_URL=http://localhost:8080/api
   ```

3. Các endpoints cần implement:
   - `POST /auth/login` 
   - `POST /auth/register`
   - `GET /user-profiles/{userId}`
   - `POST /user-profiles`

