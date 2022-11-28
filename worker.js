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

const ms = 1
const s = 1000
const gcd = 1500

onmessage = function(e) {
	const abilitys = e.data[0];
	const startTime = e.data[1];
	const endTime = e.data[2];
	const timeStep = e.data[3];
	const spellCDs = e.data[4];
	const spellDmgs = e.data[5];
	const gcdTypes = e.data[6];
	const spellHaste = e.data[7];
	const heroismCastTime = e.data[8];
	const speedPotionCastTime = e.data[9];

	results = []
	for (const prio of permutator(abilitys)) {
		let avrPrioDmg = 0;
		let runs = 0;
		for (let i = startTime; i <= endTime; i+=timeStep) {
	  		avrPrioDmg += runRotation(prio, spellCDs, spellDmgs, gcdTypes, spellHaste, i, heroismCastTime, speedPotionCastTime);
			runs++;
		}
		results.push([avrPrioDmg / runs, prio])
	}
	
	results.sort(function(a, b){return b[0] - a[0]}); 
	resultString = ""
	for (const result of results){
		resultString += result[0].toFixed(4) + ": [" + result[1].toString() + "]\n"; 
	}
	
	postMessage(resultString);
}

function runRotation(prio, spellCDs, spellDmgs, gcdTypes, spellHaste,  fightTime, heroismCastTime, speedPotionCastTime) {
	const currentSpellCds = new Map();
	const spellUsedCount = new Map();
	const spellLastCastAt = new Map();

	for (const ability of prio) {
		currentSpellCds.set(ability, 0)
		spellUsedCount.set(ability, 0)
		spellLastCastAt.set(ability, 0)
	}
	if(prio.includes(Ability.HammerOfWrath)){
		currentSpellCds.set(Ability.HammerOfWrath, Math.trunc((fightTime * (1 - 0.2))));
	}
	
	currentTime = 0;
	
	while(currentTime < fightTime){
		let spellCast = null;
		for (const ability of prio) {
			if(currentSpellCds.get(ability) <= 0) {
				spellUsedCount.set(ability, spellUsedCount.get(ability) + 1)
				spellLastCastAt.set(ability, currentTime)
				currentSpellCds.set(ability, spellCDs.get(ability))
				spellCast = ability
				break;
			}
		}
		
		
		if(spellCast != null){
			let currentGCD = 0
			if(gcdTypes.get(spellCast) === GCDType.Melee){
				currentGCD = gcd
			}else{
				currentSpellHaste = spellHaste
				if(currentTime > heroismCastTime && currentTime <= heroismCastTime + 40 * s){
					currentSpellHaste += 0.3
				}
				if(currentTime > speedPotionCastTime && currentTime <= speedPotionCastTime + 15 * s){
					currentSpellHaste += 0.15249
				}
				currentGCD = Math.max(gcd - (gcd * currentSpellHaste), 1 * s)
			}
			currentTime += currentGCD
			subtractTimeFromCDs(currentSpellCds, currentGCD)
		}else{
			let lowestCd = Math.min(...currentSpellCds.values())
			if(lowestCd > 0){
				currentTime += lowestCd
				subtractTimeFromCDs(currentSpellCds, lowestCd)
			}
		}
	}
	
	if(prio.includes(Ability.Consecration) && spellLastCastAt.get(Ability.Consecration) + spellCDs.get(Ability.Consecration) > fightTime){
		let reduceCast = spellUsedCount.get(Ability.Consecration) - (1 - (fightTime - spellLastCastAt.get(Ability.Consecration)) / spellCDs.get(Ability.Consecration))
		spellUsedCount.set(Ability.Consecration, reduceCast)
	}
	
	let damage = 0
	for (let ability of spellUsedCount.keys()) {
		damage += spellUsedCount.get(ability) * spellDmgs.get(ability)
	}
		
	return damage / (fightTime / s)
}

function subtractTimeFromCDs (currentSpellCds, time) {
	for (let ability of currentSpellCds.keys()) {
		currentSpellCds.set(ability, currentSpellCds.get(ability) - time)
	}
}


function permutator(inputArr) {
  var results = [];

  function permute(arr, memo) {
    var cur, memo = memo || [];

    for (var i = 0; i < arr.length; i++) {
      cur = arr.splice(i, 1);
      if (arr.length === 0) {
        results.push(memo.concat(cur));
      }
      permute(arr.slice(), memo.concat(cur));
      arr.splice(i, 0, cur[0]);
    }

    return results;
  }

  return permute(inputArr);
}