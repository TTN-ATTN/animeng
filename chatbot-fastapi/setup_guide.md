# Chatbot

## Giới thiệu

Tài liệu này hướng dẫn cách cài đặt và sử dụng chatbot AI được tích hợp khả năng Retrieval-Augmented Generation (RAG). Chatbot này có thể trả lời các câu hỏi chung về học tiếng Anh và các câu hỏi cụ thể về nội dung trang web. 

## Tính năng chính

*   **Trợ lý học tiếng Anh**: Giải thích ngữ pháp, cung cấp ví dụ.
*   **Hỏi đáp về trang web (RAG)**: Trả lời câu hỏi dựa trên nội dung mã nguồn trang web của bạn.
*   **Đa ngôn ngữ**: Tự động phát hiện và trả lời bằng tiếng Anh hoặc tiếng Việt.
*   **Phản hồi đơn giản hóa**: Cung cấp phiên bản dễ hiểu hơn của câu trả lời.
*   **Hỗ trợ Markdown**: Hiển thị định dạng Markdown trong tin nhắn.
*   **Ngăn chặn Hallucination**: Giảm thiểu việc mô hình tự tạo hội thoại không liên quan.
*   **Tùy chỉnh Cache**: Hỗ trợ lưu trữ mô hình trên ổ đĩa ngoài (ví dụ: ổ E:) để tiết kiệm dung lượng ổ C:.

## 1. Yêu cầu

*   Python 3.9 trở lên
*   `pip` (trình quản lý gói Python)
*   (Khuyến nghị) Ổ đĩa ngoài (ví dụ: ổ E:) nếu bạn muốn sử dụng tính năng cache tùy chỉnh.

## 2. Cài đặt

```bash
pip install -r requirements.txt
```


## 3. Chạy Chatbot Server

```
python app/rag_utils.py [--rebuild]
python app/main.py
```

Server sẽ khởi động và bắt đầu tải mô hình LLM (Gemma) và RAG retriever.

*Lưu ý:* Việc tải mô hình LLM lần đầu tiên có thể mất **vài phút đến rất lâu** tùy thuộc vào tốc độ mạng và cấu hình máy tính (CPU sẽ chậm hơn đáng kể so với GPU). Server sẽ báo lỗi `503 Model is still loading` nếu bạn cố gắng gọi API chat trước khi mô hình sẵn sàng.

Kiểm tra trạng thái server bằng cách truy cập `http://localhost:8000/api/health`.

## 4. Sử dụng Chatbot

### API Endpoint

*   **POST** `/api/chat`
    *   **Request Body:**
        ```json
        {
          "message": "Câu hỏi của bạn ở đây",
        }
        ```
    *   **Response Body:**
        ```json
        {
          "response": "Câu trả lời đầy đủ của chatbot (hỗ trợ Markdown)",
          "mood": "trạng thái cảm xúc (ví dụ: default, happy)",
          "retrieved_context": [
            {"source": "đường dẫn file nguồn", "content_preview": "xem trước nội dung được truy xuất..."}
          ]
        }
        ```
*   **GET** `/api/health`: Kiểm tra trạng thái server, mô hình và RAG.


### Tích hợp Frontend

Frontend đã được thiết kế để hoạt động với API này. Đảm bảo frontend gọi đúng endpoint (mặc định là `http://localhost:8000/api/chat`).





## 5. Cài đặt và Chạy bằng Docker (Khuyến nghị)

Sử dụng Docker và Docker Compose là cách được khuyến nghị để chạy ứng dụng này, vì nó giúp quản lý môi trường và dependencies dễ dàng hơn.

### 5.1. Yêu cầu Docker

