<script lang="ts">
	import {
		Select,
		type SelectBaseRootPropsWithoutHTML,
		type SelectSingleRootPropsWithoutHTML,
		type WithoutChildren
	} from 'bits-ui';
	import Check from 'phosphor-svelte/lib/Check';
	import DiceSix from 'phosphor-svelte/lib/DiceSix';
	import CaretUpDown from 'phosphor-svelte/lib/CaretUpDown';
	import CaretDoubleUp from 'phosphor-svelte/lib/CaretDoubleUp';
	import CaretDoubleDown from 'phosphor-svelte/lib/CaretDoubleDown';
	import type { Component } from 'svelte';

	type Props = {
		placeholder?: string;
		items: { value: string; label: string; disabled?: boolean; default?: boolean }[];
		contentProps?: WithoutChildren<Select.ContentProps>;
		icon: Component;
		// any other specific component props if needed
	} & WithoutChildren<SelectSingleRootPropsWithoutHTML & SelectBaseRootPropsWithoutHTML>;

	let {
		value = $bindable(),
		items,
		contentProps,
		placeholder,
		icon: SelIcon,
		type,
		...restProps
	}: Props = $props();

	$effect(() => {
		if (items.some((item) => item.default)) {
			value = items.find((item) => item.default)?.value || '';
		}
	});

	const selectedLabel = $derived(items.find((item) => item.value === value)?.label || placeholder);
</script>

<Select.Root type="single" bind:value {...restProps}>
	<Select.Trigger
		class="h-input rounded-9px border-border-input bg-background data-placeholder:text-foreground-alt/50 inline-flex w-[296px] items-center border px-[11px] text-sm transition-colors select-none"
		aria-label={placeholder}
	>
		<SelIcon class="text-muted-foreground mr-[9px] size-6" />
		{selectedLabel}
		<CaretUpDown class="text-muted-foreground ml-auto size-6" />
	</Select.Trigger>
	<Select.Portal>
		<Select.Content
			class="focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 h-96 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] rounded-xl border px-1 py-3 outline-hidden select-none data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
			sideOffset={10}
		>
			<Select.ScrollUpButton class="flex w-full items-center justify-center">
				<CaretDoubleUp class="size-3" />
			</Select.ScrollUpButton>
			<Select.Viewport class="p-1">
				{#each items as item, i (i + item.value)}
					<Select.Item
						class="rounded-button data-highlighted:bg-muted flex h-10 w-full items-center py-3 pr-1.5 pl-5 text-sm capitalize outline-hidden select-none  data-disabled:opacity-50"
						value={item.value}
						label={item.label}
					>
						{#snippet children({ selected })}
							{item.label}
							{#if selected}
								<div class="ml-auto">
									<Check />
								</div>
							{/if}
						{/snippet}
					</Select.Item>
				{/each}
			</Select.Viewport>
			<Select.ScrollDownButton class="flex w-full items-center justify-center">
				<CaretDoubleDown class="size-3" />
			</Select.ScrollDownButton>
		</Select.Content>
	</Select.Portal>
</Select.Root>
