// ═══════════════════════════════════════
// COMPOUND LIBRARY DATABASE
// Full reference data from Notion export
// ═══════════════════════════════════════

const LIBRARY_DATA = [
  {
    name: '5-amino-1MQ',
    halfLifeHours: 7,
    type: 'Peptide',
    goodWith: ['NAD+'],
    notGoodWith: [],
    benefits: ['Anti-Inflammatory', 'Body Composition', 'Muscle Growth', 'Weight Loss'],
    tags: ['Immune system', 'Muscles', 'Weight Loss'],
    protocols: `Treatment Length: 20-30 days on, followed by 1-2 weeks off

Oral:
• 50-150 mg daily with food
• 150 mg daily, 30 minutes after taking NAD+
• Start with 50 mg and increase if tolerated

Stacking:
• Often stacked with NAD+ (take NAD+ first, wait 30 minutes, then take 5-amino-1MQ)

Special Instructions:
• Take with food to minimize GI side effects
• Cycling is important - do not use continuously
• Works by inhibiting NNMT enzyme to support metabolism`,
    notes: '',
    sideEffects: ['Difficulty Breathing', 'Difficulty Sleeping']
  },
  {
    name: 'AOD-9604',
    halfLifeHours: 0.067,
    type: 'Peptide',
    goodWith: [],
    notGoodWith: [],
    benefits: ['Body Composition', 'Bone Health', 'Fat Loss', 'Joint Health', 'Weight Loss'],
    tags: ['Healing', 'Weight Loss'],
    protocols: `Treatment Length: Cycle 20 days on, 10 days off for up to 6 months

SQ:
• 300 mcg in the morning while fasted
• 250 mcg twice daily - morning (fasted) and bedtime (1-4 hours after last meal)
• Wait at least 30 minutes after injection before eating

Oral:
• 500 mcg troche dissolved under tongue in the morning on empty stomach

Special Instructions:
• Modified form of Frag 176-191
• May need a month for effects to kick in - use for minimum 3 months`,
    notes: 'AOD stands for Anti Obesity Drug. Modified form of Frag 176-191. May need a month for the effects to kick in. Use for minimum of 3 months.',
    sideEffects: ['Diarrhea', 'Flatulence', 'Headache', 'Increased Appetite', 'Nausea']
  },
  {
    name: 'ARA 290',
    halfLifeHours: 2,
    type: 'Peptide',
    goodWith: [],
    notGoodWith: [],
    benefits: ['Diabetes Management', 'Immune Support', 'Pain Relief', 'Tissue Repair'],
    tags: ['Cognitive function', 'Healing', 'Immune system'],
    protocols: `Treatment Length: 4-5 weeks

SQ:
• 1-5 mg daily
• 2 mg daily is most common dose
• Start with lower dose and titrate up

Special Instructions:
• May appear cloudy when mixed with BAC water (this is normal due to alkaline solubility)
• Best used for tissue repair and pain management`,
    notes: 'Soluble in alkaline solutions. May appear cloudy when mixed with BAC water.',
    sideEffects: ['Elevated Blood Pressure', 'Fast Heart Rate', 'Liver Enzyme Elevation', 'Nausea', 'Vomiting']
  },
  {
    name: 'Argireline',
    halfLifeHours: null,
    type: 'Peptide',
    goodWith: ['Snap-8'],
    notGoodWith: [],
    benefits: ['Anti-Aging', 'Skin Health'],
    tags: ['Skin'],
    protocols: `Topical:
• Apply to clean skin 1-2 times daily
• Focus on areas with wrinkles (forehead, around eyes, crow's feet)
• Typically used in concentrations of 5-10%
• Often combined with other peptides like Matrixyl or Snap-8
• Use consistently for 4-12 weeks to see results`,
    notes: '',
    sideEffects: ['Rash', 'Skin Reactions']
  },
  {
    name: 'BPC-157',
    halfLifeHours: 4,
    type: 'Peptide',
    goodWith: ['GHK-Cu', 'TB-500', 'Thymosin Beta-4'],
    notGoodWith: [],
    benefits: ['Anti-Inflammatory', 'Bone Health', 'Cancer Prevention', 'Cardiovascular Health', 'Cognitive Enhancement', 'Gut Health', 'Immune Support', 'Joint Health', 'Mood Enhancement', 'Tissue Repair', 'Wound Healing'],
    tags: ['Bones', 'Focus', 'Healing', 'Immune system', 'Pain'],
    protocols: `Treatment Length: Not for long-term use
• 30 days
• 8 weeks followed by 2-week rest, can repeat cycle if needed

SQ:
• Start with 100 mcg daily to assess tolerance
• 300 mcg daily for general use
• 250 mcg twice daily
• 200-300 mcg twice daily at location of pain/injury

Oral:
• 500 mcg capsules twice daily

IM:
• 150 mcg twice daily at location of pain/injury

Stacking:
• Often combined with TB-500 or Thymosin Beta-4 for enhanced healing

Special Instructions:
• BPC stands for Body Protective Compound
• Can affect mood when taken with SSRIs - discontinue if causes depression or anxiety`,
    notes: 'BPC stands for Body Protective Compound.',
    sideEffects: ['Anxiety', 'Depression', 'Dizziness', 'Elevated Blood Pressure', 'Fatigue', 'Hot Flashes', 'Mood Changes', 'Nausea', 'Vomiting']
  },
  {
    name: 'CJC-1295',
    halfLifeHours: 168,
    type: 'Peptide',
    goodWith: ['Ibutamoren (MK-677)', 'Ipamorelin'],
    notGoodWith: ['Sermorelin', 'Tesamorelin'],
    benefits: ['Bone Health', 'Cognitive Enhancement', 'Energy Boost', 'Immune Support', 'Longevity', 'Muscle Growth', 'Sleep Improvement', 'Wound Healing'],
    tags: ['Bones', 'Cognitive function', 'Energy', 'Healing', 'Immune system', 'Longevity', 'Muscles', 'Sleep'],
    protocols: `Treatment Length: 30 days
Timing: Wait 2-3 hours after eating, don't eat for 30 minutes after injection

CJC-1295 DAC (with Drug Affinity Complex):
SQ:
• 100 mcg twice weekly
• Longer half-life (6-8 days) = less frequent dosing

CJC-1295 no DAC (Modified GRF 1-29):
SQ:
• 200 mcg nightly, 5 nights on/2 nights off
• Shorter half-life (30 minutes) = more frequent dosing

Stacking - CJC-1295 no DAC + Ipamorelin:
SQ:
• 200 mcg/200 mcg nightly, 5 nights on/2 nights off
• 100 mcg/100 mcg is more cost-effective with only marginally less benefit

Special Instructions:
• Human Growth Hormone-Releasing Hormone (GHRH)
• GHRH should be paired with GHRP (like Ipamorelin) for synergistic effect
• Do not stack with Tesamorelin or Sermorelin (all are GHRH analogs)`,
    notes: 'Also known as MOD GRF (1-29). Human growth hormone-releasing hormone (GHRH). GHRH should be paired with GHRP for synergistic effect.',
    sideEffects: ['Decreased Insulin Sensitivity', 'Lethargy', 'Numbness', 'Tingling', 'Tiredness', 'Water Retention']
  },
  {
    name: 'Dihexa',
    halfLifeHours: 3.5,
    type: 'Peptide',
    goodWith: ['Selank', 'Semax'],
    notGoodWith: [],
    benefits: ['Cognitive Enhancement', 'Longevity', 'Neuroprotection', 'Recovery'],
    tags: ['Cognitive function', 'Longevity'],
    protocols: `Treatment Length: Varies (typically 4-12 weeks)

Topical:
• 20 mg/ml twice daily
• 8-45 mg daily
• 10-20 mg applied to inner forearms daily, rub in until fully absorbed
• Apply to clean, dry skin

Oral:
• 1-2 mg daily
• Take on empty stomach for best absorption

Stacking:
• Often combined with Selank and Semax for cognitive enhancement

Special Instructions:
• Potent nootropic peptide
• May cause taste changes and mood effects
• Start with lower dose to assess tolerance`,
    notes: '',
    sideEffects: ['Anxiety', 'Change of Taste', 'Insomnia', 'Irritability', 'Mood Changes', 'Nausea']
  },
  {
    name: 'DSIP',
    halfLifeHours: 0.125,
    type: 'Peptide',
    goodWith: [],
    notGoodWith: [],
    benefits: ['Blood Pressure', 'Cancer Prevention', 'Cardiovascular Health', 'Cognitive Enhancement', 'Diabetes Management', 'Mood Enhancement', 'Pain Relief', 'Sleep Improvement', 'Stress Relief'],
    tags: ['Sleep'],
    protocols: `Treatment Length: Can be used ongoing or cyclically

SQ:
• 100 mcg three hours before bedtime
• 250 mcg at least 2 hours before bedtime
• Up to 450 mcg for those who need higher doses
• Can be given daily, every 3 days, or weekly depending on response

Special Instructions:
• Delta Sleep-Inducing Peptide
• Take on empty stomach for best results
• May help with sleep quality and circadian rhythm`,
    notes: 'Delta Sleep-Inducing Peptide.',
    sideEffects: ['Headache', 'Low Blood Pressure', 'Vagal Reactions', 'Vomiting']
  },
  {
    name: 'Epitalon',
    halfLifeHours: 2.5,
    type: 'Peptide',
    goodWith: ['Thymalin/Thimogen'],
    notGoodWith: [],
    benefits: ['Anti-Aging', 'Cancer Prevention', 'Cardiovascular Health', 'Cognitive Enhancement', 'Diabetes Management', 'Eye Health', 'Immune Support', 'Longevity', 'Sleep Improvement'],
    tags: ['Longevity'],
    protocols: `Important Note: There was a mistranslation between Epithalon and Epithalamin. Epithalamin is an extract of Epithalon and is less concentrated. Original Russian/Ukrainian studies used Epithalamin (10 mg dose). The equivalent Epithalon dose is 100 mcg.

Treatment Length: Typically done in cycles, 1-2 times per year

IM or SQ:
• 100 mcg daily for 10 days, done twice yearly
• 100 mcg every 3rd day until reaching 50 mg total (Ukrainian Protocol)
• 100 mcg every 3 days for 15 days
• 100 mcg three times weekly for 3 weeks, once yearly

Stacking - Epithalon + Thymalin:
IM or SQ:
• 5 mg Thymalin + 5 mg Epithalamin daily for 20 days, repeating every 6 months

Special Instructions:
• Results are long-term and may appear after the cycle is complete`,
    notes: 'Mistranslation between Epithalon and Epithalamin. Epithalamin is an extract of Epitalon and is less concentrated. Long-term results may start showing after the course is done.',
    sideEffects: ['Diarrhea', 'Difficulty Sleeping', 'Fatigue', 'Flu-like Symptoms', 'Headache', 'Irregular Heartbeat', 'Joint Pain', 'Nausea']
  },
  {
    name: 'Frag 176-191',
    halfLifeHours: 0.05,
    type: 'Peptide',
    goodWith: ['MOTS-C'],
    notGoodWith: ['AOD-9604'],
    benefits: ['Bone Health', 'Diabetes Management', 'Fat Loss', 'Sleep Improvement'],
    tags: ['Bones', 'Sleep', 'Weight Loss'],
    protocols: `Treatment Length: Cycle 20 days on, 10 days off for up to 6 months

SQ:
• 500 mcg first thing every morning on empty stomach
• Wait 1 hour before eating for optimal absorption
• 250 mcg twice daily (morning and before bed) for higher dose protocol

Special Instructions:
• Real Frag 176-191 is always cloudy when reconstituted - this is normal
• Modified version of amino acids 176-191 of human Growth Hormone
• AOD-9604 is a modified form of Frag 176-191`,
    notes: 'Real Frag is always cloudy. HGH Fragment 176-191 is a modified form of amino acids 176-191 of human Growth Hormone.',
    sideEffects: ['ISR (Injection Site Reaction)', 'Lethargy', 'Sleepiness']
  },
  {
    name: 'GHK-Cu',
    halfLifeHours: 1,
    type: 'Peptide',
    goodWith: ['BPC-157', 'Snap-8'],
    notGoodWith: [],
    benefits: ['Anti-Aging', 'Anti-Inflammatory', 'Cognitive Enhancement', 'Hair Health', 'Neuroprotection', 'Skin Health', 'Stress Relief', 'Wound Healing'],
    tags: ['Immune system', 'Longevity'],
    protocols: `Treatment Length: 6 weeks on, minimum 4 weeks off (can repeat 3-4 times yearly)

SQ:
• 1-2 mg daily for 6 weeks
• Can split dose: 0.5-1 mg morning + 0.5-1 mg evening
• Follow with at least 4 weeks off before repeating

Topical:
• 1-2 pumps daily for 30 days (5% concentration)
• Apply to clean skin, allow to absorb fully

Important Warnings:
• Check for copper allergy before use
• If ISR is more than mild local reaction, discontinue immediately
• Can cause sun sensitivity - use sunscreen
• Lunula of nail may turn blue temporarily (reverses in a few weeks)

Special Instructions:
• Copper-peptide complex
• Often combined with Argireline and Snap-8 for anti-aging skin protocols`,
    notes: '',
    sideEffects: ['Blue Nail Discoloration', 'Copper Allergy', 'Dizziness', 'Fatigue', 'Headache', 'ISR (Injection Site Reaction)', 'Increased Appetite', 'Increased Blood Pressure', 'Nausea', 'Sun Sensitivity']
  },
  {
    name: 'Humanin',
    halfLifeHours: 0.5,
    type: 'Peptide',
    goodWith: ['MOTS-C', 'SS-31'],
    notGoodWith: [],
    benefits: ['Bone Health', 'Cardiovascular Health', 'Diabetes Management', 'Eye Health', 'Kidney Health', 'Longevity', 'Neuroprotection'],
    tags: ['Cognitive function', 'Immune system', 'Longevity', 'Mitochondrial'],
    protocols: `Treatment Length: 30 days per cycle

SQ:
• 1 mg daily (most commonly cited protocol)

Stacking:
• Can stack with MOTS-C after SS-31 cycle
• Often combined with other mitochondrial peptides

Special Instructions:
• Also known as Humanin-HN
• Modified version exists: Humanin-G (HN-G) - dosed in mcg but protocol not clearly established
• Protocol is not firmly established yet`,
    notes: 'Also known as Humanin-HN. Modified version Humanin-G (HN-G) exists. Can stack with MOTS-C after SS-31.',
    sideEffects: []
  },
  {
    name: 'Ipamorelin',
    halfLifeHours: 2,
    type: 'Peptide',
    goodWith: ['CJC-1295', 'Ibutamoren (MK-677)', 'Tesamorelin'],
    notGoodWith: [],
    benefits: ['Anti-Aging', 'Bone Health', 'Collagen Production', 'Fat Loss', 'Immune Support', 'Longevity', 'Muscle Growth', 'Recovery', 'Sleep Improvement'],
    tags: ['Immune system', 'Longevity', 'Muscles', 'Sleep', 'Weight Loss'],
    protocols: `Treatment Length: Maximum 8 weeks on, with equal time off
Timing: Wait 2-3 hours after eating, don't eat for 30 minutes after injection

SQ:
• 200 mcg nightly, 5 nights on/2 nights off
• 200-300 mcg one to three times daily
• Start at lower dose (100 mcg) due to possible allergic reaction
• Inject SLOWLY to minimize side effects

Stacking - Ipamorelin + CJC-1295 no DAC:
SQ:
• 200 mcg/200 mcg nightly, 5 nights on/2 nights off
• 100 mcg/100 mcg is more cost-effective option

Special Instructions:
• Human Growth Hormone Releasing Peptide (GHRP)
• GHRP should be paired with GHRH (CJC-1295 or Tesamorelin) for synergistic effect
• Facial flushing and head rush are common but temporary side effects`,
    notes: 'Human growth hormone releasing peptide (GHRP). GHRP should be paired with GHRH for synergistic effect.',
    sideEffects: ['Facial Flushing', 'Headaches', 'ISR (Injection Site Reaction)', 'Muscle Pain', 'Tachycardia', 'Water Retention']
  },
  {
    name: 'Ibutamoren (MK-677)',
    halfLifeHours: 24,
    type: 'Peptide',
    goodWith: ['Sermorelin', 'CJC-1295', 'Ipamorelin'],
    notGoodWith: [],
    benefits: ['Cognitive Enhancement', 'Energy Boost', 'Fat Loss', 'Joint Health', 'Metabolism', 'Muscle Growth'],
    tags: ['Energy', 'Muscles', 'Sleep'],
    protocols: `Treatment Length: 4-6 weeks on, with at least 4-6 weeks off between cycles

Oral:
• Males: 25 mg daily before bedtime on empty stomach
• Females: 12.5 mg daily before bedtime on empty stomach

Stacking:
• Often combined with Sermorelin (not CJC-1295 DAC)
• Can stack with CJC-1295 no DAC and Ipamorelin

Special Instructions:
• Not a peptide - it's a growth hormone secretagogue
• Can make you extremely hungry - eat protein-rich meals before dosing
• Take at bedtime to minimize daytime hunger
• Do not use continuously - cycling is essential
• Half-life of 24 hours allows once-daily dosing`,
    notes: 'Can make you extremely hungry, so better to eat protein. Not a peptide - it\'s a growth hormone secretagogue.',
    sideEffects: ['Blood Sugar Changes', 'Edema', 'Headaches', 'Increased Appetite', 'Increased Cortisol', 'Increased Insulin', 'Muscle Pain', 'Sleepiness']
  },
  {
    name: 'KPV',
    halfLifeHours: 0.4,
    type: 'Peptide',
    goodWith: [],
    notGoodWith: [],
    benefits: ['Anti-Inflammatory', 'Cancer Prevention', 'Gut Health', 'Immune Support', 'Skin Health', 'Wound Healing'],
    tags: ['Healing', 'Skin'],
    protocols: `Treatment Length: Varies by condition (typically 4-8 weeks)

Oral:
• 500 mcg capsules twice daily
• Best for gut health and systemic anti-inflammatory effects

SQ:
• 200-400 mcg daily
• For localized inflammation or wound healing

Topical:
• KPV (2 mg/g) + Vitamin D3 (1000 IU/g) cream (30 ml TopiClick)
• Apply 0.5 ml to affected area twice daily
• Good for skin conditions and localized inflammation

Special Instructions:
• Tripeptide derived from alpha-MSH
• Excellent for gut health, inflammation, and wound healing
• Well-tolerated with minimal side effects`,
    notes: '',
    sideEffects: ['Diarrhea', 'Headache', 'Nausea', 'Vomiting']
  },
  {
    name: 'LL-37',
    halfLifeHours: 2,
    type: 'Peptide',
    goodWith: [],
    notGoodWith: [],
    benefits: ['Anti-Inflammatory', 'Bone Health', 'Cancer Prevention', 'Cardiovascular Health', 'Immune Support', 'Wound Healing'],
    tags: ['Bones', 'Healing', 'Immune system'],
    protocols: `Treatment Length: 4 weeks maximum

SQ:
• 50-100 mcg daily
• Start at 25-50 mcg to assess tolerance
• Use lowest effective dose

Important Warnings:
• ONLY use when there is active inflammation present
• Not for preventive or long-term use
• Lower doses (25-50 mcg) often sufficient
• Discontinue if side effects occur
• Can potentially worsen autoimmune conditions`,
    notes: '',
    sideEffects: ['Autoimmune Effects', 'Damage to Sperm', 'Depression', 'Increased Inflammation', 'Skin Conditions']
  },
  {
    name: 'Matrixyl',
    halfLifeHours: null,
    type: 'Peptide',
    goodWith: ['Snap-8'],
    notGoodWith: [],
    benefits: ['Anti-Aging', 'Skin Health'],
    tags: ['Skin'],
    protocols: `Treatment Length: Use continuously for best anti-aging results

Topical:
• Use serums or creams containing 2-8% Matrixyl
• 3% concentration is considered optimal
• Apply 1-2 times daily to clean skin
• Focus on areas with wrinkles and fine lines
• Allow to absorb before applying other products

Application Areas:
• Forehead lines
• Crow's feet (around eyes)
• Nasolabial folds (smile lines)
• Neck and decolletage

Stacking:
• Often combined with Argireline and Snap-8 for comprehensive anti-aging
• Can be used with retinoids (apply Matrixyl first, wait 10 min, then retinoid)
• Works well with vitamin C serums

Special Instructions:
• Peptide complex (palmitoyl oligopeptide and palmitoyl tetrapeptide-7)
• Stimulates collagen production
• Results visible after 4-8 weeks of consistent use
• Very well-tolerated, minimal side effects`,
    notes: '',
    sideEffects: []
  },
  {
    name: 'Melanotan 1',
    halfLifeHours: 0.75,
    type: 'Peptide',
    goodWith: [],
    notGoodWith: [],
    benefits: ['Anti-Inflammatory', 'Blood Pressure', 'Cancer Prevention', 'Cardiovascular Health', 'Cognitive Enhancement', 'Fat Loss', 'Neuroprotection', 'Skin Health'],
    tags: ['Cognitive function', 'Immune system'],
    protocols: `Treatment Length: Varies by purpose

For Immunity:
• 200 mcg daily for 6-8 weeks
• Can repeat cycles as needed

For Tanning:
• Loading: 200 mcg once weekly
• Maintenance: 100 mcg twice weekly for stabilization
• Continue maintenance dose until desired tan is achieved

SQ:
• Inject into fatty tissue (abdomen, thigh)
• Rotate injection sites

Special Instructions:
• Also known as Afamelanotide
• Less aggressive than Melanotan 2
• Still causes skin darkening and increased moles/freckles
• Use sunscreen despite tanning effect
• Effects are dose-dependent`,
    notes: '',
    sideEffects: ['Facial Flushing', 'Increased Moles/Freckles', 'Loss of Appetite', 'Nausea', 'Stomach Upset', 'Tiredness', 'Unwanted Tanning', 'Vomiting']
  },
  {
    name: 'MOTS-C',
    halfLifeHours: 3,
    type: 'Peptide',
    goodWith: ['Frag 176-191', 'Humanin', 'SS-31', 'Tesofensine'],
    notGoodWith: [],
    benefits: ['Bone Health', 'Cardiovascular Health', 'Diabetes Management', 'Energy Boost', 'Eye Health', 'Fat Loss', 'Longevity', 'Metabolism'],
    tags: ['Energy', 'Longevity', 'Mitochondrial', 'Weight Loss'],
    protocols: `Treatment Length: 4-6 weeks per cycle

SQ:
• 5 mg three times weekly for 4-6 weeks, then 5 mg once weekly for 4 weeks maintenance
• Can repeat cycle 3-4 times per year
• 10 mg once weekly for up to 10 weeks per year
• 10 mg once weekly for 4 weeks, repeat within 12 months

Stacking:
• Best used AFTER SS-31 cycle
• Often combined with Tesofensine for enhanced metabolic effects

Special Instructions:
• Mitochondrial-derived peptide
• Stands for Mitochondrial Open Reading Frame of the 12S rRNA-c
• Excellent for mitochondrial health and metabolic function
• Cycle after SS-31 for optimal mitochondrial support`,
    notes: 'Cycle after SS-31.',
    sideEffects: ['Blood Sugar Changes', 'Fluid Retention', 'Stomach Upset']
  },
  {
    name: 'NAD+',
    halfLifeHours: 0.02,
    type: 'Peptide',
    goodWith: [],
    notGoodWith: [],
    benefits: ['Anti-Aging', 'Blood Pressure', 'Cardiovascular Health', 'Cognitive Enhancement', 'Energy Boost', 'Immune Support', 'Kidney Health', 'Liver Health', 'Longevity', 'Muscle Growth', 'Weight Loss'],
    tags: ['Cognitive function', 'Immune system', 'Longevity', 'Muscles', 'Weight Loss'],
    protocols: `Treatment Length: Varies (typically done in cycles)

SQ:
• 25-50 mg once or twice weekly (most common)
• 100 mg once weekly for anti-aging
• 200-500 mg once weekly for therapeutic use

IV:
• 250-500 mg per session
• 1-2 times per week
• Often done as part of NAD+ infusion therapy

Oral (Sublingual):
• 50-100 mg daily
• Hold under tongue for maximum absorption

Special Instructions:
• Some protocols recommend cycling: 4-8 weeks on, 2-4 weeks off
• Best taken 30 minutes before 5-amino-1MQ if stacking`,
    notes: 'Nicotinamide Adenine Dinucleotide.',
    sideEffects: ['Decreased Insulin Sensitivity', 'Decreased Phosphorus', 'Decreased Platelets', 'Dizziness', 'Headaches', 'Nausea']
  },
  {
    name: 'PE 22-28',
    halfLifeHours: 1.5,
    type: 'Peptide',
    goodWith: [],
    notGoodWith: [],
    benefits: ['Mood Enhancement'],
    tags: ['Mood'],
    protocols: `Treatment Length: Varies (typically 4-8 weeks for mood support)

Intranasal:
• 400 mcg daily in the morning
• Can be split into 200 mcg twice daily

Special Instructions:
• Synthetic peptide analog of spadin
• Used primarily for mood enhancement and depression
• Take in morning to avoid potential sleep interference`,
    notes: '',
    sideEffects: []
  },
  {
    name: 'Semax',
    halfLifeHours: 0.2,
    type: 'Peptide',
    goodWith: ['Dihexa', 'Selank'],
    notGoodWith: [],
    benefits: ['Cardiovascular Health', 'Cognitive Enhancement', 'Immune Support', 'Mood Enhancement', 'Neuroprotection', 'Wound Healing'],
    tags: ['Cognitive function', 'Mood'],
    protocols: `Treatment Length: Varies (typically 4-12 weeks)

Intranasal:
• 750-1000 mcg daily in the morning
• Most common and convenient route

SQ:
• 100-300 mcg daily in the morning
• Alternative to intranasal if preferred

Stacking:
• Often combined with Selank for enhanced cognitive and mood benefits
• Can stack with Dihexa for neuroprotection

Special Instructions:
• Nootropic peptide derived from ACTH
• Enhances cognitive function and focus
• Higher doses can lead to desensitization - avoid prolonged use at high doses
• May cause hair loss in some users
• Intranasal use can cause nasal cavity discoloration over time`,
    notes: 'Nootropic peptide.',
    sideEffects: ['Blood Sugar Changes', 'Desensitization', 'Hair Loss', 'Nasal Cavity Discoloration']
  },
  {
    name: 'Selank',
    halfLifeHours: 0.4,
    type: 'Peptide',
    goodWith: ['Dihexa', 'Semax'],
    notGoodWith: [],
    benefits: ['Cognitive Enhancement', 'Immune Support', 'Liver Health', 'Stress Relief'],
    tags: ['Cognitive function', 'Immune system'],
    protocols: `Treatment Length: Varies (typically 4-12 weeks)

Intranasal:
• 750-1000 mcg daily in the morning
• Most common and convenient route

SQ:
• 100-300 mcg daily in the morning
• Alternative to intranasal if preferred

Stacking:
• Often combined with Semax for enhanced cognitive benefits
• Can stack with Dihexa for neuroprotection

Special Instructions:
• Synthetic derivative of tuftsin
• Anxiolytic and nootropic properties
• Can be used as antidepressant or for generalized anxiety disorder (GAD)
• Morning dosing recommended
• Well-tolerated with minimal side effects`,
    notes: 'Can be used as an antidepressant, anxiolytic, generalized anxiety disorder (GAD) treatment.',
    sideEffects: ['Dizziness', 'Fatigue', 'Hair Loss', 'Headaches', 'Nasal Irritation', 'Nausea', 'Sore Throat']
  },
  {
    name: 'Sermorelin',
    halfLifeHours: 0.1,
    type: 'Peptide',
    goodWith: ['Ibutamoren (MK-677)'],
    notGoodWith: ['CJC-1295'],
    benefits: ['Cognitive Enhancement', 'Energy Boost', 'Fat Loss', 'Longevity', 'Muscle Growth'],
    tags: ['Cognitive function', 'Longevity', 'Muscles', 'Weight Loss'],
    protocols: `Treatment Length: 30 days to 6 months
Timing: Wait 2-3 hours after eating, don't eat for 30 minutes after injection

SQ:
• 300-500 mcg nightly for 30 days
• Can extend up to 6 months if tolerated well
• Inject before bedtime on empty stomach

Stacking:
• Often combined with Ibutamoren (MK-677) for synergistic GH effects
• Can stack with GHRP peptides like Ipamorelin
• Do NOT stack with CJC-1295 or Tesamorelin (all are GHRH analogs)

Special Instructions:
• Also known as GRF 1-29 or "Old" CJC-1295
• Human Growth Hormone-Releasing Hormone (GHRH)
• Shorter half-life (6 minutes) compared to CJC-1295
• Well-tolerated with minimal side effects`,
    notes: 'Also known as GRF 1-29 ("Old" CJC-1295).',
    sideEffects: []
  },
  {
    name: 'Snap-8',
    halfLifeHours: null,
    type: 'Peptide',
    goodWith: ['Matrixyl', 'GHK-Cu', 'Argireline'],
    notGoodWith: [],
    benefits: ['Anti-Aging', 'Skin Health'],
    tags: ['Skin'],
    protocols: `Treatment Length: Use continuously for best anti-aging results

Topical Preparation:
• Reconstitute 10 mg Snap-8 with 1 ml BAC water
• Let sit for 20+ minutes to fully dissolve
• Add to 30 ml of rich serum or cream base
• Mix thoroughly

Application:
• Apply to areas with wrinkles (forehead, around eyes, mouth)
• Use once or twice daily
• Apply to clean, dry skin
• Allow to absorb before other products

Stacking:
• Often combined with Matrixyl, Argireline, and GHK-Cu for comprehensive anti-aging

Special Instructions:
• Octapeptide that relaxes facial muscles
• Similar mechanism to Botox but topical
• Results take 4-8 weeks of consistent use`,
    notes: 'Can add to serums like Ordinary Buffet, Ordinary Argireline, Olay Regenerist Night Recovery Cream, etc.',
    sideEffects: []
  },
  {
    name: 'SS-31',
    halfLifeHours: 4,
    type: 'Peptide',
    goodWith: ['Humanin', 'MOTS-C', 'Tesofensine'],
    notGoodWith: [],
    benefits: ['Cardiovascular Health', 'Cognitive Enhancement', 'Energy Boost', 'Eye Health', 'Kidney Health', 'Longevity', 'Recovery'],
    tags: ['Focus', 'Healing', 'Longevity', 'Mitochondrial'],
    protocols: `Treatment Length: 10-20 days per cycle

SQ:
• 4 mg daily for 10-20 days (standard protocol)
• Alternative: 2 mg on Day 1, then 4 mg daily for 12 days (total 50 mg)
• Inject in the morning or early afternoon

Stacking:
• Use SS-31 FIRST, then follow with MOTS-C cycle
• Often combined with Humanin for comprehensive mitochondrial support
• Can stack with Tesofensine for metabolic enhancement

Special Instructions:
• Also known as Elamipretide or Bendavia
• Mitochondrial-targeting peptide
• Excellent for mitochondrial health, energy, and recovery
• Protocol order: SS-31 first, then MOTS-C, then Humanin (optional)
• Some users report immediate energy improvements`,
    notes: 'AKA Elamipretide. Good to follow with MOTS-C after SS-31.',
    sideEffects: []
  },
  {
    name: 'TB-500',
    halfLifeHours: 36,
    type: 'Peptide',
    goodWith: ['BPC-157', 'Thymosin Alpha-1'],
    notGoodWith: [],
    benefits: ['Anti-Inflammatory', 'Cardiovascular Health', 'Longevity', 'Pain Relief', 'Tissue Repair', 'Wound Healing'],
    tags: ['Healing', 'Longevity'],
    protocols: `Treatment Length: Varies by condition (typically 20-30 days, up to 3 months)

SQ:
• 750 mcg daily for 20 days
• 1 mg twice weekly for maintenance
• 300 mcg to 1 mg daily for up to 3 months, then 1 month off
• 450 mcg daily for 30 days
• 2.0-2.5 mg every other day for acute injuries

For Acute Injuries:
• Higher doses (1-2.5 mg) can be used
• Inject near injury site if possible

Stacking:
• Often combined with BPC-157 for enhanced healing
• Can stack with Thymosin Alpha-1 for immune support

Special Instructions:
• Synthetic version of Thymosin Beta-4 Fragment 17-23
• Excellent for wound healing, tissue repair, and recovery
• Can be injected locally near injury or systemically
• Very well-tolerated with minimal side effects`,
    notes: 'Frag 17-23. TB-500 is the active region of Thymosin Beta-4.',
    sideEffects: []
  },
  {
    name: 'Tesamorelin',
    halfLifeHours: 0.5,
    type: 'Peptide',
    goodWith: ['Ipamorelin'],
    notGoodWith: ['CJC-1295'],
    benefits: ['Bone Health', 'Cardiovascular Health', 'Cognitive Enhancement', 'Fat Loss', 'Metabolism', 'Weight Loss'],
    tags: ['Bones', 'Focus', 'Muscles', 'Sleep', 'Weight Loss'],
    protocols: `Treatment Length: Maximum 60 days on, followed by equal time off
Timing: Wait 2-3 hours after eating, don't eat for 30 minutes after injection

SQ:
• 1 mg 5-6 days per week before bed
• 1 mg daily
• 1 mg morning (fasted) + 1 mg bedtime (90+ min after meal) = 2 mg total daily
• 2 mg daily for enhanced fat loss
• 200 mcg at bedtime for cognitive benefits, 5 days on/2 days off for 20 weeks

Stacking - Tesamorelin + Ipamorelin:
SQ:
• 1 mg Tesamorelin before bed (90+ min after food) + 200 mcg Ipamorelin in morning
• Synergistic effect for fat loss and body composition

Special Instructions:
• Human Growth Hormone-Releasing Hormone (GHRH)
• Brand name: EGRIFTA (FDA-approved for HIV lipodystrophy)
• GHRH should be paired with GHRP (Ipamorelin) for optimal results
• Do NOT stack with CJC-1295 or Sermorelin (all are GHRH analogs)
• Excellent for visceral fat reduction`,
    notes: 'Human growth hormone-releasing hormone (GHRH). Brand name - EGRIFTA. Developed to treat HIV lipodystrophy.',
    sideEffects: ['Blood Sugar Changes', 'Difficulty Breathing', 'Dizziness', 'Fast Heart Rate', 'Hives', 'ISR (Injection Site Reaction)', 'Joint Pain', 'Night Sweats', 'Numbness', 'Rash', 'Vomiting']
  },
  {
    name: 'Tesofensine',
    halfLifeHours: 50,
    type: 'Peptide',
    goodWith: ['MOTS-C', 'SS-31'],
    notGoodWith: [],
    benefits: ['Cognitive Enhancement', 'Energy Boost', 'Fat Loss', 'Metabolism', 'Mood Enhancement', 'Weight Loss'],
    tags: ['Energy', 'Focus', 'Weight Loss'],
    protocols: `Treatment Length: Can be used long-term (studied up to 6 months)

Oral:
• 500 mcg daily in early morning
• Some start at 250 mcg and titrate up to assess tolerance
• Take on empty stomach for best absorption

Stacking:
• Often used with Tirzepatide/Semaglutide/Retatrutide
• Can be used during maintenance breaks from GLP-1 medications

Special Instructions:
• Triple reuptake inhibitor (serotonin, norepinephrine, dopamine)
• No apparent withdrawal effects when discontinued
• Morning dosing recommended due to stimulant-like effects`,
    notes: 'Some use with Tirzepatide/Semaglutide/Retatrutide. Doesn\'t seem to have any withdrawal effects.',
    sideEffects: ['Constipation', 'Diarrhea', 'Dry Mouth', 'Headache', 'Increased Blood Pressure', 'Increased Heart Rate', 'Insomnia', 'Nausea']
  },
  {
    name: 'Thymosin Alpha-1',
    halfLifeHours: 2,
    type: 'Peptide',
    goodWith: ['Thymosin Beta-4', 'TB-500'],
    notGoodWith: [],
    benefits: ['Anti-Inflammatory', 'Cancer Prevention', 'Immune Support', 'Wound Healing'],
    tags: ['Immune system'],
    protocols: `Treatment Length: Varies by condition (typically 30 days to 3 months)

SQ:
• 450 mcg daily for 30 days
• 90 mcg daily for 1 month = total 5 mg
• 1.5 mg every 3rd day for 2 weeks for viral infection
• 1.5 mg every 3rd day for up to 3 months for HIV, cancer, Hepatitis B/C, or severe immune suppression

For Immune Support:
• Lower doses (90-450 mcg daily)
• Shorter duration (30 days)

For Chronic Illness:
• Higher doses (1.5 mg)
• Longer duration (up to 3 months)
• More frequent dosing (every 3 days)

Stacking:
• Often combined with TB-500 or Thymosin Beta-4 for comprehensive immune and healing support

Special Instructions:
• FDA-approved peptide
• Used for chronic fatigue, Lyme disease, autoimmune conditions
• Powerful immune modulator
• Well-researched with strong clinical backing`,
    notes: 'FDA approved. Some physicians are using thymosin for chronic fatigue, Lyme disease, autoimmune function.',
    sideEffects: ['Fatigue', 'Fever', 'Low White Blood Cells', 'Muscle Pain', 'Nausea', 'Vomiting']
  },
  {
    name: 'Thymalin/Thimogen',
    halfLifeHours: 3,
    type: 'Peptide',
    goodWith: ['Epitalon'],
    notGoodWith: [],
    benefits: ['Anti-Aging', 'Anti-Inflammatory', 'Cancer Prevention', 'Cardiovascular Health', 'Immune Support', 'Longevity'],
    tags: ['Immune system', 'Longevity'],
    protocols: `Important Note: Thymalin is an extract of Thymogen. 10 mg Thymalin = 100 mcg Thymogen.

Treatment Length:
• Maximum 10 days if taken daily
• Maximum 10 weeks if taken weekly
• Preferably no more than 100 mg total per cycle
• Can do 2 cycles per year

Preparation:
• Take 30 mg zinc 30 minutes before Thymalin injection

IM (some use SQ):
• For immune disorders: 5-20 mg daily for 3-10 days
• For anti-aging: 2-5 mg daily
• For anti-aging: 5-10 mg daily
• For anti-aging: 10 mg once or twice weekly

Stacking - Thymalin + Epithalon:
IM (some use SQ):
• 5 mg Thymalin + 5 mg Epithalamin daily for 20 days, repeat every 6 months

Special Instructions:
• Immune system and longevity peptide
• More concentrated than Thymogen
• Powerful immune modulator - use carefully`,
    notes: 'Thymalin is an extract of Thymogen and is more concentrated. Similar to Epithalamin vs Epitalon.',
    sideEffects: []
  },
  {
    name: 'Thymosin Beta-4',
    halfLifeHours: 10,
    type: 'Peptide',
    goodWith: ['Thymosin Alpha-1', 'BPC-157'],
    notGoodWith: [],
    benefits: ['Anti-Inflammatory', 'Cardiovascular Health', 'Collagen Production', 'Eye Health', 'Immune Support', 'Liver Health', 'Neuroprotection', 'Tissue Repair', 'Wound Healing'],
    tags: ['Cognitive function', 'Healing', 'Immune system'],
    protocols: `Treatment Length: Varies by condition (typically 4-8 weeks)

SQ:
• 750 mcg daily for 20 days
• 1-2 mg twice weekly
• 500 mcg to 1.5 mg daily for acute injuries
• 2-3 mg every other day

Note: TB-500 is the synthetic version of Thymosin Beta-4 and is more commonly used. See TB-500 for more detailed protocols.`,
    notes: 'TB-500 is the active region of Thymosin Beta-4. Currently being trialed for HIV, AIDS, and Influenza. Often prescribed for acute injury, surgical repair.',
    sideEffects: ['Dizziness', 'Headache', 'Lethargy', 'Nausea', 'Tiredness']
  },
  {
    name: 'Retatrutide',
    halfLifeHours: 168,
    type: 'Peptide',
    goodWith: [],
    notGoodWith: [],
    benefits: ['Body Composition', 'Cardiovascular Health', 'Diabetes Management', 'Fat Loss', 'Liver Health', 'Metabolism', 'Weight Loss'],
    tags: ['Muscles', 'Weight Loss'],
    protocols: `Treatment Length: 48 weeks for weight loss studies

SQ (Phase 2 Titration Schedule):
• Week 1-4: 0.5 mg once weekly
• Week 5-8: 1 mg once weekly
• Week 9-12: 2 mg once weekly (or continue at 1 mg if tolerated poorly)
• Week 13-20: 4 mg once weekly
• Week 21-48: 8 mg once weekly (maintenance dose)
• Alternative high dose: 12 mg once weekly for maximum weight loss

General Guidelines:
• Administer once weekly on the same day each week
• Inject subcutaneously in abdomen, thigh, or upper arm
• Titrate slowly to minimize GI side effects
• Most common maintenance doses: 4-8 mg weekly`,
    notes: 'Triple agonist: activates GLP-1, GIP, and glucagon receptors simultaneously. Phase 2 trials showed up to 24% body weight reduction in 48 weeks. Manufactured by Eli Lilly. Currently in Phase 3 trials - not yet FDA approved.',
    sideEffects: ['Constipation', 'Diarrhea', 'Dizziness', 'Fatigue', 'Headache', 'Loss of Appetite', 'Nausea', 'Stomach Upset', 'Vomiting']
  },
  {
    name: 'Testosterone Cypionate',
    halfLifeHours: 192,
    type: 'Hormone',
    goodWith: [],
    notGoodWith: [],
    benefits: ['Body Composition', 'Bone Health', 'Cardiovascular Health', 'Cognitive Enhancement', 'Energy Boost', 'Fat Loss', 'Mood Enhancement', 'Muscle Growth'],
    tags: ['Bones', 'Energy', 'Mood', 'Muscles', 'TRT'],
    protocols: `Standard TRT Protocol:

IM (Intramuscular):
• 100-200 mg once weekly (most common)
• 50-100 mg twice weekly (more stable levels, less side effects)
• 80-100 mg every 5 days (alternative schedule)

Typical Starting Dose:
• 100 mg once weekly, titrate based on blood work
• Target total testosterone: 700-1000 ng/dL
• Target free testosterone: upper end of normal range

Injection Sites:
• Glutes (dorsogluteal or ventrogluteal)
• Thighs (vastus lateralis)
• Deltoids (for smaller volumes)
• Rotate injection sites to prevent scar tissue buildup

Important Monitoring:
• Check blood work every 6-8 weeks initially
• Monitor: Total testosterone, free testosterone, estradiol, hematocrit, PSA, lipid panel, liver enzymes
• Adjust dose based on symptoms and lab values

Special Instructions:
• Requires prescription - Schedule III controlled substance
• Long-acting ester provides sustained release
• More frequent injections (twice weekly) provide more stable blood levels
• May require AI (aromatase inhibitor) if estradiol becomes elevated
• May require HCG to prevent testicular atrophy and maintain fertility
• Inject slowly (30-60 seconds) to reduce pip (post-injection pain)`,
    notes: 'Synthetic testosterone ester. Cypionate ester provides slow, sustained release over 8-10 days. Most commonly prescribed testosterone ester in the US. FDA approved for testosterone replacement therapy.',
    sideEffects: ['Acne', 'Aggression', 'Decreased Sperm Production', 'Elevated Blood Pressure', 'Gynecomastia', 'Hair Loss', 'ISR (Injection Site Reaction)', 'Increased Hematocrit', 'Irritability', 'Mood Changes', 'Oily Skin', 'Prostate Enlargement', 'Sleep Apnea', 'Testicular Atrophy', 'Water Retention']
  },
  {
    name: 'Testosterone Enanthate',
    halfLifeHours: 168,
    type: 'Hormone',
    goodWith: ['Oxandrolone (Anavar)', 'Nandrolone Decanoate (Deca)', 'Human Growth Hormone (HGH)'],
    notGoodWith: [],
    benefits: ['Body Composition', 'Bone Health', 'Cardiovascular Health', 'Cognitive Enhancement', 'Energy Boost', 'Fat Loss', 'Mood Enhancement', 'Muscle Growth'],
    tags: ['Bones', 'Energy', 'Mood', 'Muscles', 'TRT'],
    protocols: `Standard TRT Protocol:

IM (Intramuscular):
• 100-200 mg once weekly (most common)
• 50-100 mg twice weekly (more stable levels)
• 80-100 mg every 5 days

Blast/Cycle Dosing:
• 300-500 mg per week for 12-16 weeks (intermediate)
• Split into 2 injections per week for stable levels

Injection Sites:
• Glutes, thighs, deltoids
• Rotate injection sites

Important Monitoring:
• Blood work every 6-8 weeks initially
• Monitor: Total T, free T, estradiol, hematocrit, PSA, lipids
• May require AI if estradiol elevated
• May require HCG for fertility preservation`,
    notes: 'Enanthate ester provides sustained release over ~7 days. Most commonly prescribed testosterone ester outside the US. Very similar pharmacokinetics to Cypionate.',
    sideEffects: ['Acne', 'Aggression', 'Decreased Sperm Production', 'Elevated Blood Pressure', 'Gynecomastia', 'Hair Loss', 'ISR (Injection Site Reaction)', 'Increased Hematocrit', 'Mood Changes', 'Oily Skin', 'Testicular Atrophy', 'Water Retention']
  },
  {
    name: 'Testosterone Propionate',
    halfLifeHours: 48,
    type: 'Hormone',
    goodWith: ['Masteron Propionate', 'Trenbolone Acetate'],
    notGoodWith: [],
    benefits: ['Body Composition', 'Energy Boost', 'Fat Loss', 'Mood Enhancement', 'Muscle Growth'],
    tags: ['Energy', 'Muscles', 'TRT'],
    protocols: `Short Ester Protocol:

IM (Intramuscular):
• 25-50 mg every other day (TRT)
• 50-100 mg every other day (cycle)
• Must inject frequently due to short half-life (~2 days)

Advantages:
• Faster onset and clearance
• Less water retention vs longer esters
• Better for short cycles or competition prep
• Clears system faster for PCT

Injection Notes:
• Known for more PIP (post-injection pain) vs other esters
• Smaller gauge needles (25-27g) recommended
• Rotate injection sites frequently`,
    notes: 'Shortest commonly used testosterone ester. Faster clearance makes it preferred for competition prep and short cycles. More frequent injections required.',
    sideEffects: ['Acne', 'Elevated Blood Pressure', 'Gynecomastia', 'Hair Loss', 'ISR (Injection Site Reaction)', 'Increased Hematocrit', 'Mood Changes', 'Oily Skin', 'Post-Injection Pain', 'Water Retention']
  },
  {
    name: 'Testosterone Undecanoate',
    halfLifeHours: 504,
    type: 'Hormone',
    goodWith: [],
    notGoodWith: [],
    benefits: ['Body Composition', 'Bone Health', 'Energy Boost', 'Mood Enhancement', 'Muscle Growth'],
    tags: ['Bones', 'Energy', 'Mood', 'Muscles', 'TRT'],
    protocols: `Long-Acting TRT Protocol:

IM (Intramuscular) - Nebido/Aveed:
• 750-1000 mg every 10-14 weeks (clinical protocol)
• First two injections 6 weeks apart, then every 10-14 weeks
• Administered by healthcare provider

Oral - Jatenzo:
• 158-396 mg twice daily with food
• Adjust based on blood levels

Advantages:
• Very infrequent injections
• Stable blood levels once established
• Good for patients who prefer fewer injections

Monitoring:
• Trough levels before next injection
• Standard TRT blood panels`,
    notes: 'Longest-acting testosterone ester. Brand names: Nebido (IM), Aveed (IM), Jatenzo (oral). 21-day half-life allows very infrequent dosing.',
    sideEffects: ['Acne', 'Elevated Blood Pressure', 'Gynecomastia', 'Hair Loss', 'Increased Hematocrit', 'Mood Changes', 'Oily Skin', 'Pulmonary Oil Microembolism', 'Water Retention']
  },
  {
    name: 'Trenbolone Acetate',
    halfLifeHours: 24,
    type: 'Hormone',
    goodWith: ['Testosterone Cypionate', 'Testosterone Propionate'],
    notGoodWith: ['Nandrolone Decanoate (Deca)', 'Nandrolone Phenylpropionate (NPP)'],
    benefits: ['Body Composition', 'Fat Loss', 'Muscle Growth', 'Recovery'],
    tags: ['Muscles', 'Weight Loss'],
    protocols: `Cycle Protocol (Advanced Users Only):

IM (Intramuscular):
• 50-75 mg every other day (beginner tren dose)
• 75-100 mg every other day (intermediate)
• Must always run with a testosterone base
• Typical cycle length: 8-10 weeks

Important Warnings:
• NOT for beginners - powerful compound with significant side effects
• Strong 19-nor compound - suppressive to natural testosterone
• Can cause severe insomnia, night sweats, and cardiovascular strain
• Monitor blood pressure and cardiovascular markers closely
• Tren cough (brief coughing fit after injection) is common

Post Cycle:
• Extended PCT needed due to 19-nor metabolites
• Allow adequate time off between cycles`,
    notes: 'One of the most potent anabolic steroids. 5x more anabolic than testosterone. Short acetate ester allows quick clearance if side effects occur. Not for beginners.',
    sideEffects: ['Aggression', 'Anxiety', 'Cardiovascular Strain', 'Elevated Blood Pressure', 'Hair Loss', 'Increased Sweating', 'Insomnia', 'Night Sweats', 'Oily Skin', 'Reduced Cardio Capacity', 'Tren Cough']
  },
  {
    name: 'Trenbolone Enanthate',
    halfLifeHours: 120,
    type: 'Hormone',
    goodWith: ['Testosterone Cypionate', 'Testosterone Enanthate'],
    notGoodWith: ['Nandrolone Decanoate (Deca)', 'Nandrolone Phenylpropionate (NPP)'],
    benefits: ['Body Composition', 'Fat Loss', 'Muscle Growth', 'Recovery'],
    tags: ['Muscles', 'Weight Loss'],
    protocols: `Cycle Protocol (Advanced Users Only):

IM (Intramuscular):
• 200-400 mg per week (split into 2 injections)
• Must always run with a testosterone base
• Typical cycle length: 10-12 weeks

Advantages vs Acetate:
• Less frequent injections (2x/week vs EOD)
• Same compound, just longer ester

Important Warnings:
• Same side effect profile as Trenbolone Acetate
• Takes longer to clear system if sides are intolerable
• Strong 19-nor - very suppressive
• Monitor cardiovascular health closely`,
    notes: 'Long ester version of Trenbolone. Less frequent injections but takes longer to clear if side effects occur. Same potency as Acetate version.',
    sideEffects: ['Aggression', 'Anxiety', 'Cardiovascular Strain', 'Elevated Blood Pressure', 'Hair Loss', 'Increased Sweating', 'Insomnia', 'Night Sweats', 'Oily Skin', 'Reduced Cardio Capacity', 'Tren Cough']
  },
  {
    name: 'Nandrolone Decanoate (Deca)',
    halfLifeHours: 144,
    type: 'Hormone',
    goodWith: ['Testosterone Cypionate', 'Testosterone Enanthate'],
    notGoodWith: ['Trenbolone Acetate', 'Trenbolone Enanthate'],
    benefits: ['Bone Health', 'Joint Health', 'Muscle Growth', 'Pain Relief', 'Recovery'],
    tags: ['Bones', 'Healing', 'Muscles'],
    protocols: `Cycle Protocol:

IM (Intramuscular):
• 200-400 mg per week for therapeutic/joint relief
• 300-600 mg per week for muscle building (12-16 weeks)
• Always run with testosterone at equal or higher dose
• Typical cycle: 12-16 weeks (long ester needs time)

Joint Relief Protocol:
• 100-200 mg per week provides significant joint relief
• Can be used at low dose alongside TRT

Important Warnings:
• 19-nor compound with very long detection time
• Deca Dick (erectile dysfunction) common without adequate testosterone
• Run testosterone at higher dose than Deca
• Extended PCT needed - metabolites detectable for 18+ months
• Progesterone-related side effects possible`,
    notes: 'Popular for joint relief and mass building. Long-acting ester (6-day half-life). Known for "Deca Dick" if run without adequate testosterone base. Very long detection time.',
    sideEffects: ['Bloating', 'Decreased Libido', 'Elevated Blood Pressure', 'Erectile Dysfunction', 'Gynecomastia', 'Hair Loss', 'Increased Appetite', 'Mood Changes', 'Progestin Effects', 'Water Retention']
  },
  {
    name: 'Nandrolone Phenylpropionate (NPP)',
    halfLifeHours: 36,
    type: 'Hormone',
    goodWith: ['Testosterone Cypionate', 'Testosterone Propionate'],
    notGoodWith: ['Trenbolone Acetate', 'Trenbolone Enanthate'],
    benefits: ['Bone Health', 'Joint Health', 'Muscle Growth', 'Pain Relief', 'Recovery'],
    tags: ['Bones', 'Healing', 'Muscles'],
    protocols: `Cycle Protocol:

IM (Intramuscular):
• 100-150 mg every other day (300-525 mg/week)
• Always run with testosterone
• Typical cycle: 8-12 weeks (shorter than Deca due to faster ester)

Advantages vs Deca:
• Faster acting - feel effects sooner
• Clears system faster if side effects occur
• Shorter detection time
• Better for shorter cycles

Important Warnings:
• Same compound as Deca, just shorter ester
• Still a 19-nor - suppressive to natural testosterone
• Run testosterone at higher dose than NPP`,
    notes: 'Short ester version of Nandrolone. Same compound as Deca but with faster onset and clearance. Better for shorter cycles and if side effects need to clear quickly.',
    sideEffects: ['Bloating', 'Decreased Libido', 'Elevated Blood Pressure', 'Erectile Dysfunction', 'Gynecomastia', 'Hair Loss', 'Mood Changes', 'Water Retention']
  },
  {
    name: 'Boldenone Undecylenate (EQ)',
    halfLifeHours: 336,
    type: 'Hormone',
    goodWith: ['Testosterone Cypionate', 'Testosterone Enanthate'],
    notGoodWith: [],
    benefits: ['Body Composition', 'Cardiovascular Health', 'Muscle Growth', 'Recovery'],
    tags: ['Muscles'],
    protocols: `Cycle Protocol:

IM (Intramuscular):
• 300-600 mg per week (14-20 week cycles)
• Very long ester - needs extended cycle to see full effects
• Always run with testosterone base
• Takes 4-6 weeks to reach stable blood levels

Key Effects:
• Increases red blood cell production (improved endurance)
• Lean, quality muscle gains
• Can act as a mild AI (lowers estrogen)
• Appetite increase is common

Important Warnings:
• May crash estrogen if testosterone dose is not adequate
• Causes elevated hematocrit - monitor blood work
• Very long detection time
• Increased anxiety in some users`,
    notes: 'Originally a veterinary steroid (Equipoise). Very long half-life (14 days) requires extended cycles. Known for lean gains, increased vascularity, and appetite stimulation.',
    sideEffects: ['Acne', 'Anxiety', 'Elevated Blood Pressure', 'Hair Loss', 'Increased Appetite', 'Increased Hematocrit', 'Oily Skin']
  },
  {
    name: 'Masteron Propionate',
    halfLifeHours: 24,
    type: 'Hormone',
    goodWith: ['Testosterone Propionate', 'Trenbolone Acetate'],
    notGoodWith: [],
    benefits: ['Body Composition', 'Fat Loss', 'Mood Enhancement', 'Muscle Growth'],
    tags: ['Muscles', 'Weight Loss'],
    protocols: `Cycle Protocol:

IM (Intramuscular):
• 300-500 mg per week (100 mg EOD typical)
• Often used in cutting cycles
• Best results at lower body fat percentages (<15%)
• Typical cycle: 8-10 weeks

Key Effects:
• Anti-estrogenic properties (DHT derivative)
• Hardening and drying effect on physique
• Mild strength increase
• Best cosmetic effects at lower body fat

Important Notes:
• Not a mass builder - best for cutting/recomp
• DHT derivative - significant hair loss risk
• Anti-estrogenic effect can reduce need for AI
• Originally developed as breast cancer treatment`,
    notes: 'DHT derivative with anti-estrogenic properties. Best for cutting and competition prep. Cosmetic effects most visible at lower body fat. Short propionate ester requires frequent injections.',
    sideEffects: ['Acne', 'Aggression', 'Hair Loss', 'ISR (Injection Site Reaction)', 'Oily Skin', 'Post-Injection Pain', 'Prostate Enlargement']
  },
  {
    name: 'Masteron Enanthate',
    halfLifeHours: 120,
    type: 'Hormone',
    goodWith: ['Testosterone Enanthate', 'Testosterone Cypionate'],
    notGoodWith: [],
    benefits: ['Body Composition', 'Fat Loss', 'Mood Enhancement', 'Muscle Growth'],
    tags: ['Muscles', 'Weight Loss'],
    protocols: `Cycle Protocol:

IM (Intramuscular):
• 400-600 mg per week (split into 2 injections)
• Often used in cutting cycles
• Typical cycle: 10-12 weeks

Advantages vs Propionate:
• Less frequent injections (2x/week vs EOD)
• Same compound, longer ester
• Pairs well with longer ester testosterone

Same Profile as Masteron Propionate:
• Anti-estrogenic, hardening effect
• Best at lower body fat percentages
• DHT derivative - hair loss risk`,
    notes: 'Long ester version of Masteron (Drostanolone). Less frequent injections than Propionate version. Same effects profile.',
    sideEffects: ['Acne', 'Aggression', 'Hair Loss', 'Oily Skin', 'Prostate Enlargement']
  },
  {
    name: 'Oxandrolone (Anavar)',
    halfLifeHours: 9,
    type: 'Hormone',
    goodWith: ['Testosterone Cypionate', 'Testosterone Enanthate'],
    notGoodWith: [],
    benefits: ['Body Composition', 'Fat Loss', 'Muscle Growth', 'Recovery'],
    tags: ['Muscles', 'Weight Loss'],
    protocols: `Oral Protocol:

Males:
• 40-80 mg daily (split into 2 doses, AM/PM)
• 6-8 week cycles
• Always run with testosterone base

Females:
• 5-20 mg daily
• 6-8 week cycles
• One of few AAS considered relatively safe for women

Key Effects:
• Mild but effective for lean gains and fat loss
• Low aromatization (minimal estrogen conversion)
• Increases strength disproportionate to mass gains
• Enhances muscle hardness and vascularity

Important Warnings:
• Oral - hepatotoxic (liver toxic)
• Significant impact on lipid profile (lowers HDL)
• Suppresses natural testosterone production
• Monitor liver values and lipids`,
    notes: 'One of the mildest oral AAS. Popular for cutting cycles and female use. Relatively low androgenic effects but still suppressive. Known for strength gains without excessive mass.',
    sideEffects: ['Acne', 'Hair Loss', 'Headache', 'Liver Toxicity', 'Lipid Changes', 'Nausea', 'Suppressed Testosterone']
  },
  {
    name: 'Stanozolol Oral (Winstrol)',
    halfLifeHours: 9,
    type: 'Hormone',
    goodWith: ['Testosterone Propionate', 'Masteron Propionate'],
    notGoodWith: ['Nandrolone Decanoate (Deca)'],
    benefits: ['Body Composition', 'Fat Loss', 'Muscle Growth'],
    tags: ['Muscles', 'Weight Loss'],
    protocols: `Oral Protocol:

Males:
• 25-50 mg daily for 6-8 weeks
• Split dose AM/PM for more stable levels
• Always run with testosterone base

Females:
• 5-10 mg daily for 4-6 weeks

Key Effects:
• Strong drying/hardening effect
• Does not aromatize
• Increases vascularity and muscle definition
• Popular for competition prep

Important Warnings:
• Very hepatotoxic (liver toxic) - limit cycle length
• Extremely harsh on joints (dries them out)
• Significant negative impact on lipids
• NOT recommended to stack with Deca (both are harsh on lipids)
• Absolutely requires liver support supplements`,
    notes: 'Powerful oral AAS for cutting. Known for joint dryness and liver toxicity. Very popular for competition prep. Available in both oral and injectable forms.',
    sideEffects: ['Acne', 'Hair Loss', 'Joint Pain', 'Liver Toxicity', 'Lipid Changes', 'Tendon Damage']
  },
  {
    name: 'Stanozolol Injectable (Winstrol)',
    halfLifeHours: 24,
    type: 'Hormone',
    goodWith: ['Testosterone Propionate', 'Masteron Propionate'],
    notGoodWith: ['Nandrolone Decanoate (Deca)'],
    benefits: ['Body Composition', 'Fat Loss', 'Muscle Growth'],
    tags: ['Muscles', 'Weight Loss'],
    protocols: `Injectable Protocol:

IM (Intramuscular):
• 50 mg every other day (most common)
• 50 mg daily for advanced users (short cycles only)
• 6-8 week cycles maximum

Advantages vs Oral:
• Longer half-life (24h vs 9h)
• Slightly less liver stress (still hepatotoxic)
• More stable blood levels

Important Warnings:
• Water-based suspension - can be painful to inject
• Still hepatotoxic even as injectable
• Joint dryness and lipid impact same as oral version
• Requires liver support`,
    notes: 'Injectable version of Winstrol. Water-based suspension that can be painful. Slightly less hepatotoxic than oral but still requires monitoring.',
    sideEffects: ['Acne', 'Hair Loss', 'ISR (Injection Site Reaction)', 'Joint Pain', 'Liver Toxicity', 'Lipid Changes', 'Post-Injection Pain', 'Tendon Damage']
  },
  {
    name: 'Methandrostenolone (Dianabol)',
    halfLifeHours: 4.5,
    type: 'Hormone',
    goodWith: ['Testosterone Cypionate', 'Testosterone Enanthate'],
    notGoodWith: [],
    benefits: ['Muscle Growth', 'Recovery'],
    tags: ['Muscles'],
    protocols: `Oral Protocol:

Males:
• 20-50 mg daily for 4-6 weeks (kickstart)
• Split into 2-3 doses throughout the day
• Commonly used as cycle kickstart while waiting for long esters to saturate

Kickstart Example:
• Weeks 1-4: Dianabol 30-40 mg/day
• Weeks 1-12: Testosterone Enanthate 500 mg/week

Key Effects:
• Rapid weight and strength gains
• Significant water retention and bloating
• Strong aromatization (high estrogen conversion)
• Dramatic pumps in the gym

Important Warnings:
• Hepatotoxic - limit to 4-6 weeks
• Very strong aromatization - AI often needed
• Significant water retention
• Blood pressure elevation common
• Monitor liver values and estradiol`,
    notes: 'Classic oral steroid. Known for rapid strength and mass gains with significant water retention. Best used as a cycle kickstart for 4-6 weeks.',
    sideEffects: ['Acne', 'Bloating', 'Elevated Blood Pressure', 'Gynecomastia', 'Hair Loss', 'Liver Toxicity', 'Mood Changes', 'Water Retention']
  },
  {
    name: 'Oxymetholone (Anadrol)',
    halfLifeHours: 8,
    type: 'Hormone',
    goodWith: ['Testosterone Cypionate', 'Testosterone Enanthate'],
    notGoodWith: [],
    benefits: ['Muscle Growth', 'Recovery'],
    tags: ['Muscles'],
    protocols: `Oral Protocol:

Males:
• 25-50 mg daily for 4-6 weeks
• 50-100 mg daily for experienced users (4 weeks max)
• Often used as cycle kickstart
• Single daily dose (long enough half-life)

Key Effects:
• Most potent oral steroid for mass gain
• Dramatic strength increases
• Significant water retention
• Can increase appetite substantially

Important Warnings:
• VERY hepatotoxic - strict time limits
• Does not aromatize but causes estrogenic sides through other mechanisms
• Can cause severe headaches and nosebleeds (blood pressure)
• Absolutely requires liver support
• Not recommended for beginners`,
    notes: 'One of the strongest oral steroids. FDA-approved for anemia treatment. Causes estrogenic side effects despite not aromatizing (possibly through progestin activity).',
    sideEffects: ['Acne', 'Bloating', 'Elevated Blood Pressure', 'Gynecomastia', 'Hair Loss', 'Headache', 'Liver Toxicity', 'Nausea', 'Nosebleeds', 'Water Retention']
  },
  {
    name: 'Primobolan Enanthate',
    halfLifeHours: 240,
    type: 'Hormone',
    goodWith: ['Testosterone Cypionate', 'Testosterone Enanthate', 'Oxandrolone (Anavar)'],
    notGoodWith: [],
    benefits: ['Body Composition', 'Fat Loss', 'Immune Support', 'Muscle Growth'],
    tags: ['Immune system', 'Muscles'],
    protocols: `Cycle Protocol:

IM (Intramuscular):
• 400-800 mg per week for males (12-16 weeks)
• 50-100 mg per week for females
• Always run with testosterone base (males)
• Long ester - needs extended cycles

Key Effects:
• Mild but high-quality lean muscle gains
• Does not aromatize
• Immune system support
• Very low side effect profile
• Good for cutting and recomposition

Important Notes:
• One of the mildest injectable AAS
• High cost per mg compared to other compounds
• Often counterfeited - verify source
• Arnold's reported favorite compound
• DHT derivative with low androgenic effects`,
    notes: 'Mild injectable AAS with excellent safety profile. Does not aromatize. Known as one of the safest injectable steroids. High cost limits availability.',
    sideEffects: ['Acne', 'Hair Loss', 'ISR (Injection Site Reaction)', 'Lipid Changes', 'Suppressed Testosterone']
  },
  {
    name: 'Human Growth Hormone (HGH)',
    halfLifeHours: 3.8,
    type: 'Hormone',
    goodWith: ['Testosterone Cypionate', 'Ipamorelin', 'CJC-1295'],
    notGoodWith: [],
    benefits: ['Anti-Aging', 'Body Composition', 'Bone Health', 'Cognitive Enhancement', 'Fat Loss', 'Joint Health', 'Longevity', 'Muscle Growth', 'Recovery', 'Skin Health', 'Sleep Improvement', 'Wound Healing'],
    tags: ['Bones', 'Healing', 'Longevity', 'Muscles', 'Skin', 'Sleep', 'Weight Loss'],
    protocols: `Protocol by Goal:

Anti-Aging / General Wellness:
SQ:
• 1-2 IU daily
• Inject before bed or first thing in morning
• Can run indefinitely at low doses

Fat Loss:
SQ:
• 2-4 IU daily
• Split dose: AM (fasted) + pre-bed
• Best results with consistent cardio

Muscle Building (with AAS):
SQ:
• 4-8 IU daily
• Split into 2-3 doses
• Often combined with insulin (advanced - dangerous)

Timing:
• Morning fasted: Best for fat loss
• Before bed: Mimics natural GH pulse
• Split dosing: Most stable levels
• Wait 30-60 min before eating after injection

Important Warnings:
• Can cause insulin resistance at higher doses
• Carpal tunnel syndrome common initially
• Water retention and joint pain common when starting
• Start low and titrate up over weeks
• Monitor IGF-1 and fasting glucose levels
• Takes 3-6 months for full body composition effects`,
    notes: 'Recombinant human growth hormone (somatropin). Effects are dose-dependent. Low doses for anti-aging, higher for body composition. Takes months for visible results.',
    sideEffects: ['Carpal Tunnel Syndrome', 'Elevated Blood Sugar', 'Fluid Retention', 'Headache', 'Joint Pain', 'Muscle Pain', 'Numbness', 'Tingling', 'Water Retention']
  },
  {
    name: 'PT-141 (Bremelanotide)',
    halfLifeHours: 2,
    type: 'Peptide',
    goodWith: [],
    notGoodWith: ['Melanotan 1'],
    benefits: ['Mood Enhancement'],
    tags: ['Mood'],
    protocols: `Treatment: As needed (not for daily use)

SQ:
• 1-2 mg approximately 45-60 minutes before desired effect
• Do not exceed 1 dose per 24 hours
• Do not exceed 8 doses per month
• Start with 0.5-1 mg to assess tolerance

Important Warnings:
• FDA-approved for hypoactive sexual desire disorder (HSDD) in women
• Works on melanocortin receptors in the brain
• Can cause significant nausea (most common side effect)
• May cause temporary skin darkening
• Blood pressure changes can occur
• Not for use with uncontrolled hypertension`,
    notes: 'FDA-approved as Vyleesi for HSDD in premenopausal women. Works centrally on melanocortin receptors. Different mechanism from PDE5 inhibitors.',
    sideEffects: ['Elevated Blood Pressure', 'Facial Flushing', 'Headache', 'Nausea', 'Skin Darkening', 'Vomiting']
  },
  {
    name: 'GHRP-2',
    halfLifeHours: 0.417,
    type: 'Peptide',
    goodWith: ['CJC-1295', 'Ipamorelin'],
    notGoodWith: [],
    benefits: ['Fat Loss', 'Immune Support', 'Muscle Growth', 'Recovery', 'Sleep Improvement'],
    tags: ['Muscles', 'Sleep', 'Weight Loss'],
    protocols: `Treatment Length: 8-12 weeks on, 4 weeks off

Timing: Wait 2-3 hours after eating, don't eat for 30 minutes after injection

SQ:
• 100-300 mcg 2-3 times daily
• Most common: 200 mcg before bed
• 100 mcg upon waking + 200 mcg before bed

Stacking:
• Best when paired with a GHRH (CJC-1295 no DAC)
• GHRP + GHRH = synergistic GH release

Important Notes:
• Growth Hormone Releasing Peptide
• Stronger GH release than Ipamorelin
• Increases appetite more than Ipamorelin
• Increases cortisol and prolactin slightly
• Inject on empty stomach for best results`,
    notes: 'Growth Hormone Releasing Peptide. More potent than GHRP-6 with fewer appetite-stimulating effects. Pairs well with GHRH peptides for synergistic effect.',
    sideEffects: ['Increased Appetite', 'Increased Cortisol', 'Increased Prolactin', 'Numbness', 'Tingling', 'Water Retention']
  },
  {
    name: 'GHRP-6',
    halfLifeHours: 0.333,
    type: 'Peptide',
    goodWith: ['CJC-1295', 'Ipamorelin'],
    notGoodWith: [],
    benefits: ['Fat Loss', 'Immune Support', 'Muscle Growth', 'Recovery', 'Sleep Improvement'],
    tags: ['Muscles', 'Sleep', 'Weight Loss'],
    protocols: `Treatment Length: 8-12 weeks on, 4 weeks off

Timing: Wait 2-3 hours after eating, don't eat for 30 minutes after injection

SQ:
• 100-300 mcg 2-3 times daily
• Most common: 200 mcg before bed
• Can use 100 mcg 3x daily (morning, post-workout, before bed)

Stacking:
• Best when paired with a GHRH (CJC-1295 no DAC)
• GHRP + GHRH = synergistic GH release

Important Notes:
• Growth Hormone Releasing Peptide
• Causes significant hunger increase (more than GHRP-2)
• Good for those wanting to increase appetite
• Increases cortisol and prolactin
• Inject on empty stomach`,
    notes: 'Growth Hormone Releasing Peptide. Known for strong appetite stimulation. Good choice for those who want to increase food intake. Pairs with GHRH peptides.',
    sideEffects: ['Increased Appetite', 'Increased Cortisol', 'Increased Prolactin', 'Numbness', 'Tingling', 'Water Retention']
  },
  {
    name: 'Semaglutide',
    halfLifeHours: 168,
    type: 'Peptide',
    goodWith: ['Tesofensine'],
    notGoodWith: [],
    benefits: ['Body Composition', 'Cardiovascular Health', 'Diabetes Management', 'Fat Loss', 'Metabolism', 'Weight Loss'],
    tags: ['Weight Loss'],
    protocols: `Titration Schedule (Weekly SQ Injection):

• Week 1-4: 0.25 mg once weekly
• Week 5-8: 0.5 mg once weekly
• Week 9-12: 1.0 mg once weekly
• Week 13-16: 1.7 mg once weekly (if needed)
• Week 17+: 2.4 mg once weekly (maximum dose)

General Guidelines:
• Inject subcutaneously in abdomen, thigh, or upper arm
• Same day each week (can change day if 2+ days between)
• Titrate slowly to minimize GI side effects
• Stay on each dose 4 weeks before increasing
• Many patients find effective dose at 1.0-1.7 mg

Important Warnings:
• GLP-1 receptor agonist
• Nausea is very common, especially during titration
• Eat smaller meals, avoid high-fat foods
• Stay hydrated
• Contraindicated with personal/family history of medullary thyroid cancer
• Monitor for pancreatitis symptoms`,
    notes: 'GLP-1 receptor agonist. Brand names: Ozempic (diabetes), Wegovy (weight loss). Average weight loss of 15% body weight in clinical trials. Weekly injection.',
    sideEffects: ['Constipation', 'Diarrhea', 'Dizziness', 'Fatigue', 'Gallbladder Issues', 'Headache', 'Loss of Appetite', 'Nausea', 'Pancreatitis Risk', 'Stomach Upset', 'Vomiting']
  },
  {
    name: 'Tirzepatide',
    halfLifeHours: 120,
    type: 'Peptide',
    goodWith: ['Tesofensine'],
    notGoodWith: [],
    benefits: ['Body Composition', 'Cardiovascular Health', 'Diabetes Management', 'Fat Loss', 'Metabolism', 'Weight Loss'],
    tags: ['Weight Loss'],
    protocols: `Titration Schedule (Weekly SQ Injection):

• Week 1-4: 2.5 mg once weekly
• Week 5-8: 5 mg once weekly
• Week 9-12: 7.5 mg once weekly
• Week 13-16: 10 mg once weekly
• Week 17-20: 12.5 mg once weekly (if needed)
• Week 21+: 15 mg once weekly (maximum dose)

General Guidelines:
• Inject subcutaneously in abdomen, thigh, or upper arm
• Same day each week
• Titrate slowly to minimize GI side effects
• Many patients find effective dose at 5-10 mg
• Can be used alongside Tesofensine

Important Warnings:
• Dual GIP/GLP-1 receptor agonist
• GI side effects common during titration
• Contraindicated with personal/family history of medullary thyroid cancer
• Monitor for pancreatitis symptoms
• May affect absorption of oral medications`,
    notes: 'Dual GIP/GLP-1 receptor agonist. Brand names: Mounjaro (diabetes), Zepbound (weight loss). More effective for weight loss than Semaglutide in head-to-head trials. Weekly injection.',
    sideEffects: ['Constipation', 'Diarrhea', 'Dizziness', 'Fatigue', 'Gallbladder Issues', 'Hair Loss', 'Headache', 'Loss of Appetite', 'Nausea', 'Pancreatitis Risk', 'Stomach Upset', 'Vomiting']
  },
  {
    name: 'Glutathione',
    halfLifeHours: 0.5,
    type: 'Supplement',
    goodWith: [],
    notGoodWith: [],
    benefits: ['Anti-Aging', 'Cancer Prevention', 'Cardiovascular Health', 'Eye Health', 'Immune Support', 'Liver Health', 'Longevity', 'Neuroprotection', 'Skin Health'],
    tags: ['Antioxidant', 'Detox', 'Immune system', 'Longevity', 'Skin'],
    protocols: `IV (Intravenous):
• 600-1200 mg 1-3 times weekly for general wellness
• 1200-2400 mg 2-3 times weekly for therapeutic use
• 2000-4000 mg 1-2 times weekly for chronic conditions

IM (Intramuscular):
• 200-600 mg 2-3 times weekly
• Can be mixed with other compounds in same syringe

SQ (Subcutaneous):
• 200-400 mg daily or every other day
• May cause more injection site reactions than IM

Oral:
• 500-1000 mg daily on empty stomach
• Take with vitamin C for better absorption
• Liposomal forms have better bioavailability (100-500 mg daily)

Nebulized:
• 200-400 mg nebulized 1-2 times daily for respiratory conditions

Special Instructions:
• Most bioavailable via IV route (oral bioavailability is poor ~10-30%)
• Best taken on empty stomach for oral forms
• Can cause temporary flushing or lightheadedness with IV administration
• Consider taking with NAC or alpha-lipoic acid for synergistic effect`,
    notes: 'Master antioxidant and detoxifier produced naturally in the body. Tripeptide composed of glutamine, cysteine, and glycine. Levels decline with age, stress, toxin exposure, and illness.',
    sideEffects: ['Diarrhea', 'Headache', 'Nausea', 'Rash', 'Stomach Upset']
  },
  {
    name: 'L-Carnitine',
    halfLifeHours: 15,
    type: 'Supplement',
    goodWith: [],
    notGoodWith: [],
    benefits: ['Body Composition', 'Cardiovascular Health', 'Cognitive Enhancement', 'Energy Boost', 'Fat Loss', 'Metabolism', 'Muscle Growth', 'Recovery'],
    tags: ['Energy', 'Mitochondrial', 'Muscles', 'Weight Loss'],
    protocols: `IM (Intramuscular):
• 500-1000 mg 2-3 times weekly for fat loss and energy
• 250-500 mg daily for maintenance
• Often included in lipotropic "fat burner" injections

IV (Intravenous):
• 500-2000 mg per session
• Can be added to Myers' Cocktail or other IV therapy

Oral:
• 500-2000 mg daily in divided doses
• 2000-4000 mg daily for athletic performance
• Take on empty stomach or with carbohydrates

Forms:
• L-Carnitine (standard form)
• Acetyl-L-Carnitine (ALCAR) - better for cognitive benefits, crosses blood-brain barrier
• L-Carnitine L-Tartrate (LCLT) - preferred for exercise performance and recovery
• Propionyl-L-Carnitine - best for cardiovascular health

Timing:
• For fat loss: take before cardio or in morning fasted
• For performance: take 30-60 minutes before training
• For general health: split doses throughout the day with meals

Special Instructions:
• Injectable forms provide higher bioavailability than oral
• Works best when combined with exercise
• May take 2-4 weeks to see effects
• Vegans/vegetarians may benefit most as dietary sources are limited`,
    notes: 'Amino acid derivative synthesized from lysine and methionine. Transports fatty acids into mitochondria for energy production. Not a stimulant but provides energy by improving fat utilization.',
    sideEffects: ['Diarrhea', 'Increased Appetite', 'Insomnia', 'Nausea', 'Stomach Upset']
  },
  {
    name: 'KLOW',
    halfLifeHours: 2,
    type: 'Blend',
    goodWith: ['BPC-157', 'TB-500', 'GHK-Cu', 'KPV'],
    notGoodWith: [],
    benefits: ['Anti-Aging', 'Anti-Inflammatory', 'Gut Health', 'Pain Relief', 'Recovery', 'Skin Health', 'Tissue Repair', 'Wound Healing'],
    tags: ['Healing', 'Immune system', 'Pain', 'Skin'],
    protocols: `KLOW Peptide Blend - Combines KPV, GHK-Cu, BPC-157, and TB-500

Treatment Length: Varies by condition (typically 4-8 weeks)

SQ:
• Typical blend ratios vary by vendor
• Common protocol: Daily injections for tissue repair and wound healing
• Rotate injection sites

Special Instructions:
• Synergistic blend of four powerful healing peptides
• KPV: Anti-inflammatory and gut health
• GHK-Cu: Skin health and collagen production
• BPC-157: Tissue repair and gut healing
• TB-500: Wound healing and recovery
• Designed for comprehensive healing support
• Follow individual peptide precautions (copper allergy for GHK-Cu, mood changes with BPC-157 if on SSRIs)`,
    notes: 'KLOW stands for the initials of the peptides in the blend: KPV + GHK-Cu (copper = O) + BPC-157 (L-isomer) + TB-500. Blend ratios vary by compounding pharmacy.',
    sideEffects: ['Dizziness', 'Fatigue', 'ISR (Injection Site Reaction)', 'Nausea']
  },
  {
    name: 'BPC-157 + TB-500',
    halfLifeHours: 20,
    type: 'Blend',
    goodWith: ['BPC-157', 'TB-500'],
    notGoodWith: [],
    benefits: ['Anti-Inflammatory', 'Bone Health', 'Cardiovascular Health', 'Gut Health', 'Joint Health', 'Pain Relief', 'Recovery', 'Tissue Repair', 'Wound Healing'],
    tags: ['Healing', 'Immune system', 'Pain'],
    protocols: `BPC-157 + TB-500 Blend - Synergistic healing and recovery combination

Treatment Length: 4-8 weeks, followed by rest period

SQ:
• Common ratio: 250-300 mcg BPC-157 + 750 mcg TB-500 daily or twice daily
• Alternative: 250 mcg BPC-157 + 1 mg TB-500 daily
• Can inject near injury site or systemically
• Rotate injection sites

Timing:
• Can be injected together or separately
• Morning and/or evening dosing

Stacking:
• Often combined with other healing peptides (GHK-Cu, Thymosin Alpha-1)
• Excellent for acute injury recovery

Special Instructions:
• Synergistic combination for enhanced tissue repair
• BPC-157: Focuses on gut healing, tissue repair, and systemic anti-inflammatory effects
• TB-500: Focuses on wound healing, tissue migration, and cardiovascular support
• Together they provide comprehensive healing support
• Follow BPC-157 precautions: Can affect mood with SSRIs - discontinue if depression/anxiety occurs`,
    notes: 'One of the most popular peptide blends for healing and recovery. Combines the complementary benefits of both peptides.',
    sideEffects: ['Dizziness', 'Elevated Blood Pressure', 'Fatigue', 'Hot Flashes', 'ISR (Injection Site Reaction)', 'Mood Changes', 'Nausea']
  },
  {
    name: 'Tesamorelin + Ipamorelin',
    halfLifeHours: 1.25,
    type: 'Blend',
    goodWith: ['Tesamorelin', 'Ipamorelin'],
    notGoodWith: [],
    benefits: ['Body Composition', 'Bone Health', 'Cognitive Enhancement', 'Collagen Production', 'Fat Loss', 'Metabolism', 'Muscle Growth', 'Recovery', 'Sleep Improvement'],
    tags: ['Bones', 'Muscles', 'Sleep', 'Weight Loss'],
    protocols: `Tesamorelin + Ipamorelin Blend - GHRH + GHRP synergistic stack

Treatment Length: Maximum 60 days on, followed by equal time off
Timing: Wait 2-3 hours after eating, don't eat for 30 minutes after injection

SQ:
• Standard protocol: 1 mg Tesamorelin + 200 mcg Ipamorelin before bed
• Alternative: 1 mg Tesamorelin (evening) + 200 mcg Ipamorelin (morning)
• Cost-effective option: 500 mcg Tesamorelin + 100 mcg Ipamorelin
• 5-6 days per week with 1-2 rest days

Timing Options:
• Both at bedtime: Maximum GH release during sleep
• Split dosing: Tesamorelin PM, Ipamorelin AM for extended GH elevation

Special Instructions:
• GHRH (Tesamorelin) + GHRP (Ipamorelin) = Synergistic effect
• Excellent for visceral fat reduction and body composition
• Tesamorelin: Reduces abdominal fat, improves lipid profile
• Ipamorelin: Promotes muscle growth, improves recovery and sleep
• Inject SLOWLY to minimize facial flushing
• Do not use continuously - cycling is essential`,
    notes: 'Popular stack combining GHRH and GHRP for synergistic growth hormone release. FDA-approved Tesamorelin (EGRIFTA) validates safety profile.',
    sideEffects: ['Dizziness', 'Facial Flushing', 'Headaches', 'ISR (Injection Site Reaction)', 'Joint Pain', 'Muscle Pain', 'Night Sweats', 'Water Retention']
  }
];