*   **Docker:** Cài đặt Docker Engine. ([Hướng dẫn cài đặt Docker](https://docs.docker.com/engine/install/))
*   **Docker Compose:** Cài đặt Docker Compose (thường đi kèm với Docker Desktop). ([Hướng dẫn cài đặt Docker Compose](https://docs.docker.com/compose/install/))

### 5.2. Cấu hình Môi trường

1.  **Tạo file môi trường:** Trong thư mục gốc của dự án (cùng cấp với `docker-compose.yaml`), tạo một file tên là `chatbot.env` (Lưu ý: file này khác với `.chatbot.env` được đề cập trong phần cài đặt thủ công).
2.  **Thêm Hugging Face Token:** Mở file `chatbot.env` và thêm token của bạn:
    ```env
    HUGGINGFACE_TOKEN=hf_YOUR_TOKEN_HERE
    ```
    Thay `hf_YOUR_TOKEN_HERE` bằng token Hugging Face thực tế của bạn. Docker Compose sẽ tự động nạp biến môi trường này vào container khi bạn chạy `docker-compose up`.

### 5.3. Build và Chạy Container

1.  **Mở Terminal:** Mở terminal hoặc command prompt trong thư mục gốc của dự án.
2.  **Build Docker Image:** Chạy lệnh sau để build image dựa trên `Dockerfile`:
    ```bash
    docker-compose build
    ```
3.  **Chạy Container:** Chạy lệnh sau để khởi động container ở chế độ nền (detached mode):
    ```bash
    docker-compose up -d
    ```
    *   Nếu bạn muốn xem logs trực tiếp trong terminal, bỏ cờ `-d`: `docker-compose up`
    *   Server sẽ khởi động bên trong container. Việc tải mô hình lần đầu có thể mất thời gian.

### 5.4. Quản lý Container

*   **Kiểm tra Logs:** Xem logs của container đang chạy:
    ```bash
    docker-compose logs -f
    ```
*   **Kiểm tra Trạng thái (Healthcheck):** Docker Compose đã cấu hình healthcheck. Bạn có thể kiểm tra trạng thái các dịch vụ:
    ```bash
    docker-compose ps
    ```
    Trạng thái `healthy` cho biết ứng dụng đã khởi động và vượt qua kiểm tra sức khỏe cơ bản.
*   **Dừng Container:** Dừng và xóa container:
    ```bash
    docker-compose down
    ```
    *(Lệnh này sẽ dừng và xóa container, nhưng dữ liệu trong volumes (documents, faiss, model_cache) sẽ được giữ lại trên máy host của bạn trong các thư mục tương ứng.)*

### 5.5. Giải thích Volumes

`docker-compose.yaml` cấu hình các volumes để lưu trữ dữ liệu persistent bên ngoài container, giúp dữ liệu không bị mất khi container khởi động lại:

*   `./documents:/documents`: Ánh xạ thư mục `documents` cục bộ (trên máy host của bạn) vào thư mục `/documents` bên trong container. Mã nguồn Python cần đọc tài liệu từ `/documents` khi chạy trong container.
*   `./app/faiss:/app/faiss`: Ánh xạ thư mục `app/faiss` cục bộ vào `/app/faiss` trong container. Đây là nơi vector store FAISS sẽ được lưu trữ. Mã nguồn Python cần đọc/ghi vector store tại `/app/faiss` khi chạy trong container.
*   `./model_cache:/root/.cache/huggingface`: Ánh xạ thư mục `model_cache` cục bộ vào thư mục cache của Hugging Face (`/root/.cache/huggingface`, theo cấu hình trong `Dockerfile`) bên trong container. Điều này giúp lưu trữ các mô hình đã tải xuống, tránh việc phải tải lại mỗi lần container khởi động.

**Quan trọng:** Đảm bảo các đường dẫn được sử dụng trong mã nguồn Python (ví dụ: trong `rag_utils.py` cho `SOURCE_DIRECTORY` và `VECTOR_STORE_PATH`) khớp với các đường dẫn **đích** (phần sau dấu hai chấm `:`) được ánh xạ trong `docker-compose.yaml`. Dựa trên `docker-compose.yaml` hiện tại, các đường dẫn trong Python nên là:
*   `SOURCE_DIRECTORY = "/documents"`
*   `VECTOR_STORE_PATH = "/app/faiss"`
Nếu các đường dẫn này trong file `rag_utils.py` của bạn khác, bạn cần cập nhật chúng để phù hợp với cấu hình Docker Compose.

Sau khi chạy ứng dụng bằng Docker, bạn có thể truy cập API và kiểm tra trạng thái tương tự như cách chạy thủ công (ví dụ: `http://localhost:8000/api/health`).

