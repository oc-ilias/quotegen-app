/**
 * Unit Tests for Quote Workflow State Machine
 * @module lib/__tests__/quoteWorkflow.test
 */

import {
  VALID_TRANSITIONS,
  STATUS_FLOW,
  STATUS_METADATA,
  isValidTransition,
  validateTransition,
  getAvailableTransitions,
  getNextStatuses,
  createStatusChangeRecord,
  getActivityTypeForStatusChange,
  getQuoteActions,
  canEditQuote,
  isFinalStatus,
  getStatusColorClass,
  getStatusLabel,
  getStatusDescription,
  QuoteWorkflow,
} from '@/lib/quoteWorkflow';
import { QuoteStatus, ActivityType } from '@/types/quote';

describe('Quote Workflow State Machine', () => {
  describe('Constants', () => {
    test('should have valid status transitions defined', () => {
      expect(VALID_TRANSITIONS).toBeDefined();
      expect(VALID_TRANSITIONS.length).toBeGreaterThan(0);
      
      VALID_TRANSITIONS.forEach(transition => {
        expect(transition).toHaveProperty('from');
        expect(transition).toHaveProperty('to');
        expect(transition).toHaveProperty('action');
        expect(Object.values(QuoteStatus)).toContain(transition.to);
      });
    });

    test('should have status flow map for all statuses', () => {
      Object.values(QuoteStatus).forEach(status => {
        expect(STATUS_FLOW[status]).toBeDefined();
        expect(Array.isArray(STATUS_FLOW[status])).toBe(true);
      });
    });

    test('should have metadata for all statuses', () => {
      Object.values(QuoteStatus).forEach(status => {
        expect(STATUS_METADATA[status]).toBeDefined();
        expect(STATUS_METADATA[status]).toHaveProperty('label');
        expect(STATUS_METADATA[status]).toHaveProperty('description');
        expect(STATUS_METADATA[status]).toHaveProperty('color');
        expect(STATUS_METADATA[status]).toHaveProperty('icon');
        expect(STATUS_METADATA[status]).toHaveProperty('isFinal');
        expect(STATUS_METADATA[status]).toHaveProperty('canEdit');
      });
    });
  });

  describe('isValidTransition', () => {
    test('should return true for valid transitions', () => {
      expect(isValidTransition(QuoteStatus.DRAFT, QuoteStatus.SENT)).toBe(true);
      expect(isValidTransition(QuoteStatus.DRAFT, QuoteStatus.PENDING)).toBe(true);
      expect(isValidTransition(QuoteStatus.SENT, QuoteStatus.VIEWED)).toBe(true);
      expect(isValidTransition(QuoteStatus.SENT, QuoteStatus.ACCEPTED)).toBe(true);
      expect(isValidTransition(QuoteStatus.SENT, QuoteStatus.REJECTED)).toBe(true);
      expect(isValidTransition(QuoteStatus.VIEWED, QuoteStatus.ACCEPTED)).toBe(true);
    });

    test('should return false for invalid transitions', () => {
      expect(isValidTransition(QuoteStatus.DRAFT, QuoteStatus.ACCEPTED)).toBe(false);
      expect(isValidTransition(QuoteStatus.ACCEPTED, QuoteStatus.SENT)).toBe(false);
      expect(isValidTransition(QuoteStatus.REJECTED, QuoteStatus.ACCEPTED)).toBe(false);
      expect(isValidTransition(QuoteStatus.EXPIRED, QuoteStatus.ACCEPTED)).toBe(false);
    });

    test('should allow same-status transitions if defined in VALID_TRANSITIONS', () => {
      expect(isValidTransition(QuoteStatus.SENT, QuoteStatus.SENT)).toBe(true); // Resend
    });
  });

  describe('validateTransition', () => {
    test('should return success for valid transitions', () => {
      const result = validateTransition(QuoteStatus.DRAFT, QuoteStatus.SENT);
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should return error for invalid transitions', () => {
      const result = validateTransition(QuoteStatus.DRAFT, QuoteStatus.ACCEPTED);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid transition');
    });

    test('should return error for transitioning from final status', () => {
      const result = validateTransition(QuoteStatus.ACCEPTED, QuoteStatus.SENT);
      expect(result.success).toBe(false);
      expect(result.error).toContain('final status');
    });

    test('should check role permissions when provided', () => {
      const result = validateTransition(QuoteStatus.DRAFT, QuoteStatus.SENT, {
        userRole: 'viewer',
        allowedRoles: ['admin', 'editor'],
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('permission');
    });

    test('should allow transition when user has required role', () => {
      const result = validateTransition(QuoteStatus.DRAFT, QuoteStatus.SENT, {
        userRole: 'admin',
        allowedRoles: ['admin', 'editor'],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('getAvailableTransitions', () => {
    test('should return transitions for draft status', () => {
      const transitions = getAvailableTransitions(QuoteStatus.DRAFT);
      expect(transitions.length).toBeGreaterThan(0);
      
      const actions = transitions.map(t => t.action);
      expect(actions).toContain('Send Quote');
      expect(actions).toContain('Save as Pending');
    });

    test('should return transitions for sent status', () => {
      const transitions = getAvailableTransitions(QuoteStatus.SENT);
      expect(transitions.length).toBeGreaterThan(0);
      
      const actions = transitions.map(t => t.action);
      expect(actions).toContain('Mark as Viewed');
      expect(actions).toContain('Mark as Accepted');
      expect(actions).toContain('Mark as Declined');
    });

    test('should return empty array for final statuses', () => {
      expect(getAvailableTransitions(QuoteStatus.ACCEPTED)).toEqual([]);
      expect(getAvailableTransitions(QuoteStatus.CONVERTED)).toEqual([]);
    });
  });

  describe('getNextStatuses', () => {
    test('should return next possible statuses', () => {
      const nextStatuses = getNextStatuses(QuoteStatus.DRAFT);
      expect(nextStatuses).toContain(QuoteStatus.SENT);
      expect(nextStatuses).toContain(QuoteStatus.PENDING);
    });

    test('should return empty array for final statuses', () => {
      expect(getNextStatuses(QuoteStatus.ACCEPTED)).toEqual([]);
      expect(getNextStatuses(QuoteStatus.CONVERTED)).toEqual([]);
    });
  });

  describe('createStatusChangeRecord', () => {
    test('should create a valid status change record', () => {
      const record = createStatusChangeRecord(
        'quote-123',
        QuoteStatus.DRAFT,
        QuoteStatus.SENT,
        'user-456',
        'John Doe',
        'Sent to customer',
        { notify: true }
      );

      expect(record).toHaveProperty('id');
      expect(record.quoteId).toBe('quote-123');
      expect(record.fromStatus).toBe(QuoteStatus.DRAFT);
      expect(record.toStatus).toBe(QuoteStatus.SENT);
      expect(record.changedBy).toBe('user-456');
      expect(record.changedByName).toBe('John Doe');
      expect(record.comment).toBe('Sent to customer');
      expect(record.metadata).toEqual({ notify: true });
      expect(record).toHaveProperty('changedAt');
      expect(new Date(record.changedAt)).toBeInstanceOf(Date);
    });

    test('should create record without optional fields', () => {
      const record = createStatusChangeRecord(
        'quote-123',
        QuoteStatus.DRAFT,
        QuoteStatus.SENT,
        'user-456',
        'John Doe'
      );

      expect(record.comment).toBeUndefined();
      expect(record.metadata).toBeUndefined();
    });
  });

  describe('getActivityTypeForStatusChange', () => {
    test('should return correct activity types', () => {
      expect(getActivityTypeForStatusChange(QuoteStatus.DRAFT)).toBe(ActivityType.QUOTE_CREATED);
      expect(getActivityTypeForStatusChange(QuoteStatus.SENT)).toBe(ActivityType.QUOTE_SENT);
      expect(getActivityTypeForStatusChange(QuoteStatus.VIEWED)).toBe(ActivityType.QUOTE_VIEWED);
      expect(getActivityTypeForStatusChange(QuoteStatus.ACCEPTED)).toBe(ActivityType.QUOTE_ACCEPTED);
      expect(getActivityTypeForStatusChange(QuoteStatus.REJECTED)).toBe(ActivityType.QUOTE_REJECTED);
      expect(getActivityTypeForStatusChange(QuoteStatus.EXPIRED)).toBe(ActivityType.QUOTE_EXPIRED);
      expect(getActivityTypeForStatusChange(QuoteStatus.CONVERTED)).toBe(ActivityType.QUOTE_CONVERTED);
    });
  });

  describe('getQuoteActions', () => {
    test('should return actions with correct properties', () => {
      const actions = getQuoteActions(QuoteStatus.DRAFT);
      
      actions.forEach(action => {
        expect(action).toHaveProperty('id');
        expect(action).toHaveProperty('label');
        expect(action).toHaveProperty('status');
        expect(action).toHaveProperty('variant');
        expect(action).toHaveProperty('requiresConfirmation');
        expect(['primary', 'secondary', 'danger', 'ghost']).toContain(action.variant);
      });
    });

    test('should mark acceptance/rejection as requiring confirmation', () => {
      const sentActions = getQuoteActions(QuoteStatus.SENT);
      
      const acceptAction = sentActions.find(a => a.status === QuoteStatus.ACCEPTED);
      const rejectAction = sentActions.find(a => a.status === QuoteStatus.REJECTED);
      
      expect(acceptAction?.requiresConfirmation).toBe(true);
      expect(rejectAction?.requiresConfirmation).toBe(true);
    });
  });

  describe('Status Helpers', () => {
    test('canEditQuote should return correct values', () => {
      expect(canEditQuote(QuoteStatus.DRAFT)).toBe(true);
      expect(canEditQuote(QuoteStatus.PENDING)).toBe(true);
      expect(canEditQuote(QuoteStatus.SENT)).toBe(false);
      expect(canEditQuote(QuoteStatus.ACCEPTED)).toBe(false);
    });

    test('isFinalStatus should return correct values', () => {
      expect(isFinalStatus(QuoteStatus.ACCEPTED)).toBe(true);
      expect(isFinalStatus(QuoteStatus.REJECTED)).toBe(true);
      expect(isFinalStatus(QuoteStatus.CONVERTED)).toBe(true);
      expect(isFinalStatus(QuoteStatus.DRAFT)).toBe(false);
      expect(isFinalStatus(QuoteStatus.SENT)).toBe(false);
    });

    test('getStatusColorClass should return a color class', () => {
      const colorClass = getStatusColorClass(QuoteStatus.ACCEPTED);
      expect(colorClass).toContain('bg-');
      expect(colorClass).toContain('500');
    });

    test('getStatusLabel should return readable labels', () => {
      expect(getStatusLabel(QuoteStatus.DRAFT)).toBe('Draft');
      expect(getStatusLabel(QuoteStatus.ACCEPTED)).toBe('Accepted');
      expect(getStatusLabel(QuoteStatus.REJECTED)).toBe('Declined');
    });

    test('getStatusDescription should return descriptions', () => {
      expect(getStatusDescription(QuoteStatus.DRAFT)).toContain('prepared');
      expect(getStatusDescription(QuoteStatus.SENT)).toContain('sent');
    });
  });

  describe('QuoteWorkflow Class', () => {
    let workflow: QuoteWorkflow;

    beforeEach(() => {
      workflow = new QuoteWorkflow('quote-123', QuoteStatus.DRAFT);
    });

    test('should initialize with correct status', () => {
      expect(workflow.getCurrentStatus()).toBe(QuoteStatus.DRAFT);
    });

    test('should perform valid transitions', () => {
      const result = workflow.transition(
        QuoteStatus.SENT,
        'user-456',
        'John Doe',
        'Sent to customer'
      );

      expect(result.success).toBe(true);
      expect(result.transition).toBeDefined();
      expect(workflow.getCurrentStatus()).toBe(QuoteStatus.SENT);
    });

    test('should reject invalid transitions', () => {
      const result = workflow.transition(
        QuoteStatus.ACCEPTED,
        'user-456',
        'John Doe'
      );

      expect(result.success).toBe(false);
      expect(workflow.getCurrentStatus()).toBe(QuoteStatus.DRAFT);
    });

    test('should track history', () => {
      workflow.transition(QuoteStatus.SENT, 'user-1', 'Alice');
      workflow.transition(QuoteStatus.VIEWED, 'system', 'System');
      
      const history = workflow.getHistory();
      expect(history.length).toBe(2);
      expect(history[0].toStatus).toBe(QuoteStatus.SENT);
      expect(history[1].toStatus).toBe(QuoteStatus.VIEWED);
    });

    test('should return available transitions', () => {
      const transitions = workflow.getAvailableTransitions();
      expect(transitions.length).toBeGreaterThan(0);
      expect(transitions.map(t => t.to)).toContain(QuoteStatus.SENT);
    });

    test('should check if transition is possible', () => {
      expect(workflow.canTransitionTo(QuoteStatus.SENT)).toBe(true);
      expect(workflow.canTransitionTo(QuoteStatus.ACCEPTED)).toBe(false);
    });

    test('should track last change', () => {
      workflow.transition(QuoteStatus.SENT, 'user-1', 'Alice');
      
      const lastChange = workflow.getLastChange();
      expect(lastChange).toBeDefined();
      expect(lastChange?.changedByName).toBe('Alice');
    });

    test('should calculate time in current status', () => {
      const time = workflow.getTimeInCurrentStatus();
      expect(time).toBeGreaterThanOrEqual(0);
      expect(typeof time).toBe('number');
    });

    test('should check if in status longer than threshold', () => {
      // New workflow should not be in status longer than 1 hour
      expect(workflow.isInStatusLongerThan(3600000)).toBe(false);
    });

    test('should calculate history correctly', () => {
      workflow.transition(QuoteStatus.SENT, 'user-1', 'Alice', 'First comment');
      workflow.transition(QuoteStatus.ACCEPTED, 'user-2', 'Bob', 'Second comment');
      
      const history = workflow.getHistory();
      expect(history.length).toBe(2);
      expect(history[0].comment).toBe('First comment');
      expect(history[1].comment).toBe('Second comment');
    });
  });
});
