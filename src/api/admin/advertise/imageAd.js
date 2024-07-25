import request from "@/utils/request";
import {praseStrEmpty} from "@/utils/ruoyi";

// 查询列表广告
export function imageAds(query) {
    return request({
        url: "/admin/advertise/imageAd",
        method: "get",
        params: query
    });
}

// 新增列表广告
export function addImageAd(data) {
    return request({
        url: "/admin/advertise/imageAd/image/add",
        method: "post",
        data: data
    });
}

// 查询详情
export function getImageAd(imageAdId) {
    return request({
        url: "/admin/advertise/imageAd/image/details/?imageAdId=" + praseStrEmpty(imageAdId),
        method: "get"
    });
}

// 修改公告
export function updateImageAd(data) {
    return request({
        url: "/admin/advertise/imageAd/image/update",
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
export function searchMerchants(params) {
    return request({
        url: "/admin/merchants/merchant/search?params=" + praseStrEmpty(params),
        method: "get"
    });
}

// 续费
export function imageAdRenewal(data) {
    return request({
        url: "/admin/advertise/imageAd/image/renewal",
        method: "post",
        data: data
    });
}

// 检查是否到期
export function checkExpire() {
    return request({
        url: "/admin/advertise/imageAd/image/check",
        method: "post"
    });
}