/**
 * Quote Status Workflow State Machine
 * Defines valid status transitions and manages quote lifecycle
 * @module lib/quoteWorkflow
 */

import { QuoteStatus, ActivityType, type Quote } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

export interface StatusTransition {
  from: QuoteStatus | QuoteStatus[];
  to: QuoteStatus;
  action: string;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  allowedRoles?: string[];
}

export interface StatusChangeRecord {
  id: string;
  quoteId: string;
  fromStatus: QuoteStatus;
  toStatus: QuoteStatus;
  changedBy: string;
  changedByName: string;
  changedAt: string;
  comment?: string;
  metadata?: Record<string, unknown>;
}

export interface TransitionResult {
  success: boolean;
  error?: string;
  transition?: StatusChangeRecord;
}

export interface QuoteWithHistory extends Quote {
  statusHistory: StatusChangeRecord[];
}

// ============================================================================
// Valid Status Transitions
// ============================================================================

export const VALID_TRANSITIONS: StatusTransition[] = [
  // Draft transitions
  { 
    from: QuoteStatus.DRAFT, 
    to: QuoteStatus.SENT, 
    action: 'Send Quote',
    requiresConfirmation: false,
  },
  { 
    from: QuoteStatus.DRAFT, 
    to: QuoteStatus.PENDING, 
    action: 'Save as Pending',
    requiresConfirmation: false,
  },
  
  // Pending transitions
  { 
    from: QuoteStatus.PENDING, 
    to: QuoteStatus.SENT, 
    action: 'Send Quote',
    requiresConfirmation: false,
  },
  { 
    from: QuoteStatus.PENDING, 
    to: QuoteStatus.DRAFT, 
    action: 'Move to Draft',
    requiresConfirmation: false,
  },
  
  // Sent transitions
  { 
    from: QuoteStatus.SENT, 
    to: QuoteStatus.VIEWED, 
    action: 'Mark as Viewed',
    requiresConfirmation: false,
  },
  { 
    from: QuoteStatus.SENT, 
    to: QuoteStatus.ACCEPTED, 
    action: 'Mark as Accepted',
    requiresConfirmation: true,
    confirmationMessage: 'Are you sure you want to mark this quote as accepted? This action cannot be undone.',
  },
  { 
    from: QuoteStatus.SENT, 
    to: QuoteStatus.REJECTED, 
    action: 'Mark as Declined',
    requiresConfirmation: true,
    confirmationMessage: 'Are you sure you want to mark this quote as declined? This action cannot be undone.',
  },
  { 
    from: QuoteStatus.SENT, 
    to: QuoteStatus.EXPIRED, 
    action: 'Mark as Expired',
    requiresConfirmation: false,
  },
  { 
    from: QuoteStatus.SENT, 
    to: QuoteStatus.SENT, 
    action: 'Resend Quote',
    requiresConfirmation: false,
  },
  
  // Viewed transitions
  { 
    from: QuoteStatus.VIEWED, 
    to: QuoteStatus.ACCEPTED, 
    action: 'Mark as Accepted',
    requiresConfirmation: true,
    confirmationMessage: 'Are you sure you want to mark this quote as accepted? This action cannot be undone.',
  },
  { 
    from: QuoteStatus.VIEWED, 
    to: QuoteStatus.REJECTED, 
    action: 'Mark as Declined',
    requiresConfirmation: true,
    confirmationMessage: 'Are you sure you want to mark this quote as declined? This action cannot be undone.',
  },
  { 
    from: QuoteStatus.VIEWED, 
    to: QuoteStatus.EXPIRED, 
    action: 'Mark as Expired',
    requiresConfirmation: false,
  },
  
  // Expired transitions (can resend)
  { 
    from: QuoteStatus.EXPIRED, 
    to: QuoteStatus.SENT, 
    action: 'Resend Quote',
    requiresConfirmation: false,
  },
  { 
    from: QuoteStatus.EXPIRED, 
    to: QuoteStatus.DRAFT, 
    action: 'Move to Draft',
    requiresConfirmation: false,
  },
  
  // Rejected transitions (can reopen)
  { 
    from: QuoteStatus.REJECTED, 
    to: QuoteStatus.DRAFT, 
    action: 'Reopen as Draft',
    requiresConfirmation: false,
  },
];

