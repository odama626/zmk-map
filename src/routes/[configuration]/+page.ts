import type { PageLoad } from './$types';
import { parse, parseKeyboardLayout } from '$lib/keymapAst';
import { getColorForPercentage } from '$lib/color';

export const load = (async ({ params, fetch, route, url }) => {
	const keymapFile = parse(await fetch(url.searchParams.get('keymap')).then((r) => r.text()));

	console.dir({ keymapFile}, { depth: 10})
	const config = keymapFile.result.find((r) => r.type === 'config');
	const defines = keymapFile.result?.filter((r) => r.type === 'define');


	const layerDefinitions = config.keymap?.filter((node) => node.type === 'layerDefinition') ??  [];
	const rawCombos = config.combos?.filter((node) => node.type === 'combo') || [];
	const keyboardLayout = parseKeyboardLayout(params.configuration).result;

	const colorsNeeded = layerDefinitions?.length + rawCombos?.length;
	const keyReferences = {};

	const combos = rawCombos.map(({ value, ...combo }, i, arr) => {
		const keys = value['key-positions']?.map((k) => Number(k));
		const color = getColorForPercentage(i / colorsNeeded);

		keys.forEach((key) => {
			keyReferences[`${key}`] = keyReferences[`${key}`] || [];
			keyReferences[`${key}`].push({
				color,
				keyIndex: key
			});
		});

		return {
			...combo,
			...value,
			keys,
			color
		};
	});

	const layers = layerDefinitions.map((layer, i) => {
		return {
			...layer,
			label: layer.value.label,
			color: getColorForPercentage((i + rawCombos.length) / colorsNeeded)
		};
	});

	layerDefinitions.forEach((layer, layerIndex) =>
		layer.value.bindings.forEach((binding, keyIndex) => {
			if (!['lt', 'mo'].includes(binding.type)) return;
			let index = defines.findIndex((d) => d.name === binding.hold);
			const ref = index > -1 ? index : Number(binding.hold ?? binding.key);
			keyReferences[`${ref}.${keyIndex}`] = keyReferences[`${ref}.${keyIndex}`] || [];
			keyReferences[`${ref}.${keyIndex}`].push({
				...binding,
				keyIndex,
				layerIndex,
				momentary: binding.type === 'mo',
				color: layers[layerIndex].color
			});
		})
	);

	return {
		keyReferences,
		layers,
		combos,
		defines,
		keyboardLayout,
		hideKeys: url.searchParams.has('hidekeys') ? JSON.parse(url.searchParams.get('hidekeys')) : []
	};
}) satisfies PageLoad;
