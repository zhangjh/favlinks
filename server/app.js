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
  origin: process.env.NODE_ENV === 'production' ? true : 'http://localhost:5173',
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

// 旧版本加密函数（模拟旧版本crypto.createCipher的实际实现）
function encryptLegacy(str) {
  // 旧版本createCipher使用EVP_BytesToKey进行密钥派生
  const algorithm = 'aes192';
  const password = config.session.secret;
  
  // 使用MD5进行密钥派生，模拟EVP_BytesToKey
  const keySize = 24; // AES-192
  const ivSize = 16;
  const derived = evpBytesToKey(password, null, keySize, ivSize);
  
  const cipher = crypto.createCipheriv('aes-192-cbc', derived.key, derived.iv);
  let enc = cipher.update(str, 'utf8', 'hex');
  enc += cipher.final('hex');
  return enc;
}

// 模拟EVP_BytesToKey算法（旧版本crypto.createCipher使用的密钥派生方法）
function evpBytesToKey(password, salt, keySize, ivSize) {
  const d = [];
  const dLen = keySize + ivSize;
  let d_i = 0;
  
  while (d_i < dLen) {
    const hash = crypto.createHash('md5');
    if (d_i > 0) {
      hash.update(d[d_i - 1]);
    }
    hash.update(password);
    if (salt) {
      hash.update(salt);
    }
    d[d_i] = hash.digest();
    d_i++;
  }
  
  const key = Buffer.concat(d).slice(0, keySize);
  const iv = Buffer.concat(d).slice(keySize, keySize + ivSize);
  
  return { key, iv };
}

// 新版本加密函数
function encrypt(str) {
  const algorithm = 'aes-192-cbc';
  const key = crypto.scryptSync(config.session.secret, 'salt', 24);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let enc = cipher.update(str, 'utf8', 'hex');
  enc += cipher.final('hex');
  
  return 'v2:' + iv.toString('hex') + ':' + enc;
}

function decrypt(str) {
  const algorithm = 'aes-192-cbc';
  const key = crypto.scryptSync(config.session.secret, 'salt', 24);
  
  const textParts = str.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = textParts.join(':');
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let dec = decipher.update(encryptedText, 'hex', 'utf8');
  dec += decipher.final('utf8');
  
  return dec;
}

// 验证密码（兼容新旧版本）
function verifyPassword(inputPassword, storedPassword) {
  try {
    // 检查是否是新版本加密（有v2:前缀）
    if (storedPassword.startsWith('v2:')) {
      // 新版本：解密存储的密码并比较
      try {
        const encryptedPart = storedPassword.substring(3); // 移除v2:前缀
        const decrypted = decrypt(encryptedPart);
        return decrypted === inputPassword;
      } catch (decryptError) {
        console.error('新版本密码解密失败:', decryptError);
        return false;
      }
    } else {
      // 旧版本加密验证
      const legacyEncrypted = encryptLegacy(inputPassword);
      return legacyEncrypted === storedPassword;
    }
  } catch (error) {
    console.error('密码验证失败:', error);
    return false;
  }
}

// 升级密码到新版本加密
function upgradePassword(password) {
  return encrypt(password);
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
  
  const { data: userData } = await db.getUser(user);
  
  if (userData) {
    // 使用兼容验证函数
    if (verifyPassword(rawPasswd, userData.passwd)) {
      // 如果是旧版本密码，升级到新版本
      if (!userData.passwd.startsWith('v2:')) {
        const newEncryptedPassword = upgradePassword(rawPasswd);
        await db.updateUserPassword(user, newEncryptedPassword);
        console.log(`用户 ${user} 的密码已升级到新版本加密`);
      }
      
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

// 在本地开发时启动服务器
if (process.env.NODE_ENV !== 'production') {
  app.listen(config.server.port, () => {
    console.log(`Server running on port ${config.server.port}`);
  });
}

// 为Vercel导出app
export default app;
