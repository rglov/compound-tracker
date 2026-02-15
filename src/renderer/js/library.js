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
      const status = getCompoundStatus(compound.name);
      if (libraryStatusFilter === 'reference' && status !== 'reference') return false;
      if (libraryStatusFilter === 'active' && status !== 'active') return false;
      if (libraryStatusFilter === 'planned' && status !== 'planned' && status !== 'active') return false;
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
            ${compound.benefits.length > 0 ? `<span class="library-meta-item library-benefit-count">${compound.benefits.length} benefits</span>` : ''}
          </div>
        </div>

        <div class="library-card-tags">
          ${compound.tags.slice(0, 4).map(tag => `<span class="library-tag">${escapeHtml(tag)}</span>`).join('')}
          ${compound.tags.length > 4 ? `<span class="library-tag library-tag-more">+${compound.tags.length - 4}</span>` : ''}
        </div>

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

  // Info row
  sections.push(`
    <div class="lib-detail-info-row">
      <div class="lib-detail-info-card">
        <span class="lib-detail-info-label">Half-Life</span>
        <span class="lib-detail-info-value">${formatHalfLife(compound.halfLifeHours)}</span>
      </div>
      <div class="lib-detail-info-card">
        <span class="lib-detail-info-label">Type</span>
        <span class="lib-detail-info-value" style="color:${typeConf.color}">${compound.type}</span>
      </div>
      <div class="lib-detail-info-card">
        <span class="lib-detail-info-label">Benefits</span>
        <span class="lib-detail-info-value">${compound.benefits.length}</span>
      </div>
      <div class="lib-detail-info-card">
        <span class="lib-detail-info-label">Side Effects</span>
        <span class="lib-detail-info-value">${compound.sideEffects.length}</span>
      </div>
    </div>`);

  // Benefits
  if (compound.benefits.length > 0) {
    sections.push(`
      <div class="lib-detail-section">
        <h4 class="library-detail-label">Benefits</h4>
        <div class="library-benefit-tags">
          ${compound.benefits.map(b => `<span class="library-benefit-tag">${escapeHtml(b)}</span>`).join('')}
        </div>
      </div>`);
  }

  // Tags
  if (compound.tags.length > 0) {
    sections.push(`
      <div class="lib-detail-section">
        <h4 class="library-detail-label">Tags</h4>
        <div class="library-card-tags">
          ${compound.tags.map(t => `<span class="library-tag">${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>`);
  }

  // Good With / Not Good With
  if (compound.goodWith.length > 0 || compound.notGoodWith.length > 0) {
    sections.push(`
      <div class="lib-detail-section">
        ${compound.goodWith.length > 0 ? `
          <h4 class="library-detail-label library-label-good">Good With</h4>
          <div class="library-compat-tags">
            ${compound.goodWith.map(g => `<span class="library-compat-tag good">${escapeHtml(g)}</span>`).join('')}
          </div>` : ''}
        ${compound.notGoodWith.length > 0 ? `
          <h4 class="library-detail-label library-label-bad" style="margin-top:10px">Not Good With</h4>
          <div class="library-compat-tags">
            ${compound.notGoodWith.map(n => `<span class="library-compat-tag bad">${escapeHtml(n)}</span>`).join('')}
          </div>` : ''}
      </div>`);
  }

  // Protocols
  if (compound.protocols) {
    sections.push(`
      <div class="lib-detail-section">
        <h4 class="library-detail-label">Protocols & Dosing</h4>
        <div class="library-protocol-text">${escapeHtml(compound.protocols)}</div>
      </div>`);
  }

  // Side Effects
  if (compound.sideEffects.length > 0) {
    sections.push(`
      <div class="lib-detail-section">
        <h4 class="library-detail-label library-label-warning">Side Effects</h4>
        <div class="library-side-effects">
          ${compound.sideEffects.map(s => `<span class="library-side-effect">${escapeHtml(s)}</span>`).join('')}
        </div>
      </div>`);
  }

  // Notes
  if (compound.notes) {
    sections.push(`
      <div class="lib-detail-section">
        <h4 class="library-detail-label">Notes</h4>
        <p class="library-notes-text">${escapeHtml(compound.notes)}</p>
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
