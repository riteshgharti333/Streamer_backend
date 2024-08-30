import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true // User's name associated with the subscription
  },
  email: { 
    type: String, 
    required: true // User's email associated with the subscription
  },
  customerId: { 
    type: String, 
    required: true // Stripe customer ID or equivalent from your payment provider
  },
  subscriptionId: { 
    type: String, 
    required: true // Stripe subscription ID 
  },
  plan: {
    type: String,
    enum: ['movies', 'web series', 'movies + web series'],
    required: true,
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(value) {
        return this.startDate < value;
      },
      message: 'End date must be after start date',
    },
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active',
  },
  price: { 
    type: Number, 
    required: true 
  },
});

subscriptionSchema.index({ userId: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
