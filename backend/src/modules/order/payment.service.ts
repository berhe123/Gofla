import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface PaymentIntentResult {
  intentId: string;
  clientSecret: string | null;
  mocked: boolean;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private stripe: Stripe | null = null;
  private readonly enabled: boolean;

  constructor(private readonly config: ConfigService) {
    const key = this.config.get<string>('stripe.secretKey');
    this.enabled = !!key && key.startsWith('sk_') && !key.includes('replace_me');
    if (this.enabled) {
      this.stripe = new Stripe(key as string);
      this.logger.log('Stripe payments enabled');
    } else {
      this.logger.warn('Stripe not configured — using mock payments (auto-succeed)');
    }
  }

  get isEnabled() {
    return this.enabled;
  }

  async createIntent(amount: number, currency: string, metadata: Record<string, string>): Promise<PaymentIntentResult> {
    if (!this.enabled || !this.stripe) {
      return { intentId: `mock_${Date.now()}`, clientSecret: null, mocked: true };
    }
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: { enabled: true },
    });
    return { intentId: intent.id, clientSecret: intent.client_secret, mocked: false };
  }

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    if (!this.stripe) throw new Error('Stripe not configured');
    const secret = this.config.get<string>('stripe.webhookSecret') as string;
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
