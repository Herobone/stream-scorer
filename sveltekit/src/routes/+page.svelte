<script lang="ts">
	import { goto } from "$app/navigation";
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<div>
	<nav>
		<button 
		class="rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 text-md h-12 px-4 font-semibold active:scale-[0.98] active:transition-all"
		onclick={() => goto('auth/signin')}>Sign In</button>
	</nav>
</div>
