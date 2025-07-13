class FavLinks {
  constructor() {
    this.container = document.getElementById('groups-container');
    this.currentGroup = null;
    this.init();
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const bgColor = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    }[type];
    
    toast.className = `${bgColor} text-white px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0`;
    toast.textContent = message;
    
    document.getElementById('toast-container').appendChild(toast);
    
    setTimeout(() => {
      toast.classList.remove('translate-x-full', 'opacity-0');
    }, 100);
    
    setTimeout(() => {
      toast.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  async init() {
    this.bindEvents();
    await this.checkLoginStatus();
    await this.loadLinks();
  }

  bindEvents() {
    // 登录相关
    document.getElementById('login').addEventListener('click', () => this.showModal('loginModal'));
    document.getElementById('closeLogin').addEventListener('click', () => this.hideModal('loginModal'));
    document.getElementById('loginBtn').addEventListener('click', () => this.handleLogin());
    document.getElementById('signupBtn').addEventListener('click', () => this.handleSignup());

    // 添加组
    document.getElementById('addGroup').addEventListener('click', () => this.showModal('addGroupModal'));
    document.getElementById('closeAddGroup').addEventListener('click', () => this.hideModal('addGroupModal'));
    document.getElementById('saveGroup').addEventListener('click', () => this.handleAddGroup());
    document.getElementById('cancelGroup').addEventListener('click', () => this.hideModal('addGroupModal'));

    // 添加链接
    document.getElementById('closeAddLink').addEventListener('click', () => this.hideModal('addLinkModal'));
    document.getElementById('saveLink').addEventListener('click', () => this.handleAddLink());
    document.getElementById('cancelLink').addEventListener('click', () => this.hideModal('addLinkModal'));

    // 编辑组
    document.getElementById('closeEditGroup').addEventListener('click', () => this.hideModal('editGroupModal'));
    document.getElementById('saveEditGroup').addEventListener('click', () => this.handleEditGroup());
    document.getElementById('cancelEditGroup').addEventListener('click', () => this.hideModal('editGroupModal'));

    // 输入验证
    ['userName', 'passwd'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => this.validateLogin());
    });
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  validateLogin() {
    const userName = document.getElementById('userName').value.trim();
    const passwd = document.getElementById('passwd').value.trim();
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    
    const isValid = userName && passwd;
    loginBtn.disabled = !isValid;
    signupBtn.disabled = !isValid;
    
    loginBtn.classList.toggle('opacity-50', !isValid);
    signupBtn.classList.toggle('opacity-50', !isValid);
  }

  async handleLogin() {
    const userName = document.getElementById('userName').value.trim();
    const passwd = document.getElementById('passwd').value.trim();

    if (!userName || !passwd) return;

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-biz': passwd
        },
        body: JSON.stringify({ user: userName }),
        credentials: 'include'
      });

      const result = await response.json();
      if (result.status === 0) {
        this.hideModal('loginModal');
        this.setCookie('user', userName, 14);
        this.setCookie('name', userName, 14);
        this.setCookie('isLogin', 'true', 14);
        this.updateLoginStatus(userName);
        await this.loadLinks();
      } else {
        this.showToast(result.msg, 'error');
      }
    } catch (error) {
      this.showToast('登录失败', 'error');
    }
  }

  async handleSignup() {
    const userName = document.getElementById('userName').value.trim();
    const passwd = document.getElementById('passwd').value.trim();
    const email = document.getElementById('email').value.trim();

    if (!userName || !passwd) return;
    if (!email) {
      this.showToast('注册需要填写邮箱', 'warning');
      return;
    }

    try {
      const response = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userName, passwd, email }),
        credentials: 'include'
      });

      const result = await response.json();
      if (result.status === 0) {
        this.hideModal('loginModal');
        this.setCookie('user', userName, 14);
        this.setCookie('name', userName, 14);
        this.setCookie('isLogin', 'true', 14);
        this.updateLoginStatus(userName);
        await this.loadLinks();
      } else {
        this.showToast(result.msg, 'error');
      }
    } catch (error) {
      this.showToast('注册失败', 'error');
    }
  }

  updateLoginStatus(userName) {
    document.getElementById('loginUser').textContent = userName;
    document.getElementById('login').classList.add('hidden');
    const logoutBtn = document.getElementById('logout');
    logoutBtn.classList.remove('hidden');
    logoutBtn.onclick = (e) => {
      e.preventDefault();
      this.handleLogout();
    };
  }

  async handleLogout() {
    try {
      await fetch('/logout', {
        credentials: 'include'
      });
      // 清除本地cookie
      this.setCookie('user', '', -1);
      this.setCookie('name', '', -1);
      this.setCookie('isLogin', '', -1);
      // 重置UI状态
      document.getElementById('loginUser').textContent = '游客';
      document.getElementById('login').classList.remove('hidden');
      document.getElementById('logout').classList.add('hidden');
      // 重新加载数据
      await this.loadLinks();
    } catch (error) {
      console.error('退出失败:', error);
    }
  }

  setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
  }

  getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === name) return decodeURIComponent(value);
    }
    return null;
  }

  async checkLoginStatus() {
    const isLogin = this.getCookie('isLogin');
    const userName = this.getCookie('name');

    if (isLogin === 'true' && userName) {
      // 验证session是否有效
      try {
        const response = await fetch('/api/session-check', {
          credentials: 'include'
        });
        const result = await response.json();
        if (result.isLogin) {
          this.updateLoginStatus(userName);
        } else {
          // session已失效，清除cookie和UI
          this.clearLoginState();
        }
      } catch (error) {
        this.clearLoginState();
      }
    }
  }

  clearLoginState() {
    this.setCookie('user', '', -1);
    this.setCookie('name', '', -1);
    this.setCookie('isLogin', '', -1);
    document.getElementById('loginUser').textContent = '游客';
    document.getElementById('login').classList.remove('hidden');
    document.getElementById('logout').classList.add('hidden');
  }

  async handleAddGroup() {
    const groupName = document.getElementById('groupName').value.trim();
    if (!groupName) return;

    try {
      const response = await fetch('/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          collection: 'links',
          findPattern: {groupname: groupName},
          data: {groupname: groupName, linkname: '', url: ''},
          user: this.getCookie('user')
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      if (data.status === 0) {
        this.hideModal('addGroupModal');
        document.getElementById('groupName').value = '';
        await this.loadLinks();
      } else {
        this.showToast(data.msg, 'error');
      }
    } catch (error) {
      this.showToast('添加组失败', 'error');
    }
  }

  async handleAddLink() {
    const linkName = document.getElementById('linkName').value.trim();
    const linkUrl = document.getElementById('linkUrl').value.trim();
    
    if (!linkName || !linkUrl) return;

    if (this.isEditing) {
      // 编辑链接
      try {
        const response = await fetch(`/api/links/${this.currentLinkId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            linkname: linkName,
            url: linkUrl
          }),
          credentials: 'include'
        });
        
        if (response.ok) {
          this.hideModal('addLinkModal');
          document.getElementById('linkName').value = '';
          document.getElementById('linkUrl').value = '';
          await this.loadLinks();
        } else {
          this.showToast('编辑链接失败', 'error');
        }
      } catch (error) {
        this.showToast('编辑链接失败', 'error');
      }
    } else {
      // 添加链接
      try {
        const response = await fetch('/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            collection: 'links',
            data: {
              groupname: this.currentGroup,
              linkname: linkName,
              url: linkUrl
            },
            user: this.getCookie('user')
          }),
          credentials: 'include'
        });
        
        const result = await response.json();
        if (result.status === 0) {
          this.hideModal('addLinkModal');
          document.getElementById('linkName').value = '';
          document.getElementById('linkUrl').value = '';
          await this.loadLinks();
        } else {
          this.showToast(result.msg, 'error');
        }
      } catch (error) {
        this.showToast('添加链接失败', 'error');
      }
    }
  }

  async loadLinks() {
    try {
      const response = await fetch('/api/links', {
        credentials: 'include'
      });
      const { groups } = await response.json();
      this.renderGroups(groups);
    } catch (error) {
      console.error('加载链接失败:', error);
    }
  }

  renderGroups(groups) {
    this.container.innerHTML = '';
    
    Object.entries(groups).forEach(([groupName, links]) => {
      const groupEl = this.createGroupElement(groupName, links);
      this.container.appendChild(groupEl);
    });
  }

  createGroupElement(groupName, links) {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-lg shadow-sm border border-gray-200';
    
    div.innerHTML = `
      <div class="p-4 bg-blue-600 text-white rounded-t-lg" ondrop="favLinks.drop(event, '${groupName}')" ondragover="favLinks.dragOver(event)">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold flex items-center">
            <svg onclick="favLinks.toggleGroup('${groupName}')" class="w-5 h-5 mr-3 cursor-pointer transition-transform" fill="currentColor" viewBox="0 0 20 20" id="toggle-${groupName}">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
            <span onclick="favLinks.editGroup('${groupName}')" class="cursor-pointer hover:text-blue-200">${groupName}</span>
          </h2>
          <div class="flex space-x-2">
            <button onclick="favLinks.editGroup('${groupName}')" class="text-blue-200 hover:text-white px-2 py-1 rounded text-sm">编辑</button>
            <button onclick="favLinks.deleteGroup('${groupName}')" class="text-red-200 hover:text-white px-2 py-1 rounded text-sm">删除</button>
          </div>
        </div>
      </div>
      <div class="p-4" id="content-${groupName}" ondrop="favLinks.drop(event, '${groupName}')" ondragover="favLinks.dragOver(event)">
        <div class="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          ${links.map(link => `
            <div class="relative group/item" draggable="true" ondragstart="favLinks.dragStart(event, '${link.id}', '${groupName}')" ondragend="favLinks.dragEnd(event)">
              <div class="flex items-center p-3 rounded-md border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group">
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate">
                    ${link.linkname}
                  </div>
                  <div class="text-xs text-gray-500 truncate">${link.url}</div>
                </div>
                <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onclick="favLinks.editLink('${link.id}', '${link.linkname}', '${link.url}')" 
                          class="p-1 text-blue-500 hover:bg-blue-50 rounded" title="编辑">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button onclick="favLinks.deleteLink('${link.id}')" 
                          class="p-1 text-red-500 hover:bg-red-50 rounded" title="删除">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                  <a href="${link.url}" target="_blank" class="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded" title="访问">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          `).join('')}
          <button onclick="favLinks.showAddLinkModal('${groupName}')" 
                  class="flex items-center justify-center p-3 rounded-md border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <span class="text-sm text-gray-600">添加新链接</span>
          </button>
        </div>
      </div>
    `;
    
    return div;
  }



  editLink(linkId, linkName, linkUrl) {
    document.getElementById('linkName').value = linkName;
    document.getElementById('linkUrl').value = linkUrl;
    this.currentLinkId = linkId;
    this.isEditing = true;
    this.showModal('addLinkModal');
  }

  showAddLinkModal(groupName) {
    this.currentGroup = groupName;
    this.isEditing = false;
    this.currentLinkId = null;
    document.getElementById('linkName').value = '';
    document.getElementById('linkUrl').value = '';
    this.showModal('addLinkModal');
  }

  async deleteLink(linkId) {
    if (!confirm('确定要删除这个链接吗？')) return;
    
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        await this.loadLinks();
      } else {
        this.showToast('删除失败', 'error');
      }
    } catch (error) {
      this.showToast('删除失败', 'error');
    }
  }

  async deleteGroup(groupName) {
    if (!confirm(`删除组后，组内保存链接不可恢复，确认删除“${groupName}”组吗？`)) return;
    
    try {
      const response = await fetch('/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          collection: 'links',
          data: {groupname: groupName},
          user: this.getCookie('user')
        }),
        credentials: 'include'
      });
      
      const result = await response.json();
      if (result.status === 0) {
        await this.loadLinks();
      } else {
        this.showToast(result.msg, 'error');
      }
    } catch (error) {
      this.showToast('删除组失败', 'error');
    }
  }

  editGroup(groupName) {
    this.currentEditGroup = groupName;
    document.getElementById('newGroupName').value = groupName;
    this.showModal('editGroupModal');
  }

  async handleEditGroup() {
    const newGroupName = document.getElementById('newGroupName').value.trim();
    if (!newGroupName || newGroupName === this.currentEditGroup) {
      this.hideModal('editGroupModal');
      return;
    }

    try {
      const response = await fetch('/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          collection: 'links',
          findPattern: {groupname: this.currentEditGroup},
          data: {groupname: newGroupName},
          user: this.getCookie('user')
        }),
        credentials: 'include'
      });
      
      const result = await response.json();
      if (result.status === 0) {
        this.hideModal('editGroupModal');
        await this.loadLinks();
      } else {
        this.showToast(result.msg, 'error');
      }
    } catch (error) {
      this.showToast('修改组名失败', 'error');
    }
  }

  async exportLinks() {
    try {
      const response = await fetch('/export', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '藏经阁导出.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        this.showToast('导出失败', 'error');
      }
    } catch (error) {
      this.showToast('导出失败', 'error');
    }
  }

  toggleGroup(groupName) {
    const content = document.getElementById(`content-${groupName}`);
    const toggle = document.getElementById(`toggle-${groupName}`);
    
    if (content.style.display === 'none') {
      content.style.display = 'block';
      toggle.style.transform = 'rotate(0deg)';
    } else {
      content.style.display = 'none';
      toggle.style.transform = 'rotate(-90deg)';
    }
  }

  dragStart(event, linkId, groupName) {
    event.dataTransfer.setData('text/plain', JSON.stringify({ linkId, groupName }));
    event.currentTarget.style.opacity = '0.5';
  }

  dragEnd(event) {
    event.currentTarget.style.opacity = '1';
  }

  dragOver(event) {
    event.preventDefault();
    event.currentTarget.style.backgroundColor = '#e3f2fd';
  }

  async drop(event, targetGroupName) {
    event.preventDefault();
    event.currentTarget.style.backgroundColor = '';
    
    const data = JSON.parse(event.dataTransfer.getData('text/plain'));
    const { linkId, groupName: sourceGroupName } = data;
    
    if (sourceGroupName === targetGroupName) return;
    
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ groupname: targetGroupName }),
        credentials: 'include'
      });
      
      if (response.ok) {
        await this.loadLinks();
      } else {
        this.showToast('移动链接失败', 'error');
      }
    } catch (error) {
      this.showToast('移动链接失败', 'error');
    }
  }
}

// 全局实例
const favLinks = new FavLinks();

// 将favLinks暴露为全局变量，供HTML中的onclick事件使用
window.favLinks = favLinks;
