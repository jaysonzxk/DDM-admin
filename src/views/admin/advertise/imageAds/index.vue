<template>
  <div class="app-container">
    <el-row>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="商户名称" prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入广告名称" clearable size="small"
                      style="width: 240px" @keyup.enter.native="handleQuery"/>
          </el-form-item>
          <el-form-item label="状态" prop="is_active">
            <el-select v-model="queryParams.status" placeholder="商户状态" clearable size="small"
                       style="width: 240px">
              <el-option v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictLabel"
                         :value="dict.dictValue"/>
            </el-select>
          </el-form-item>
          <el-form-item v-if="false" label="创建时间">
            <el-date-picker v-model="dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd"
                            type="daterange" range-separator="-" start-placeholder="开始日期"
                            end-placeholder="结束日期"/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['permission:user:post']" type="primary" plain icon="el-icon-plus"
                       size="mini" @click="handleAdd">开通
            </el-button>
          </el-col>

          <right-toolbar :show-search.sync="showSearch" @queryTable="getList"/>
        </el-row>

        <el-table v-loading="loading" :data="imageAd" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center"/>
          <el-table-column key="name" label="广告名称" align="center" prop="name" :show-overflow-tooltip="true"
                           width="160"/>
          <el-table-column key="context" label="广告内容" align="center" prop="context" :show-overflow-tooltip="true"
                           width="160"/>
          <el-table-column key="file" label="广告图片" align="center" prop="file" :show-overflow-tooltip="true"
                           width="160">
            <template slot-scope="scope">
              <el-image :src="host + scope.row.file" style="width: 100px; height: 100px"></el-image>
            </template>
          </el-table-column>
          <el-table-column key="address" label="商户地址" align="center" prop="address"
                           :show-overflow-tooltip="true" width="160"/>
          <el-table-column key="isExpire" label="是否过期" align="center" prop="isExpire"
                           :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span v-if="scope.row.isExpire === 0" style="color: green;">未到期</span>
              <span v-else style="color: red;">已到期</span>
            </template>
          </el-table-column>
          <el-table-column key="merchant" label="关联商家" align="center" prop="botMenu"
                           :show-overflow-tooltip="true" width="160">
            <template slot-scope="scope">
              <span>{{ scope.row.merchant.name }}</span>
            </template>
          </el-table-column>
          <el-table-column key="isRecommend" label="是否推荐" align="center" prop="isRecommend"
                           :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span v-if="scope.row.isRecommend === 0">不推荐</span>
              <span v-else>推荐</span>
            </template>
          </el-table-column>
          <el-table-column key="isHot" label="是否热门" align="center" prop="isHot" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span v-if="scope.row.isHot === 0">不热门</span>
              <span v-else>热门</span>
            </template>
          </el-table-column>
          <el-table-column key="sort" label="排序" align="center" prop="sort" :show-overflow-tooltip="true"/>
          <el-table-column key="count" label="点击次数" align="center" prop="count"
                           :show-overflow-tooltip="true"/>
          <el-table-column key="status" label="状态" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.status === 1">启用</span>
              <span v-else>禁用</span>
            </template>
          </el-table-column>
          <el-table-column label="到期时间" align="center" prop="expireDatetime" width="100">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.expireDatetime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="更新时间" align="center" prop="update_datetime" width="100">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.update_datetime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="create_datetime" width="100">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.create_datetime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" fixed="right" width="160"
                           class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改
              </el-button>
              <el-button size="mini" type="text" icon="el-icon-edit" @click="handleRenewal(scope.row)">续期
              </el-button>


            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
                    :limit.sync="queryParams.pageSize" @pagination="getList"/>
      </el-col>
    </el-row>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="广告名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入广告名称"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="广告内容" prop="context">
              <el-input v-model="form.context" type="textarea" prefix-icon="el-icon-search"
                        suffix-icon="el-icon-date" placeholder="请输入广告内容" />

