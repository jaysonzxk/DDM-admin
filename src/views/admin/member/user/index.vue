<template>
    <div class="app-container">
        <el-row>
            <!--用户数据-->
            <el-col :span="20" :xs="24">
                <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
                    <el-form-item label="用户名称" prop="username">
                        <el-input v-model="queryParams.username" placeholder="请输入用户名称" clearable size="small"
                            style="width: 240px" @keyup.enter.native="handleQuery" />
                    </el-form-item>
                    <el-form-item label="手机号码" prop="mobile">
                        <el-input v-model="queryParams.mobile" placeholder="请输入手机号码" clearable size="small"
                            style="width: 240px" @keyup.enter.native="handleQuery" />
                    </el-form-item>
                    <el-form-item label="状态" prop="is_active">
                        <el-select v-model="queryParams.is_active" placeholder="用户状态" clearable size="small"
                            style="width: 240px">
                            <el-option v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictLabel"
                                :value="dict.dictValue" />
                        </el-select>
                    </el-form-item>
                    <el-form-item v-if="false" label="创建时间">
                        <el-date-picker v-model="dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd"
                            type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
                    </el-form-item>
                </el-form>

                <el-row :gutter="10" class="mb8">
                    <el-col :span="1.5">
                        <el-button v-hasPermi="['permission:user:post']" type="primary" plain icon="el-icon-plus"
                            size="mini" @click="handleAdd">新增
                        </el-button>
                    </el-col>
                    <el-col :span="1.5">
                        <el-button v-hasPermi="['permission:user:{id}:put']" type="success" plain icon="el-icon-edit"
                            size="mini" :disabled="single" @click="handleUpdate">修改
                        </el-button>
                    </el-col>
                    <el-col :span="1.5">
                        <el-button v-hasPermi="['permission:user:{id}:delete']" type="danger" plain
                            icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete">删除
                        </el-button>
                    </el-col>
                    <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
                </el-row>

                <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="50" align="center" />
                    <el-table-column key="id" label="用户编号" align="center" prop="id" />
                    <el-table-column key="username" label="用户名" align="center" prop="username"
                        :show-overflow-tooltip="true" />
                    <el-table-column key="userUrl" label="用户链接" align="center" prop="username"
                        :show-overflow-tooltip="true" />
                    <el-table-column key="name" label="用户昵称" align="center" prop="name" :show-overflow-tooltip="true" />
                    <el-table-column key="inviteCode" label="邀请码" align="center" prop="inviteCode"
                        :show-overflow-tooltip="true" />
                    <el-table-column key="parent" label="上级" align="center" prop="parent"
                        :show-overflow-tooltip="true" />
                    <el-table-column key="mobile" label="手机号码" align="center" prop="mobile" width="120" />
                    <el-table-column key="is_active" label="状态" align="center">
                        <template slot-scope="scope">
                            <el-switch v-model="scope.row.is_active" disabled @change="handleStatusChange(scope.row)" />
                        </template>
                    </el-table-column>
                    <el-table-column label="创建时间" align="center" prop="create_datetime" width="160">
                        <template slot-scope="scope">
                            <span>{{ parseTime(scope.row.create_datetime) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column
                        v-if="hasPermi(['permission:user:{id}:put', 'permission:user:{id}:delete', 'permission:user:resetpwd:put'])"
                        label="操作" align="center" width="160" class-name="small-padding fixed-width">
                        <template slot-scope="scope">
                            <el-button v-hasPermi="['permission:user:{id}:put']" size="mini" type="text"
                                icon="el-icon-edit" @click="handleUpdate(scope.row)">修改
                            </el-button>

                        </template>
                    </el-table-column>
                </el-table>

                <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
                    :limit.sync="queryParams.pageSize" @pagination="getList" />
            </el-col>
        </el-row>

        <!-- 添加或修改参数配置对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="用户昵称" prop="name">
                            <el-input v-model="form.name" placeholder="请输入用户昵称" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="手机号码" prop="mobile">
                            <el-input v-model="form.mobile" placeholder="请输入手机号码" maxlength="11" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="邮箱" prop="email">
                            <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item v-if="form.id == undefined" label="用户名称" prop="username">
                            <el-input v-model="form.username" placeholder="请输入用户名称" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item v-if="form.id == undefined" label="用户密码" prop="password">
                            <el-input v-model="form.password" placeholder="请输入用户密码" type="password" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="状态">
                            <el-radio-group v-model="form.is_active">
                                <el-radio v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictValue">{{
                                    dict.dictLabel }}
                                </el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="备注">
                            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitForm">确 定</el-button>
                <el-button @click="cancel">取 消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import {
    addUser,
    changeUserStatus,
    getUser,
    listUser,
    updateUser
} from "@/api/admin/member/user";
import { getToken } from "@/utils/auth";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
    name: "User",
    components: { Treeselect },
    data() {
        return {
            // 遮罩层
            loading: true,
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
            userList: null,
            // 弹出层标题
            title: "",
            // 是否显示弹出层
            open: false,
            // 默认密码
            initPassword: undefined,
            // 日期范围
            dateRange: [],
            // 状态数据字典
            statusOptions: [{ dictLabel: "正常", dictValue: true }, { dictLabel: "停用", dictValue: false }],
            // 性别状态字典
            sexOptions: [],
            // 岗位选项
            postOptions: [],
            // 角色选项
            roleOptions: [],
            // 表单参数
            form: {},
            defaultProps: {
                children: "children",
                label: "label"
            },
            // 用户导入参数
            upload: {
                // 是否显示弹出层（用户导入）
                open: false,
                // 弹出层标题（用户导入）
                title: "",
                // 是否禁用上传
                isUploading: false,
                // 是否更新已经存在的用户数据
                updateSupport: 0,
                // 设置上传的请求头部
                headers: { Authorization: "Bearer " + getToken() },
                // 上传的地址
                url: process.env.VUE_APP_BASE_API + "/admin/system/savefile/"
            },
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                username: undefined,
                mobile: undefined,
                is_active: undefined,
            },
            // 列信息
            // columns: [
            //     { key: 0, label: `序号`, visible: false },
            //     { key: 1, label: `用户名称`, visible: true },
            //     { key: 2, label: `用户昵称`, visible: true },
            //     { key: 3, label: `邀请码`, visible: true },
            //     { key: 4, label: `上级`, visible: true },
            //     { key: 5, label: `手机号码`, visible: true },
            //     { key: 6, label: `状态`, visible: true },
            //     { key: 7, label: `创建时间`, visible: true }
            // ],
            // 表单校验
            rules: {
                username: [
                    { required: true, message: "用户名称不能为空", trigger: "blur" }
                ],
                name: [
                    { required: true, message: "用户昵称不能为空", trigger: "blur" }
                ],
                password: [
                    { required: true, message: "用户密码不能为空", trigger: "blur" }
                ],
                email: [
                    {
                        type: "email",
                        message: "'请输入正确的邮箱地址",
                        trigger: ["blur", "change"]
                    }
                ],
                mobile: [
                    {
                        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
                        message: "请输入正确的手机号码",
                        trigger: "blur"
                    }
                ]
            }
        };
    },
    watch: {

    },
    created() {
        this.getList();
        // this.getDicts("sys_normal_disable").then(response => {
        //   this.statusOptions = response.data;
        // });
        this.getDicts("sys_user_sex").then(response => {
            this.sexOptions = response.data;
        });
        this.getConfigKey("sys.user.initPassword").then(response => {
            this.initPassword = response.msg;
        });
    },
    methods: {
        /** 查询用户列表 */
        getList() {
            this.loading = true;
            listUser(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
                this.userList = response.data.results;
                this.total = response.data.count;
                this.loading = false;
            }
            );
        },

        // 筛选节点
        filterNode(value, data) {
            if (!value) return true;
            return data.label.indexOf(value) !== -1;
        },

        // 用户状态修改
        handleStatusChange(row) {
            const text = row.is_active === true ? "启用" : "停用";
            this.$confirm('确认要"' + text + '""' + row.username + '"用户吗?', "警告", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(function () {
                return changeUserStatus(row.id, row.is_active);
            }).then(() => {
                this.msgSuccess(text + "成功");
            }).catch(function () {
                row.is_active = row.is_active === false;
            });
        },
        // 取消按钮
        cancel() {
            this.open = false;
            this.reset();
        },
        // 表单重置
        reset() {
            this.form = {
                id: undefined,
                username: undefined,
                name: undefined,
                password: undefined,
                mobile: undefined,
                email: undefined,
                gender: undefined,
                is_active: false,
                remark: undefined,
                postIds: [],
                roleIds: []
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
            getUser().then(response => {
                this.postOptions = response.data.posts;
                this.roleOptions = response.data.roles;
                this.open = true;
                this.title = "添加用户";
                this.form.password = this.initPassword;
            });
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            const id = row.id || this.ids;
            getUser(id).then(response => {
                const data = response.data.data;
                this.form = data;
                this.open = true;
                this.title = "修改用户";
            });
        },
        /** 重置密码按钮操作 */
        handleResetPwd(row) {
            this.$prompt('请输入"' + row.username + '"的新密码', "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消"
            }).then(({ value }) => {
                resetUserPwd(row.id, value).then(response => {
                    this.msgSuccess("修改成功，新密码是：" + value);
                });
            }).catch(() => {
            });
        },
        /** 提交按钮 */
        submitForm: function () {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    if (this.form.id !== undefined) {
                        updateUser(this.form).then(response => {
                            this.msgSuccess("修改成功");
                            this.open = false;
                            this.getList();
                        });
                    } else {
                        addUser(this.form).then(response => {
                            this.msgSuccess("新增成功");
                            this.open = false;
                            this.getList();
                        });
                    }
                }
            });
        },
        /** 删除按钮操作 */
        handleDelete(row) {
            const userIds = row.id || this.ids;
            this.$confirm('是否确认删除用户编号为"' + userIds + '"的数据项?', "警告", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(function () {
                return delUser(userIds);
            }).then(() => {
                this.getList();
                this.msgSuccess("删除成功");
            });
        },
        /** 导出按钮操作 */
        handleExport() {
            const queryParams = this.queryParams;
            this.$confirm("是否确认导出所有用户数据项?", "警告", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(function () {
                return exportUser(queryParams);
            }).then(response => {
                this.download(response.data.file_url, response.data.name);
            });
        },
        /** 导入按钮操作 */
        handleImport() {
            this.upload.title = "用户导入";
            this.upload.open = true;
        },
        /** 下载模板操作 */
        importTemplate() {
            importTemplate().then(response => {
                this.download(response.data.file_url, response.data.name);
            });
        },
        // 文件上传中处理
        handleFileUploadProgress(event, file, fileList) {
            this.upload.isUploading = true;
        },
        // 文件上传成功处理
        handleFileSuccess(response, file, fileList) {
            this.upload.open = false;
            this.upload.isUploading = false;
            this.$refs.upload.clearFiles();
            // 是否更新已经存在的用户数据
            importsUser({ file_url: response.data.file_url, updateSupport: this.upload.updateSupport }).then(response => {
                this.$alert("导入成功！", "导入结果", { dangerouslyUseHTMLString: true });
                this.getList();
            });
        },
        // 提交上传文件
        submitFileForm() {
            this.$refs.upload.submit();
        }
    }
};
</script>
<style lang="scss">
.el-col-20 {
    width: 100% !important;
}
</style>