// Navigation loading state using Svelte 5 runes
import { goto } from "$app/navigation";
import { normalizeUsername, usernamePath } from "$lib/utils/username";

class NavigationState {
  isLoading = $state(false);
  targetUsername = $state<string | null>(null);
  phase = $state<"idle" | "exiting" | "entering">("idle");

  async navigateToProfile(username: string) {
    if (this.isLoading) return;
    const normalizedUsername = normalizeUsername(username);

    this.targetUsername = normalizedUsername;
    this.isLoading = true;
    this.phase = "exiting";

    // Wait for exit animation to complete before navigating
    await new Promise((resolve) => setTimeout(resolve, 700));

    // Navigate to the profile page (skeleton will show while data loads)
    await goto(usernamePath(normalizedUsername));

    // Set entering phase for the new page
    this.phase = "entering";

    // Reset state after enter animation completes
    setTimeout(() => {
      this.phase = "idle";
      this.isLoading = false;
      this.targetUsername = null;
    }, 900);
  }

  profileLoaded() {
    // No longer needed since skeleton handles loading state
    if (this.phase === "exiting") {
      this.phase = "entering";

      // Reset after enter animation completes
      setTimeout(() => {
        this.phase = "idle";
        this.isLoading = false;
        this.targetUsername = null;
      }, 500);
    }
  }

  reset() {
    this.isLoading = false;
    this.targetUsername = null;
    this.phase = "idle";
  }
}

export const navigationState = new NavigationState();
