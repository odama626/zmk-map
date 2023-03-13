<script lang="ts">
	import Binding from '$lib/binding.svelte';
	
	import type { PageData } from './$types';

	export let data: PageData;


	const { keyboardLayout, defines = [], layers = [], keyReferences = {}, combos = [] } = data;

	let hideKeys = Object.fromEntries(data.hideKeys.map((v) => [v, true]));


	const style = `
    <style>
      .binding:nth-child(${keyboardLayout.width * 2}n - ${
		keyboardLayout.width - 1
	}):not(:nth-last-child(4)) {
        grid-column: ${keyboardLayout.width + 2};
      }
      .binding:nth-last-child(${keyboardLayout.thumbs}) {
        grid-column: ${keyboardLayout.width + 2};
      }
			.binding:nth-last-child(${keyboardLayout.thumbs * 2}) {
        grid-column: ${keyboardLayout.width - (keyboardLayout.thumbs - 1)} !important;
      }
    </style>
  `;
</script>

{@html style}
<main
	style="
  --width: {keyboardLayout?.width};
  --height: {keyboardLayout?.height};
  --thumb: {keyboardLayout?.thumb};
"
>
	{#if combos.length}
		<h2>Combos</h2>
	{/if}
	<div class="combos">
		{#each combos as combo}
			<div class="combo">
				{#each combo.bindings as binding}
					<Binding {binding}>
						<div class="dots">
							<div class="dot" style="--color: {combo.color};" />
						</div>
					</Binding>
				{/each}
			</div>
		{/each}
	</div>
	{#each layers as layer, layerIndex}
		<h2>
			{defines?.[layerIndex]?.name ?? layer.name}
			<div class="dot" style="--color: {layer.color};" />
		</h2>
		<div class="layer">
			{#each layer.value.bindings as binding, keyIndex}
				<Binding {binding} index={keyIndex} hidden={hideKeys[keyIndex]}>
					<div class="dots">
						{#if keyReferences[`${layerIndex}.${keyIndex}`]}
							{#each keyReferences[`${layerIndex}.${keyIndex}`] as reference}
								<div
									class="dot"
									style="
										--color:{reference.color};
										--border-style:{reference.momentary ? 'dotted' : 'solid'};
									"
								/>
							{/each}
						{/if}
						{#if keyReferences[`${keyIndex}`]}
							{#each keyReferences[`${keyIndex}`] as reference}
								<div class="dot" style="--color:{reference.color}" />
							{/each}
						{/if}
					</div></Binding
				>
			{/each}
		</div>
	{/each}
</main>

<style lang="scss">
	.combos {
		display: flex;
		gap: 2rem;
	}

	h2 {
		display: flex;
		text-align: start;
		align-items: center;
		gap: 1rem;
	}

	.combo {
		position: relative;
		display: flex;
		gap: 1rem;
		align-items: center;
		overflow: hidden;
	}

	.layer {
		display: inline-grid;
		grid-template-columns: repeat(calc(var(--width)), 1fr) 0.5fr repeat(calc(var(--width)), 1fr);
		justify-items: center;
		margin-bottom: 4rem;
		justify-content: center;
		align-items: center;
		align-content: center;
	}

	.dots {
		position: absolute;
		text-align: start;
		width: 100%;
		bottom: 0;
		display: flex;
		flex-direction: column;
	}

	.dot {
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
		background-color: var(--color);
		display: inline-block;
	}

	.combo {
		position: relative;
	}

	.dots .dot {
		width: 100%;
		height: 0px;
		background-color: transparent;
		border-bottom-color: var(--color);
		border-bottom-width: 4px;
		border-bottom-style: var(--border-style, solid);
		border-radius: initial;
		visibility: visible;
	}

	.logo:hover {
		filter: drop-shadow(0 0 2em #646cffaa);
	}
	.logo.svelte:hover {
		filter: drop-shadow(0 0 2em #ff3e00aa);
	}
	.read-the-docs {
		color: #888;
	}
</style>
