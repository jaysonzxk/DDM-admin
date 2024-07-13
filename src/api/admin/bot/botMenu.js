import request from "@/utils/request";
import { praseStrEmpty } from "@/utils/ruoyi";

// 查询机器人配置
export function listBotMenu(query) {
  return request({
    url: "/admin/telegarm/botMenu",
    method: "get",
    params: query
  });
}

// 新增机器人菜单
export function addBanners(data) {
  return request({
    url: "/admin/telegarm/botMenu/menu/add",
    method: "post",
    data: data
  });
}

// 查询详情
export function getBotMenu(botMenuId) {
  return request({
    url: "/admin/telegarm/botMenu/menu/details/?botMenuId=" + praseStrEmpty(botMenuId),
    method: "get"
  });
}

// 修改公告
export function updateBotMenu(data) {
  return request({
    url: "/admin/telegarm/botMenu/menu/update",
    method: "post",
    data: data
  });
}

// 删除公告
export function delBanners(data) {
  return request({
    url: "/admin/system/banners/del",
    method: "post",
    data: data
  });
}