// ============================================================================
// Status Flow Map (for quick lookup)
// ============================================================================

export const STATUS_FLOW: Record<QuoteStatus, QuoteStatus[]> = {
  [QuoteStatus.DRAFT]: [QuoteStatus.SENT, QuoteStatus.PENDING],
  [QuoteStatus.PENDING]: [QuoteStatus.SENT, QuoteStatus.DRAFT],
  [QuoteStatus.SENT]: [QuoteStatus.VIEWED, QuoteStatus.ACCEPTED, QuoteStatus.REJECTED, QuoteStatus.EXPIRED, QuoteStatus.SENT],
  [QuoteStatus.VIEWED]: [QuoteStatus.ACCEPTED, QuoteStatus.REJECTED, QuoteStatus.EXPIRED],
  [QuoteStatus.ACCEPTED]: [],
  [QuoteStatus.REJECTED]: [QuoteStatus.DRAFT],
  [QuoteStatus.EXPIRED]: [QuoteStatus.SENT, QuoteStatus.DRAFT],
  [QuoteStatus.CONVERTED]: [],
};

// ============================================================================
// Status Metadata
// ============================================================================

export const STATUS_METADATA: Record<QuoteStatus, {
  label: string;
  description: string;
  color: string;
  icon: string;
  isFinal: boolean;
  canEdit: boolean;
}> = {
  [QuoteStatus.DRAFT]: {
    label: 'Draft',
    description: 'Quote is being prepared',
    color: 'bg-slate-500',
    icon: 'PencilIcon',
    isFinal: false,
    canEdit: true,
  },
  [QuoteStatus.PENDING]: {
    label: 'Pending',
    description: 'Quote is ready to be sent',
    color: 'bg-amber-500',
    icon: 'ClockIcon',
    isFinal: false,
    canEdit: true,
  },
  [QuoteStatus.SENT]: {
    label: 'Sent',
    description: 'Quote has been sent to customer',
    color: 'bg-indigo-500',
    icon: 'PaperAirplaneIcon',
    isFinal: false,
    canEdit: false,
  },
  [QuoteStatus.VIEWED]: {
    label: 'Viewed',
    description: 'Customer has viewed the quote',
    color: 'bg-purple-500',
    icon: 'EyeIcon',
    isFinal: false,
    canEdit: false,
  },
  [QuoteStatus.ACCEPTED]: {
    label: 'Accepted',
    description: 'Quote has been accepted by customer',
    color: 'bg-emerald-500',
    icon: 'CheckCircleIcon',
    isFinal: true,
    canEdit: false,
  },
  [QuoteStatus.REJECTED]: {
    label: 'Declined',
    description: 'Quote has been declined',
    color: 'bg-red-500',
    icon: 'XCircleIcon',
    isFinal: true,
    canEdit: false,
  },
  [QuoteStatus.EXPIRED]: {
    label: 'Expired',
    description: 'Quote has expired',
    color: 'bg-gray-500',
    icon: 'CalendarIcon',
    isFinal: false,
    canEdit: false,
  },
  [QuoteStatus.CONVERTED]: {
    label: 'Converted',
    description: 'Quote converted to order',
    color: 'bg-blue-500',
    icon: 'ShoppingCartIcon',
    isFinal: true,
    canEdit: false,
  },
};

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Check if a status transition is valid
 */
