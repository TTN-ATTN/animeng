# THÔNG TIN CHI TIẾT VỀ WEBSITE ANIMENG

## 1. TỔNG QUAN WEBSITE

### 1.1 Giới thiệu
ANIMENG là một nền tảng học tiếng Anh trực tuyến lấy cảm hứng từ Duolingo, được thiết kế với giao diện anime hấp dẫn. Website cung cấp các khóa học tiếng Anh tương tác, hệ thống điểm thưởng, bảng xếp hạng và nhiều tính năng học tập thú vị khác.

### 1.2 Tính năng chính
- **Hệ thống khóa học**: Các khóa học được tổ chức thành units (đơn vị) và lessons (bài học)
- **Thử thách đa dạng**: Nhiều loại thử thách khác nhau (CHOICE, SPELLING, VOICE, WRITING)
- **Hệ thống tim (hearts)**: Giới hạn số lần làm sai, có thể nạp lại bằng điểm
- **Hệ thống điểm**: Tích lũy điểm khi hoàn thành thử thách
- **Bảng xếp hạng**: Hiển thị người dùng có điểm cao nhất
- **Gói đăng ký premium**: Không giới hạn số tim, trải nghiệm học tập không gián đoạn
- **Thanh toán trực tuyến**: Tích hợp cổng thanh toán MoMo
- **Xác thực người dùng**: Sử dụng Clerk để quản lý đăng nhập, đăng ký

## 2. CẤU TRÚC DỮ LIỆU

### 2.1 Courses (Khóa học)
- **id**: Khóa chính
- **title**: Tên khóa học
- **imageSrc**: Đường dẫn hình ảnh khóa học

### 2.2 Units (Đơn vị học tập)
- **id**: Khóa chính
- **title**: Tên đơn vị
- **description**: Mô tả đơn vị
- **courseId**: Khóa ngoại tham chiếu đến khóa học
- **order**: Thứ tự của đơn vị trong khóa học

### 2.3 Lessons (Bài học)
- **id**: Khóa chính
- **title**: Tên bài học
- **description**: Mô tả bài học
- **unitId**: Khóa ngoại tham chiếu đến đơn vị
- **order**: Thứ tự của bài học trong đơn vị

### 2.4 Challenges (Thử thách)
- **id**: Khóa chính
- **lessonId**: Khóa ngoại tham chiếu đến bài học
- **type**: Loại thử thách (CHOICE, SPELLING, VOICE, WRITING)
- **question**: Câu hỏi của thử thách
- **order**: Thứ tự của thử thách trong bài học

### 2.5 Challenge Options (Tùy chọn cho thử thách)
- **id**: Khóa chính
- **challengeId**: Khóa ngoại tham chiếu đến thử thách
- **text**: Nội dung tùy chọn
- **correct**: Đánh dấu tùy chọn đúng
- **imageSrc**: Đường dẫn hình ảnh (nếu có)
- **audioSrc**: Đường dẫn âm thanh (nếu có)

### 2.6 User Progress (Tiến trình người dùng)
- **userId**: Khóa chính, ID người dùng từ Clerk
- **userName**: Tên người dùng
- **userImageSrc**: Đường dẫn hình ảnh người dùng
- **activeCourseId**: Khóa học đang học
- **hearts**: Số tim còn lại (mặc định: 5)
- **points**: Điểm tích lũy (mặc định: 0)

### 2.7 Challenge Progress (Tiến trình thử thách)
- **id**: Khóa chính
- **userId**: ID người dùng
- **challengeId**: ID thử thách
- **completed**: Trạng thái hoàn thành

### 2.8 User Subscription (Đăng ký premium)
- **id**: Khóa chính
- **userId**: ID người dùng
- **momoCustomerId**: ID khách hàng MoMo
- **momoSubscriptionId**: ID đăng ký MoMo
- **momoPriceId**: ID giá MoMo
- **momoCurrentPeriodEnd**: Thời gian kết thúc gói đăng ký

## 3. ROUTES VÀ ENDPOINTS

### 3.1 Trang chính
- **/** - Trang chủ
- **/courses** - Danh sách khóa học
- **/learning** - Trang học chính
- **/lesson/{lessonId}** - Trang bài học cụ thể
- **/shop** - Cửa hàng (mua tim, đăng ký premium)
- **/quests** - Nhiệm vụ và thử thách
- **/leaderboard** - Bảng xếp hạng người dùng

