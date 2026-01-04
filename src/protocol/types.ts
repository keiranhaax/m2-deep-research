import { z } from 'zod';

export const PhaseSchema = z.enum(['planning', 'researching', 'synthesizing']);
export const StatusSchema = z.enum(['idle', 'working', 'complete', 'error']);
export const ModeSchema = z.enum(['chat', 'plan', 'research']);

// Ready event - sent WITHOUT envelope (per DESIGN.md protocol spec)
export const ReadyEventSchema = z.object({
  type: z.literal('ready'),
  protocolVersion: z.string(),
  capabilities: z.array(ModeSchema),
});

// All other protocol events
export const ProtocolEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('content_delta'), text: z.string() }),
  z.object({ type: z.literal('phase_status'), phase: PhaseSchema, status: StatusSchema }),
  z.object({ type: z.literal('progress'), percent: z.number(), message: z.string() }),
  z.object({ type: z.literal('tool_call'), tool: z.string(), query: z.string() }),
  z.object({
    type: z.literal('tool_result'),
    tool: z.string(),
    success: z.boolean(),
    summary: z.string(),
    artifactId: z.string().optional(),
    error: z.string().optional(),
  }),
  z.object({ type: z.literal('complete') }),
  z.object({ type: z.literal('aborted'), partialSaved: z.boolean() }),
  z.object({ type: z.literal('error'), message: z.string(), recoverable: z.literal(false) }),
  z.object({ type: z.literal('query_history_result'), sessions: z.array(z.any()) }),
  z.object({ type: z.literal('get_session_result'), session: z.any(), messages: z.array(z.any()) }),
  z.object({ type: z.literal('heartbeat_ack') }),
]);

// Envelope wraps events EXCEPT ready (which is sent bare)
export const ProtocolEnvelopeSchema = z.object({
  sessionId: z.string(),
  requestId: z.string(),
  seq: z.number().int().positive(),
  timestamp: z.number(),
  event: ProtocolEventSchema,
});

export type ReadyEvent = z.infer<typeof ReadyEventSchema>;
export type ProtocolEvent = z.infer<typeof ProtocolEventSchema>;
export type ProtocolEnvelope = z.infer<typeof ProtocolEnvelopeSchema>;
export type Mode = z.infer<typeof ModeSchema>;
export type Phase = z.infer<typeof PhaseSchema>;
export type Status = z.infer<typeof StatusSchema>;