export function isValidTransition(fromStatus: QuoteStatus, toStatus: QuoteStatus): boolean {
  // Same status is always valid (for updates like resend)
  if (fromStatus === toStatus) {
    return VALID_TRANSITIONS.some(t => 
      (Array.isArray(t.from) ? t.from.includes(fromStatus) : t.from === fromStatus) && t.to === toStatus
    );
  }
  
  const validTargets = STATUS_FLOW[fromStatus];
  return validTargets?.includes(toStatus) ?? false;
}

/**
 * Get available transitions from a given status
 */
export function getAvailableTransitions(currentStatus: QuoteStatus): StatusTransition[] {
  return VALID_TRANSITIONS.filter(t => 
    Array.isArray(t.from) ? t.from.includes(currentStatus) : t.from === currentStatus
  );
}

/**
 * Get available next statuses from current status
 */
export function getNextStatuses(currentStatus: QuoteStatus): QuoteStatus[] {
  return STATUS_FLOW[currentStatus] ?? [];
}

/**
 * Validate a transition and return detailed result
 */
export function validateTransition(
  fromStatus: QuoteStatus,
  toStatus: QuoteStatus,
  options?: {
    userRole?: string;
    allowedRoles?: string[];
  }
): TransitionResult {
  // Check if from status is final first
  if (STATUS_METADATA[fromStatus].isFinal && fromStatus !== toStatus) {
    return {
      success: false,
      error: `Cannot transition from final status "${fromStatus}"`,
    };
  }

  // Check if transition exists
  if (!isValidTransition(fromStatus, toStatus)) {
    return {
      success: false,
      error: `Invalid transition from "${fromStatus}" to "${toStatus}"`,
    };
  }

  // Check role permissions if specified
  if (options?.allowedRoles && options?.userRole) {
    if (!options.allowedRoles.includes(options.userRole)) {
      return {
        success: false,
        error: 'You do not have permission to perform this action',
      };
    }
  }

  return { success: true };
}

// ============================================================================
// Transition Creation
// ============================================================================

/**
 * Create a status change record
 */
export function createStatusChangeRecord(
  quoteId: string,
  fromStatus: QuoteStatus,
  toStatus: QuoteStatus,
  changedBy: string,
  changedByName: string,
  comment?: string,
  metadata?: Record<string, unknown>
): StatusChangeRecord {
  return {
    id: generateHistoryId(),
    quoteId,
    fromStatus,
    toStatus,
    changedBy,
    changedByName,
    changedAt: new Date().toISOString(),
    comment,
    metadata,
  };
}

/**
 * Generate a unique ID for status history records
 */
