import request from "@/utils/request";
import { praseStrEmpty } from "@/utils/ruoyi";

// token 列表
export function listToken(query) {
  return request({
    url: "/admin/telegarm/token",
    method: "get",
    params: query
  });
}

// 新增token
export function addToken(data) {
  return request({
    url: "/admin/telegarm/token/token/add",
    method: "post",
    data: data
  });
}

// 查询详情
export function getToken(tokenId) {
  return request({
    url: "/admin/telegarm/token/token/details/?tokenId=" + praseStrEmpty(tokenId),
    method: "get"
  });
}

// 修改token
export function updateToken(data) {
  return request({
    url: "/admin/telegarm/token/token/update",
    method: "post",
    data: data
  });
}


