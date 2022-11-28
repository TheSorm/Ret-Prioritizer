const Ability = {
	Judgement: "Judgement",
	CrusaderStrike: "CrusaderStrike",
	DivineStorm: "DivineStorm",
	HammerOfWrath: "HammerOfWrath",
	Exorcism: "Exorcism",
	Consecration: "Consecration",
	HolyWrath: "HolyWrath"
}

const ms = 1
const s = 1000
const gcd = 1500

function findBestPrio() {
	const spellCDs = new Map();
	const spellDmgs = new Map();
	const spellGcds = new Map();
	const abilitys = [];
	
	let sealOfVengeanceDmg = 0
	if (document.getElementById("SealOfVengeanceEnabled").checked){
		sealOfVengeanceDmg = document.getElementById("SealOfVengeanceAvrCast").valueAsNumber;
	}
	
	if (document.getElementById("JudgementEnabled").checked) {
		abilitys.push(Ability.Judgement);
		spellCDs.set(Ability.Judgement, document.getElementById("JudgementCD").valueAsNumber * s);
		let avrCast = document.getElementById("JudgementAvrCast").valueAsNumber
		let crit = document.getElementById("JudgementCrit").valueAsNumber / 100
		let righteousVengeanceDmg = (avrCast / 3.06) * 2.06 * 0.3
		spellDmgs.set(Ability.Judgement, avrCast + (righteousVengeanceDmg * crit) );
		spellGcds.set(Ability.Judgement, gcd);
	}
	
	if (document.getElementById("CrusaderStrikeEnabled").checked) {
		abilitys.push(Ability.CrusaderStrike);
		spellCDs.set(Ability.CrusaderStrike, document.getElementById("CrusaderStrikeCD").valueAsNumber * s);
		let avrCast = document.getElementById("CrusaderStrikeAvrCast").valueAsNumber
		let crit = document.getElementById("CrusaderStrikeCrit").valueAsNumber / 100
		let righteousVengeanceDmg = (avrCast / 3.06) * 2.06 * 0.3
		spellDmgs.set(Ability.CrusaderStrike, avrCast + sealOfVengeanceDmg + (righteousVengeanceDmg * crit) );
		spellGcds.set(Ability.CrusaderStrike, gcd);
	}
	
	if (document.getElementById("DivineStormEnabled").checked) {
		abilitys.push(Ability.DivineStorm);
		spellCDs.set(Ability.DivineStorm, document.getElementById("DivineStormCD").valueAsNumber * s);
		let avrCast = document.getElementById("DivineStormAvrCast").valueAsNumber;
		let crit = document.getElementById("DivineStormCrit").valueAsNumber / 100;
		let righteousVengeanceDmg = (avrCast / 3.06) * 2.06 * 0.3
		spellDmgs.set(Ability.DivineStorm, avrCast + sealOfVengeanceDmg + (righteousVengeanceDmg * crit) );
		spellGcds.set(Ability.DivineStorm, gcd);
	}
	
	if (document.getElementById("HammerOfWrathEnabled").checked) {
		abilitys.push(Ability.HammerOfWrath);
		spellCDs.set(Ability.HammerOfWrath, document.getElementById("HammerOfWrathCD").valueAsNumber * s);
		let avrCast = document.getElementById("HammerOfWrathAvrCast").valueAsNumber;
		spellDmgs.set(Ability.HammerOfWrath, avrCast + sealOfVengeanceDmg);
		spellGcds.set(Ability.HammerOfWrath, gcd);
	}
	
	if (document.getElementById("ExorcismEnabled").checked) {
		abilitys.push(Ability.Exorcism);
		spellCDs.set(Ability.Exorcism, document.getElementById("ExorcismCD").valueAsNumber * s);
		spellDmgs.set(Ability.Exorcism, document.getElementById("ExorcismAvrCast").valueAsNumber);
		spellGcds.set(Ability.Exorcism, document.getElementById("SpellGCD").valueAsNumber * s);
	}
	
	if (document.getElementById("ConsecrationEnabled").checked) {
		abilitys.push(Ability.Consecration);
		spellCDs.set(Ability.Consecration, document.getElementById("ConsecrationCD").valueAsNumber * s);
		let avrHit = document.getElementById("ConsecrationAvrHit").valueAsNumber;
		let miss = document.getElementById("ConsecrationMiss").valueAsNumber / 100;
		spellDmgs.set(Ability.Consecration, (avrHit - (avrHit * miss)) * (spellCDs.get(Ability.Consecration) / s));
		spellGcds.set(Ability.Consecration, document.getElementById("SpellGCD").valueAsNumber * s);
	}
	
	if (document.getElementById("HolyWrathEnabled").checked) {
		abilitys.push(Ability.HolyWrath);
		spellCDs.set(Ability.HolyWrath, document.getElementById("HolyWrathCD").valueAsNumber * s);
		spellDmgs.set(Ability.HolyWrath, document.getElementById("HolyWrathAvrCast").valueAsNumber);
		spellGcds.set(Ability.HolyWrath, document.getElementById("SpellGCD").valueAsNumber * s);
	}
	let startTime = document.getElementById("MinFightLength").valueAsNumber * s
	let endTime = document.getElementById("MaxFightLength").valueAsNumber * s
	let timeStep = document.getElementById("Timestep").valueAsNumber * s
	
	document.getElementById("RunButton").disabled = true;
	
	const prioWorker = new Worker("./worker.js");
	prioWorker.postMessage([abilitys, startTime, endTime, timeStep, spellCDs, spellDmgs, spellGcds]);
	
	prioWorker.onmessage = function(e) {
		document.getElementById('OutputArea').value = e.data;
		document.getElementById("RunButton").disabled = false;
	}
	
} 
