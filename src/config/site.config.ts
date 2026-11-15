// Cấu hình chung của ứng dụng Storefront Hanbi Sushi
export const SITE_CONFIG = {
  name: "Hanbi Sushi",
  brandSubtitle: "HANBI SIGNATURE SUSHI • 厳選江戸前寿司",
  slogan: "Thưởng Thức Sushi Nhật Bản Chuẩn Vị",
  description:
    "Đặt món sushi trực tuyến giao hàng tận nơi nhanh chóng, tiện lợi và tươi ngon mỗi ngày",
  hotline: "1900 6868",
  hotlineTel: "19006868",
} as const;

// Biểu thức regex kiểm tra số điện thoại di động Việt Nam chuẩn (10 chữ số)
export const VIETNAM_PHONE_REGEX = /^(0|\+84)[35789]\d{8}$/;
