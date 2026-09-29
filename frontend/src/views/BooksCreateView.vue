<script setup lang="ts">
import { ref } from 'vue';
import { BookService } from '@/services/BookService.js';
import { describeRequestError } from '@/services/http.js';
import type { CreateBookDTO } from '@/dtos/CreateBookDTO.js';

const title = ref('');
const category = ref('');
const price = ref(0);
const stock = ref(0);
const successMessage = ref('');
const errorMessage = ref('');
const isSubmitting = ref(false);

async function submitForm() {
  if (isSubmitting.value) return;

  const newBook: CreateBookDTO = {
    title: title.value,
    category: category.value,
    price: price.value,
    stock: stock.value,
  };

  isSubmitting.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    await BookService.createBook(newBook);
    successMessage.value = 'Book created successfully!';
    // Cleared only after the API confirmed the book. The tutorial empties the
    // form inside the `try` before checking anything, so a rejected book also
    // takes the text the user had typed.
    title.value = '';
    category.value = '';
    price.value = 0;
    stock.value = 0;
  } catch (error) {
    // The tutorial logs this to the console, where nobody using the page can
    // see it: the form looks like it did nothing at all.
    errorMessage.value = describeRequestError(error, 'No se pudo crear el libro.');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <section class="max-w-2xl mx-auto py-8">
    <h2 class="text-2xl font-bold text-gray-800 mb-8">Create a New Book</h2>
    <form class="bg-white rounded-lg shadow-md p-8 space-y-6" @submit.prevent="submitForm">
      <div>
        <label class="block text-gray-700 font-semibold mb-2" for="title">Title</label>
        <input
          v-model="title"
          type="text"
          name="title"
          id="title"
          class="w-full border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring focus:border-blue-300"
          required
          placeholder="Book Title"
        />
      </div>

      <div>
        <label class="block text-gray-700 font-semibold mb-2" for="category">Category</label>
        <input
          v-model="category"
          type="text"
          name="category"
          id="category"
          class="w-full border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring focus:border-blue-300"
          required
          placeholder="Category"
        />
      </div>

      <div>
        <label class="block text-gray-700 font-semibold mb-2" for="price">Price</label>
        <input
          v-model.number="price"
          type="number"
          min="0"
          step="0.01"
          id="price"
          class="w-full border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring focus:border-blue-300"
          required
          placeholder="0.00"
        />
      </div>

      <div>
        <label class="block text-gray-700 font-semibold mb-2" for="stock">Stock</label>
        <input
          v-model.number="stock"
          type="number"
          min="0"
          id="stock"
          class="w-full border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring focus:border-blue-300"
          required
          placeholder="0"
        />
      </div>

      <div class="pt-4">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full bg-blue-600 text-white font-semibold py-3 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? 'Creating…' : 'Create Book' }}
        </button>
      </div>

      <p v-if="successMessage" class="text-green-600 mt-4">{{ successMessage }}</p>
      <p
        v-if="errorMessage"
        class="bg-red-50 border border-red-200 text-red-700 rounded p-3 mt-4 text-sm"
      >
        {{ errorMessage }}
      </p>
    </form>

    <div class="mt-6">
      <RouterLink
        to="/books"
        class="inline-block bg-blue-100 hover:bg-blue-200 text-blue-600 font-semibold py-2 px-3 rounded transition duration-300"
      >
        <i class="fas fa-arrow-left mr-2"></i> Back to books
      </RouterLink>
    </div>
  </section>
</template>
