
<script lang='ts'>
	import { keyLookup } from "./keyLookup";


  export let binding;
  export let hidden = false;

  function translateKey(key: string) {
		return keyLookup[key] ?? key;
	}
</script>

<div class="binding" title={binding.raw} data-type={binding.type} data-hide={hidden}>
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