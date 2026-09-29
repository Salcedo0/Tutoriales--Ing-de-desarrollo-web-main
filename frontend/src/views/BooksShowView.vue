<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import BookReviews from '@/components/BookReviews.vue';
import type { BookInterface } from '@/interfaces/BookInterface.js';
import { BookService } from '@/services/BookService.js';
import { describeRequestError } from '@/services/http.js';
import { formatPriceCOP } from '@/utils/format.js';

// `useRoute` is read here and not inside `onMounted`: it is a composable, and
// outside of setup it has no component instance to attach to.
const route = useRoute();
const bookId = Number(route.params.id);

const book = ref<BookInterface | null>(null);
const isLoading = ref(true);
const errorMessage = ref('');

onMounted(async () => {
  try {
    book.value = await BookService.getBookById(bookId);
  } catch (error) {
    errorMessage.value = describeRequestError(error, 'No se pudo cargar el libro.');
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <section v-if="isLoading" class="max-w-7xl mx-auto text-center text-gray-500">
    Loading book…
  </section>

  <section v-else-if="book">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 gap-12">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-md p-8 mb-8">
            <div class="flex items-start space-x-8">
              <div>
                <img
                  src="https://picsum.photos/seed/picsum/536/354"
                  alt="Book Cover"
                  class="object-cover rounded shadow-sm w-72 h-auto"
                />
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-800 mb-6">{{ book.title }}</h2>
                <div class="prose text-gray-600">
                  <p class="mb-4">
                    "{{ book.title }}" is an outstanding work in the {{ book.category }} category.
                    This work is an important part of our collection and has been carefully selected
                    to enrich the reading experience of our users.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-8">
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Book Information</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Title:</span>
                  <span class="font-medium">
                    {{ book.title }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Category:</span>
                  <span class="font-medium">
                    {{ book.category }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Price:</span>
                  <span class="font-medium">{{ formatPriceCOP(book.price) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Stock:</span>
                  <span class="font-medium">
                    {{ book.stock }}
                  </span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <BookReviews :book-id="book.id" />
            </div>

            <div>
              <RouterLink
                to="/books"
                class="inline-block bg-blue-100 hover:bg-blue-200 text-blue-600 font-semibold py-2 px-3 rounded transition duration-300"
              >
                <i class="fas fa-arrow-left mr-2"></i> Back to books
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section v-else class="max-w-7xl mx-auto text-center">
    <h2 class="text-2xl font-bold text-gray-800 mb-4">
      {{ errorMessage || 'Book not found' }}
    </h2>
    <RouterLink
      to="/books"
      class="inline-block bg-blue-100 hover:bg-blue-200 text-blue-600 font-semibold py-2 px-3 rounded transition duration-300"
    >
      <i class="fas fa-arrow-left mr-2"></i> Back to books
    </RouterLink>
  </section>
</template>
