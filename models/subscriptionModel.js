import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  name: { 
    type: String, 
    required: true // Stripe customer ID or equivalent from your payment provider
  },
  email: { 
    type: String, 
    required: true // Stripe customer ID or equivalent from your payment provider
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
    required: true 
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
  // Additional fields if needed
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
