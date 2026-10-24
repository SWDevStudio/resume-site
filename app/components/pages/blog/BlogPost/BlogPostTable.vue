<template>
  <div
    class="blog-post-table-scroll"
    tabindex="0"
  >
    <table class="blog-post-table">
      <thead>
        <tr>
          <th
            v-for="column in data.columns"
            :key="column"
            class="blog-post-table-head"
            scope="col"
          >
            {{ column }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, rowIndex) in data.rows"
          :key="rowIndex"
        >
          <td
            v-for="(cell, cellIndex) in row"
            :key="cellIndex"
            class="blog-post-table-cell"
          >
            {{ cell }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { BlogPostTableData } from "~/assets/api/types/blog";

defineProps<{
  data: BlogPostTableData;
}>();
</script>

<style src="./BlogPostTable.css" />
