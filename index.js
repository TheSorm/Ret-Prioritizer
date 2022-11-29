const Ability = {
	Judgement: "Judgement",
	CrusaderStrike: "CrusaderStrike",
	DivineStorm: "DivineStorm",
	HammerOfWrath: "HammerOfWrath",
	Exorcism: "Exorcism",
	Consecration: "Consecration",
	HolyWrath: "HolyWrath"
}

const GCDType = {
	Melee: "Melee",
	Spell: "Spell"
}

//TODO Add Glove Enchant and make haste a list of times and percentages
//TODO Add Multitarget to Cons

const ms = 1
const s = 1000
const gcd = 1500

function findBestPrio() {
	const spellCDs = new Map();
	const spellDmgs = new Map();
	const gcdTypes = new Map();
	const abilitys = [];
	
	let sealOfVengeanceDmg = 0
	if (document.getElementById("SealOfVengeanceEnabled").checked){
		sealOfVengeanceDmg = document.getElementById("SealOfVengeanceAvrCast").valueAsNumber;
	}
	
	let targetCount = document.getElementById("TargetCount").valueAsNumber
	
	let sealOfCommandDmg = 0
	if (document.getElementById("SealOfCommandEnabled").checked){
		sealOfCommandDmg = document.getElementById("SealOfCommandAvrCast").valueAsNumber;
		sealOfCommandDmg -= sealOfCommandDmg * document.getElementById("SealOfCommandMiss").valueAsNumber / 100
	}
	
	if (document.getElementById("JudgementEnabled").checked) {
		abilitys.push(Ability.Judgement);
		spellCDs.set(Ability.Judgement, document.getElementById("JudgementCD").valueAsNumber * s);
		let avrCast = document.getElementById("JudgementAvrCast").valueAsNumber
		let crit = document.getElementById("JudgementCrit").valueAsNumber / 100
		let righteousVengeanceDmg = (avrCast / 3.06) * 2.06 * 0.3
		spellDmgs.set(Ability.Judgement, avrCast + (righteousVengeanceDmg * crit) );
		gcdTypes.set(Ability.Judgement, GCDType.Melee);
	}
	
	if (document.getElementById("CrusaderStrikeEnabled").checked) {
		abilitys.push(Ability.CrusaderStrike);
		spellCDs.set(Ability.CrusaderStrike, document.getElementById("CrusaderStrikeCD").valueAsNumber * s);
		let avrCast = document.getElementById("CrusaderStrikeAvrCast").valueAsNumber
		let crit = document.getElementById("CrusaderStrikeCrit").valueAsNumber / 100
		let righteousVengeanceDmg = (avrCast / 3.06) * 2.06 * 0.3
		let socDmg = sealOfCommandDmg * Math.max(targetCount, 3)
		spellDmgs.set(Ability.CrusaderStrike, avrCast + sealOfVengeanceDmg + socDmg + (righteousVengeanceDmg * crit) );
		gcdTypes.set(Ability.CrusaderStrike, GCDType.Melee);
	}
	
	if (document.getElementById("DivineStormEnabled").checked) {
		abilitys.push(Ability.DivineStorm);
		spellCDs.set(Ability.DivineStorm, document.getElementById("DivineStormCD").valueAsNumber * s);
		let avrCast = document.getElementById("DivineStormAvrCast").valueAsNumber;
		let crit = document.getElementById("DivineStormCrit").valueAsNumber / 100;
		let righteousVengeanceDmg = (avrCast / 3.06) * 2.06 * 0.3
		let socDmg = sealOfCommandDmg * Math.max(targetCount, 4)
		spellDmgs.set(Ability.DivineStorm, avrCast + sealOfVengeanceDmg + socDmg + (righteousVengeanceDmg * crit) );
		gcdTypes.set(Ability.DivineStorm, GCDType.Melee);
	}
	
	if (document.getElementById("HammerOfWrathEnabled").checked) {
		abilitys.push(Ability.HammerOfWrath);
		spellCDs.set(Ability.HammerOfWrath, document.getElementById("HammerOfWrathCD").valueAsNumber * s);
		let avrCast = document.getElementById("HammerOfWrathAvrCast").valueAsNumber;
		let socDmg = sealOfCommandDmg * Math.max(targetCount, 3)
		spellDmgs.set(Ability.HammerOfWrath, avrCast + sealOfVengeanceDmg + socDmg);
		gcdTypes.set(Ability.HammerOfWrath, GCDType.Melee);
	}
	
	if (document.getElementById("ExorcismEnabled").checked) {
		abilitys.push(Ability.Exorcism);
		spellCDs.set(Ability.Exorcism, document.getElementById("ExorcismCD").valueAsNumber * s);
		spellDmgs.set(Ability.Exorcism, document.getElementById("ExorcismAvrCast").valueAsNumber);
		gcdTypes.set(Ability.Exorcism, GCDType.Spell);
	}
	
	if (document.getElementById("ConsecrationEnabled").checked) {
		abilitys.push(Ability.Consecration);
		spellCDs.set(Ability.Consecration, document.getElementById("ConsecrationCD").valueAsNumber * s);
		let avrHit = document.getElementById("ConsecrationAvrHit").valueAsNumber;
		let miss = document.getElementById("ConsecrationMiss").valueAsNumber / 100;
		spellDmgs.set(Ability.Consecration, (avrHit - (avrHit * miss)) * (spellCDs.get(Ability.Consecration) / s) * targetCount);
		gcdTypes.set(Ability.Consecration, GCDType.Spell);
	}
	
	if (document.getElementById("HolyWrathEnabled").checked) {
		abilitys.push(Ability.HolyWrath);
		spellCDs.set(Ability.HolyWrath, document.getElementById("HolyWrathCD").valueAsNumber * s);
		spellDmgs.set(Ability.HolyWrath, document.getElementById("HolyWrathAvrCast").valueAsNumber);
		gcdTypes.set(Ability.HolyWrath, GCDType.Spell);
	}
	let startTime = document.getElementById("MinFightLength").valueAsNumber * s
	let endTime = document.getElementById("MaxFightLength").valueAsNumber * s
	let timeStep = document.getElementById("Timestep").valueAsNumber * s
	let spellHaste = 1 - (document.getElementById("SpellGCD").valueAsNumber / 1.5)
	let heroismCastTime = document.getElementById("HeroismCastTime").valueAsNumber * s
	let speedPotionCastTime = document.getElementById("SpeedPotionCastTime").valueAsNumber * s

	document.getElementById("RunButton").disabled = true;
	
	const prioWorker = new Worker("./worker.js");
	prioWorker.postMessage([abilitys, startTime, endTime, timeStep, spellCDs, spellDmgs, gcdTypes, spellHaste, heroismCastTime, speedPotionCastTime]);
		
	//runRotation([Ability.HammerOfWrath, Ability.Judgement, Ability.CrusaderStrike, Ability.DivineStorm, Ability.Exorcism, Ability.HolyWrath, Ability.Consecration], spellCDs, //spellDmgs, gcdTypes, spellHaste,  180 * s, heroismCastTime, speedPotionCastTime)
	
	prioWorker.onmessage = function(e) {
		document.getElementById('OutputArea').value = e.data;
		document.getElementById("RunButton").disabled = false;
	}
	
}

document.getElementById('SealOfCommandEnabled').addEventListener('change', e => {
    if(e.target.checked){
        document.getElementById('SealOfVengeanceEnabled').checked = false;
    }
});

document.getElementById('SealOfVengeanceEnabled').addEventListener('change', e => {
    if(e.target.checked){
        document.getElementById('SealOfCommandEnabled').checked = false;
    }
});
