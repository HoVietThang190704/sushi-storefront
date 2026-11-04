// Cấu hình chung của ứng dụng Storefront Hanbi Sushi
export const SITE_CONFIG = {
  name: "Hanbi Sushi",
  brandSubtitle: "HANBI SIGNATURE SUSHI • 厳選江戸前寿司",
  slogan: "Thưởng Thức Sushi Nhật Bản Chuẩn Vị",
  description:
    "Đặt món sushi trực tuyến mang đi (Take Away) nhanh chóng, tiện lợi và tươi ngon mỗi ngày",
  hotline: "1900 8888",
} as const;

// Cấu hình chuyển khoản thanh toán VietQR
export const PAYMENT_CONFIG = {
  vietqr: {
    bankName: "MB Bank (Ngân hàng Quân Đội)",
    accountHolder: "HANBI SUSHI PLATFORM",
    accountNumber: "0988888888",
    noteTemplate: "HANBI",
  },
} as const;

// Biểu thức regex kiểm tra số điện thoại di động Việt Nam chuẩn (10 chữ số)
export const VIETNAM_PHONE_REGEX = /^(0|\+84)[35789]\d{8}$/;