// ═══════════════════════════════════════
// TYPE COLORS & ICONS
// ═══════════════════════════════════════

const LIBRARY_TYPE_CONFIG = {
  'Peptide':    { color: '#00e676', bg: 'rgba(0, 230, 118, 0.15)' },
  'Hormone':   { color: '#ff5252', bg: 'rgba(255, 82, 82, 0.15)' },
  'Supplement': { color: '#42a5f5', bg: 'rgba(66, 165, 245, 0.15)' },
  'Blend':     { color: '#ffd54f', bg: 'rgba(255, 213, 79, 0.15)' }
};

// ═══════════════════════════════════════
// LIBRARY OVERRIDE MERGING
// ═══════════════════════════════════════

async function applyLibraryOverrides() {
  const overrides = await window.api.getLibraryOverrides();
  for (const [name, data] of Object.entries(overrides)) {
    const existing = LIBRARY_DATA.find(c => c.name === name);
    if (existing) {
      Object.assign(existing, data);
    } else {
      LIBRARY_DATA.push({ name, ...data });
    }
  }
}

// ═══════════════════════════════════════
// LIBRARY VIEW LOGIC
// ═══════════════════════════════════════

let librarySearchTerm = '';
let libraryTypeFilter = 'all';
let libraryTagFilter = 'all';
let libraryStatusFilter = 'all';
let _libCompoundsWithInventory = new Set();

