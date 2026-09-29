<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { ReviewInterface } from '@/interfaces/ReviewInterface.js';
import { ReviewService } from '@/services/ReviewService.js';
import { describeRequestError } from '@/services/http.js';
import { formatDate } from '@/utils/format.js';

const props = defineProps<{
  bookId: number;
}>();

const reviews = ref<ReviewInterface[]>([]);
const isLoading = ref(true);
const isSubmitting = ref(false);
const errorMessage = ref('');

const rating = ref(5);
const comment = ref('');
const author = ref('');

async function loadReviews() {
  try {
    reviews.value = await ReviewService.getReviewsByBookId(props.bookId);
  } catch (error) {
    errorMessage.value = describeRequestError(error, 'No se pudieron cargar las reseñas.');
  } finally {
    isLoading.value = false;
  }
}

async function submitReview() {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    // `author` is left out when empty instead of sent as "Anonymous": the name
    // is a display decision, and storing it would make an unsigned review
    // indistinguishable from one actually signed "Anonymous".
    const created = await ReviewService.createReview({
      bookId: props.bookId,
      rating: rating.value,
      comment: comment.value.trim(),
      author: author.value.trim() || undefined,
    });

    // The API answers with the saved review, so the list grows without a second
    // round trip — and it goes first because the endpoint sorts newest first.
    reviews.value.unshift(created);

    rating.value = 5;
    comment.value = '';
    author.value = '';
  } catch (error) {
    errorMessage.value = describeRequestError(error, 'No se pudo publicar la reseña.');
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(loadReviews);
</script>

<template>
  <div class="space-y-6">
    <h3 class="text-lg font-semibold text-gray-800">Reviews</h3>

    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Add a review</h4>
      <form class="space-y-3" @submit.prevent="submitReview">
        <div>
          <label for="rating" class="block text-sm text-gray-600 mb-1">Rating</label>
          <select
            id="rating"
            v-model.number="rating"
            class="w-full border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring focus:border-blue-300"
          >
            <option v-for="n in 5" :key="n" :value="n">{{ n }} star{{ n > 1 ? 's' : '' }}</option>
          </select>
        </div>

        <div>
          <label for="comment" class="block text-sm text-gray-600 mb-1">Comment</label>
          <textarea
            id="comment"
            v-model="comment"
            rows="3"
            class="w-full border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Write your review..."
          />
        </div>

        <div>
          <label for="author" class="block text-sm text-gray-600 mb-1">Your name (optional)</label>
          <input
            id="author"
            v-model="author"
            type="text"
            class="w-full border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Name"
          />
        </div>

        <button
          type="submit"
          :disabled="!comment.trim() || isSubmitting"
          class="bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {{ isSubmitting ? 'Posting…' : 'Post review' }}
        </button>
      </form>
    </div>

    <p v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm">
      {{ errorMessage }}
    </p>

    <p v-if="isLoading" class="text-gray-500 text-sm py-4">Loading reviews…</p>

    <ul v-else class="space-y-4">
      <li
        v-for="review in reviews"
        :key="review.id"
        class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
      >
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="font-medium text-gray-800">{{ review.author ?? 'Anonymous' }}</span>
          <span class="text-amber-500 text-sm" :aria-label="`${review.rating} of 5 stars`">
            {{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}
          </span>
        </div>
        <p class="text-gray-600 text-sm whitespace-pre-wrap">{{ review.comment }}</p>
        <p class="text-gray-400 text-xs mt-2">{{ formatDate(review.createdAt) }}</p>
      </li>

      <li v-if="reviews.length === 0" class="text-gray-500 text-sm py-4">
        No reviews yet. Be the first to review!
      </li>
    </ul>
  </div>
</template>
