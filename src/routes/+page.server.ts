import { promises as fs } from 'fs';
import path from 'path';
import { cwd } from 'process';
import sweph from 'sweph';
import type { PageServerLoad } from './$types';

const jd = 2460686.185035; // Friday	A.D. 2025 January 10	16:26:27.0
const planets = [
	'SE_SUN',
	'SE_MOON',
	'SE_MARS',
	'SE_MERCURY',
	'SE_JUPITER',
	'SE_VENUS',
	'SE_SATURN',
	'SE_TRUE_NODE'
];
const iFlag =
	sweph.constants.SEFLG_SIDEREAL | sweph.constants.SEFLG_TRUEPOS | sweph.constants.SEFLG_SPEED;

async function findFolder(folderName: string, currentPath: string): Promise<string | null> {
	const entries = await fs.readdir(currentPath, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(currentPath, entry.name);
		if (entry.isDirectory()) {
			if (entry.name === folderName) {
				return fullPath;
			}
			const result = await findFolder(folderName, fullPath);
			if (result) {
				return result;
			}
		}
	}
	return null;
}

export const load: PageServerLoad = async () => {
	const folderPath = await findFolder('ephe', cwd());
	console.log('folderPath', folderPath);

	const version = sweph.version();
	sweph.set_ephe_path('/ephe');
	sweph.set_sid_mode(sweph.constants.SE_SIDM_KRISHNAMURTI_VP291, 0, 0);
	const ayanamsa = sweph.get_ayanamsa_ex_ut(
		jd,
		sweph.constants.SEFLG_SIDEREAL | sweph.constants.SEFLG_NONUT | sweph.constants.SEFLG_TRUEPOS
	).data;
	const planetData = planets.map((planet) => sweph.calc_ut(jd, sweph.constants[planet], iFlag));
	return {
		version,
		ayanamsa,
		planetData,
		folderPath
	};
};