let _activeCompoundNames = new Set();
let _plannedCompoundNames = new Set();

async function refreshCompoundStatuses() {
  const doses = await window.api.getDoses();
  const cycles = await window.api.getCycles();
  const now = Date.now();

  _activeCompoundNames = new Set();
  for (const dose of doses) {
    const remaining = calculateRemainingLevel(dose, now);
    if (remaining > 0) {
      _activeCompoundNames.add(dose.compoundName);
    }
  }

  _plannedCompoundNames = new Set();
  for (const cycle of cycles) {
    if (cycle.status === 'active' || cycle.status === 'planned') {
      for (const entry of cycle.entries) {
        _plannedCompoundNames.add(entry.compoundName);
      }
    }
  }
}

function getCompoundStatus(compoundName) {
  if (_activeCompoundNames.has(compoundName)) return 'active';
  if (_plannedCompoundNames.has(compoundName)) return 'planned';
  return 'reference';
}

async function initLibrary() {
  await refreshCompoundStatuses();
  renderLibrary();

  // Status filter pills
  document.querySelectorAll('.status-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.status-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      libraryStatusFilter = pill.dataset.status;
      renderLibrary();
    });
  });

  // Search input
  const searchInput = document.getElementById('library-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      librarySearchTerm = e.target.value.toLowerCase();
      renderLibrary();
    });
  }

  // Type filter
  const typeFilter = document.getElementById('library-type-filter');
  if (typeFilter) {
    typeFilter.addEventListener('change', (e) => {
      libraryTypeFilter = e.target.value;
      renderLibrary();
    });
  }

  // Tag filter
  const tagFilter = document.getElementById('library-tag-filter');
  if (tagFilter) {
    tagFilter.addEventListener('change', (e) => {
      libraryTagFilter = e.target.value;
      renderLibrary();
    });
  }
}