<!--                <quill-editor v-bind:options="editorOption" v-model="form.context" style="height: 200px"></quill-editor>-->
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="广告图片" prop="file">
              <el-upload :action="uploadImgUrl" list-type="picture-card" :on-success="handleUploadSuccess"
                         :before-upload="handleBeforeUpload" :on-error="handleUploadError" name="file"
                         :show-file-list="false" :headers="headers"
                         style="display: inline-block; vertical-align: top"
                         v-model="form.file">
                <el-image v-if="!value" :src="value">
                  <div slot="error" class="image-slot">
                    <i class="el-icon-plus"/>
                  </div>
                </el-image>
                <div v-else class="image">
                  <el-image :src="value" :style="`width:360px;height:150px;`" fit="fill"/>
                  <div class="mask">
                    <div class="actions">
                                            <span title="预览" @click.stop="dialogVisible = true">
                                                <i class="el-icon-zoom-in"/>
                                            </span>
                      <span title="移除" @click.stop="removeImage">
                                                <i class="el-icon-delete"/>
                                            </span>
                    </div>
                  </div>
                </div>

              </el-upload>
              <el-dialog :visible.sync="dialogVisible" title="预览" width="800" append-to-body>
                <img :src="value" style="display: block; max-width: 100%; margin: 0 auto;">
              </el-dialog>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="商家地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入商户地址" type="textarea"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="到期时间" prop="expireDatetime">
              <el-date-picker v-model="form.expireDatetime" size="small" style="width: 200px"
                              value-format="yyyy-MM-dd HH:mm:ss" type="datetime" placeholder="到期时间"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="关联商家" prop="merchant">
              <el-select v-model="form.merchant" filterable remote placeholder="请输入关键词"
                         :remote-method="searchQuery" :loading="searchLoading" v-if="this.title==='开通广告'" >
                <el-option v-for="item in merchantsList" :key="item.id" :label="item.value"
                           :value="item.id">
                </el-option>
              </el-select>
              <el-select v-model="form.merchant" filterable remote placeholder="请输入关键词"
                         :remote-method="searchQuery" :loading="searchLoading" v-else :disabled="disabled">
                <el-option v-for="item in merchantsList" :key="item.id" :label="item.value"
                           :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input v-model="form.sort" placeholder="排序" type="number"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="是否推荐" prop="isRecommend">
              <el-radio-group v-model="form.isRecommend">
                <el-radio v-for="dict in recommendOptions" :key="dict.dictValue"
                          :label="dict.dictValue">{{
                    dict.dictLabel
                  }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否热门" prop="isHot">
              <el-radio-group v-model="form.isHot">
                <el-radio v-for="dict in hotsOptions" :key="dict.dictValue" :label="dict.dictValue">{{
                    dict.dictLabel
                  }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictValue">{{
                    dict.dictLabel
                  }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="description">
              <el-input v-model="form.description" type="textarea" placeholder="请输入内容"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="renewalTitle" :visible.sync="renewalOpen" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="到期时间" prop="expireDatetime">
              <el-date-picker v-model="renewalData.expireDatetime" size="small" style="width: 200px"
                              value-format="yyyy-MM-dd HH:mm:ss" type="datetime" placeholder="到期时间"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="renewalForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  imageAds,
  addImageAd,
  getImageAd,
  updateImageAd,
  searchMerchants,
  imageAdRenewal,
  checkExpire
} from "@/api/admin/advertise/imageAd";
import {getToken} from "@/utils/auth";
import {quillEditor} from 'vue-quill-editor';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';


