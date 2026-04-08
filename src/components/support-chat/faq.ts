export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "what-is-this",
    question: "Intern Community Hub là gì?",
    answer:
      "Đây là nền tảng để browse/submit/upvote các mini-app modules. Submission sẽ được admin review và có trạng thái PENDING/APPROVED/REJECTED.",
    keywords: ["intern", "community", "hub", "là gì", "what", "platform"],
  },
  {
    id: "sign-in",
    question: "Làm sao để đăng nhập?",
    answer:
      'Bạn bấm "Sign in with GitHub" trên thanh điều hướng. Nếu gặp lỗi OAuth, kiểm tra biến môi trường AUTH_GITHUB_ID/AUTH_GITHUB_SECRET và callback URL.',
    keywords: ["login", "sign in", "github", "oauth", "đăng nhập"],
  },
  {
    id: "submit-module",
    question: "Làm sao để submit module?",
    answer:
      'Sau khi đăng nhập, vào "Submit Module" và điền thông tin (name, description, repo/demo URL, category). Sau khi submit, bạn có thể theo dõi trong "My Submissions".',
    keywords: ["submit", "module", "gửi", "nộp", "submission"],
  },
  {
    id: "my-submissions",
    question: 'Xem trạng thái bài nộp ở đâu?',
    answer:
      'Bạn vào "My Submissions" để xem danh sách và trạng thái. Admin sẽ approve/reject, bạn chỉ cần refresh để thấy cập nhật mới nhất.',
    keywords: ["my submissions", "status", "trạng thái", "pending", "approved", "rejected"],
  },
  {
    id: "vote",
    question: "Upvote hoạt động như thế nào?",
    answer:
      "Bạn cần đăng nhập để upvote. Số vote hiển thị trên từng module và có thể toggle (vote/unvote).",
    keywords: ["vote", "upvote", "toggle", "like", "bình chọn"],
  },
  {
    id: "review-time",
    question: "Bao lâu thì module được duyệt?",
    answer:
      "Thời gian review phụ thuộc maintainer/admin. Bạn có thể bổ sung thông tin rõ ràng (README, demo link, mô tả) để review nhanh hơn.",
    keywords: ["review", "duyệt", "bao lâu", "time", "approval"],
  },
  {
    id: "common-errors",
    question: "Hay gặp lỗi gì khi chạy local?",
    answer:
      "Các lỗi phổ biến: Node chưa đủ version (Prisma yêu cầu 20.19+), chưa chạy DB bằng Docker, DATABASE_URL không khớp, hoặc chưa chạy prisma generate.",
    keywords: ["error", "local", "run", "docker", "database_url", "prisma", "generate"],
  },
  {
    id: "need-more-help",
    question: "Mình cần hỗ trợ thêm thì làm sao?",
    answer:
      "Bạn có thể tạo issue trên GitHub repo hoặc mô tả lỗi kèm steps reproduce, log, và ảnh chụp màn hình để được hỗ trợ nhanh hơn.",
    keywords: ["help", "support", "issue", "github", "bug", "hỗ trợ"],
  },
];