function getFilteredLibrary() {
  return LIBRARY_DATA.filter(compound => {
    // Status filter
    if (libraryStatusFilter !== 'all') {
      if (libraryStatusFilter === 'in-stock') {
        if (!_libCompoundsWithInventory.has(compound.name)) return false;
      } else {
        const status = getCompoundStatus(compound.name);
        if (libraryStatusFilter === 'reference' && status !== 'reference') return false;
        if (libraryStatusFilter === 'active' && status !== 'active') return false;
        if (libraryStatusFilter === 'planned' && status !== 'planned' && status !== 'active') return false;
      }
    }

    // Search filter
    if (librarySearchTerm) {
      const searchIn = [
        compound.name,
        ...(compound.benefits || []),
        ...(compound.tags || []),
        compound.notes || '',
        compound.type || ''
      ].join(' ').toLowerCase();
      if (!searchIn.includes(librarySearchTerm)) return false;
    }

    // Type filter
    if (libraryTypeFilter !== 'all' && compound.type !== libraryTypeFilter) return false;

    // Tag filter
    if (libraryTagFilter !== 'all') {
      if (!compound.tags || !compound.tags.includes(libraryTagFilter)) return false;
    }

    return true;
  });
}

function getAllTags() {
  const tagSet = new Set();
  LIBRARY_DATA.forEach(c => {
    if (c.tags) c.tags.forEach(t => tagSet.add(t));
  });
  return [...tagSet].sort();
}

