export interface Category {
  id: string;
  name: string;
  sortOrder?: number;
  parentId: string | null;
  children?: Category[];
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  sku: string;
  slug?: string | null;
  barcode?: string | null;
  name: string;
  type: "SINGLE" | "COMBO";
  categoryId: string | null;
  sellingPrice: string | number;
  imageUrl?: string | null;
  description?: string | null;
  accompaniments?: string | null;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
  } | null;
  comboItemsAsParent?: Array<{
    quantity: string | number;
    childProduct: Product;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp?: string;
}

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address?: string;
  province?: string;
  district?: string;
  ward?: string;
  note?: string;
  branchId?: string;
  paymentMethod?: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface WardLocationItem {
  district: string;
  ward: string;
  wardCode?: string;
  formerWards?: string;
  isSupported: boolean;
  defaultBranch?: {
    id: string;
    code: string;
    name: string;
    address: string;
  };
  supportedBranches: Array<{
    id: string;
    code: string;
    name: string;
    fee: number;
    isDefault: boolean;
  }>;
}

export interface ShippingCalculationResult {
  district?: string;
  ward: string;
  fee: number;
  branch: {
    id: string;
    code: string;
    name: string;
    address: string;
  };
}

export interface CreatedOrderResponse {
  order: {
    id: string;
    code: string;
    orderCode?: string;
    customerName: string;
    customerPhone: string;
    address?: string;
    district?: string;
    ward?: string;
    shippingFee?: string | number;
    totalAmount: string | number;
    status: string;
    paymentStatus: string;
    paymentMethod?: string;
    paymentQrUrl?: string | null;
    paymentBankInfo?: string | null;
    createdAt: string;
    items?: Array<{
      id: string;
      productName: string;
      quantity: number;
      unitPrice: string | number;
      subtotal: string | number;
    }>;
  };
  trackingToken: string | null;
  isDuplicate?: boolean;
}

export interface TrackOrderResponse {
  id: string;
  code: string;
  orderCode?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  address?: string | null;
  district?: string | null;
  ward?: string | null;
  note?: string | null;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentQrUrl?: string | null;
  paymentBankInfo?: string | null;
  shippingFee?: string | number;
  totalAmount: string | number;
  createdAt: string;
  canCancel?: boolean;
  trackingTicket?: string;
  items?: Array<{
    id: string;
    productName: string;
    unitPrice: string | number;
    quantity: number;
    subtotal: string | number;
  }>;
  statusHistories?: Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    reason?: string | null;
    createdAt: string;
  }>;
}

export interface StorePaymentConfig {
  bankName?: string | null;
  accountNumber?: string | null;
  accountHolder?: string | null;
  qrImageUrl?: string | null;
  transferSyntax?: string | null;
  note?: string | null;
  isActive: boolean;
}

export interface HeroBannerConfigItem {
  id: string;
  imageUrl: string;
  leadTitle?: string;
  highlightTitle?: string;
  description?: string;
  kanjiWatermark?: string;
  isActive?: boolean;
}

export interface CuratedCategoryConfigItem {
  id: string;
  title: string;
  japanese?: string;
  desc?: string;
  imageUrl: string;
  targetCategory?: string;
  isActive?: boolean;
}

export interface CulinaryNewsConfigItem {
  id: string;
  title: string;
  date?: string;
  tag?: string;
  imageUrl: string;
  summary?: string;
  isActive?: boolean;
}

export interface BrandStoryPillarConfig {
  title: string;
  description: string;
}

export interface BrandStoryTileConfig {
  imageUrl: string;
  caption: string;
}

export interface BrandStoryConfig {
  cardBadge?: string;
  cardTitle?: string;
  cardQuote?: string;
  cardSignature?: string;
  cardKanji?: string;
  storyLabel?: string;
  storyHeading?: string;
  storyParagraph1?: string;
  storyParagraph2?: string;
  pillars?: BrandStoryPillarConfig[];
  craftTiles?: BrandStoryTileConfig[];
}

export interface FooterConfig {
  patternPreset?: string;
  customBgImageUrl?: string;
  bgColor?: string;
  overlayOpacity?: number;
  patternOpacity?: number;
  brandDescription?: string;
  openingDays?: string;
  openingHours?: string;
  closingNote?: string;
  addressNote?: string;
  copyrightText?: string;
}

export interface StoreConfig {
  id?: string;
  key?: string;
  customerOrderingEnabled: boolean;
  contactPhone: string;
  heroBanners?: HeroBannerConfigItem[] | null;
  brandStory?: BrandStoryConfig | null;
  curatedCategories?: CuratedCategoryConfigItem[] | null;
  culinaryNews?: CulinaryNewsConfigItem[] | null;
  footerConfig?: FooterConfig | null;
}
