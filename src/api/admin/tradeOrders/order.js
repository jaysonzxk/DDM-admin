import request from "@/utils/request";
import { praseStrEmpty } from "@/utils/ruoyi";

// 查询订单列表
export function listOrder(query) {
  return request({
    url: "/admin/tradeOrders/orders",
    method: "get",
    params: query
  });
}

// 录入订单
export function addOrder(data) {
  return request({
    url: "/admin/tradeOrders/orders/add",
    method: "post",
    data: data
  });
}

// 查询详情
export function getOrder(orderNumber) {
  return request({
    url: "/admin/tradeOrders/orders/details/?orderNumber=" + praseStrEmpty(orderNumber),
    method: "get"
  });
}

// 修改订单
export function updateOrder(data) {
  return request({
    url: "/admin/tradeOrders/orders/update",
    method: "post",
    data: data
  });
}

// 删除公告
// export function delBanners(data) {
//   return request({
//     url: "/admin/system/banners/del",
//     method: "post",
//     data: data
//   });
// }

// 获取所以图片广告
export function allImageAd() {
    return request({
      url: "/admin/advertise/imageAd/image/all",
      method: "get"
    });
  }

  // 获取所以列表广告
export function allListAd() {
    return request({
      url: "/admin/advertise/listAd/list/all",
      method: "get"
    });
  }