function formatHalfLife(hours) {
  if (hours === null || hours === undefined) return 'Topical';
  if (hours < 1/60) return `${Math.round(hours * 3600)}s`;
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours}h`;
  const days = hours / 24;
  if (Number.isInteger(days)) return `${days}d`;
  return `${days.toFixed(1)}d`;
}

async function renderLibrary() {
  const container = document.getElementById('library-grid');
  if (!container) return;

  await refreshCompoundStatuses();

  // Load inventory for stock display on cards
  const _libInventory = await window.api.getInventory();
  const _libInventoryByCompound = {};
  _libCompoundsWithInventory = new Set();
  for (const item of _libInventory) {
    const name = item.compoundName || '';
    if (!_libInventoryByCompound[name]) _libInventoryByCompound[name] = [];
    _libInventoryByCompound[name].push(item);
    _libCompoundsWithInventory.add(name);
  }
  // Also check orders for compound line items
  const _libOrders = await window.api.getOrders();
  for (const order of _libOrders) {
    for (const li of (order.lineItems || [])) {
      if (li.type === 'compound' && li.compoundName) {
        _libCompoundsWithInventory.add(li.compoundName);
      }
    }
  }

  const filtered = getFilteredLibrary();
  const countEl = document.getElementById('library-count');
  if (countEl) countEl.textContent = `${filtered.length} compound${filtered.length !== 1 ? 's' : ''}`;

  // Populate tag filter if not already done
  const tagFilter = document.getElementById('library-tag-filter');
  if (tagFilter && tagFilter.options.length <= 1) {
    getAllTags().forEach(tag => {
      const opt = document.createElement('option');
      opt.value = tag;
      opt.textContent = tag;
      tagFilter.appendChild(opt);
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="library-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <p>No compounds match your search.</p>
      </div>`;
    return;
  }

  // Escape compound names for onclick - handle single quotes
  const escapeName = (name) => name.replace(/'/g, "\\'").replace(/"/g, '&quot;');

  container.innerHTML = filtered.map((compound, i) => {
    const typeConf = LIBRARY_TYPE_CONFIG[compound.type] || LIBRARY_TYPE_CONFIG['Peptide'];
    const status = getCompoundStatus(compound.name);
    const statusBadge = status === 'active'
      ? '<span class="compound-status-badge active">Active</span>'
      : status === 'planned'
      ? '<span class="compound-status-badge planned">Planned</span>'
      : '';

    return `
      <div class="library-card" onclick="openLibraryCompoundDetail('${escapeName(compound.name)}')">
        <div class="library-card-header">
          <div class="library-card-title-row">
            <h3 class="library-card-name">${escapeHtml(compound.name)}</h3>
            <span class="library-type-badge" style="background:${typeConf.bg};color:${typeConf.color}">${compound.type}</span>
            ${statusBadge}
          </div>
          <div class="library-card-meta">
            <span class="library-meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${formatHalfLife(compound.halfLifeHours)}
            </span>
          </div>
        </div>

        ${compound.benefits.length > 0 ? `
          <div class="library-card-benefits">
            ${compound.benefits.slice(0, 3).map(b => `<span class="library-benefit-pill">${escapeHtml(b)}</span>`).join('')}
            ${compound.benefits.length > 3 ? `<span class="library-benefit-pill library-benefit-pill-more">+${compound.benefits.length - 3}</span>` : ''}
          </div>` : ''}

        ${compound.tags.length > 0 ? `
          <div class="library-card-tagline">${compound.tags.map(t => escapeHtml(t)).join(' · ')}</div>` : ''}

        ${(() => {
          // Orders are the source of truth — gather ALL order items for this compound
          const invItems = _libInventoryByCompound[compound.name] || [];
          const oItems = [];
          for (const order of _libOrders) {
            for (const li of (order.lineItems || [])) {
              if (li.type === 'compound' && li.compoundName === compound.name) {
                oItems.push(li);
              }
            }
          }
          if (oItems.length === 0 && invItems.length === 0) return '';

          // Group by mg per vial — orders for vials/cost/tested/batch, inventory for remainingAmount
          const mgGroups = {};
          for (const item of oItems) {
            const mg = item.amountPerUnit || 0;
            if (!mgGroups[mg]) mgGroups[mg] = { orderItems: [], invItems: [] };
            mgGroups[mg].orderItems.push(item);
          }
          for (const item of invItems) {
            const mg = item.amountPerUnit || 0;
            if (!mgGroups[mg]) mgGroups[mg] = { orderItems: [], invItems: [] };
            mgGroups[mg].invItems.push(item);
          }

          let cards = '';
          for (const [mg, group] of Object.entries(mgGroups)) {
            const mgNum = parseFloat(mg);
            const totalVials = group.orderItems.reduce((s, e) => s + (e.quantity || 0), 0);
            const totalMg = mgNum * totalVials;
            const totalRemaining = group.invItems.reduce((s, e) => s + (e.remainingAmount || 0), 0);
            const allItems = [...group.orderItems, ...group.invItems];
            const capColors = [...new Set(allItems.map(e => e.capColor).filter(c => c && c !== '#000000'))];
            const capDots = capColors.slice(0, 3).map(c =>
              '<span class="inv-cap-dot" style="background:' + c + '"></span>'
            ).join('');
            const batches = [...new Set(group.orderItems.map(e => e.batchNumber).filter(Boolean))];
            const batchTags = batches.map(b => '<span class="inv-batch-tag">' + escapeHtml(b) + '</span>').join('');
            const tested = group.orderItems.some(e => e.tested);
            const hasStock = group.invItems.length > 0;
            const pct = totalMg > 0 && hasStock ? Math.round((totalRemaining / totalMg) * 100) : 0;
            const isLow = hasStock && pct < 20;
            const totalCost = group.orderItems.reduce((s, e) => s + (e.cost || 0), 0);
            const costPerVial = totalVials > 0 && totalCost > 0 ? (totalCost / totalVials) : 0;

            cards += '<div class="compound-inv-card lib-inv-card ' + (isLow ? 'low' : '') + '">' +
              '<div class="compound-inv-card-header">' +
                capDots +
                '<span class="compound-inv-card-name">' + escapeHtml(compound.name) + '</span>' +
                (tested ? '<span class="inv-tested-badge" title="Tested">&#10003;</span>' : '') +
                batchTags +
                (isLow ? '<span class="inv-low-badge">Low</span>' : '') +
              '</div>' +
              '<div class="compound-inv-card-qty">' +
                '<span class="compound-inv-qty-value">' + totalVials + '</span>' +
                '<span class="compound-inv-qty-unit">vials</span>' +
                (mgNum ? '<span class="compound-inv-qty-x">x</span><span class="compound-inv-qty-value">' + mgNum + '</span><span class="compound-inv-qty-unit">mg</span>' : '') +
              '</div>' +
              '<div class="compound-inv-card-detail">' +
                '<span>' + totalMg.toFixed(0) + ' mg total</span>' +
                (hasStock ? '<span>' + totalRemaining.toFixed(0) + ' mg remaining</span>' : '') +
                (totalCost > 0 ? '<span class="compound-inv-cost">$' + totalCost.toFixed(2) + (costPerVial > 0 ? ' ($' + costPerVial.toFixed(2) + '/vial)' : '') + '</span>' : '') +
              '</div>' +
              (hasStock ? '<div class="inv-progress-bar-sm"><div class="inv-progress-fill ' + (isLow ? 'low' : '') + '" style="width:' + Math.min(pct, 100) + '%"></div></div>' : '') +
            '</div>';
          }

          return '<div class="library-card-inventory-grid" onclick="event.stopPropagation()">' + cards + '</div>';
        })()}

        <div class="library-card-expand-hint">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>`;
  }).join('');
}

