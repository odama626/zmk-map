<script lang="ts">
	import { keyLookup } from './keyLookup';

	export let binding;
	export let index;
	export let hidden = false;

	function translateKey(key: string) {
		const keys = Array.isArray(key) ? key : [key];
		return keys.map(key => keyLookup[key] ?? key).join(' ');
	}

	function trim(pieces: string[], ...args: string[]): string {
		const text = pieces
			.map((piece, index) => (index < args.length ? [piece, args[index]] : piece))
			.flat()
			.join('');

		const lines = text.split('\n');

		if (!lines[0].length) lines.shift();

		const indentCharCount = lines
			.map((line) => {
				if (!line.length) return Infinity;
				for (let i = 0; i < line.length; i++) {
					if (line[i] !== ' ') return i;
				}
				return line.length;
			})
			.reduce((a, b) => Math.min(a, b));

		return lines.map((line) => line.slice(indentCharCount)).join('\n');
	}

	const title = trim`
     ${binding.raw}

     key position: ${index}`;
</script>

<div class="binding" {title} data-type={binding.type} data-hide={hidden}>
	<slot />
	{#if binding.type !== 'trans'}
		{#if binding.hold}
			<div class="hold">{translateKey(binding.hold)}</div>
		{/if}
		<div>
			{translateKey(binding.key)}
			{#if binding.option}
				{binding.option}
			{/if}
		</div>
	{/if}
</div>

<style lang="scss">
	.binding {
		overflow: hidden;
		border-radius: 4px;
		margin: 4px;
		width: 4rem;
		height: 3rem;
		border: 1px solid;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		position: relative;

		&:hover {
			outline-offset: 1px;
			outline: 1px solid blue;
		}
	}

	.binding[data-hide='true'] {
		visibility: hidden;
	}

	.binding .hold {
		opacity: 50%;
	}
</style>
