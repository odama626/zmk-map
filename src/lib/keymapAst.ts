import * as A from 'arcsecond';

const whitespace = A.many(A.whitespace);

const keyword = A.sequenceOf([
	A.choice([A.letter, A.digit, A.str('_')]),
	A.many(A.choice([A.letter, A.digit, A.str('_'), A.str('-')]))
]).map((r) => r.flat().join(''));
const layerName = keyword;
const key = keyword;

const betweenQuotes = A.between(A.char('"'))(A.char('"'));

const reservedWord = A.choice([A.str('&caps_word').map((r) => ({ type: r, key: r, raw: r }))]);

const kp = A.sequenceOf([A.str('&kp'), whitespace, key]).map((result) => ({
	type: 'kp',
	key: result[2],
	raw: result.join('')
}));
const lt = A.sequenceOf([A.str('&lt'), whitespace, layerName, whitespace, key]).map((result) => ({
	type: 'lt',
	hold: result[2],
	key: result[4],
	raw: result.join('')
}));

const mt = A.sequenceOf([A.str('&mt'), whitespace, key, whitespace, key]).map((result) => ({
	type: 'mt',
	hold: result[2],
	key: result[4],
	raw: result.join('')
}));

const mo = A.sequenceOf([A.str('&mo'), whitespace, key]).map((result) => ({
	type: 'mo',
	key: result[2],
	raw: result.join('')
}));

const bt = A.sequenceOf([
	A.str('&bt'),
	whitespace,
	A.choice([A.sequenceOf([A.str('BT_SEL'), whitespace, key]), key])
]).map((r) => ({
	type: 'bt',
	key: Array.isArray(r[2]) ? r[2][0] : r[2],
	option: Array.isArray(r[2]) && r[2][2],
	raw: r.join('')
}));

const trans = A.str('&trans').map((r) => ({ type: 'trans', raw: r }));

const namedKeyValue = (name) => (valueParser) =>
	A.sequenceOf([
		whitespace,
		name,
		whitespace,
		A.str('='),
		whitespace,
		valueParser,
		whitespace,
		A.str(';')
	]).map((r) => ({ type: r[1], value: r[5] }));

const namedBlock = (name) => (content) =>
	A.sequenceOf([
		whitespace,
		name,
		whitespace,
		A.between(A.sequenceOf([A.optionalWhitespace, A.char('{'), A.optionalWhitespace]))(
			A.sequenceOf([A.optionalWhitespace, A.char('}'), A.optionalWhitespace])
		)(content),
		whitespace,
		A.str(';')
	]).map((r) => ({ type: 'block', name: r[2], value: r[3] }));

const block = namedBlock(keyword);

const keyValue = namedKeyValue(keyword);

const stringValue = A.sequenceOf([whitespace, betweenQuotes(A.everyCharUntil(A.str('"')))]).map(
	(r) => r[1]
);

function arrayOf(parser) {
	return A.sequenceOf([
		A.str('<'),
		whitespace,
		A.many(A.sequenceOf([parser, whitespace]).map((r) => r[0])),
		whitespace,
		A.str('>'),
		whitespace
		// A.str(';')
	]).map((r) => r[2]);
}

const bindings = namedKeyValue(A.str('bindings'))(arrayOf(A.choice([kp, lt, mt, trans, bt, mo])));

const commentBlock = A.sequenceOf([
	whitespace,
	A.str('/*'),
	A.everyCharUntil(A.str('*/')),
	A.str('*/')
]).map((r) => ({ type: 'commentBlock', value: r[2] }));

const comment = A.sequenceOf([whitespace, A.str('//'), A.everyCharUntil(A.str('\n'))]).map((r) => ({
	type: 'comment',
	value: r[2]
}));

const label = namedKeyValue(A.str('label'))(stringValue);
const compatible = namedKeyValue(A.str('compatible'))(stringValue);

const layerDefinition =
	 block(A.many(A.choice([commentBlock, comment, bindings, label])).map((r) => r.flat())).map((r) => ({
		type: 'layerDefinition',
		name: r.name,
		value: Object.fromEntries(r.value.map((node) => [node.type, node.value])),
		raw: r
	}));

const define = A.sequenceOf([
	whitespace,
	A.str('#define'),
	whitespace,
	keyword,
	whitespace,
	A.digits
]).map((r) => ({
	type: 'define',
	name: r[3],
	value: Number(r[5])
}));

const include = A.sequenceOf([
	whitespace,
	A.str('#include'),
	whitespace,
	A.everyCharUntil(A.str('\n'))
]).map((r) => ({ type: 'include', value: r[2] }));

const keymap = A.sequenceOf([
	whitespace,
	A.str('keymap'),
	whitespace,
	A.str('{'),
	whitespace,
	A.many(A.choice([layerDefinition, compatible, comment])),
	whitespace,
	A.str('}'),
	A.str(';')
]).map((r) => ({
	type: 'keymap',
	value: r[5]
}));

const combo = A.sequenceOf([
	whitespace,
	keyword,
	whitespace,
	A.str('{'),
	A.many(keyValue(arrayOf(A.choice([keyword, A.digits, lt, kp, bt, reservedWord])))).map(
		(r) => r.reduce((a, b) => Object.assign(a, { [b.type]: b.value })),
		{}
	),
	whitespace,
	A.str('}'),
	whitespace,
	A.str(';')
]).map((r) => ({ type: 'combo', value: r[4] }));

const combos = A.sequenceOf([
	whitespace,
	A.str('combos'),
	whitespace,
	A.str('{'),
	whitespace,
	A.many(A.choice([compatible, combo])),
	whitespace,
	A.str('}'),
	whitespace,
	A.str(';')
]).map((r) => ({
	type: 'combos',
	value: r[5]
}));

const config = A.sequenceOf([
	whitespace,
	A.str('/'),
	whitespace,
	A.str('{'),
	whitespace,
	A.many(A.choice([keymap, combos, comment]))
]).map((r) => ({
	type: 'config',
	...Object.fromEntries(r[5].map((r) => [r.type, r.value]))
}));

const keymapFile = A.many(A.choice([define, include, config, commentBlock, comment]));

export const keyboardLayout = A.sequenceOf([
	whitespace,
	A.digits,
	A.str('x'),
	A.digits,
	A.str('+'),
	A.digits
]).map((r) => ({
	height: Number(r[1]),
	width: Number(r[3]),
	thumbs: Number(r[5])
}));

export function parseKeyboardLayout(layout) {
	return keyboardLayout.run(layout);
}

export function parse(input) {
	const output = keymapFile.run(input);


	return output;
}
