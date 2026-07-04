export type OrderItemDetail = {
    id: number;
    variantId: number;
    productName: string;
    options: Array<{ name: string; value: string }>;
    colorName: string;
    size: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
};

export type ShippingAddress = {
    name: string;
    phone: string;
    address: string;
};

export type OrderCustomer = {
    id: number;
    name: string;
    email: string;
};

export type OrderDetail = {
    id: number;
    orderNumber: string;
    status: string;
    totalAmount: number;
    subtotalAmount?: number;
    discountAmount?: number;
    discountCode?: string | null;
    paymentMethod?: string;
    paymentIntentId?: string | null;
    shippingAddress: ShippingAddress;
    createdAt: string | null;
    customer?: OrderCustomer | null;
    items: OrderItemDetail[];
};

export type PaginatedOrders = {
    data: OrderDetail[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        last_page: number;
        total: number;
    };
};