// ═══════════════════════════════════════
// LIBRARY DETAIL (delegates to unified compound-detail view)
// ═══════════════════════════════════════

function openLibraryCompoundDetail(compoundName) {
  const compound = LIBRARY_DATA.find(c => c.name === compoundName);
  if (!compound) return;

  // Delegate to unified compound detail with library origin
  openCompoundDetail(compoundName, { origin: 'library', compoundName: compoundName });
}

async function saveLibraryEdits() {
  // Uses detailLibraryData from compound-detail.js
  if (!detailLibraryData) return;
  const compound = detailLibraryData;

  // Read values from edit form
  const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : null; };

  const newName = getVal('lib-edit-name');
  if (newName && newName.trim()) compound.name = newName.trim();

  const newType = getVal('lib-edit-type');
  if (newType) compound.type = newType;

  const newHalfLife = getVal('lib-edit-halflife');
  if (newHalfLife !== null && newHalfLife !== '') {
    compound.halfLifeHours = parseFloat(newHalfLife) || null;
  }

  const newBenefits = getVal('lib-edit-benefits');
  if (newBenefits !== null) {
    compound.benefits = newBenefits.split(',').map(s => s.trim()).filter(Boolean);
  }

  const newTags = getVal('lib-edit-tags');
  if (newTags !== null) {
    compound.tags = newTags.split(',').map(s => s.trim()).filter(Boolean);
  }

  const newGoodWith = getVal('lib-edit-goodwith');
  if (newGoodWith !== null) {
    compound.goodWith = newGoodWith.split(',').map(s => s.trim()).filter(Boolean);
  }

  const newNotGoodWith = getVal('lib-edit-notgoodwith');
  if (newNotGoodWith !== null) {
    compound.notGoodWith = newNotGoodWith.split(',').map(s => s.trim()).filter(Boolean);
  }

  const newProtocols = getVal('lib-edit-protocols');
  if (newProtocols !== null) compound.protocols = newProtocols;

  const newSideEffects = getVal('lib-edit-sideeffects');
  if (newSideEffects !== null) {
    compound.sideEffects = newSideEffects.split(',').map(s => s.trim()).filter(Boolean);
  }

  const newNotes = getVal('lib-edit-notes');
  if (newNotes !== null) compound.notes = newNotes;

  // Persist to electron-store
  const overrideData = {
    type: compound.type,
    halfLifeHours: compound.halfLifeHours,
    benefits: compound.benefits,
    tags: compound.tags,
    goodWith: compound.goodWith,
    notGoodWith: compound.notGoodWith,
    protocols: compound.protocols,
    sideEffects: compound.sideEffects,
    notes: compound.notes
  };
  await window.api.saveLibraryOverride(compound.name, overrideData);

  showToast(`Updated ${compound.name}`, 'success');
}

