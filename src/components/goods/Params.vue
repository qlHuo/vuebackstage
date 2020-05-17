<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 头部警告区域 -->
      <el-alert show-icon :closable="false" title="注意：只允许为第三级分类设置相关参数！" type="warning"></el-alert>

      <!-- 选择商品参数 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <!-- 商品参数的级联选择框 -->
          <el-cascader
            v-model="seletedKeys"
            :options="catelist"
            :props="cascaderProps"
            @change="hanleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab切换标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 设置动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisable" @click="showAddDialog">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  closable
                  v-for="(item,index) in scope.row.attr_vals"
                  :key="index"
                  @close="handleClose(index,scope.row)"
                >{{ item }}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 按钮切换 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column width="50" label="编号" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParamsById(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 设置静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisable" @click="showAddDialog">添加属性</el-button>

          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  closable
                  v-for="(item,index) in scope.row.attr_vals"
                  :key="index"
                  @close="handleClose(index,scope.row)"
                >{{ item }}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 按钮切换 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column width="50" label="编号" type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParamsById(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form
        :model="addDialogForm"
        :rules="addDialogFormRoules"
        ref="addDialogFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addDialogForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑参数的对话框 -->
    <el-dialog
      :title="'编辑' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editDialogForm"
        :rules="editDialogFormRoules"
        ref="editDialogFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editDialogForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品列表数据
      catelist: [],
      //   选中的商品分类的id数组
      seletedKeys: [],
      // props 级联选择器配置选项
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        // 触发的事件 hover或者是 click
        expandTrigger: 'hover'
      },
      //   默认选中
      activeName: 'many',
      //   动态参数的数据列表
      manyTableData: [],
      // 静态属性的数据列表
      onlyTableData: [],
      //  控制添加参数对话框显示或者隐藏
      addDialogVisible: false,
      //   添加参数数据表单
      addDialogForm: {
        attr_name: ''
      },
      // 表单数据的验证规则
      addDialogFormRoules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      //  控制编辑对话框的显示与隐藏
      editDialogVisible: false,
      //   编辑对话框的表单数据
      editDialogForm: {
        attr_name: ''
      },
      // 编辑对话框的表单验证规则
      editDialogFormRoules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //   获取商品分类列表数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表数据失败')
      }
      this.catelist = res.data
      console.log(this.catelist)
    },
    // 级联选择框选中项变化会触发此事件
    hanleChange() {
      this.getParamsList()
    },

    // tab 页签点击事件的处理函数
    handleClick() {
      console.log(this.activeName)
      this.getParamsList()
    },

    async getParamsList() {
      //   console.log(this.seletedKeys)
      // 如果选中的数组长度不等于3，那么就证明选中的不是三级分类
      if (this.seletedKeys.length !== 3) {
        // 清空数组，重置
        this.seletedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return this.$message.info('请选择三级分类')
      }
      console.log(this.seletedKeys)
      // 根据所选分类的id和当前所处的面板，获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      res.data.forEach(item => {
        //   判断：如果attr_vals中有值就使用字符串分隔，否则就之间返回空数组
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制这一行的文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })

      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 显示添加参数对话框
    showAddDialog() {
      this.addDialogVisible = true
    },
    // 监听对话框的关闭事件
    addDialogClosed() {
      this.$refs.addDialogFormRef.resetFields()
    },
    // 点击按钮添加参数
    addParams() {
      // 表单预验证
      this.$refs.addDialogFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) {
          return this.$message.error('请检查输入的内容是否符合要求')
        }
        // 预验证通过，发起网络请求
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addDialogForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('更新数据失败')
        }

        this.$message.success('更新数据成功')
        // 更新参数列表
        this.getParamsList()
        // 关闭对话框
        this.addDialogVisible = false
      })
    },
    // 点击显示编辑的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/` + id,
        {
          attr_sel: this.activeName
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据列表失败')
      }

      this.editDialogForm = res.data
      this.editDialogVisible = true
    },
    // 编辑对话框关闭之后，重置
    editDialogClosed() {
      this.$refs.editDialogFormRef.resetFields()
    },
    // 点击按钮提交修改后的数据
    editParams() {
      // 先进行表单预验证
      this.$refs.editDialogFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请检查输入的内容是否符合要求')
        }
        // 预验证成功之后，发起网络请求
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editDialogForm.attr_id}`,
          {
            attr_name: this.editDialogForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新数据失败')
        }
        this.$message.success('更新数据成功')
        // 更新数据列表
        this.getParamsList()
        // 关闭对话框
        this.editDialogVisible = false
      })
    },
    // 根据id删除对应的参数
    async removeParamsById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除该参数')
      }
      //   如果点击的是 确定 就发起请求删除该参数
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/` + id
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }

      this.$message.success('删除参数成功')
      // 更新参数列表
      this.getParamsList()
    },
    // 文本框失去焦点或者 摁下了 enter 键 都会触发这个函数
    handleInputConfirm(row) {
      // 如果清空输入框两侧的空白之后文本框的长度为0，就说明输入的内容不合法
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return this.$message.error('请检查输入的内容是否符合要求')
      }
      //   如果输入的内容合法，那么就需要进行进一步的处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      //   将修改后的数据存放到数据库中
      this.saveAttrVals(row)
    },
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('更新数据失败')
      }

      this.$message.success(res.meta.msg)
    },
    // 点击按钮显示文本框
    showInput(row) {
      row.inputVisible = true
      // $nextTick 方法的作用：当页面上的元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应的数据可选项
    handleClose(index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    //   控制添加按钮是否禁用，禁用为true，否则为false
    isBtnDisable() {
      if (this.seletedKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类的id
    cateId() {
      if (this.seletedKeys.length === 3) {
        return this.seletedKeys[2]
      }
      return null
    },
    // 对话框显示 动态参数 或者 静态属性
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
  span {
    margin-right: 10px;
  }
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>
