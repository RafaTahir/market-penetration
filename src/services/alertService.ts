import { supabase } from './supabaseClient';

export interface AlertRule {
  id: string;
  user_id: string;
  name: string;
  description: string;
  rule_type: 'price_threshold' | 'competitor_activity' | 'regulatory_change' | 'labor_market' | 'market_entry';
  conditions: Record<string, any>;
  priority: 'critical' | 'high' | 'medium' | 'low';
  is_active: boolean;
  notification_channels: string[];
  last_checked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AlertTriggered {
  id: string;
  rule_id: string;
  user_id: string;
  alert_data: Record<string, any>;
  message: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  is_read: boolean;
  is_actioned: boolean;
  action_taken: string | null;
  triggered_at: string;
  dismissed_at: string | null;
}

export interface AlertTemplate {
  id: string;
  name: string;
  description: string;
  rule_type: 'price_threshold' | 'competitor_activity' | 'regulatory_change' | 'labor_market' | 'market_entry';
  default_conditions: Record<string, any>;
  icon: string;
  color: string;
  category: string;
  created_at: string;
}

class AlertService {
  // ==================== ALERT RULES ====================

  async createAlertRule(
    name: string,
    description: string,
    rule_type: AlertRule['rule_type'],
    conditions: Record<string, any>,
    priority: AlertRule['priority'] = 'medium',
    notification_channels: string[] = ['in_app']
  ): Promise<AlertRule | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('alert_rules')
      .insert({
        user_id: user.id,
        name,
        description,
        rule_type,
        conditions,
        priority,
        notification_channels
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating alert rule:', error);
      return null;
    }

    return data;
  }

  async getUserAlertRules(): Promise<AlertRule[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('alert_rules')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching alert rules:', error);
      return [];
    }

    return data || [];
  }

  async updateAlertRule(
    rule_id: string,
    updates: Partial<Omit<AlertRule, 'id' | 'user_id' | 'created_at'>>
  ): Promise<AlertRule | null> {
    const { data, error } = await supabase
      .from('alert_rules')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', rule_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating alert rule:', error);
      return null;
    }

    return data;
  }

  async deleteAlertRule(rule_id: string): Promise<boolean> {
    const { error } = await supabase
      .from('alert_rules')
      .delete()
      .eq('id', rule_id);

    if (error) {
      console.error('Error deleting alert rule:', error);
      return false;
    }

    return true;
  }

  async toggleAlertRule(rule_id: string, is_active: boolean): Promise<AlertRule | null> {
    return this.updateAlertRule(rule_id, { is_active });
  }

  // ==================== TRIGGERED ALERTS ====================

  async triggerAlert(
    rule_id: string,
    user_id: string,
    message: string,
    priority: AlertTriggered['priority'],
    alert_data: Record<string, any> = {}
  ): Promise<AlertTriggered | null> {
    const { data, error } = await supabase
      .from('alerts_triggered')
      .insert({
        rule_id,
        user_id,
        message,
        priority,
        alert_data
      })
      .select()
      .single();

    if (error) {
      console.error('Error triggering alert:', error);
      return null;
    }

    return data;
  }

  async getUserTriggeredAlerts(includeRead: boolean = true): Promise<AlertTriggered[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
      .from('alerts_triggered')
      .select('*')
      .eq('user_id', user.id);

    if (!includeRead) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query
      .order('triggered_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching triggered alerts:', error);
      return [];
    }

    return data || [];
  }

  async getUnreadAlertCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from('alerts_triggered')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error fetching unread alert count:', error);
      return 0;
    }

    return count || 0;
  }

  async markAlertAsRead(alert_id: string): Promise<boolean> {
    const { error } = await supabase
      .from('alerts_triggered')
      .update({ is_read: true })
      .eq('id', alert_id);

    if (error) {
      console.error('Error marking alert as read:', error);
      return false;
    }

    return true;
  }

  async markAllAlertsAsRead(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('alerts_triggered')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all alerts as read:', error);
      return false;
    }

    return true;
  }

  async dismissAlert(alert_id: string): Promise<boolean> {
    const { error } = await supabase
      .from('alerts_triggered')
      .update({
        dismissed_at: new Date().toISOString()
      })
      .eq('id', alert_id);

    if (error) {
      console.error('Error dismissing alert:', error);
      return false;
    }

    return true;
  }

  async recordAlertAction(alert_id: string, action_taken: string): Promise<boolean> {
    const { error } = await supabase
      .from('alerts_triggered')
      .update({
        is_actioned: true,
        action_taken
      })
      .eq('id', alert_id);

    if (error) {
      console.error('Error recording alert action:', error);
      return false;
    }

    return true;
  }

  // ==================== ALERT TEMPLATES ====================

  async getAlertTemplates(): Promise<AlertTemplate[]> {
    const { data, error } = await supabase
      .from('alert_templates')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching alert templates:', error);
      return [];
    }

    return data || [];
  }

  async getTemplatesByCategory(category: string): Promise<AlertTemplate[]> {
    const { data, error } = await supabase
      .from('alert_templates')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching templates by category:', error);
      return [];
    }

    return data || [];
  }

  async createAlertFromTemplate(
    template_id: string,
    rule_name: string,
    customConditions?: Record<string, any>
  ): Promise<AlertRule | null> {
    const template = await this.getAlertTemplate(template_id);
    if (!template) return null;

    const conditions = {
      ...template.default_conditions,
      ...(customConditions || {})
    };

    return this.createAlertRule(
      rule_name,
      template.description,
      template.rule_type,
      conditions,
      'medium',
      ['in_app']
    );
  }

  private async getAlertTemplate(template_id: string): Promise<AlertTemplate | null> {
    const { data, error } = await supabase
      .from('alert_templates')
      .select('*')
      .eq('id', template_id)
      .single();

    if (error) {
      console.error('Error fetching alert template:', error);
      return null;
    }

    return data;
  }

  // ==================== ALERT STATISTICS ====================

  async getAlertStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const [
      { count: totalRules },
      { count: activeRules },
      { count: unreadAlerts },
      { count: totalAlerts }
    ] = await Promise.all([
      supabase
        .from('alert_rules')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('alert_rules')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true),
      supabase
        .from('alerts_triggered')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false),
      supabase
        .from('alerts_triggered')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
    ]);

    return {
      total_rules: totalRules || 0,
      active_rules: activeRules || 0,
      unread_alerts: unreadAlerts || 0,
      total_alerts: totalAlerts || 0
    };
  }

  async getAlertsByPriority() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};

    const { data } = await supabase
      .from('alerts_triggered')
      .select('priority')
      .eq('user_id', user.id)
      .eq('is_read', false);

    const counts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    (data || []).forEach((alert: any) => {
      counts[alert.priority as keyof typeof counts]++;
    });

    return counts;
  }
}

export default new AlertService();
