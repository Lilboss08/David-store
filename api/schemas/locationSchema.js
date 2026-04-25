import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['state', 'lga'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: function() {
      return this.type === 'lga';
    },
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
locationSchema.index({ type: 1, state: 1, name: 1 });

// Virtual for easier population
locationSchema.virtual('lgas', {
  ref: 'Location',
  localField: 'name',
  foreignField: 'state',
  justOne: false,
  match: { type: 'lga' }
});

export const Location = mongoose.model('Location', locationSchema);