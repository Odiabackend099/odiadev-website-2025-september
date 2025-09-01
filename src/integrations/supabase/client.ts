import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with placeholder values for now
// These will be replaced with actual environment variables at runtime
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://your-project.supabase.co"
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "your-anon-key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string
  email: string
  phone?: string
  full_name?: string
  company?: string
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  user_id: string
  channel: "whatsapp" | "web" | "phone" | "voice"
  status: "active" | "completed" | "archived"
  content: string
  created_at: string
  updated_at: string
}

export interface Analytics {
  id: string
  user_id: string
  event_type: string
  timestamp: string
  metadata: Record<string, any>
}

export const db = {
  users: {
    create: async (data: Partial<User>) => {
      const { data: user, error } = await supabase
        .from("users")
        .insert(data)
        .select()
        .single()
      if (error) throw error
      return user
    },
    getById: async (id: string) => {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single()
      if (error) throw error
      return user
    },
    update: async (id: string, data: Partial<User>) => {
      const { data: user, error } = await supabase
        .from("users")
        .update(data)
        .eq("id", id)
        .select()
        .single()
      if (error) throw error
      return user
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", id)
      if (error) throw error
    },
    getByEmail: async (email: string) => {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single()
      if (error) throw error
      return user
    },
  },
  conversations: {
    create: async (data: Partial<Conversation>) => {
      const { data: conversation, error } = await supabase
        .from("conversations")
        .insert(data)
        .select()
        .single()
      if (error) throw error
      return conversation
    },
    getById: async (id: string) => {
      const { data: conversation, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", id)
        .single()
      if (error) throw error
      return conversation
    },
    update: async (id: string, data: Partial<Conversation>) => {
      const { data: conversation, error } = await supabase
        .from("conversations")
        .update(data)
        .eq("id", id)
        .select()
        .single()
      if (error) throw error
      return conversation
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", id)
      if (error) throw error
    },
    getByUserId: async (userId: string) => {
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
      if (error) throw error
      return conversations
    },
  },
  analytics: {
    create: async (data: Partial<Analytics>) => {
      const { data: analytics, error } = await supabase
        .from("analytics")
        .insert(data)
        .select()
        .single()
      if (error) throw error
      return analytics
    },
    getById: async (id: string) => {
      const { data: analytics, error } = await supabase
        .from("analytics")
        .select("*")
        .eq("id", id)
        .single()
      if (error) throw error
      return analytics
    },
    update: async (id: string, data: Partial<Analytics>) => {
      const { data: analytics, error } = await supabase
        .from("analytics")
        .update(data)
        .eq("id", id)
        .select()
        .single()
      if (error) throw error
      return analytics
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from("analytics")
        .delete()
        .eq("id", id)
      if (error) throw error
    },
    getStats: async (userId: string) => {
      const { data: stats, error } = await supabase
        .from("analytics")
        .select("*")
        .eq("user_id", userId)
      if (error) throw error
      return stats
    },
    track: async (eventType: string, metadata: Record<string, any>) => {
      const { data: analytics, error } = await supabase
        .from("analytics")
        .insert({
          event_type: eventType,
          metadata,
        })
        .select()
        .single()
      if (error) throw error
      return analytics
    },
    getMetrics: async () => {
      const { data: metrics, error } = await supabase
        .from("analytics")
        .select("*")
      if (error) throw error
      return metrics
    },
  },
}

export const auth = {
  signUp: async (email: string, password: string, userData?: Partial<User>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })
    if (error) throw error
    return data
  },
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  },
}

export const realtime = {
  subscribeToConversations: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`conversations:${userId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "conversations",
        filter: `user_id=eq.${userId}`,
      }, callback)
      .subscribe()
  },
  subscribeToAnalytics: (callback: (payload: any) => void) => {
    return supabase
      .channel("analytics")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "analytics",
      }, callback)
      .subscribe()
  },
}
