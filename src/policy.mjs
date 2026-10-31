import fs from 'node:fs';
const raw=JSON.parse(fs.readFileSync(new URL('../config/policy-0.7.1.json',import.meta.url),'utf8'));
const keys=["annualPathGrowthMaximum", "annualPathGrowthMinimum", "auctionNonClearanceResponse", "billRateKillCriterion", "brakeLambda", "brakeMaximumRatio", "brakeReleaseLogGap", "brakeTriggerLogGap", "calendarConvention", "emergencyExpiryOverhang", "emergencyFacilityCap", "emergencyInitialDays", "emergencyMaximumDays", "facilityMaximumContractDays", "moneyArithmetic", "ordinaryFacilityCap", "priceFeedbackLambda", "quarterEndCashBreachDuringCure", "quartersPerYear", "safeAssetFloorRatio", "supportedInflationTargets", "treasuryDailyRatio", "treasuryMaximumBreachBusinessDays", "treasuryQuarterEndRatio", "version"];
export function validatePolicy(input){
 if(JSON.stringify(Object.keys(input).sort())!==JSON.stringify(keys))throw Error('Unsupported policy fields or missing policy fields');
 const p=structuredClone(input);
 for(const k of ['ordinaryFacilityCap','emergencyFacilityCap','treasuryQuarterEndRatio','treasuryDailyRatio','safeAssetFloorRatio','brakeLambda','priceFeedbackLambda','brakeTriggerLogGap','brakeReleaseLogGap','brakeMaximumRatio','billRateKillCriterion','annualPathGrowthMinimum','annualPathGrowthMaximum'])if(!Number.isFinite(Number(p[k]))||Number(p[k])<0)throw Error(`Invalid policy parameter ${k}`);
 for(const k of ['treasuryMaximumBreachBusinessDays','facilityMaximumContractDays','emergencyInitialDays','emergencyMaximumDays'])if(!Number.isInteger(p[k])||p[k]<=0)throw Error(`Invalid policy duration ${k}`);
 if(p.quartersPerYear!==4)throw Error('Only calendar quarters are implemented');
 if(Number(p.annualPathGrowthMinimum)>Number(p.annualPathGrowthMaximum)||Number(p.ordinaryFacilityCap)>Number(p.emergencyFacilityCap)||p.emergencyInitialDays>p.emergencyMaximumDays)throw Error('Inconsistent policy limits');
 if(JSON.stringify(p.supportedInflationTargets)!=='[0,0.02]')throw Error('Unsupported price-target variants');
 for(const k of ['emergencyExpiryOverhang','auctionNonClearanceResponse','quarterEndCashBreachDuringCure'])if(p[k]!=='POLICY_UNDEFINED')throw Error(`No implemented resolution for ${k}`);
 Object.freeze(p.supportedInflationTargets);return Object.freeze(p);
}
export const POLICY=validatePolicy(raw);
