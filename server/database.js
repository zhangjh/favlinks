import crypto from 'crypto';
import { config } from './config.js';

async function d1Request(endpoint, method = 'GET', params = {}) {
  const url = new URL(endpoint, config.d1.apiBase);
  
  const options = {
    method,
    headers: {
      'token': config.d1.token,
      'Content-Type': 'application/json'
    }
  };

  if (method === 'GET' && Object.keys(params).length > 0) {
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
  } else if (method === 'POST') {
    options.body = JSON.stringify(params);
  }

  try {
    const response = await fetch(url.toString(), options);
    const result = await response.json();
    
    if (!response.ok) {
      return { data: null, error: { message: result.error || '请求失败' } };
    }
    
    return { data: result.data || result, error: null };
  } catch (error) {
    return { data: null, error: { message: error.message } };
  }
}

export const db = {
  async getLinks(username) {
    const { data, error } = await d1Request('/read', 'GET', {
      table: 'links',
      username: username
    });
    
    if (error) return { data: null, error };
    
    const links = Array.isArray(data) ? data : [];
    links.sort((a, b) => {
      const timeA = new Date(a.gmtmodified || 0).getTime();
      const timeB = new Date(b.gmtmodified || 0).getTime();
      return timeA - timeB;
    });
    
    return { data: links, error: null };
  },

  async addLink(username, linkData) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const { data, error } = await d1Request('/create', 'POST', {
      table: 'links',
      id: id,
      username: username,
      groupname: linkData.groupname,
      linkname: linkData.linkname || '',
      url: linkData.url || '',
      gmtcreate: now,
      gmtmodified: now
    });
    
    if (error) return { data: null, error };
    
    return { 
      data: { 
        id, 
        username, 
        ...linkData,
        gmtcreate: now,
        gmtmodified: now
      }, 
      error: null 
    };
  },

  async updateLink(username, linkId, updates) {
    const now = new Date().toISOString();
    
    const { data, error } = await d1Request('/update', 'POST', {
      table: 'links',
      id: linkId,
      username: username,
      ...updates,
      gmtmodified: now
    });
    
    if (error) return { data: null, error };
    
    return { data: { id: linkId, ...updates, gmtmodified: now }, error: null };
  },

  async deleteLink(username, linkId) {
    const { error } = await d1Request('/delete', 'GET', {
      table: 'links',
      id: linkId
    });
    
    return { error };
  },

  async getUser(username) {
    const { data, error } = await d1Request('/read', 'GET', {
      table: 'users',
      username: username
    });
    
    if (error) return { data: null, error };
    
    const users = Array.isArray(data) ? data : [];
    const user = users.length > 0 ? users[0] : null;
    
    return { data: user, error: null };
  },

  async createUser(userData) {
    const now = new Date().toISOString();
    
    const { data, error } = await d1Request('/create', 'POST', {
      table: 'users',
      id: userData.id,
      username: userData.username,
      passwd: userData.passwd,
      email: userData.email,
      gmtcreate: now,
      gmtmodified: now
    });
    
    if (error) return { data: null, error };
    
    return { 
      data: { 
        ...userData,
        gmtcreate: now,
        gmtmodified: now
      }, 
      error: null 
    };
  },

  async updateLinksByGroup(username, oldGroupName, newGroupName) {
    const { data: links, error: readError } = await this.getLinks(username);
    
    if (readError) return { data: null, error: readError };
    
    const groupLinks = links.filter(link => link.groupname === oldGroupName);
    
    for (const link of groupLinks) {
      await this.updateLink(username, link.id, { groupname: newGroupName });
    }
    
    return { data: groupLinks, error: null };
  },

  async updateUserPassword(username, newPasswordHash) {
    const now = new Date().toISOString();
    
    const { data: user, error: getUserError } = await this.getUser(username);
    if (getUserError || !user) {
      return { data: null, error: getUserError || { message: '用户不存在' } };
    }
    
    const { data, error } = await d1Request('/update', 'POST', {
      table: 'users',
      id: user.id,
      username: username,
      passwd: newPasswordHash,
      gmtmodified: now
    });
    
    if (error) return { data: null, error };
    
    return { 
      data: { 
        ...user, 
        passwd: newPasswordHash,
        gmtmodified: now
      }, 
      error: null 
    };
  }
};
