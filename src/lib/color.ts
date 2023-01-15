export function getColorForPercentage(percentage: number) {
  // return `hsl(${percentage * 360}, 100%, 50%)`;
  const [h, s, l] = hsv2hsl((percentage * 360) + 80, 100, 85);
  return `hsl(${h}, ${s}%, ${l}%)`
}

export function hsv2hsl(hsvH, hsvS, hsvV) {

	const hslL = (200 - hsvS) * hsvV / 100;

	const [ hslS, hslV ] = [

		hslL === 0 || hslL === 200 ? 0 : hsvS * hsvV / 100 / (hslL <= 100 ? hslL : 200 - hslL) * 100,

		hslL * 5 / 10

	];

	return [ hsvH % 361, hslS, hslV ];

}