function renderLibraryReadView(compound, typeConf) {
  const sections = [];

  // Benefits & Side Effects — side-by-side boxes
  sections.push(`
    <div class="detail-box-row">
      <div class="detail-box benefits-box">
        <h4 class="detail-box-header benefits-header">✦ Benefits</h4>
        ${compound.tags.length > 0 ? `
          <div class="library-tag-chips">
            ${compound.tags.map(t => `<span class="tag-chip">${escapeHtml(t)}</span>`).join('')}
          </div>` : ''}
        ${compound.benefits.length > 0
          ? `<span class="detail-box-text benefits-text">${compound.benefits.map(b => escapeHtml(b)).join(' · ')}</span>`
          : `<span class="detail-box-none">No benefits listed</span>`}
      </div>
      <div class="detail-box side-effects-box">
        <h4 class="detail-box-header side-effects-header">⚠ Side Effects</h4>
        ${compound.sideEffects.length > 0
          ? `<span class="detail-box-text side-effects-text">${compound.sideEffects.map(s => escapeHtml(s)).join(' · ')}</span>`
          : `<span class="detail-box-none">No known side effects</span>`}
      </div>
    </div>`);

  // Compatibility (merged Good With / Not Good With)
  if (compound.goodWith.length > 0 || compound.notGoodWith.length > 0) {
    const makeCompatItem = (name, type) => {
      const exists = LIBRARY_DATA.find(c => c.name === name);
      const escapedName = escapeHtml(name).replace(/'/g, "\\'");
      const prefix = type === 'good' ? '✓' : '✗';
      const cls = `compat-item ${type}${exists ? ' clickable' : ''}`;
      const onclick = exists ? ` onclick="event.stopPropagation(); openLibraryCompoundDetail('${escapedName}')"` : '';
      return `<span class="${cls}"${onclick}>${prefix} ${escapeHtml(name)}</span>`;
    };

    const items = [
      ...compound.goodWith.map(g => makeCompatItem(g, 'good')),
      ...compound.notGoodWith.map(n => makeCompatItem(n, 'bad'))
    ];

    sections.push(`
      <div class="lib-detail-section">
        <h4 class="library-detail-label">Compatibility</h4>
        <div class="compat-row">
          ${items.join('')}
        </div>
      </div>`);
  }

  // Protocols & Notes — side-by-side boxes
  if (compound.protocols || compound.notes) {
    sections.push(`
      <div class="detail-box-row">
        <div class="detail-box protocols-box">
          <h4 class="detail-box-header protocols-header">📋 Protocols & Dosing</h4>
          ${compound.protocols
            ? `<span class="detail-box-text protocols-text">${escapeHtml(compound.protocols)}</span>`
            : `<span class="detail-box-none">No protocols listed</span>`}
        </div>
        <div class="detail-box notes-box">
          <h4 class="detail-box-header notes-header">📝 Notes</h4>
          ${compound.notes
            ? `<span class="detail-box-text notes-text">${escapeHtml(compound.notes)}</span>`
            : `<span class="detail-box-none">No notes</span>`}
        </div>
      </div>`);
  }

  return sections.join('');
}

function renderLibraryEditForm(compound) {
  return `
    <div class="lib-edit-form">
      <div class="lib-edit-row">
        <div class="lib-edit-field flex-2">
          <label class="form-label">Name</label>
          <input type="text" id="lib-edit-name" value="${escapeHtml(compound.name)}">
        </div>
        <div class="lib-edit-field flex-1">
          <label class="form-label">Type</label>
          <select id="lib-edit-type">
            <option value="Peptide" ${compound.type === 'Peptide' ? 'selected' : ''}>Peptide</option>
            <option value="Hormone" ${compound.type === 'Hormone' ? 'selected' : ''}>Hormone</option>
            <option value="Supplement" ${compound.type === 'Supplement' ? 'selected' : ''}>Supplement</option>
            <option value="Blend" ${compound.type === 'Blend' ? 'selected' : ''}>Blend</option>
          </select>
        </div>
        <div class="lib-edit-field flex-1">
          <label class="form-label">Half-Life (hours)</label>
          <input type="number" id="lib-edit-halflife" step="any" value="${compound.halfLifeHours !== null ? compound.halfLifeHours : ''}">
        </div>
      </div>
      <div class="lib-edit-field">
        <label class="form-label">Benefits <span class="form-hint">(comma-separated)</span></label>
        <input type="text" id="lib-edit-benefits" value="${escapeHtml(compound.benefits.join(', '))}">
      </div>
      <div class="lib-edit-field">
        <label class="form-label">Tags <span class="form-hint">(comma-separated)</span></label>
        <input type="text" id="lib-edit-tags" value="${escapeHtml(compound.tags.join(', '))}">
      </div>
      <div class="lib-edit-row">
        <div class="lib-edit-field flex-1">
          <label class="form-label library-label-good">Good With <span class="form-hint">(comma-separated)</span></label>
          <input type="text" id="lib-edit-goodwith" value="${escapeHtml(compound.goodWith.join(', '))}">
        </div>
        <div class="lib-edit-field flex-1">
          <label class="form-label library-label-bad">Not Good With <span class="form-hint">(comma-separated)</span></label>
          <input type="text" id="lib-edit-notgoodwith" value="${escapeHtml(compound.notGoodWith.join(', '))}">
        </div>
      </div>
      <div class="lib-edit-field">
        <label class="form-label">Protocols & Dosing</label>
        <textarea id="lib-edit-protocols" rows="10">${escapeHtml(compound.protocols || '')}</textarea>
      </div>
      <div class="lib-edit-field">
        <label class="form-label library-label-warning">Side Effects <span class="form-hint">(comma-separated)</span></label>
        <input type="text" id="lib-edit-sideeffects" value="${escapeHtml(compound.sideEffects.join(', '))}">
      </div>
      <div class="lib-edit-field">
        <label class="form-label">Notes</label>
        <textarea id="lib-edit-notes" rows="3">${escapeHtml(compound.notes || '')}</textarea>
      </div>
    </div>`;
}

// Expose to global scope
window.openLibraryCompoundDetail = openLibraryCompoundDetail;
