```
GET /api/coupons
- Headers: Authorization: Bearer {token}
- Query params: status (all/used/unused), page, limit
- Response: { coupons: CouponObject[], total: number, page: number, totalPages: number }

POST /api/coupons
- Headers: Authorization: Bearer {token}
- Request: { code: string, days: number }
- Response: { coupon: CouponObject }

POST /api/coupons/bulk
- Headers: Authorization: Bearer {token}
- Request: { coupons: Array<{ code: string, days: number }> }
- Response: { coupons: CouponObject[], count: number }

POST /api/coupons/generate
- Headers: Authorization: Bearer {token}
- Request: { quantity: number, days: number }
- Response: { coupons: CouponObject[], count: number }

PUT /api/coupons/:id/status
- Headers: Authorization: Bearer {token}
- Request: { used: boolean, usedBy?: string }
- Response: { coupon: CouponObject }

POST /api/coupons/import
- Headers: Authorization: Bearer {token}
- Request: FormData with CSV file
- Response: { coupons: CouponObject[], count: number, errors?: Array<{ line: number, message: string }> }
```
```
GET /api/transactions
- Headers: Authorization: Bearer {token}
- Query params: startDate, endDate, page, limit
- Response: { transactions: TransactionObject[], total: number, page: number, totalPages: number }

POST /api/transactions
- Headers: Authorization: Bearer {token}
- Request: { studentName: string, couponCode: string }
- Response: { transaction: TransactionObject }

GET /api/analytics/revenue
- Headers: Authorization: Bearer {token}
- Query params: period (today/month/year/all)
- Response: { amount: number, count: number, periodStart: string, periodEnd: string }

GET /api/analytics/summary
- Headers: Authorization: Bearer {token}
- Response: { 
    todayRevenue: number, 
    monthlyRevenue: number, 
    totalRevenue: number,
    activeCoupons: number,
    usedCoupons: number
  }

  GET /api/analytics/revenue
- Headers: Authorization: Bearer {token}
- Query params: period (today/month/year/all)
- Response: { amount: number, count: number, periodStart: string, periodEnd: string }

GET /api/analytics/summary
- Headers: Authorization: Bearer {token}
- Response: { 
    todayRevenue: number, 
    monthlyRevenue: number, 
    totalRevenue: number,
    activeCoupons: number,
    usedCoupons: number
  }
```