function generateHistoryId(): string {
  return `hist_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// Activity Type Mapping
// ============================================================================

/**
 * Get the activity type for a status change
 */
export function getActivityTypeForStatusChange(status: QuoteStatus): ActivityType {
  const activityMap: Record<QuoteStatus, ActivityType> = {
    [QuoteStatus.DRAFT]: ActivityType.QUOTE_CREATED,
    [QuoteStatus.PENDING]: ActivityType.STATUS_CHANGED,
    [QuoteStatus.SENT]: ActivityType.QUOTE_SENT,
    [QuoteStatus.VIEWED]: ActivityType.QUOTE_VIEWED,
    [QuoteStatus.ACCEPTED]: ActivityType.QUOTE_ACCEPTED,
    [QuoteStatus.REJECTED]: ActivityType.QUOTE_REJECTED,
    [QuoteStatus.EXPIRED]: ActivityType.QUOTE_EXPIRED,
    [QuoteStatus.CONVERTED]: ActivityType.QUOTE_CONVERTED,
  };
  
  return activityMap[status] || ActivityType.STATUS_CHANGED;
}

// ============================================================================
// Status Actions
// ============================================================================

export interface StatusAction {
  id: string;
  label: string;
  status: QuoteStatus;
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  requiresConfirmation: boolean;
  confirmationMessage?: string;
  icon?: string;
}

/**
 * Get available actions for a quote based on its current status
 */
export function getQuoteActions(currentStatus: QuoteStatus): StatusAction[] {
  const transitions = getAvailableTransitions(currentStatus);
  
  return transitions.map((transition, index) => {
    const isReversible = !STATUS_METADATA[transition.to].isFinal;
    
    return {
      id: `action_${transition.to}_${index}`,
      label: transition.action,
      status: transition.to,
      variant: transition.to === QuoteStatus.ACCEPTED 
        ? 'primary' 
        : transition.to === QuoteStatus.REJECTED 
          ? 'danger' 
          : 'secondary',
      requiresConfirmation: transition.requiresConfirmation ?? false,
      confirmationMessage: transition.confirmationMessage,
      icon: STATUS_METADATA[transition.to].icon,
    };
  });
}

// ============================================================================
// Status Helpers
// ============================================================================

/**
 * Check if a quote can be edited
 */
export function canEditQuote(status: QuoteStatus): boolean {
  return STATUS_METADATA[status].canEdit;
}

/**
 * Check if a quote is in a final state
 */
export function isFinalStatus(status: QuoteStatus): boolean {
  return STATUS_METADATA[status].isFinal;
}

/**
 * Get status color class
 */
export function getStatusColorClass(status: QuoteStatus): string {
  return STATUS_METADATA[status]?.color || 'bg-slate-500';
}

/**
 * Get status label
 */
export function getStatusLabel(status: QuoteStatus): string {
  return STATUS_METADATA[status]?.label || status;
}

/**
 * Get status description
 */
export function getStatusDescription(status: QuoteStatus): string {
  return STATUS_METADATA[status]?.description || '';
}

// ============================================================================
// Workflow State Machine
// ============================================================================

export class QuoteWorkflow {
  private history: StatusChangeRecord[] = [];
  
  constructor(
    private quoteId: string,
    private currentStatus: QuoteStatus = QuoteStatus.DRAFT,
    history: StatusChangeRecord[] = []
  ) {
    this.history = [...history];
  }
  
  /**
   * Get current status
   */
  getCurrentStatus(): QuoteStatus {
    return this.currentStatus;
  }
  
  /**
   * Get status history
   */
  getHistory(): StatusChangeRecord[] {
    return [...this.history];
  }
  
  /**
   * Get available transitions
   */
  getAvailableTransitions(): StatusTransition[] {
    return getAvailableTransitions(this.currentStatus);
  }
  
  /**
   * Check if transition is valid
   */
  canTransitionTo(toStatus: QuoteStatus): boolean {
    return isValidTransition(this.currentStatus, toStatus);
  }
  
  /**
   * Perform a status transition
   */
  transition(
    toStatus: QuoteStatus,
    changedBy: string,
    changedByName: string,
    comment?: string,
    metadata?: Record<string, unknown>
  ): TransitionResult {
    const validation = validateTransition(this.currentStatus, toStatus);
    
    if (!validation.success) {
      return validation;
    }
    
    const record = createStatusChangeRecord(
      this.quoteId,
      this.currentStatus,
      toStatus,
      changedBy,
      changedByName,
      comment,
      metadata
    );
    
    this.history.push(record);
    this.currentStatus = toStatus;
    
    return {
      success: true,
      transition: record,
    };
  }
  
  /**
   * Get the last status change
   */
  getLastChange(): StatusChangeRecord | undefined {
    return this.history[this.history.length - 1];
  }
  
  /**
   * Get time in current status
   */
  getTimeInCurrentStatus(): number {
    const lastChange = this.getLastChange();
    if (!lastChange) return 0;
    
    return Date.now() - new Date(lastChange.changedAt).getTime();
  }
  
  /**
   * Check if quote has been in status for longer than threshold
   */
  isInStatusLongerThan(thresholdMs: number): boolean {
    return this.getTimeInCurrentStatus() > thresholdMs;
  }
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  QuoteStatus,
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
};
