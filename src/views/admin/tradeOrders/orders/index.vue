<template>
    <div class="app-container">
        <el-row>
            <!--用户数据-->
            <el-col :span="20" :xs="24">
                <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
                    <el-form-item label="录入时间">
                        <el-date-picker v-model="dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd"
                            type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" />
                    </el-form-item>
                    <el-form-item label="支付方式" prop="payType">
                        <el-select v-model="queryParams.payType" placeholder="支付方式" clearable size="small"
                            style="width: 240px">
                            <el-option v-for="dict in payOptions" :key="dict.dictValue" :label="dict.dictLabel"
                                :value="dict.dictValue" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
                    </el-form-item>
                </el-form>
                <el-row :gutter="10" class="mb8">
                    <el-col :span="1.5">
                        <el-button v-hasPermi="['permission:user:post']" type="primary" plain icon="el-icon-plus"
                            size="mini" @click="handleAdd">录入
                        </el-button>
                        <span style="margin-left: 20px;">
                            <span class="amount">总金额: {{ this.totalAmount }}元</span>
                            <span class="amount">微信支付金额: {{ this.wxTotalAmount }}元</span>
                            <span class="amount">支付宝支付金额: {{ this.alpayTotalAmount }}元</span>
                            <span class="amount">USDT支付金额: {{ this.usdtTotalAmount }}元</span>
                            <span class="amount">汇旺支付金额: {{ this.hwTotalAmount }}元</span>
                        </span>
                    </el-col>
                    <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
                </el-row>

                <el-table v-loading="loading" :data="listOrder" @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="50" align="center" />
                    <el-table-column key="orderNumber" label="订单编号" align="center" prop="orderNumber" width="200" />
                    <el-table-column key="amount" label="实付金额" align="center" prop="amount"
                        :show-overflow-tooltip="true" width="160">
                        <template slot-scope="scope">
                            <span v-if="scope.row.payType===2">{{ scope.row.amount }}U</span>
                            <span v-else>{{ scope.row.amount }}元</span>
                        </template>
                    </el-table-column>
                    <el-table-column key="botMenu" label="关联广告" align="center" prop="botMenu"
                        :show-overflow-tooltip="true" width="160">
                        <template slot-scope="scope">
                            <span v-if="scope.row.adType === 0">{{ scope.row.listAd.name }}</span>
                            <span v-else>{{ scope.row.imageAd.name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column key="merchant" label="所属商家" align="center" prop="merchant"
                        :show-overflow-tooltip="true" width="160">
                        <template slot-scope="scope">
                            <span v-if="scope.row.adType === 0">{{ scope.row.listAd.merchant.name }}</span>
                            <span v-else>{{ scope.row.imageAd.merchant.name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column key="adType" label="广告类型" align="center" prop="adType"
                        :show-overflow-tooltip="true" width="160">
                        <template slot-scope="scope">
                            <span v-if="scope.row.adType === 0">列表广告</span>
                            <span v-else>图片广告</span>
                        </template>
                    </el-table-column>
                    <el-table-column key="payType" label="支付方式" align="center" prop="payType"
                        :show-overflow-tooltip="true" width="160">
                        <template slot-scope="scope">
                            <span v-if="scope.row.payType === 0">微信支付</span>
                            <span v-if="scope.row.payType === 1">支付宝支付</span>
                            <span v-if="scope.row.payType === 2">USDT支付</span>
                            <span v-if="scope.row.payType === 3">汇旺支付</span>
                        </template>
                    </el-table-column>
                    <el-table-column key="status" label="状态" align="center">
                        <template slot-scope="scope">
                            <span v-if="scope.row.status === 1">启用</span>
                            <span v-else>禁用</span>
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

                <el-row v-if="this.title === '修改订单'">
                    <el-col :span="24">
                        <el-form-item label="订单编号" prop="orderNumber" :disabled="disabled">
                            <el-input v-model="form.orderNumber" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="实付金额" prop="amount">
                            <el-input v-model="form.amount" placeholder="请输入金额" type="number">
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="支付方式" prop="payType">
                            <el-radio-group v-model="form.payType">
                                <el-radio v-for="dict in payOptions" :key="dict.dictValue" :label="dict.dictValue">{{
                                    dict.dictLabel }}
                                </el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="广告类型" prop="adType">
                            <el-radio-group v-model="form.adType">
                                <el-radio v-for="dict in adOptions" :key="dict.dictValue" :label="dict.dictValue">{{
                                    dict.dictLabel }}
                                </el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row v-if="this.form.adType === 0">
                    <el-col :span="20">
                        <el-form-item label="列表广告" prop="listAd">
                            <el-select v-model="form.listAd" filterable placeholder="请输入关键词">
                                <el-option v-for="item in listAdList" :key="item.id" :label="item.name"
                                    :value="item.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="20" v-if="this.form.adType === 1">
                        <el-form-item label="图片广告" prop="imageAd">
                            <el-select v-model="form.imageAd" filterable placeholder="请输入关键词">
                                <el-option v-for="item in imageAdList" :key="item.id" :label="item.name"
                                    :value="item.id">
                                </el-option>
                            </el-select>
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
    listOrder,
    addOrder,
    getOrder,
    updateOrder,
    allImageAd,
    allListAd
} from "@/api/admin/tradeOrders/order";

export default {
    name: "Order",
    data() {
        return {
            totalAmount: 0.00,
            wxTotalAmount: 0.00,
            alpayTotalAmount: 0.00,
            usdtTotalAmount: 0.00,
            hwTotalAmount: 0.00,
            disabled: true,
            //
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
            listOrder: null,
            listOrder1: null,
            // 列表广告
            listAdList: null,
            listAdList1: null,
            // 图片广告
            imageAdList: null,
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
            statusOptions: [{ dictLabel: "启用", dictValue: 1 }, { dictLabel: "停用", dictValue: 0 }],
            // 广告类型
            adOptions: [{ dictLabel: "图片广告", dictValue: 1 }, { dictLabel: "列表广告", dictValue: 0 }],
            // 支付类型
            payOptions: [{ dictLabel: "微信", dictValue: 0 }, { dictLabel: "支付宝", dictValue: 1 }, { dictLabel: "USDT", dictValue: 2 }, { dictLabel: "汇旺", dictValue: 3 }],
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
                orderNumber: undefined,
                payType: undefined
            },
            // 表单校验
            rules: {
                amount: [
                    { required: true, message: "请输入订单金额", trigger: "blur" },
                    { pattern: /^[1-9]\d+(\.\d{1,2})?$/, message: '请输入正确的数字（最多两位小数）', trigger: 'blur' }
                ],
                adType: [
                    { required: true, message: "请选择广告类型", trigger: "blur" }
                ],
                payType: [
                    { required: true, message: "请选择支付类型", trigger: "blur" }
                ],
                imageAd: [
                    { required: true, message: "请选择广告", trigger: "blur" }
                ],
                listAd: [
                    { required: true, message: "请选择广告", trigger: "blur" }
                ]
            }
        };
    },
    watch: {

    },
    created() {
        this.getList();
    },
    methods: {
        // 获取所有列表广告
        getAllListAd() {
            allListAd().then(response => {
                this.listAdList = response.data;

            })
        },
        // 获取所有图片广告
        getAllImageAd() {
            allImageAd().then(response => {
                this.imageAdList = response.data;
            })
        },
        /** 查询列表广告 */
        getList() {
            this.loading = true;
            listOrder(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
                this.listOrder = response.data.results.results;
                this.total = response.data.count;
                this.totalAmount = response.data.results.totalAmount;
                this.wxTotalAmount = response.data.results.wxTotalAmount;
                this.alpayTotalAmount = response.data.results.alpayTotalAmount;
                this.usdtTotalAmount = response.data.results.usdtTotalAmount;
                this.hwTotalAmount = response.data.results.hwTotalAmount
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
                payType: 0,
                adType: undefined
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
            this.getAllListAd();
            this.getAllImageAd();
            this.open = true;
            this.title = "录入订单";
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            this.getAllImageAd();
            this.getAllListAd();
            const id = row.orderNumber;
            getOrder(id).then(response => {
                const data = response.data;
                this.form = data;
                this.form.listAd = data.adType === 0 ? data.listAd.id : undefined;
                this.form.imageAd = data.adType === 1 ? data.imageAd.id : undefined;
                this.open = true;
                this.title = "修改订单";
            });
        },

        /** 提交按钮 */
        submitForm: function () {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    if (this.form.orderNumber !== undefined) {
                        updateOrder(this.form).then(response => {
                            this.msgSuccess("修改成功");
                            this.open = false;
                            this.getList();
                        });
                    } else {
                        addOrder(this.form).then(response => {
                            this.msgSuccess("新增成功");
                            this.open = false;
                            this.getList();
                        });
                    }
                }
            });
        },
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
<style lang="scss">
.el-col-20 {
    width: 100% !important;
}

.amount {
    margin-left: 20px;
}
</style>