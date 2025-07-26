import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { config } from './config.js';

export const supabase = createClient(config.supabase.url, config.supabase.anonKey);

export const db = {
  async getLinks(username) {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('username', username)
      .order('id', { ascending: true });
    return { data, error };
  },

  async addLink(username, linkData) {
    // 自动生成id
    const id = crypto.randomUUID();
    linkData.id = id;
    linkData.username = username;
    const { data, error } = await supabase
      .from('links')
      .insert(linkData)
      .select()
      .single();
    return { data, error };
  },

  async updateLink(username, linkId, updates) {
    const { data, error } = await supabase
      .from('links')
      .update(updates)
      .eq('id', linkId)
      .eq('username', username)
      .select()
      .single();
    return { data, error };
  },

  async deleteLink(username, linkId) {
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', linkId)
      .eq('username', username);
    return { error };
  },

  async getUser(username) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    return { data, error };
  },

  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    return { data, error };
  },

  async updateLinksByGroup(username, oldGroupName, newGroupName) {
    const { data, error } = await supabase
      .from('links')
      .update({ groupname: newGroupName })
      .eq('username', username)
      .eq('groupname', oldGroupName);
    return { data, error };
  },

  async updateUserPassword(username, newPasswordHash) {
    const { data, error } = await supabase
      .from('users')
      .update({ passwd: newPasswordHash })
      .eq('username', username)
      .select()
      .single();
    return { data, error };
  }
};
