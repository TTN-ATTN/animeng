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


### Bước 3: Thiết lập Hugging Face Token

Một số mô hình (như Gemma) có thể yêu cầu đăng nhập vào Hugging Face. Nếu bạn có tài khoản Hugging Face, bạn có thể tạo một token truy cập (read access là đủ) tại [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).

Tạo một file tên là `.env` trong thư mục `backend` và thêm token của bạn:

```
HUGGINGFACE_TOKEN=hf_YOUR_TOKEN_HERE
```

Thay `hf_YOUR_TOKEN_HERE` bằng token thực tế của bạn.

## 3. Chạy Chatbot Server

```
python app/rag_utils.py [--rebuild]
python app/main.py
```

Server sẽ khởi động và bắt đầu tải mô hình LLM (PhoGPT hoặc Gemma) và RAG retriever.

*Lưu ý:* Việc tải mô hình LLM lần đầu tiên có thể mất **vài phút đến rất lâu** (đặc biệt là PhoGPT 7B) tùy thuộc vào tốc độ mạng và cấu hình máy tính (CPU sẽ chậm hơn đáng kể so với GPU). Server sẽ báo lỗi `503 Model is still loading` nếu bạn cố gắng gọi API chat trước khi mô hình sẵn sàng.

Kiểm tra trạng thái server bằng cách truy cập `http://localhost:8000/api/health` trong trình duyệt hoặc dùng `curl`. Bạn sẽ thấy trạng thái tải mô hình (`model_loaded`) và RAG (`rag_ready`).

## 4. Sử dụng Chatbot

### API Endpoint

*   **POST** `/api/chat`
    *   **Request Body:**
        ```json
        {
          "message": "Câu hỏi của bạn ở đây",
          "conversation_id": "(tùy chọn) ID cuộc hội thoại trước đó",
          "conversation_history": [
            {"role": "user", "content": "Tin nhắn trước của người dùng"},
            {"role": "assistant", "content": "Phản hồi trước của trợ lý"}
          ] // (tùy chọn)
        }
        ```
    *   **Response Body:**
        ```json
        {
          "response": "Câu trả lời đầy đủ của chatbot (hỗ trợ Markdown)",
          "conversation_id": "ID cuộc hội thoại hiện tại",
          "mood": "trạng thái cảm xúc (ví dụ: default, happy)",
          "simplified_response": "(tùy chọn) Phiên bản đơn giản hóa của câu trả lời",
          "retrieved_context": [
            {"source": "đường dẫn file nguồn", "content_preview": "xem trước nội dung được truy xuất..."}
          ] // (tùy chọn, thông tin gỡ lỗi RAG)
        }
        ```
*   **GET** `/api/health`: Kiểm tra trạng thái server, mô hình và RAG.
*   **GET** `/api/conversations/{conversation_id}`: Lấy lịch sử của một cuộc hội thoại.
*   **DELETE** `/api/conversations/{conversation_id}`: Xóa một cuộc hội thoại.

### Tích hợp Frontend

Frontend đã được thiết kế để hoạt động với API này. Đảm bảo frontend gọi đúng endpoint (mặc định là `http://localhost:8000/api/chat`).