### 3.2 Server Actions (API)
- **upsertUserProgress(courseId)** - Cập nhật/tạo tiến trình người dùng
- **upsertChallengeProgess(challengeId)** - Cập nhật tiến trình thử thách
- **reduceHearts(challengeId)** - Giảm số tim khi làm sai
- **refillHearts()** - Nạp lại tim bằng điểm
- **createMomoUrl()** - Tạo URL thanh toán MoMo

### 3.3 Truy vấn dữ liệu
- **getCourses()** - Lấy danh sách khóa học
- **getUserProgress()** - Lấy tiến trình người dùng
- **getCourseById(courseId)** - Lấy thông tin khóa học theo ID
- **getUnits()** - Lấy danh sách đơn vị học tập
- **getCourseProgress()** - Lấy tiến trình khóa học
- **getLesson(id)** - Lấy thông tin bài học
- **getLessonPercent()** - Lấy phần trăm hoàn thành bài học
- **getUserSubscription()** - Lấy thông tin đăng ký premium
- **getTopUsers()** - Lấy danh sách người dùng điểm cao nhất

## 4. LUỒNG NGƯỜI DÙNG

### 4.1 Đăng ký và đăng nhập
1. Người dùng đăng ký/đăng nhập thông qua Clerk
2. Hệ thống tạo hồ sơ người dùng trong cơ sở dữ liệu
3. Người dùng được chuyển đến trang chọn khóa học

### 4.2 Chọn khóa học
1. Người dùng xem danh sách khóa học
2. Chọn khóa học muốn học
3. Hệ thống cập nhật activeCourseId trong userProgress
4. Chuyển hướng đến trang học

### 4.3 Học bài
1. Người dùng xem danh sách đơn vị và bài học
2. Chọn bài học để bắt đầu
3. Làm các thử thách trong bài học
4. Mỗi thử thách hoàn thành được cộng 10 điểm
5. Làm sai sẽ mất 1 tim
6. Khi hoàn thành tất cả thử thách, bài học được đánh dấu hoàn thành

### 4.4 Nạp tim
1. Khi hết tim, người dùng có thể:
   - Đợi tim tự động nạp lại theo thời gian
   - Dùng điểm để nạp lại tim (refillHearts)
   - Đăng ký gói premium để có tim không giới hạn

### 4.5 Đăng ký premium
1. Người dùng truy cập trang shop
2. Chọn gói đăng ký premium
3. Hệ thống tạo URL thanh toán MoMo
4. Người dùng hoàn tất thanh toán
5. Hệ thống cập nhật trạng thái đăng ký trong userSubscription

### 4.6 Bảng xếp hạng
1. Người dùng truy cập trang leaderboard
2. Hệ thống hiển thị top 50 người dùng có điểm cao nhất
3. Người dùng có thể xem thứ hạng của mình

## 5. TÍCH HỢP THANH TOÁN

### 5.1 MoMo
- Sử dụng API MoMo để tạo URL thanh toán
- Xử lý webhook từ MoMo để cập nhật trạng thái đăng ký
- Lưu trữ thông tin đăng ký trong bảng userSubscription

## 6. XÁC THỰC VÀ BẢO MẬT

### 6.1 Clerk
- Quản lý đăng ký, đăng nhập người dùng
- Cung cấp userId cho hệ thống
- Bảo vệ các route yêu cầu xác thực

### 6.2 Server Actions
- Kiểm tra xác thực người dùng trước khi thực hiện hành động
- Sử dụng auth() từ Clerk để xác minh userId
- Ném lỗi "Unauthorized" nếu không có quyền truy cập

## 7. CÔNG NGHỆ SỬ DỤNG

### 7.1 Frontend
- Next.js (App Router)
- React
- Clerk cho xác thực
- Drizzle ORM cho truy vấn dữ liệu

### 7.2 Backend
- Next.js Server Actions
- PostgreSQL (thông qua Drizzle ORM)
- Clerk cho xác thực
- MoMo cho thanh toán

### 7.3 Cơ sở dữ liệu
- PostgreSQL
- Drizzle ORM cho định nghĩa schema và truy vấn
