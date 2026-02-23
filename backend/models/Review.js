import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    itemId: {
        type: String,
        required: true,
        // This will be the TMDB ID or book ID
    },
    itemType: {
        type: String,
        enum: ['movie', 'book'],
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    text: {
        type: String,
        trim: true,
        maxlength: 1000
    }
}, { timestamps: true });

// Ensure a user can only review an item once
reviewSchema.index({ user: 1, itemId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
