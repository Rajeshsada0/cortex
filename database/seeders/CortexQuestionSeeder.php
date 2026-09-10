<?php

namespace Database\Seeders;

use App\Domain\Scoring\ConfidenceLevel;
use App\Domain\Scoring\ExamPathway;
use App\Domain\SpacedRepetition\SpacedRepetitionService;
use App\Models\Question;
use App\Models\QuestionAttempt;
use App\Models\QuestionExamRelevance;
use App\Models\QuestionOption;
use App\Models\Subject;
use App\Models\TestSession;
use App\Models\Topic;
use App\Models\User;
use App\Models\UserNoteBookmark;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class CortexQuestionSeeder extends Seeder
{
    public function run(): void
    {
        $srsService = new SpacedRepetitionService;

        // 1. Create primary test user
        $user = User::firstOrCreate(
            ['email' => 'dr.cortex@example.com'],
            [
                'name' => 'Dr. Aayush Sharma, MBBS',
                'is_admin' => true,
                'password' => Hash::make('password123'),
                'active_pathway' => 'INI_CET',
                'target_exam_date' => Carbon::now()->addMonths(4)->toDateString(),
                'daily_study_hours' => 7,
                'daily_mcq_target' => 120,
            ]
        );

        // SVG clinical images data URIs
        $ecgSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="100%" height="100%"><rect width="800" height="300" fill="%23fdf2f2"/><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23fca5a5" stroke-width="0.7"/></pattern></defs><rect width="800" height="300" fill="url(%23grid)"/><text x="20" y="30" font-family="monospace" font-size="14" fill="%23991b1b" font-weight="bold">LEAD II / III / aVF: Acute Inferior Wall ST-Elevation (Tombstoning)</text><path d="M 20,150 L 80,150 L 95,140 L 105,150 L 125,150 L 135,160 L 145,50 L 160,180 L 170,110 L 210,110 L 250,150 L 320,150 L 335,140 L 345,150 L 365,150 L 375,160 L 385,50 L 400,180 L 410,110 L 450,110 L 490,150 L 560,150 L 575,140 L 585,150 L 605,150 L 615,160 L 625,50 L 640,180 L 650,110 L 690,110 L 750,150" fill="none" stroke="%23111827" stroke-width="3"/></svg>';

        $histoSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="100%" height="100%"><rect width="800" height="300" fill="%23f5d0fe"/><circle cx="400" cy="150" r="90" fill="%23c084fc" opacity="0.6"/><circle cx="360" cy="140" r="30" fill="%237e22ce"/><circle cx="440" cy="140" r="30" fill="%237e22ce"/><circle cx="360" cy="140" r="12" fill="%23ec4899"/><circle cx="440" cy="140" r="12" fill="%23ec4899"/><circle cx="200" cy="80" r="15" fill="%239333ea"/><circle cx="620" cy="220" r="16" fill="%239333ea"/><circle cx="580" cy="70" r="14" fill="%239333ea"/><circle cx="210" cy="230" r="18" fill="%239333ea"/><text x="30" y="40" font-family="sans-serif" font-size="16" fill="%23581c87" font-weight="bold">H&amp;E: Classic Reed-Sternberg Cell (Binucleated "Owl-Eyes" Appearance)</text></svg>';

        $ctSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="100%" height="100%"><rect width="800" height="300" fill="%2309090b"/><circle cx="400" cy="150" r="120" fill="%2327272a" stroke="%2371717a" stroke-width="4"/><path d="M 330 110 Q 300 150 330 200 Q 370 170 330 110" fill="%2318181b"/><path d="M 470 110 Q 500 150 470 200 Q 430 170 470 110" fill="%2318181b"/><polygon points="460,130 500,165 470,185" fill="%23fafafa"/><text x="30" y="40" font-family="monospace" font-size="14" fill="%23e4e4e7">CTPA Axial Slice: Wedge-Shaped Pleural-Based Consolidation (Hampton Hump)</text></svg>';

        $dermSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="100%" height="100%"><rect width="800" height="300" fill="%23ffedd5"/><path d="M 380,80 Q 480,90 470,160 Q 490,220 400,230 Q 310,210 330,140 Q 320,80 380,80 Z" fill="%23292524" stroke="%2378350f" stroke-width="4"/><circle cx="390" cy="140" r="25" fill="%237f1d1d"/><circle cx="430" cy="180" r="20" fill="%231e3a8a"/><text x="30" y="40" font-family="sans-serif" font-size="16" fill="%237c2d12" font-weight="bold">Dermoscopy: Asymmetric Pigmented Macule with Irregular Borders (Melanoma)</text></svg>';

        $questionsData = [
            [
                'code' => 'Q-MED-0401',
                'subject_slug' => 'general-medicine',
                'topic_slug' => 'cardiology-acs',
                'difficulty' => 'HARD',
                'question_type' => 'SINGLE_BEST_ANSWER',
                'stem' => "A 58-year-old male with long-standing type 2 diabetes mellitus and a 30 pack-year smoking history presents to the emergency department with 2 hours of crushing retrosternal chest pain radiating to his jaw and epigastrium, accompanied by profuse diaphoresis and nausea. Blood pressure is 88/56 mmHg, heart rate is 52 bpm, and oxygen saturation is 96% on room air. Physical examination reveals cool, clammy extremities and elevated jugular venous pressure without pulmonary rales. A 12-lead ECG is obtained immediately (shown below). Which of the following is the most appropriate next step in pharmacologic management?",
                'image_url' => $ecgSvg,
                'image_caption' => '12-lead ECG demonstrating marked ST-segment elevation in leads II, III, and aVF with reciprocal depressions in leads I and aVL.',
                'correct_option' => 'C',
                'learning_objective' => 'Identify right ventricular myocardial infarction complicating inferior STEMI and recognize that preload-reducing agents (nitroglycerin, morphine, diuretics) are contraindicated due to risk of catastrophic hypotension.',
                'foundation_explanation' => 'The inferior wall of the left ventricle and the right ventricle are supplied predominantly by the Right Coronary Artery (RCA) in right-dominant circulation (~85% of individuals). Occlusion of the proximal RCA leads to acute inferior wall infarction and ischemic right ventricular dysfunction.',
                'integration_explanation' => 'The ischemic right ventricle becomes a stiff, non-compliant conduit with severely impaired ejection fraction. Left ventricular filling becomes entirely dependent on right ventricular end-diastolic preload. Administration of venodilators (e.g., nitrates) drops right atrial and RV preload, precipitating sudden cardiovascular collapse.',
                'application_explanation' => 'Immediate aggressive intravenous volume resuscitation with isotonic crystalloids (0.9% Normal Saline 500-1000 mL bolus) restores RV preload and LV stroke volume. Nitroglycerin and beta-blockers must be strictly withheld in this patient due to hypotension and bradycardia.',
                'memory_peg' => 'RV Infarct Triad: Hypotension + Elevated JVP + Clear Lung Fields. Rule: "Give Fluids, Ban Nitrates!"',
                'exams' => ['MECEE_PG', 'INI_CET', 'USMLE_STEP1', 'USMLE_STEP2CK', 'COMBINED'],
                'options' => [
                    ['option_key' => 'A', 'option_text' => 'Sublingual Nitroglycerin 0.4 mg every 5 minutes', 'rationale' => 'Incorrect. Nitrates produce peripheral venodilation, causing an acute drop in RV preload. In RV infarction, this precipitates profound shock and cardiac arrest.'],
                    ['option_key' => 'B', 'option_text' => 'Intravenous Metoprolol 5 mg slow push', 'rationale' => 'Incorrect. The patient already presents with sinus bradycardia (52 bpm) and cardiogenic hypotension (88/56 mmHg); beta-blockade will worsen bradyarrhythmia and output.'],
                    ['option_key' => 'C', 'option_text' => 'Intravenous Isotonic Saline Bolus (500–1000 mL)', 'rationale' => 'Correct! First-line intervention for hemodynamically unstable RV infarction to optimize RV filling pressures and maintain LV stroke volume prior to emergency primary PCI.'],
                    ['option_key' => 'D', 'option_text' => 'Intravenous Furosemide 40 mg', 'rationale' => 'Incorrect. Furosemide causes rapid diuresis and further volume depletion, worsening RV filling and precipitating cardiogenic collapse; the lungs are clear of congestion.'],
                ],
            ],
            [
                'code' => 'Q-PHARM-0192',
                'subject_slug' => 'pharmacology',
                'topic_slug' => 'cardiovascular-drugs',
                'difficulty' => 'MEDIUM',
                'question_type' => 'SINGLE_BEST_ANSWER',
                'stem' => "A 64-year-old female with persistent atrial fibrillation and symptomatic heart failure with reduced ejection fraction (HFrEF, LVEF 30%) is admitted with fatigue, anorexia, visual halos with yellow-tinted vision (xanthopsia), and palpitations. Her current medications include carvedilol, sacubitril/valsartan, spironolactone, and digoxin. Her serum potassium is 2.8 mEq/L, serum creatinine is 1.8 mg/dL, and digoxin level is 3.6 ng/mL (therapeutic: 0.5-0.9 ng/mL). ECG shows atrial fibrillation with frequent ventricular premature complexes and a ventricular rate of 48 bpm. Which of the following is the definitive antidote?",
                'image_url' => null,
                'image_caption' => null,
                'correct_option' => 'B',
                'learning_objective' => 'Recognize the clinical manifestations of digitalis toxicity exacerbated by hypokalemia and identify Digoxin-Specific Antibody Fragments (Fab) as the definitive antidote.',
                'foundation_explanation' => 'Digoxin exerts positive inotropy by reversibly inhibiting the membrane-bound Na+/K+-ATPase pump. Potassium and digoxin compete for the same extracellular binding domain on the alpha subunit of this ATPase pump.',
                'integration_explanation' => 'When hypokalemia exists (often induced by loop or thiazide diuretics), fewer potassium ions compete for the Na+/K+ pump, allowing increased digoxin binding and dramatically amplifying toxicity even at borderline serum levels.',
                'application_explanation' => 'In severe life-threatening digoxin poisoning marked by cardiac arrhythmias, severe conduction blocks, and end-organ toxicity, Digoxin Immune Fab (DigiFab) binds free intravascular digoxin, rendering it inactive with rapid renal clearance.',
                'memory_peg' => 'Low K+ = High Digoxin Toxicity. "Digi-Fab Grabs Digoxin Fast!"',
                'exams' => ['MECEE_PG', 'INI_CET', 'USMLE_STEP1', 'USMLE_STEP2CK', 'COMBINED'],
                'options' => [
                    ['option_key' => 'A', 'option_text' => 'Intravenous Calcium Gluconate 10%', 'rationale' => 'Incorrect. Calcium administration in digoxin toxicity is traditionally avoided as intracellular calcium is already dangerously overloaded, risking intractable ventricular fibrillation ("stone heart").'],
                    ['option_key' => 'B', 'option_text' => 'Digoxin-Specific Antibody Fragments (Fab)', 'rationale' => 'Correct! DigiFab is the primary targeted antitoxin indicated for life-threatening arrhythmias, severe conduction disturbances, or profound hyper/hypokalemia in digoxin overdose.'],
                    ['option_key' => 'C', 'option_text' => 'Hemodialysis', 'rationale' => 'Incorrect. Digoxin has an exceptionally large volume of distribution (5-7 L/kg) and extensive tissue binding, rendering hemodialysis virtually ineffective.'],
                    ['option_key' => 'D', 'option_text' => 'Intravenous Amiodarone infusion', 'rationale' => 'Incorrect. Amiodarone inhibits renal and biliary P-glycoprotein efflux of digoxin, which would further escalate serum digoxin concentrations and worsen AV nodal conduction.'],
                ],
            ],
            [
                'code' => 'Q-PATH-0220',
                'subject_slug' => 'pathology',
                'topic_slug' => 'hematopathology',
                'difficulty' => 'MEDIUM',
                'question_type' => 'SINGLE_BEST_ANSWER',
                'stem' => "A 24-year-old medical student notes painless, rubbery left supraclavicular lymphadenopathy that noticeably aches whenever he consumes beer or wine. Over the past 6 weeks, he has experienced intermittent high fevers lasting 4-5 days followed by afebrile intervals of equal length (Pel-Ebstein fever), along with drenching night sweats and an unintentional 7-kg weight loss. An excisional lymph node biopsy is performed (histology shown). Immunophenotyping of the diagnostic giant cells will most consistently demonstrate which marker profile?",
                'image_url' => $histoSvg,
                'image_caption' => 'Excisional lymph node section displaying a characteristic binucleated giant cell with prominent eosinophilic inclusion-like nucleoli surrounded by a clear halo.',
                'correct_option' => 'A',
                'learning_objective' => 'Differentiate classical Hodgkin Lymphoma from Non-Hodgkin Lymphoma and recall the classic immunophenotypic surface profile (CD15+, CD30+, CD20-, CD45-) of Reed-Sternberg cells.',
                'foundation_explanation' => 'Reed-Sternberg (RS) cells originate from germinal center B lymphocytes that have undergone crippled somatic hypermutations, failing to undergo apoptosis due to Epstein-Barr Virus (EBV) or NF-kB oncogenic activation.',
                'integration_explanation' => 'Unlike conventional mature B-cell lymphomas, classical RS cells downregulate standard B-cell lineage surface antigens (CD20, CD19, CD45/LCA) and aberrantly express activation and TNFR family markers CD30 (Ki-1 antigen) and CD15 (granulocyte marker / Lewis X).',
                'application_explanation' => 'Targeted anti-CD30 antibody-drug conjugate Brentuximab vedotin delivers cytotoxic monomethyl auristatin E directly into Reed-Sternberg cells, demonstrating high response rates in refractory/relapsed Hodgkin lymphoma.',
                'memory_peg' => 'Reed-Sternberg code: "2 x 15 = 30" (Bimpaired, CD15+ and CD30+ positive, CD20 usually negative).',
                'exams' => ['MECEE_PG', 'INI_CET', 'USMLE_STEP1', 'USMLE_STEP2CK', 'COMBINED'],
                'options' => [
                    ['option_key' => 'A', 'option_text' => 'CD15+, CD30+, CD20-, CD45-', 'rationale' => 'Correct! Classical Reed-Sternberg cells in Nodular Sclerosis, Mixed Cellularity, and Lymphocyte-Depleted Hodgkin Lymphoma are characteristically CD15+ and CD30+ positive while losing standard B-cell markers CD20 and CD45.'],
                    ['option_key' => 'B', 'option_text' => 'CD20+, CD19+, CD10+, t(14;18)', 'rationale' => 'Incorrect. This immunophenotypic and cytogenetic profile defines Follicular Lymphoma overexpressing BCL-2.'],
                    ['option_key' => 'C', 'option_text' => 'CD5+, CD23+, CD20 (dim), Cyclin D1-', 'rationale' => 'Incorrect. This profile defines Chronic Lymphocytic Leukemia / Small Lymphocytic Lymphoma (CLL/SLL).'],
                    ['option_key' => 'D', 'option_text' => 'CD5+, CD20+, CD23-, Cyclin D1+, t(11;14)', 'rationale' => 'Incorrect. This defines Mantle Cell Lymphoma with CCND1-IGH translocation and Cyclin D1 overexpression.'],
                ],
            ],
            [
                'code' => 'Q-RAD-0119',
                'subject_slug' => 'radiology',
                'topic_slug' => 'emergency-chest-imaging',
                'difficulty' => 'HARD',
                'question_type' => 'SINGLE_BEST_ANSWER',
                'stem' => "A 36-year-old woman who underwent an elective laparoscopic cholecystectomy 5 days ago presents to the emergency room with sudden-onset sharp right-sided pleuritic chest pain, dyspnea, and hemoptysis. Heart rate is 118 bpm, respiratory rate is 26/min, BP is 124/82 mmHg, and pulse oximetry is 91% on room air. D-dimer is 3,450 ng/mL. Contrast-enhanced CT Pulmonary Angiography (CTPA) is obtained (shown below). Which classic radiological sign is demonstrated on the peripheral lung window?",
                'image_url' => $ctSvg,
                'image_caption' => 'CT chest axial cut showing a peripheral, wedge-shaped pulmonary opacity with the base abutting the visceral pleura and rounded apex pointing towards the hilum.',
                'correct_option' => 'D',
                'learning_objective' => 'Identify the imaging hallmarks of pulmonary embolism and pulmonary infarction on chest radiography and CTPA.',
                'foundation_explanation' => 'The lung has dual arterial blood supplies: the pulmonary circulation (for gas exchange) and the bronchial circulation (originating from aorta/intercostals for parenchyma nutrition).',
                'integration_explanation' => 'When a distal pulmonary thromboembolism occurs, incomplete bronchial collateralization can lead to pulmonary infarction, causing local alveolar hemorrhage and necrosis that appears as a wedge-shaped peripheral density.',
                'application_explanation' => 'Hampton Hump is a classic radiologic hallmark representing alveolar edema and hemorrhage from pulmonary infarction. Westermark sign represents distal oligemia/hypovolemia. Fleischner sign represents an enlarged central pulmonary artery from clot distension.',
                'memory_peg' => 'Hampton Hump = Wedge of Infarction ("Hump against the pleura"). Westermark = Focal Oligemia ("Washed out lung").',
                'exams' => ['MECEE_PG', 'INI_CET', 'USMLE_STEP1', 'USMLE_STEP2CK', 'COMBINED'],
                'options' => [
                    ['option_key' => 'A', 'option_text' => 'Westermark Sign', 'rationale' => 'Incorrect. Westermark sign is focal oligemia (hyperlucency) distal to an occluded lobar or segmental pulmonary artery due to decreased vascular perfusion.'],
                    ['option_key' => 'B', 'option_text' => 'Golden S Sign', 'rationale' => 'Incorrect. Golden S sign is seen on chest radiograph when a central right upper lobe mass causes bronchial obstruction and atelectasis with fissure displacement.'],
                    ['option_key' => 'C', 'option_text' => 'Rigler Sign', 'rationale' => 'Incorrect. Rigler sign (double wall sign) indicates pneumoperitoneum when gas outlines both the luminal and peritoneal surfaces of bowel wall.'],
                    ['option_key' => 'D', 'option_text' => 'Hampton Hump', 'rationale' => 'Correct! Hampton Hump is a peripheral wedge-shaped opacity abutting the visceral pleura reflecting pulmonary infarction distal to a thromboembolic vessel.'],
                ],
            ],
            [
                'code' => 'Q-DERM-0081',
                'subject_slug' => 'dermatology',
                'topic_slug' => 'derm-emergencies-infections',
                'difficulty' => 'MEDIUM',
                'question_type' => 'SINGLE_BEST_ANSWER',
                'stem' => "A 48-year-old man presents with a dark, irregularly shaped skin lesion on his upper back that has expanded over the past 8 months. His wife noticed it bleeding after drying with a towel. On examination, the lesion measures 9 mm x 7 mm, exhibits irregular notched borders, and contains mixed variegated shades of black, dark brown, and slate blue (dermoscopy shown). Which microscopic parameter is the single most important prognostic factor for predicting 5-year survival and risk of metastatic dissemination in localized primary cutaneous disease?",
                'image_url' => $dermSvg,
                'image_caption' => 'Dermoscopy revealing asymmetric pigment network, atypical dots/globules, and focal blue-white veil consistent with invasive melanoma.',
                'correct_option' => 'A',
                'learning_objective' => 'Recall that Breslow tumor thickness (depth in millimeters) is the most critical prognostic indicator in primary localized cutaneous malignant melanoma.',
                'foundation_explanation' => 'Melanocytes originate from the neural crest and migrate to the basal epidermal layer. Malignant transformation typically exhibits radial (horizontal) growth initially, followed by vertical (invasive) growth into the dermis.',
                'integration_explanation' => 'The microvasculature and lymphatic plexus of the skin reside in the papillary and reticular dermis. Once atypical melanocytes penetrate through the basement membrane into the deeper dermal layers, the probability of lymphatic and hematogenous intravasation escalates exponentially.',
                'application_explanation' => 'Breslow thickness measures vertical tumor invasion from the top of the granular cell layer of the epidermis (or base of ulcer) to the deepest invasive melanoma cell in millimeters using an ocular micrometer, dictating surgical excision margins (1 cm for <1 mm vs 2 cm for >2 mm) and sentinel lymph node biopsy indications.',
                'memory_peg' => '"Breslow = Best for prognosis". Clark level is anatomical level; Breslow depth is true millimeter measurement.',
                'exams' => ['MECEE_PG', 'INI_CET', 'USMLE_STEP1', 'USMLE_STEP2CK', 'COMBINED'],
                'options' => [
                    ['option_key' => 'A', 'option_text' => 'Breslow depth (vertical thickness in millimeters)', 'rationale' => 'Correct! Breslow tumor thickness is the single most powerful prognostic factor for recurrence and overall survival in localized primary melanoma.'],
                    ['option_key' => 'B', 'option_text' => 'Clark level of anatomical invasion', 'rationale' => 'Incorrect. Clark levels define invasion by anatomic dermal layer (I to V) and have been superseded by Breslow depth in current AJCC staging guidelines.'],
                    ['option_key' => 'C', 'option_text' => 'Total horizontal surface diameter', 'rationale' => 'Incorrect. While horizontal diameter >6 mm is part of the clinical ABCDE screening heuristic, it does not correlate directly with metastatic propensity or survival.'],
                    ['option_key' => 'D', 'option_text' => 'Degree of dermal melanophage pigmentation', 'rationale' => 'Incorrect. Dermal melanophages represent benign macrophage phagocytosis of melanin debris and do not determine staging or clinical prognosis.'],
                ],
            ],
            [
                'code' => 'Q-SURG-0310',
                'subject_slug' => 'general-surgery',
                'topic_slug' => 'acute-abdomen-trauma',
                'difficulty' => 'HARD',
                'question_type' => 'SINGLE_BEST_ANSWER',
                'stem' => "A 29-year-old unrestrained driver is brought to the trauma center following a high-speed head-on motor vehicle collision. Airway is intact, breath sounds are symmetric, and pulse oximetry is 98% on 4 L nasal cannula. Pulse is 128 bpm, BP is 82/50 mmHg despite 1,000 mL warm lactated Ringer solution. Abdomen is distended and diffusely tender. Extended FAST (eFAST) ultrasound shows significant anechoic fluid in the hepatorenal space (Morison pouch) and splenorenal recess. Pelvis is stable. Which of the following is the most appropriate next step in management?",
                'image_url' => null,
                'image_caption' => null,
                'correct_option' => 'B',
                'learning_objective' => 'Apply ATLS guidelines: a hemodynamically unstable blunt trauma patient with positive FAST examination for hemoperitoneum mandates immediate exploratory laparotomy without delay for CT scanning.',
                'foundation_explanation' => 'Blunt abdominal trauma causes rapid shear and compressive forces against solid viscera (spleen is most commonly injured, followed by liver) and mesentery.',
                'integration_explanation' => 'An unstable patient who fails to respond or transiently responds to initial crystalloid infusion exhibits ongoing Class III or IV hemorrhagic shock with hypoperfusion and impending triad of death (hypothermia, coagulopathy, acidosis).',
                'application_explanation' => 'Under ATLS principles, an unstable patient with confirmed hemoperitoneum should NOT be transported to the CT scanner ("the tunnel of death"). Immediate transfer to the operating room for emergency exploratory laparotomy is life-saving.',
                'memory_peg' => 'ATLS Golden Rule: "Unstable + Free Fluid on FAST = Immediate Laparotomy!"',
                'exams' => ['MECEE_PG', 'INI_CET', 'USMLE_STEP1', 'USMLE_STEP2CK', 'COMBINED'],
                'options' => [
                    ['option_key' => 'A', 'option_text' => 'Contrast-Enhanced Abdominal and Pelvic CT scan', 'rationale' => 'Incorrect. The CT scanner is contraindicated in hemodynamically unstable patients; CT is strictly reserved for hemodynamically stable trauma victims.'],
                    ['option_key' => 'B', 'option_text' => 'Immediate transfer to the operating theater for Exploratory Laparotomy', 'rationale' => 'Correct! Persistent hypotension with positive FAST for free intra-abdominal fluid demands immediate surgical exploration and hemoperitoneum control.'],
                    ['option_key' => 'C', 'option_text' => 'Diagnostic Peritoneal Lavage (DPL)', 'rationale' => 'Incorrect. FAST ultrasound has already documented free intraperitoneal fluid; invasive DPL is redundant and delays definitive surgical hemorrhage control.'],
                    ['option_key' => 'D', 'option_text' => 'Angioembolization by Interventional Radiology', 'rationale' => 'Incorrect. While angioembolization plays a role in stable pelvic or isolated splenic/hepatic trauma, it is contraindicated in decompensated, actively bleeding shock without surgical control.'],
                ],
            ],
            [
                'code' => 'Q-PED-0332',
                'subject_slug' => 'pediatrics',
                'topic_slug' => 'pediatric-infections',
                'difficulty' => 'MEDIUM',
                'question_type' => 'SINGLE_BEST_ANSWER',
                'stem' => "A 3-year-old boy is brought to the clinic with 6 days of unremitting high spiking fevers up to 39.8°C that have failed to respond to amoxicillin-clavulanate. His mother notes bilateral red eyes without discharge, dry cracked bleeding lips, a prominent 'strawberry' tongue, an erythematous polymorphous macular rash across his trunk, and painful swelling and induration of both feet. Examination reveals a solitary, non-tender 2.2 cm left cervical lymph node. Platelet count is 620,000/uL and ESR is 88 mm/hr. Which life-threatening complication must be proactively prevented with first-line therapy?",
                'image_url' => null,
                'image_caption' => null,
                'correct_option' => 'C',
                'learning_objective' => 'Identify Kawasaki Disease (mucocutaneous lymph node syndrome) and recognize coronary artery aneurysms as the primary morbidity prevented by timely IVIG and high-dose aspirin.',
                'foundation_explanation' => 'Kawasaki Disease is an acute, self-limited medium-vessel necrotizing vasculitis that exhibits a strong predilection for coronary arteries in infants and young children.',
                'integration_explanation' => 'Intense transvascular infiltration of neutrophils, CD8+ T cells, and IgA plasma cells leads to destruction of internal elastic lamina, causing coronary dilation, ectasia, and giant saccular or fusiform aneurysms in 20-25% of untreated children.',
                'application_explanation' => 'Administration of Intravenous Immunoglobulin (IVIG 2 g/kg single infusion) along with high-dose Aspirin (80-100 mg/kg/day) within the first 10 days of fever onset drastically slashes the incidence of coronary artery aneurysms to under 3-5%.',
                'memory_peg' => 'Kawasaki: "CRASH and Burn" (Conjunctivitis, Rash, Adenopathy, Strawberry tongue, Hands/feet swelling, Burn = 5+ days fever). Complication = Coronary Aneurysm.',
                'exams' => ['MECEE_PG', 'INI_CET', 'USMLE_STEP1', 'USMLE_STEP2CK', 'COMBINED'],
                'options' => [
                    ['option_key' => 'A', 'option_text' => 'Glomerulonephritis with nephrotic syndrome', 'rationale' => 'Incorrect. Renal involvement is rare in Kawasaki disease and does not cause life-threatening aneurysmal pathology.'],
                    ['option_key' => 'B', 'option_text' => 'Acute fulminant hepatic necrosis', 'rationale' => 'Incorrect. Mild transaminitis can occur as part of systemic vasculitis, but fulminant hepatic failure is not the signature complication.'],
                    ['option_key' => 'C', 'option_text' => 'Coronary artery aneurysms and thrombosis', 'rationale' => 'Correct! Up to 25% of untreated patients develop coronary aneurysms risking sudden myocardial infarction and death; prevented by early IVIG within 10 days.'],
                    ['option_key' => 'D', 'option_text' => 'Retinal detachment and blindness', 'rationale' => 'Incorrect. Kawasaki causes anterior uveitis and bilateral bulbar conjunctival injection without exudate, but does not cause retinal detachment.'],
                ],
            ],
            [
                'code' => 'Q-OBG-0415',
                'subject_slug' => 'obstetrics-gynecology',
                'topic_slug' => 'high-risk-obstetrics',
                'difficulty' => 'MEDIUM',
                'question_type' => 'SINGLE_BEST_ANSWER',
                'stem' => "A 32-year-old primigravida at 34 weeks gestation is brought to the triage unit with severe persistent right upper quadrant pain, throbbing frontal headache, and scotomata. Blood pressure is 172/112 mmHg on two measurements 20 minutes apart. Laboratory evaluation reveals: Hemoglobin 9.2 g/dL with schistocytes on peripheral blood smear, platelet count 64,000/uL, AST 240 U/L, ALT 210 U/L, total bilirubin 2.8 mg/dL, and urine protein 3+ on dipstick. After initiating magnesium sulfate for seizure prophylaxis, what is the definitive management?",
                'image_url' => null,
                'image_caption' => null,
                'correct_option' => 'A',
                'learning_objective' => 'Recognize HELLP syndrome as a severe variant of preeclampsia and understand that prompt delivery is the only definitive cure.',
                'foundation_explanation' => 'Preeclampsia and HELLP syndrome originate from abnormal placentation and incomplete trophoblastic invasion of uterine maternal spiral arteries, leading to placental ischemia and widespread release of anti-angiogenic factors (sFlt-1).',
                'integration_explanation' => 'Systemic endothelial dysfunction induces microvascular thrombosis, causing microangiopathic hemolytic anemia (schistocytes), hepatic sinusoidal fibrin deposition with subcapsular hematoma risk (RUQ pain, elevated AST/ALT), and consumptive thrombocytopenia (<100,000/uL).',
                'application_explanation' => 'Delivery of the fetus and placenta removes the ischemic placental source of endothelial toxicity and is the only definitive curative therapy. In pregnancies >= 34 weeks with HELLP syndrome, delivery is indicated immediately once maternal status is stabilized.',
                'memory_peg' => 'HELLP: Hemolysis, Elevated Liver enzymes, Low Platelets. Definitive Rx = Delivery!',
                'exams' => ['MECEE_PG', 'INI_CET', 'USMLE_STEP1', 'USMLE_STEP2CK', 'COMBINED'],
                'options' => [
                    ['option_key' => 'A', 'option_text' => 'Blood pressure control with IV Labetalol/Hydralazine and prompt delivery', 'rationale' => 'Correct! Once maternal stabilization (BP lowering and seizure prophylaxis with MgSO4) is achieved, delivery is the only definitive treatment for HELLP syndrome at 34 weeks.'],
                    ['option_key' => 'B', 'option_text' => 'Expectant management until 37 weeks with bed rest and oral labetalol', 'rationale' => 'Incorrect. Expectant management in HELLP syndrome carries high maternal mortality from hepatic rupture, DIC, acute pulmonary edema, and abruption.'],
                    ['option_key' => 'C', 'option_text' => 'High-dose oral Dexamethasone for 14 days to resolve hemolysis', 'rationale' => 'Incorrect. Corticosteroids can accelerate fetal lung maturity if <34 weeks and transiently raise platelets, but do not replace delivery as definitive care.'],
                    ['option_key' => 'D', 'option_text' => 'Immediate emergency plasmapheresis / plasma exchange', 'rationale' => 'Incorrect. Plasma exchange is reserved for Thrombotic Thrombocytopenic Purpura (TTP), not primary HELLP syndrome.'],
                ],
            ],
        ];

        // Seed Questions and Options
        $createdQuestions = [];
        foreach ($questionsData as $qData) {
            $subject = Subject::where('slug', $qData['subject_slug'])->first();
            $topic = Topic::where('slug', $qData['topic_slug'])->first();

            if (! $subject || ! $topic) {
                continue;
            }

            $question = Question::updateOrCreate(
                ['code' => $qData['code']],
                [
                    'subject_id' => $subject->id,
                    'topic_id' => $topic->id,
                    'difficulty' => $qData['difficulty'],
                    'question_type' => $qData['question_type'],
                    'stem' => $qData['stem'],
                    'image_url' => $qData['image_url'],
                    'image_caption' => $qData['image_caption'],
                    'correct_option' => $qData['correct_option'],
                    'learning_objective' => $qData['learning_objective'],
                    'foundation_explanation' => $qData['foundation_explanation'],
                    'integration_explanation' => $qData['integration_explanation'],
                    'application_explanation' => $qData['application_explanation'],
                    'memory_peg' => $qData['memory_peg'],
                    'is_active' => true,
                ]
            );

            // Options
            foreach ($qData['options'] as $opt) {
                QuestionOption::updateOrCreate(
                    [
                        'question_id' => $question->id,
                        'option_key' => $opt['option_key'],
                    ],
                    [
                        'option_text' => $opt['option_text'],
                        'rationale' => $opt['rationale'],
                    ]
                );
            }

            // Relevance
            foreach ($qData['exams'] as $examPathway) {
                QuestionExamRelevance::firstOrCreate([
                    'question_id' => $question->id,
                    'exam' => $examPathway,
                ]);
            }

            $createdQuestions[] = $question;
        }

        // 3. Create a realistic Test Session with attempts covering the 4 performance quadrants
        $session = TestSession::firstOrCreate(
            ['user_id' => $user->id, 'title' => 'Diagnostic Assessment Mock I'],
            [
                'session_type' => 'GRAND_MOCK',
                'exam_pathway' => 'INI_CET',
                'total_questions' => count($createdQuestions),
                'duration_seconds' => 7200,
                'time_spent_seconds' => 3450,
                'score_obtained' => 4.67,
                'is_completed' => true,
                'started_at' => Carbon::now()->subDays(2),
                'completed_at' => Carbon::now()->subDays(2)->addMinutes(58),
            ]
        );

        // Pre-seed attempts so all 4 quadrants (Mastered, Hazardous, Lucky Guess, Gap) have data
        // Quadrant 1: Mastered (Correct + High)
        if (isset($createdQuestions[0])) {
            $q = $createdQuestions[0];
            QuestionAttempt::firstOrCreate(
                ['user_id' => $user->id, 'question_id' => $q->id],
                [
                    'session_id' => $session->id,
                    'selected_option' => $q->correct_option,
                    'is_correct' => true,
                    'confidence' => ConfidenceLevel::HIGH->value,
                    'time_taken_seconds' => 42,
                    'was_switched' => false,
                ]
            );
            $srsService->recordAttempt($user, $q->id, true, ConfidenceLevel::HIGH);
        }

        // Quadrant 2: Hazardous Blind Spot (Incorrect + High Confidence)
        if (isset($createdQuestions[1])) {
            $q = $createdQuestions[1];
            QuestionAttempt::firstOrCreate(
                ['user_id' => $user->id, 'question_id' => $q->id],
                [
                    'session_id' => $session->id,
                    'selected_option' => 'A', // Incorrectly picked Calcium
                    'is_correct' => false,
                    'confidence' => ConfidenceLevel::HIGH->value,
                    'time_taken_seconds' => 58,
                    'was_switched' => true,
                    'initial_option' => 'B',
                ]
            );
            $srsService->recordAttempt($user, $q->id, false, ConfidenceLevel::HIGH);
        }

        // Quadrant 3: Unstable / Lucky Guess (Correct + Low Confidence)
        if (isset($createdQuestions[2])) {
            $q = $createdQuestions[2];
            QuestionAttempt::firstOrCreate(
                ['user_id' => $user->id, 'question_id' => $q->id],
                [
                    'session_id' => $session->id,
                    'selected_option' => $q->correct_option,
                    'is_correct' => true,
                    'confidence' => ConfidenceLevel::LOW->value,
                    'time_taken_seconds' => 74,
                    'was_switched' => false,
                ]
            );
            $srsService->recordAttempt($user, $q->id, true, ConfidenceLevel::LOW);
        }

        // Quadrant 4: Recognized Knowledge Gap (Incorrect + Low Confidence)
        if (isset($createdQuestions[3])) {
            $q = $createdQuestions[3];
            QuestionAttempt::firstOrCreate(
                ['user_id' => $user->id, 'question_id' => $q->id],
                [
                    'session_id' => $session->id,
                    'selected_option' => 'B',
                    'is_correct' => false,
                    'confidence' => ConfidenceLevel::LOW->value,
                    'time_taken_seconds' => 88,
                    'was_switched' => false,
                ]
            );
            $srsService->recordAttempt($user, $q->id, false, ConfidenceLevel::LOW);
        }

        // Add additional attempts for remaining questions
        for ($i = 4; $i < count($createdQuestions); $i++) {
            $q = $createdQuestions[$i];
            $isCorrect = ($i % 2 === 0);
            $conf = $isCorrect ? ConfidenceLevel::HIGH->value : ConfidenceLevel::MEDIUM->value;
            QuestionAttempt::firstOrCreate(
                ['user_id' => $user->id, 'question_id' => $q->id],
                [
                    'session_id' => $session->id,
                    'selected_option' => $isCorrect ? $q->correct_option : 'A',
                    'is_correct' => $isCorrect,
                    'confidence' => $conf,
                    'time_taken_seconds' => 50 + ($i * 5),
                    'was_switched' => false,
                ]
            );
            $srsService->recordAttempt($user, $q->id, $isCorrect, $conf);
        }

        // Add a bookmark & personal note
        if (isset($createdQuestions[0])) {
            UserNoteBookmark::firstOrCreate(
                ['user_id' => $user->id, 'question_id' => $createdQuestions[0]->id],
                [
                    'is_bookmarked' => true,
                    'note_content' => 'High yield: RV Infarct cannot tolerate nitroglycerin due to acute loss of preload! Review lead V4R on 15-lead ECG.',
                ]
            );
        }
    }
}
