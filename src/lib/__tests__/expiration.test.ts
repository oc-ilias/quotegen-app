/**
 * Unit Tests for Quote Expiration Handler
 * @module lib/__tests__/expiration.test
 */

import {
  checkAndExpireQuotes,
  sendExpirationReminders,
  processQuoteExpirations,
  DEFAULT_REMINDER_CONFIG,
  type ReminderConfig,
  type ExpirationResult,
} from '@/lib/expiration';
import { supabase } from '@/lib/supabase';
import { QuoteStatus } from '@/types/quote';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    })),
  },
}));

// Mock email service
jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn().mockResolvedValue({ id: 'email-123' }),
}));

describe('Quote Expiration Handler', () => {
  let mockFrom: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom = supabase.from as jest.Mock;
  });

  describe('DEFAULT_REMINDER_CONFIG', () => {
    test('should have correct default values', () => {
      expect(DEFAULT_REMINDER_CONFIG.enabled).toBe(true);
      expect(DEFAULT_REMINDER_CONFIG.reminderDays).toEqual([7, 3, 1]);
      expect(DEFAULT_REMINDER_CONFIG.fromEmail).toBeDefined();
      expect(DEFAULT_REMINDER_CONFIG.companyName).toBeDefined();
    });
  });

  describe('checkAndExpireQuotes', () => {
    test('should return empty result when no expired quotes', async () => {
      mockFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ error: null }),
        update: jest.fn().mockResolvedValue({ error: null }),
        single: jest.fn().mockReturnThis(),
      }));

      const result = await checkAndExpireQuotes();

      expect(result.expired).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    test('should expire quotes that have passed their expiry date', async () => {
      const mockQuotes = [
        {
          id: 'quote-1',
          quote_number: 'QT-001',
          customer_email: 'test@example.com',
          customer_name: 'Test User',
          expires_at: '2024-01-01T00:00:00Z',
          status: QuoteStatus.SENT,
        },
        {
          id: 'quote-2',
          quote_number: 'QT-002',
          customer_email: 'test2@example.com',
          customer_name: 'Test User 2',
          expires_at: '2024-01-02T00:00:00Z',
          status: QuoteStatus.VIEWED,
        },
      ];

      mockFrom.mockImplementation((table: string) => {
        if (table === 'quotes') {
          return {
            select: jest.fn().mockReturnThis(),
            lt: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockQuotes, error: null }),
            eq: jest.fn().mockReturnThis(),
            insert: jest.fn().mockResolvedValue({ error: null }),
            update: jest.fn().mockReturnThis(),
          };
        }
        if (table === 'quote_status_history') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === 'activities') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
        };
      });

      const result = await checkAndExpireQuotes();

      expect(result.expired).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    test('should handle fetch errors gracefully', async () => {
      mockFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error', code: 'DB_ERROR' } 
        }),
      }));

      const result = await checkAndExpireQuotes();

      expect(result.expired).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Database error');
    });

    test('should continue processing if individual quote fails', async () => {
      const mockQuotes = [
        { id: 'quote-1', quote_number: 'QT-001', status: QuoteStatus.SENT },
        { id: 'quote-2', quote_number: 'QT-002', status: QuoteStatus.SENT },
      ];

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call - fetch quotes
          return {
            select: jest.fn().mockReturnThis(),
            lt: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockQuotes, error: null }),
          };
        }
        // Subsequent calls - simulate failure for first quote
        return {
          insert: jest.fn().mockResolvedValue({ 
            error: callCount === 2 ? { message: 'Insert failed' } : null 
          }),
          update: jest.fn().mockResolvedValue({ error: null }),
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
        };
      });

      const result = await checkAndExpireQuotes();

      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('sendExpirationReminders', () => {
    test('should skip if reminders are disabled', async () => {
      const config: ReminderConfig = { ...DEFAULT_REMINDER_CONFIG, enabled: false };
      
      const result = await sendExpirationReminders(config);

      expect(result.remindersSent).toBe(0);
      expect(mockFrom).not.toHaveBeenCalled();
    });

    test('should send reminders for quotes expiring soon', async () => {
      const mockQuotes = [
        {
          id: 'quote-1',
          quote_number: 'QT-001',
          customer_email: 'test@example.com',
          customer_name: 'Test User',
          title: 'Test Quote',
          total: 1000,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: QuoteStatus.SENT,
        },
      ];

      mockFrom.mockImplementation((table: string) => {
        if (table === 'quotes') {
          return {
            select: jest.fn().mockReturnThis(),
            gte: jest.fn().mockReturnThis(),
            lte: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({ data: mockQuotes, error: null }),
          };
        }
        if (table === 'quote_reminders') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      });

      const result = await sendExpirationReminders(DEFAULT_REMINDER_CONFIG);

      // The implementation loops through reminderDays [7, 3, 1] and counts quotes for each day
      // Since our mock returns the same quotes for all days, count is number of days * quotes
      expect(result.expiringSoon).toBe(3); // 1 quote x 3 reminder days
      expect(result.remindersSent).toBe(3); // Sends for each day (7, 3, 1)
    });

    test('should not send duplicate reminders', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'quote_reminders') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ 
              data: { id: 'reminder-1' }, 
              error: null 
            }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: [{
              id: 'quote-1',
              quote_number: 'QT-001',
              customer_email: 'test@example.com',
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: QuoteStatus.SENT,
            }],
            error: null,
          }),
        };
      });

      const result = await sendExpirationReminders(DEFAULT_REMINDER_CONFIG);

      expect(result.remindersSent).toBe(0);
    });

    test('should handle quotes without customer email', async () => {
      const mockQuotes = [
        {
          id: 'quote-1',
          quote_number: 'QT-001',
          customer_email: null,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: QuoteStatus.SENT,
        },
      ];

      mockFrom.mockImplementation((table: string) => {
        if (table === 'quotes') {
          return {
            select: jest.fn().mockReturnThis(),
            gte: jest.fn().mockReturnThis(),
            lte: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({ data: mockQuotes, error: null }),
          };
        }
        if (table === 'quote_reminders') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
          };
        }
        return { insert: jest.fn().mockResolvedValue({ error: null }) };
      });

      const result = await sendExpirationReminders(DEFAULT_REMINDER_CONFIG);

      // The implementation loops through reminderDays [7, 3, 1] and counts quotes for each day
      expect(result.expiringSoon).toBe(3); // 1 quote x 3 reminder days
      expect(result.remindersSent).toBe(0); // No email sent due to missing customer_email
    });
  });

  describe('processQuoteExpirations', () => {
    test('should combine expiration and reminder results', async () => {
      mockFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
        eq: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ error: null }),
        update: jest.fn().mockResolvedValue({ error: null }),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      }));

      const result = await processQuoteExpirations(DEFAULT_REMINDER_CONFIG);

      expect(result).toHaveProperty('expired');
      expect(result).toHaveProperty('expiringSoon');
      expect(result).toHaveProperty('remindersSent');
      expect(result).toHaveProperty('errors');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle unexpected errors gracefully', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await checkAndExpireQuotes();

      expect(result.expired).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should include error messages in result', async () => {
      mockFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Connection failed', code: 'CONN_ERROR' },
        }),
      }));

      const result = await checkAndExpireQuotes();

      expect(result.errors[0]).toContain('Connection failed');
    });
  });
});
