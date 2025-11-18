<template>
  <div class="skeleton-loader">
    <!-- Skeleton Cards Grid -->
    <div class="skeleton-grid">
      <div v-for="i in count" :key="i" class="skeleton-card">
        <div class="skeleton-header"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    default: 3
  }
})
</script>

<style scoped>
.skeleton-loader {
  width: 100%;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.skeleton-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.skeleton-header {
  height: 60px;
  background: linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2), rgba(255,255,255,0.1));
  background-size: 200% 100%;
  border-radius: 8px;
  margin-bottom: 1rem;
  animation: shimmer 2s infinite;
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2), rgba(255,255,255,0.1));
  background-size: 200% 100%;
  border-radius: 4px;
  margin-bottom: 0.75rem;
  animation: shimmer 2s infinite;
}

.skeleton-line.short {
  width: 60%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .skeleton-grid {
    grid-template-columns: 1fr;
  }
}
</style>