export default {
  name: "ImageAds",
  components: {
    quillEditor
  },
  data() {
    return {
      value: '',
      editorOption: {
        theme: "snow",
        placeholder: "请输入广告内容",

        modules: {

          toolbar: false

        }
      },
      disabled: true,
      renewalOpen: false,
      dialogVisible: false,
      // 上传的图片服务器地址
      uploadImgUrl: process.env.VUE_APP_BASE_API + "/admin/upload",
      // 遮罩层
      loading: true,
      searchLoading: false,
      // 选中的值
      selectedValue: '',
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户表格数据
      imageAd: null,
      // 商家
      merchantsList: [],
      // 弹出层标题
      title: "",
      renewalTitle: "",
      // 是否显示弹出层
      open: false,
      // 默认密码
      initPassword: undefined,
      // 到期时间
      expireDatetime: null,
      // 日期范围
      dateRange: [],
      // 状态数据字典
      statusOptions: [{dictLabel: "启用", dictValue: 1}, {dictLabel: "停用", dictValue: 0}],
      // 热门
      hotsOptions: [{dictLabel: "热门", dictValue: 1}, {dictLabel: "不热门", dictValue: 0}],
      // 推荐
      recommendOptions: [{dictLabel: "推荐", dictValue: 1}, {dictLabel: "不推荐", dictValue: 0}],
      // 性别状态字典
      sexOptions: [],
      // 岗位选项
      postOptions: [],
      // 角色选项
      roleOptions: [],
      // 表单参数
      form: {},
      renewalData: {},
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        status: undefined,
      },
      // 表单校验
      rules: {
        menuName: [
          {required: true, message: "菜单名称不能为空", trigger: "blur"}
        ],

      },
      host: process.env.VUE_APP_BASE_API + '/',
      headers: {
        Authorization: "JWT " + getToken()
      }
    };
  },
  watch: {},
  created() {
    this.getList();
  },
  methods: {
    removeImage() {
      this.value = '';
    },
    handleUploadSuccess(res) {
      this.form.file = res.data.image.split('/').slice(res.data.image.split('/').length - 3, res.data.image.split('/').length).join('/')
      this.value = res.data.image;
      this.loading.close();
    },
    handleBeforeUpload() {
      this.loading = this.$loading({
        lock: true,
        text: "上传中",
        background: "rgba(0, 0, 0, 0.7)"
      });
    },
    handleUploadError() {
      this.$message({
        type: "error",
        message: "上传失败"
      });
      this.loading.close();
    },
    file(data) {
      this.form.file = data;
    },
    checkTimeExpire() {
      checkExpire().then(response => {
        // this.msgSuccess("检验成功");
      })
    },
    searchQuery(query) {
      if (query !== '') {
        this.searchLoading = true;
        // 模拟接口调用，实际应用中应替换为真实的接口地址
        setTimeout(() => {
          // 这里的mockData应该是通过接口请求获取的数据
          searchMerchants(query).then(response => {
            this.merchantsList = response.data;
          })
          this.searchLoading = false;
        }, 200);
      } else {
        this.merchantsList = [];
      }
    },
    // 模糊查询商家
    // getMerchants(params) {

    //     this.loading = true;
    //     setTimeout(() => {
    //         this.loading = false;
    //         this.options = this.merchantsList.filter(item => {
    //             return item.label.toLowerCase()
    //                 .indexOf(params.toLowerCase()) > -1;
    //         });
    //     }, 200);

    // },
    /** 查询列表广告 */
    getList() {
      this.checkTimeExpire();
      this.loading = true;
      imageAds(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
            this.imageAd = response.data.results;
            this.total = response.data.count;
            this.loading = false;
          }
      );
    },

    // 取消按钮
    cancel() {
      this.open = false;
      this.renewalOpen = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        name: undefined,
        status: 1,
        description: undefined,
        sort: undefined,
        isRecommend: 0,
        isHot: 0,
        merchant_id: undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      // this.getMerchants();
      this.open = true;
      this.title = "开通广告";
    },
    // 续费弹窗
    handleRenewal(row) {
      const id = row.id;
      this.renewalData = {
        id: id,
        expireDatetime: this.expireDatetime,
      }
      this.renewalOpen = true;
      this.renewalTitle = '续费';
    },
    renewalForm() {
      imageAdRenewal(this.renewalData).then(response => {
        this.msgSuccess("续费成功");
        this.renewalOpen = false;
        // this.checkTimeExpire();
        this.getList();
      })
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getImageAd(id).then(response => {
        const data = response.data;
        this.form = data;
        this.form.merchant = data.merchant.name;
        this.value = this.host + data.file;
        this.open = true;
        this.title = "修改广告";
      });
    },

    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            delete this.form['merchant'];
            updateImageAd(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.checkTimeExpire();
              this.getList();
            });
          } else {
            addImageAd(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    // /** 删除按钮操作 */
    // handleDelete(row) {
    //     const userIds = row.id || this.ids;
    //     this.$confirm('是否确认删除用户编号为"' + userIds + '"的数据项?', "警告", {
    //         confirmButtonText: "确定",
    //         cancelButtonText: "取消",
    //         type: "warning"
    //     }).then(function () {
    //         return delUser(userIds);
    //     }).then(() => {
    //         this.getList();
    //         this.msgSuccess("删除成功");
    //     });
    // },
  }
};

// 自定义验证规则
function validateNumber(rule, value, callback) {
  if (value === 0 || value === 1) {
    callback(); // 验证通过
  } else {
    callback(new Error('请输入0或1(0代表不推荐,1代表推荐)')); // 验证失败
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-upload--picture-card {
  width: 360px !important;
  height: 150px !important;
}

.image {
  position: relative;

  .mask {
    opacity: 0;
    position: absolute;
    top: 0;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    transition: all 0.3s;
  }

  &:hover .mask {
    opacity: 1;
  }
}

.el-col-20 {
  width: 100% !important;
}
</style>