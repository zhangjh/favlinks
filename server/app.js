import express from 'express';
import cors from 'cors';
import compression from 'compression';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { db } from './database.js';
import crypto from 'crypto';
import favicon from 'serve-favicon';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(favicon(path.join(__dirname, '../client/img', 'favicon.ico')));

app.use(compression());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: true,
  cookie: { user: "default", maxAge: 14 * 24 * 60 * 60 * 1000 }
}));

// 静态文件
app.use(express.static(path.join(__dirname, '../client')));

// 加密函数 - 保持与原项目一致
function encrypt(str) {
  const cipher = crypto.createCipher('aes192', config.session.secret);
  let enc = cipher.update(str, 'utf8', 'hex');
  enc += cipher.final('hex');
  return enc;
}

function decrypt(str) {
  const decipher = crypto.createDecipher('aes192', config.session.secret);
  let dec = decipher.update(str,'hex','utf8');
  dec += decipher.final('utf8');
  return dec;
}

function clearCookie(res) {
  res.clearCookie("user", {});
  res.clearCookie("name", {});
  res.clearCookie("isLogin", {});
}

function setSession(req, session) {
  for (let key in session) {
    if (session[key]) {
      req.session[key] = session[key] + "";
    }
  }
}

// 主页路由
app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// 登录接口
app.post('/login', async (req, res) => {
  const user = req.body.user;
  const rawPasswd = req.headers['x-requested-biz'];
  const passwd = encrypt(rawPasswd);
  
  const { data: userData } = await db.getUser(user);
  
  if (userData) {
    if (passwd === userData.passwd) {
      setSession(req, {
        user: user,
        isLogin: true
      });
      res.json({ status: 0, msg: "登录成功." });
    } else {
      res.json({ status: 1, msg: "密码错误！" });
    }
  } else {
    res.json({ status: 1, msg: "该用户没有注册，请先注册！" });
  }
});

// 注册接口
app.post('/signup', async (req, res) => {
  const { user, passwd, email } = req.body;
  const encPasswd = encrypt(passwd);
  
  const { data: existUser } = await db.getUser(user);
  
  if (existUser) {
    res.json({ status: 1, msg: "用户名已经被注册!" });
  } else {
    const { data } = await db.createUser({
      username: user,
      password_hash: encPasswd,
      email: email
    });
    
    if (data) {
      setSession(req, {
        user: user,
        isLogin: true
      });
      clearCookie(res);
      res.json({ status: 0, msg: "注册成功！" });
    }
  }
});

// 登出接口
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    clearCookie(res);
    res.cookie("isLogin", "false");
    res.redirect("/");
  });
});

// Session检查接口
app.get('/api/session-check', (req, res) => {
  const isLogin = req.session && req.session.user && req.session.isLogin;
  res.json({ isLogin: !!isLogin, user: req.session?.user });
});

// API路由 - 获取链接
app.get('/api/links', async (req, res) => {
  const sessionUser = req.session.user || "default";
  
  const { data, error } = await db.getLinks(sessionUser);
  
  if (error) return res.status(500).json({ error: error.message });
  
  const groups = {};
  data?.forEach(link => {
    if (!groups[link.groupname]) groups[link.groupname] = [];
    if(link.linkname) {
      groups[link.groupname].push(link);
    }
  });
  
  if (Object.keys(groups).length === 0) {
    groups["默认"] = [];
  }
  
  res.json({ groups });
});

// 删除链接
app.delete('/api/links/:id', async (req, res) => {
  const sessionUser = req.session.user;
  if (!sessionUser) {
    return res.status(401).json({ error: '未登录' });
  }
  
  const { data: userData } = await db.getUser(sessionUser);
  if (!userData) {
    return res.status(401).json({ error: '用户不存在' });
  }
  
  const { error } = await db.deleteLink(sessionUser, req.params.id);
  
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  res.json({ success: true });
});

