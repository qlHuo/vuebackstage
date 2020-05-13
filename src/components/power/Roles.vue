<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 主题内容区域，列表 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRolesVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表table表格 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop':'', 'vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>

            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="编号" type="index" width="50"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditRoles(scope.row.id)"
            >修改</el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRolesById(scope.row.id)"
            >删除</el-button>
            <!-- 分配角色按钮 -->
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightsDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 点击 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRolesVisible" width="50%" @closed="addRolesClosed">
      <!-- 内容主体区域 -->
      <el-form
        :model="addRolesForm"
        :rules="addRolesFormRules"
        ref="addRolesFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 点击 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editRolesVisible" width="50%" @closed="editRolesClosed">
      <!-- 内容主体区域 -->
      <el-form
        :model="editRolesForm"
        :rules="editRolesFormRules"
        ref="editRolesFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 点击 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightsDialogVisible"
      width="50%"
      @closed="setRightsDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        :default-expand-all="true"
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色列表
      rolesList: [],
      //   控制添加角色的对话框的显示与隐藏
      addRolesVisible: false,
      //   添加角色的表单数据对象
      addRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      //  添加表单的验证规则对象
      addRolesFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      //   控制编辑角色的对话框显示与隐藏
      editRolesVisible: false,
      // 修改角色的表单数据对象
      editRolesForm: {},
      // 修改角色的表单验证规则
      editRolesFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      //   控制显示权限对话框的显示和隐藏
      setRightsDialogVisible: false,
      //   权限列表数据
      rightsList: [],
      //   树形控件 属性绑定的对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的树形控件中的数据
      defKeys: [],
      //   当前即将分配权限的角色id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    //   获取所有的角色列表信息
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      //   console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取列表数据失败')
      }
      this.rolesList = res.data
    },
    // 监听添加角色对话框关闭
    addRolesClosed() {
      // 对话框关闭之后，清空对话框里面的内容
      this.$refs.addRolesFormRef.resetFields()
    },
    // 点击按钮添加 新角色
    addRoles() {
      // 表单预验证
      this.$refs.addRolesFormRef.validate(async valid => {
        console.log(valid)
        if (!valid) {
          return this.$message.error('请检查输入的内容是否正确')
        }
        // 可以发起网络请求，添加用户
        const { data: res } = await this.$http.post('roles', this.addRolesForm)

        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }

        this.$message.success('添加用户成功')
        // 隐藏Dialog对话框
        this.addRolesVisible = false
        // 重新获取用户列表数据
        this.getRolesList()
      })
    },
    // 监听 修改对话框关闭
    editRolesClosed() {
      // 对话框关闭之后清空里面的内容
      this.$refs.editRolesFormRef.resetFields()
    },
    // 获取数据并显示编辑角色对话框
    async showEditRoles(id) {
      console.log(id)
      const { data: res } = await this.$http.get('roles/' + id)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色数据失败')
      }
      this.editRolesForm = res.data
      //   console.log(this.editRolesForm)
      // 显示编辑对话框
      this.editRolesVisible = true
    },
    // 修改角色信息并提交
    editRolesInfo() {
      // 表单信息的预验证
      this.$refs.editRolesFormRef.validate(async valid => {
        console.log(valid)
        if (!valid) {
          return this.$message.error('请检查输入的内容')
        }
        // 如果预验证通过，就发起网络请求，修改用户信息
        const { data: res } = await this.$http.put(
          'roles/' + this.editRolesForm.roleId,
          {
            roleName: this.editRolesForm.roleName,
            roleDesc: this.editRolesForm.roleDesc
          }
        )
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败')
        }

        // 关闭对话框
        this.editRolesVisible = false
        // 刷新数据列表
        this.getRolesList()
        // 显示更新成功
        this.$message.success('更新用户信息成功')
      })
    },

    // 根据用户id删除用户
    async removeRolesById(id) {
      //   console.log(id)
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户，是否继续？',
        '提示',
        {
          comfirmButtonText: '确定',
          concelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      //   console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete('roles/' + id)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.getRolesList()
    },
    // 根据id删除权限
    async removeRightById(roles, rightsId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      console.log('确认了删除')

      const { data: res } = await this.$http.delete(
        `roles/${roles.id}/rights/${rightsId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }

      //   this.getRolesList() 会重新渲染整个列表页面
      //   把服务器返回的最新的权限直接赋值给当前角色的children，防止整体刷新
      roles.children = res.data
    },
    // 显示角色权限信息对话框
    async showSetRightsDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      //   console.log(res.data)

      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }

      this.rightsList = res.data
      //   console.log(this.rightsList)
      // 调用递归函数，设置默认选中的树形控件中的数据
      this.getLeafKeys(role, this.defKeys)
      // 让设置权限对话框显示
      this.setRightsDialogVisible = true
    },
    // 通过递归的形式，拿到角色下所有的三级权限的id，并保存到defKeys数组中
    getLeafKeys(node, arr) {
      // 如果当前node不包含children属性，就是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听 分配权限对话框的关闭事件
    setRightsDialogClosed() {
      // 关闭之后 重置defKeys中的数据
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      //   console.log(keys)
      const idStr = keys.join(',')

      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        {
          rids: idStr
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }

      this.$message.success('分配权限成功')

      this.getRolesList()
      this.setRightsDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 10px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

// 设置一级权限和二级权限 样式垂直居中
.vcenter {
  display: flex;
  align-items: center;
}
</style>
