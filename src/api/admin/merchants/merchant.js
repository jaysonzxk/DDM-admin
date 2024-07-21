import request from "@/utils/request";
import { praseStrEmpty } from "@/utils/ruoyi";

// 查询商户列表
export function listMerchants(query) {
  return request({
    url: "/admin/merchants/merchant",
    method: "get",
    params: query
  });
}

// 新增商户
export function addMerchants(data) {
  return request({
    url: "/admin/merchants/merchant/add",
    method: "post",
    data: data
  });
}

// 查询详情
export function getMerchants(merchantId) {
  return request({
    url: "/admin/merchants/merchant/details/?merchantId=" + praseStrEmpty(merchantId),
    method: "get"
  });
}

// 修改公告
export function updateMerchants(data) {
  return request({
    url: "/admin/merchants/merchant/update",
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

// 获取所有菜单
export function allBotMenu() {
    return request({
      url: "/admin/telegarm/botMenu/menu/all",
      method: "get"
    });
  }

// 模糊查询商家
export function searchMerchants() {
    return request({
      url: "/admin/merchants/merchant/search",
      method: "get"
    });
  }