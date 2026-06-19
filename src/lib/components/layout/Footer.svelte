<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import { REPO_URL, AUTHOR_GITHUB_URL } from "$lib/constants";

  const currentYear = new Date().getFullYear();
</script>

<footer class="border-t border-border-default bg-bg-primary">
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <!-- Logo & Copyright -->
      <div class="flex items-center gap-2 text-text-secondary">
        <img src={favicon} alt="CheckMyDX" class="h-5 w-5" />
        <span class="text-sm">
          CheckMyDX &copy; {currentYear}
        </span>
      </div>

      <!-- Links -->
      <nav class="flex items-center gap-6">
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          源码
        </a>
      </nav>

      <!-- Social -->
      <div class="flex items-center gap-4">
        <a
          href={AUTHOR_GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="在 GitHub 查看源码"
          class="text-text-tertiary transition-colors hover:text-text-secondary"
        >
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
            />
          </svg>
        </a>
      </div>
    </div>
  </div>
</footer>
