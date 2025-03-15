<script lang="ts">
	import { SignIn } from '@auth/sveltekit/components';
	import { page } from '$app/state';
</script>

<main class="flex h-full flex-col items-center justify-center space-y-6">
	<div class="flex items-center space-x-4">
		<SignIn
			provider="twitch"
			signInPage="signin"
			className="rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 text-md h-12 px-4 font-semibold active:scale-[0.98] active:transition-all"
		/>
	</div>

	<nav>
		<img src={page.data.session?.user?.image ?? 'https://i.pravatar.cc/300'} alt="User Avatar" />
	</nav>
</main>
