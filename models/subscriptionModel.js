import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  plan: {
    type: String,
    enum: ['movies', 'web series', 'movies + web series'],
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
