<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { BookService } from '@/services/BookService.js';
import { describeRequestError } from '@/services/http.js';
import type { BookInterface } from '@/interfaces/BookInterface.js';
import { formatPriceCOP } from '@/utils/format.js';

const books = ref<BookInterface[]>([]);
const selectedCategory = ref('');

// The list no longer lives in the browser, so the states a request can be in
// have to reach the screen. Without them a backend that is down renders an
// empty library, which reads as "there are no books" instead of "it failed".
const isLoading = ref(true);
const isDeleting = ref(false);
const errorMessage = ref('');

// Both derive from the loaded list, so a deleted book updates them.
const categories = computed(() => BookService.getCategories(books.value));
const filteredBooks = computed(() =>
  selectedCategory.value
    ? books.value.filter((book) => book.category === selectedCategory.value)
    : books.value,
);

async function loadBooks() {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    books.value = await BookService.getBooks();
  } catch (error) {
    errorMessage.value = describeRequestError(error, 'No se pudieron cargar los libros.');
  } finally {
    isLoading.value = false;
  }
}

// Assignment from tutorial 04, now against the database through
// `DELETE /api/books/:id` instead of popping an array in memory.
async function deleteLastBook() {
  const lastBook = books.value.at(-1);

  if (!lastBook || isDeleting.value) return;

  isDeleting.value = true;
  errorMessage.value = '';

  try {
    await BookService.deleteBook(lastBook.id);
  } catch (error) {
    errorMessage.value = describeRequestError(error, 'No se pudo borrar el libro.');
  } finally {
    isDeleting.value = false;
    // Reloaded even after a failure: the server is the one that knows what is
    // left, and a double click would otherwise keep asking for a book that is
    // already gone.
    await loadBooks();
  }
}

onMounted(loadBooks);
</script>

<template>
  <section>
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <select
          v-model="selectedCategory"
          aria-label="Filter by category"
          class="border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring focus:border-blue-300"
        >
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>

        <div class="flex gap-3">
          <button
            type="button"
            class="inline-block bg-red-600 text-white font-semibold px-5 py-2 rounded hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="books.length === 0 || isDeleting"
            @click="deleteLastBook"
          >
            <i class="fas fa-trash mr-2"></i>{{ isDeleting ? 'Deleting…' : 'Delete last book' }}
          </button>
          <RouterLink
            to="/books/create"
            class="inline-block bg-blue-600 text-white font-semibold px-5 py-2 rounded hover:bg-blue-700 transition"
            >+ Add Book</RouterLink
          >
        </div>
      </div>

      <p v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 rounded p-4 mb-6">
        {{ errorMessage }}
      </p>

      <p v-if="isLoading" class="text-center text-gray-500">Loading books…</p>

      <!-- `!errorMessage` so a failed request shows only the failure: saying
           "there are no books" next to it states something we do not know. -->
      <p v-else-if="filteredBooks.length === 0 && !errorMessage" class="text-center text-gray-500">
        There are no books to show.
      </p>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="book in filteredBooks" :key="book.id">
          <div
            class="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 p-6 border border-gray-200"
          >
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-xl font-semibold text-gray-800">
                {{ book.title }}
              </h3>
              <span
                v-if="book.stock > 0"
                class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ml-2"
              >
                {{ book.stock }} available
              </span>
              <span v-else class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full ml-2">
                Not available
              </span>
            </div>

            <div class="flex justify-center mb-4">
              <img
                src="https://picsum.photos/seed/picsum/536/354"
                alt="Book Cover"
                class="object-cover rounded shadow-sm w-full h-auto"
              />
            </div>

            <p class="text-gray-500 text-sm mb-3">
              <i class="fas fa-tag mr-2"></i>
              {{ book.category }}
            </p>

            <div class="bg-gray-50 rounded-lg p-3 mb-4">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Price:</span>
                <span class="font-semibold">{{ formatPriceCOP(book.price) }}</span>
              </div>
            </div>

            <div class="flex justify-center">
              <RouterLink
                :to="`/books/${book.id}`"
                class="bg-blue-100 hover:bg-blue-200 text-blue-600 font-semibold py-2 px-3 rounded transition duration-300"
              >
                More info <i class="fas fa-info-circle"></i>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
