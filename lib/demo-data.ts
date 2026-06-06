export const demoShop = {
  id: "demo-shop-1",
  name: "天猫旗舰店",
  platform: "TMALL"
};

export const currentShopMetrics = {
  traffic: 256780,
  gmv: 28456000,
  gsv: 24804000,
  orders: 18735,
  conversionRate: 0.0729,
  aov: 1519,
  refundAmount: 3652000,
  refundRate: 0.1283,
  spend: 1384000,
  roi: 4.28
};

export const previousShopMetrics = {
  traffic: 238500,
  gmv: 25120000,
  gsv: 22400000,
  orders: 17620,
  conversionRate: 0.0739,
  aov: 1425,
  refundAmount: 2720000,
  refundRate: 0.1083,
  spend: 1260000,
  roi: 3.86
};

export const trendData = [
  { date: "05-01", gmv: 82, gsv: 72 },
  { date: "05-05", gmv: 96, gsv: 83 },
  { date: "05-10", gmv: 88, gsv: 77 },
  { date: "05-15", gmv: 112, gsv: 96 },
  { date: "05-20", gmv: 128, gsv: 108 },
  { date: "05-25", gmv: 134, gsv: 116 },
  { date: "05-31", gmv: 151, gsv: 132 }
];

export const productMetrics = [
  { productId: "P1001", productName: "高端精华礼盒", traffic: 42800, gmv: 7250000, orders: 3180, refundAmount: 410000, conversionRate: 0.0743 },
  { productId: "P1002", productName: "控油洁面套装", traffic: 38200, gmv: 3860000, orders: 4210, refundAmount: 780000, conversionRate: 0.1102 },
  { productId: "P1003", productName: "补水面膜 30 片", traffic: 31800, gmv: 2260000, orders: 2890, refundAmount: 180000, conversionRate: 0.0909 },
  { productId: "P1004", productName: "明星同款乳液", traffic: 51600, gmv: 3180000, orders: 2010, refundAmount: 690000, conversionRate: 0.0390 },
  { productId: "P1005", productName: "旅行装体验包", traffic: 12600, gmv: 720000, orders: 1620, refundAmount: 42000, conversionRate: 0.1286 }
].map((item) => ({
  ...item,
  gsv: item.gmv - item.refundAmount,
  aov: item.orders ? item.gmv / item.orders : 0,
  refundRate: item.gmv ? item.refundAmount / item.gmv : 0
}));

export const promotionPlans = [
  { planId: "AD01", planName: "品牌词守护", spend: 210000, revenue: 1320000, orders: 860, roi: 6.29, cpc: 1.82, ctr: 0.048 },
  { planId: "AD02", planName: "精华礼盒放量", spend: 390000, revenue: 2380000, orders: 1180, roi: 6.1, cpc: 2.31, ctr: 0.052 },
  { planId: "AD03", planName: "洁面低价转化", spend: 310000, revenue: 830000, orders: 920, roi: 2.68, cpc: 3.12, ctr: 0.031 },
  { planId: "AD04", planName: "会员人群召回", spend: 145000, revenue: 760000, orders: 310, roi: 5.24, cpc: 1.58, ctr: 0.061 }
];
