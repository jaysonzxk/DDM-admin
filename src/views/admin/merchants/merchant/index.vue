<template>
    <div class="app-container">
        <el-row>
            <!--用户数据-->
            <el-col :span="20" :xs="24">
                <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
                    <el-form-item label="商家名称" prop="name">
                        <el-input v-model="queryParams.name" placeholder="请输入商家名称" clearable size="small"
                            style="width: 240px" @keyup.enter.native="handleQuery" />
                    </el-form-item>
                    <el-form-item label="状态" prop="sttatus">
                        <el-select v-model="queryParams.status" placeholder="商家状态" clearable size="small"
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

                    <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
                </el-row>

                <el-table v-loading="loading" :data="merchantsList" @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="50" align="center" />
                    <el-table-column key="name" label="商户名称" align="center" prop="name" :show-overflow-tooltip="true" />
                    <el-table-column key="telegarm" label="商户TG" align="center" prop="telegarm" :show-overflow-tooltip="true" />
                    <el-table-column key="status" label="状态" align="center">
                        <template slot-scope="scope">
                            <span v-if="scope.row.status == 1">启用</span>
                            <span v-else>禁用</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="更新时间" align="center" prop="update_datetime" width="160">
                        <template slot-scope="scope">
                            <span>{{ parseTime(scope.row.update_datetime) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="创建时间" align="center" prop="create_datetime" width="160">
                        <template slot-scope="scope">
                            <span>{{ parseTime(scope.row.create_datetime) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
                        <template slot-scope="scope">
                            <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改
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
                        <el-form-item label="商户名称" prop="name">
                            <el-input v-model="form.name" placeholder="请输入商户名称" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="商户TG" prop="telegarm">
                            <el-input v-model="form.telegarm" placeholder="请输入商户TG" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="状态">
                            <el-radio-group v-model="form.status">
                                <el-radio v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictValue">{{
                                    dict.dictLabel }}
                                </el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="备注" prop="description">
                            <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
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
    listMerchants,
    addMerchants,
    getMerchants,
    updateMerchants,
} from "@/api/admin/merchants/merchant";

export default {
    name: "Merchants",
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
            merchantsList: null,
            // 菜单数据
            menuList: null,
            // 弹出层标题
            title: "",
            // 是否显示弹出层
            open: false,
            // 默认密码
            initPassword: undefined,
            // 日期范围
            dateRange: [],
            // 状态数据字典
            statusOptions: [{ dictLabel: "启用", dictValue: 1 }, { dictLabel: "停用", dictValue: 0 }],
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
                    { required: true, message: "菜单名称不能为空", trigger: "blur" }
                ],

            }
        };
    },
    watch: {

    },
    created() {
        this.getList();
    },
    methods: {
        /** 查询用户列表 */
        getList() {
            this.loading = true;
            listMerchants(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
                this.merchantsList = response.data.results;
                this.total = response.data.count;
                this.loading = false;
            }
            );
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
                name: undefined,
                status: 1,
                description: undefined,
                isRecommend: 0,
                isHot: 0
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
            this.open = true;
            this.title = "添加商家";
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            const id = row.id || this.ids;
            getMerchants(id).then(response => {
                const data = response.data;
                this.form = data;
                this.open = true;
                this.title = "修改菜单";
            });
        },
        /** 提交按钮 */
        submitForm: function () {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    if (this.form.id !== undefined) {
                        updateMerchants(this.form).then(response => {
                            this.msgSuccess("修改成功");
                            this.open = false;
                            this.getList();
                        });
                    } else {
                        addMerchants(this.form).then(response => {
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
    }
};
</script>
<style lang="scss">
.el-col-20 {
    width: 100% !important;
}
</style>