// 添加组/链接 - 兼容老项目接口
app.post('/add', async (req, res) => {
  const { data, user } = req.body;
  const sessionUser = req.session.user;
  
  if (sessionUser !== user) {
    return res.json({ status: 1, msg: "Access Denied！请检查是否登录." });
  }
  
  if (!data) {
    return res.json({ status: 1, msg: "Error: no data given." });
  }
  
  // 转换字段名以适配数据库
  const linkData = {
    groupname: data.groupname,
    linkname: data.linkname || '',
    url: data.url || ''
  };
  
  const { error } = await db.addLink(sessionUser, linkData);
  
  if (error) {
    return res.json({ status: 1, msg: error.message });
  }
  
  res.json({ status: 0, msg: "insert ok." });
});

// 删除组/链接 - 兼容老项目接口
app.post('/remove', async (req, res) => {
  const { data, user } = req.body;
  const sessionUser = req.session.user;
  
  if (sessionUser !== user) {
    return res.json({ status: 1, msg: "Access Denied！请检查是否登录." });
  }
  
  const { data: userData } = await db.getUser(sessionUser);
  if (!userData) {
    return res.json({ status: 1, msg: "Access Denied！请检查是否登录." });
  }
  
  // 删除整个组（删除该组下所有链接）
  if (data.groupname) {
    const { data: links } = await db.getLinks(sessionUser);
    const groupLinks = links?.filter(link => link.groupname === data.groupname) || [];
    
    for (const link of groupLinks) {
      await db.deleteLink(sessionUser, link.id);
    }
    
    return res.json({ status: 0, msg: "remove ok." });
  }
  
  res.json({ status: 1, msg: "Error: no data to remove." });
});

// 更新组/链接 - 兼容老项目接口
app.post('/update', async (req, res) => {
  const { findPattern, data, user } = req.body;
  const sessionUser = req.session.user;
  
  if (sessionUser !== user) {
    return res.json({ status: 1, msg: "Access Denied！请检查是否登录." });
  }
  
  const { data: userData } = await db.getUser(sessionUser);
  if (!userData) {
    return res.json({ status: 1, msg: "Access Denied！请检查是否登录." });
  }
  
  // 更新组名
  if (findPattern.groupname && data.groupname) {
    const { error } = await db.updateLinksByGroup(sessionUser, findPattern.groupname, data.groupname);
    
    if (error) {
      return res.json({ status: 1, msg: error.message });
    }
    
    return res.json({ status: 0, msg: "update ok." });
  }
  
  res.json({ status: 1, msg: "Error: no data to update." });
});

// 导出功能
app.get('/export', async (req, res) => {
  const sessionUser = req.session.user;
  if (!sessionUser) {
    return res.json({ status: 1, msg: "Access Denied！请检查是否登录." });
  }
  
  const { data: userData } = await db.getUser(sessionUser);
  if (!userData) {
    return res.json({ status: 1, msg: "Access Denied！请检查是否登录." });
  }
  
  const { data: links } = await db.getLinks(sessionUser);
  
  const head = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>藏经阁导出书签</TITLE>
<H1><a href="https://favlink.cn">藏经阁</a>导出书签</H1>`;
  
  let html = head + `
<DL><p>
`;
  
  const groups = [...new Set(links?.map(link => link.groupname) || [])];
  
  groups.forEach(group => {
    let groupEle = `
<DT><H3>${group}</H3>
<DL><p>
`;
    let contentEle = "";
    links?.forEach(link => {
      if (link.groupname === group && link.url && link.linkname) {
        contentEle += `
<DT><A HREF="${link.url}">${link.linkname}</A>`;
      }
    });
    html += groupEle + contentEle + `
</DL><p>`;
  });
  
  html += `
</DL><p>`;
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="export_${Date.now()}.html"`);
  res.send(html);
});

// 更新单个链接
app.put('/api/links/:id', async (req, res) => {
  const sessionUser = req.session.user;
  if (!sessionUser) {
    return res.status(401).json({ error: '未登录' });
  }
  
  const { error } = await db.updateLink(sessionUser, req.params.id, req.body);
  
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  res.json({ success: true });
});

app.listen(config.server.port, () => {
  console.log(`Server running on port ${config.server.port}`);
});