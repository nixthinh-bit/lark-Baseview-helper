# Mẫu mô tả yêu cầu view

> Điền bằng lời thường, phần nào biết thì điền — không cần biết React hay Base SDK. File này được
> tối ưu để **Claude đọc trực tiếp** (tiêu đề + bảng có cấu trúc giúp AI đọc nhanh và chính xác hơn
> một đoạn văn tự do), nên bạn điền càng nhiều trước khi bắt đầu, Phase 1 càng ít phải hỏi lại. Chỗ
> nào chưa rõ thì để trống hoặc ghi "chưa chắc" — skill sẽ hỏi thêm.
>
> **Một tấm hình cũng đáng giá ngàn lời ở đây.** Nếu bạn có ảnh chụp màn hình, bản mockup (Figma,
> PowerPoint, thậm chí ảnh chụp bản vẽ tay), hoặc link tới một view tương tự ai đó đã làm, hãy đính
> kèm hoặc dán link/ảnh đó vào Phần D. Đây là cách nhanh nhất để truyền đạt bố cục — còn bảng ở Phần
> C mới là thứ chốt chính xác *cột Base nào* nuôi *phần UI nào* và chuyện gì xảy ra khi Save, việc mà
> một tấm ảnh không nói hết được.

---

## Phần A — Base mẫu
- **Link chia sẻ hoặc `app_token`:** …
  (VD `https://<tenant>.larkoffice.com/share/base/view/shr...` hoặc link chuẩn
  `.../base/<app_token>?table=<table_id>&view=<view_id>`)
- **Tên bảng / `table_id` (nếu biết):** …
- **Tenant:** Lark (larksuite.com / larkoffice.com) hay Feishu (feishu.cn)? — …

## Phần B — Custom app
- **Bạn đã có sẵn custom app với capability "Base Extension → Data Table View" chưa?**
  - Có → **App ID:** … **BlockTypeID:** …
  - Chưa → không sao, skill sẽ hướng dẫn tạo trong Developer Console (Phase 3).
- **Bạn có quyền truy cập Developer Console trên tenant này không** (để tạo/quản lý app)? có / không / chưa chắc

## Phần C — Kế hoạch trường dữ liệu ← phần quan trọng nhất
Liệt kê mọi dữ liệu view sẽ động tới. Mỗi dòng một trường. Bảng này chuyển thẳng thành map `FIELDS`,
nên tên cột Base phải chính xác.

| Tên cột Base (chính xác) | Vai trò | Ghi chú (công thức nếu là Estimated, tuỳ chọn nếu là Select…) |
|---------------------------|---------|------------------------------------------------------------------|
| VD `account_name` | Displayed | định danh chính, hiện ở danh sách bên trái |
| VD `license` | Editable | số |
| VD `price` | Editable | số |
| VD `ARR` | Estimated | `license × price × 12`, không ghi lại — công thức Base tự tính lại sau khi Save |
| VD `Fixed price` | Fixed | hiện như tham chiếu chỉ đọc |
| VD `Status` | Editable | Trường Select — dùng lại option có sẵn trong Base |
| … | … | … |

**Giải thích vai trò** (chọn đúng 1 cho mỗi dòng):
- **Displayed** — đọc từ một cột, hiện nguyên vẹn, không bao giờ ghi lại.
- **Editable** — người dùng sửa trên UI; ghi lại khi Save.
- **Estimated** — tính ngay trên client từ các trường khác để phản hồi tức thì; KHÔNG ghi lại (trường
  formula của Base tự tính giá trị thật sau khi Save). Ghi rõ công thức.
- **Fixed** — hằng số, hoặc một cột Base luôn hiện như tham chiếu cố định (không sửa).

## Phần D — Bố cục & giao diện
- **Định danh chính mỗi dòng** (thứ người dùng chọn, VD tên khách hàng / số đơn): …
- **Panel danh sách/bên trái:** hiện gì, lọc bằng gì (ô tìm kiếm? chip theo tháng/trạng thái?
  dropdown?) — …
- **Panel chi tiết/bên phải:** nhóm thứ tự ra sao (VD "so sánh 2025 với 2026 cạnh nhau, rồi tới lý do
  + trạng thái có thể sửa, rồi Save") — …
- **Cảnh báo bạn muốn có** (gợi ý không chặn, VD "báo nếu giá trị giảm mà lý do bỏ trống", "báo nếu
  giá trị âm") — …
- **Ảnh tham chiếu / mockup / view tương tự đã thấy** (đính ảnh chụp màn hình, dán link Figma/ảnh,
  hoặc nêu tên một view bạn thích, VD "giống view renewal-updater nhưng cho X"): …

---

### Không muốn điền form này?
Không sao — chỉ cần mô tả trong một hai câu, hoặc dán ảnh một công cụ tương tự, skill sẽ hỏi các câu
Phase 1 theo kiểu trò chuyện. File này chỉ giúp cuộc trò chuyện đó nhanh hơn khi bạn đã biết sẵn câu
trả lời.
