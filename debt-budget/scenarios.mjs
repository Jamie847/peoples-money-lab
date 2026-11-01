export const opening=()=>({synthetic:true,date:'2027-01-01',unit:'synthetic units, not dollars',cash:'10',money:{External:'80',Bank:'20'},conversion:'14',policy:{borrowingBan:false,ruleIssuance:true,billsUnderBan:'allowed'},debts:[
  {id:'maturing',holder:'External',principal:'20',maturity:'2027-02-01',coupons:[]},
  {id:'long',holder:'External',principal:'80',maturity:'2030-01-01',coupons:[{date:'2027-01-20',amount:'3'}]},
  {id:'authority',holder:'Authority',principal:'30',maturity:'2030-01-01',coupons:[]},
  {id:'social',holder:'SocialSecurity',principal:'40',maturity:'2030-01-01',excluded:true,coupons:[]},
  {id:'other',holder:'OtherIG',principal:'10',maturity:'2030-01-01',excluded:true,coupons:[]},
  {id:'excluded',holder:'External',principal:'5',maturity:'2030-01-01',excluded:true,coupons:[]}
]});

export function scenario({name='design-borrowing',issuance=10,spendingAllocation=5,ban=false,taxes=10,spending=18,coupon=3,billDemand=8,cancel=false}={}){
  const input=opening();input.policy.borrowingBan=ban;input.policy.ruleIssuance=issuance>0;input.debts.find(d=>d.id==='long').coupons[0].amount=String(coupon);
  const debtAllocation=issuance-spendingAllocation;const borrowing=Math.max(0,spending+coupon+.2+20-10-taxes-issuance);const events=[];
  const add=(type,date,fields={})=>events.push({id:name+'-'+events.length,type,date,...fields});
  if(issuance)add('issue','2027-01-01',{amount:issuance,target:110+issuance,targetVerified:true,allocation:{spending:spendingAllocation,debt:debtAllocation,reserve:0}});
  if(cancel)add('cancel_authority','2027-01-01',{amount:30,instrumentId:'authority',statuteAttested:true});
  add('tax','2027-01-02',{amount:taxes});
  if(borrowing)add('borrow','2027-01-03',{amount:String(Number(borrowing.toFixed(8))),instrument:{id:'new',holder:'External',principal:String(Number(borrowing.toFixed(8))),maturity:'2030-01-01',coupons:[]}});
  if(issuance&&spendingAllocation)add('primary','2027-01-05',{amount:spendingAllocation,funding:'issuance'});
  add('primary','2027-01-05',{amount:spending-(issuance?spendingAllocation:0)});
  add('bill_sale','2027-01-10',{amount:billDemand,settledDemandAttested:true,instrument:{id:'stabilizer',principal:billDemand,maturity:'2027-03-01',coupons:[{date:'2027-03-01',amount:'.2'}]}});
  add('coupon','2027-01-20',{amount:coupon,instrumentId:'long',couponIndex:0});
  add('conversion_payment','2027-01-25',{amount:'.5'});
  if(issuance&&debtAllocation)add('redeem','2027-02-01',{amount:debtAllocation,instrumentId:'maturing',funding:'issuance'});
  add('redeem','2027-02-01',{amount:20-(issuance?debtAllocation:0),instrumentId:'maturing'});
  add('bill_maturity','2027-03-01',{amount:billDemand,instrumentId:'stabilizer'});
  add('bill_coupon','2027-03-01',{amount:'.2',instrumentId:'stabilizer',couponIndex:0});
  return {name,input,events,through:'2027-03-31',assumptions:{synthetic:true,issuance,spendingAllocation,ban,taxes,spending,coupon,billTarget:8,billDemand,billShortfall:8-billDemand,cancel,borrowingRequested:Number(borrowing.toFixed(8)),interestConvention:'Explicit coupon cash inputs; no forecast of future rates',order:'Taxes and purchaser-settled refinancing precede spending; failed obligations remain reported'}};
}
export const scenarios=()=>[
  scenario({name:'baseline-no-rule',issuance:0,spendingAllocation:0}),scenario(),scenario({name:'design-ban',ban:true}),scenario({name:'lower-taxes',taxes:8}),scenario({name:'higher-primary',spending:20}),scenario({name:'higher-coupon',coupon:5}),scenario({name:'lower-bill-demand',billDemand:3}),scenario({name:'all-issuance-to-debt',spendingAllocation:0}),scenario({name:'authority-cancellation',cancel:true})
];
