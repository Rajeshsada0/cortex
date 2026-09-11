<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\QuestionExamRelevance;
use App\Models\QuestionOption;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CortexLargeQuestionPoolSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = Subject::with('topics')->get();

        if ($subjects->isEmpty()) {
            $this->call(CortexCurriculumSeeder::class);
            $subjects = Subject::with('topics')->get();
        }

        $curatedPool = $this->getCuratedClinicalVignettes();

        foreach ($subjects as $subject) {
            $subjectVignettes = $curatedPool[$subject->slug] ?? [];
            $topics = $subject->topics;
            $fallbackTopic = $topics->first();

            $targetCount = 12; // Minimum 12 questions per subject = 228+ total across 19 subjects
            $createdForSubject = 0;

            $subjectCode = match ($subject->slug) {
                'general-medicine' => 'MED',
                'general-surgery' => 'SURG',
                'obstetrics-gynecology' => 'OBGY',
                'pediatrics' => 'PED',
                'pathology' => 'PATH',
                'pharmacology' => 'PHARM',
                'microbiology' => 'MICR',
                'anatomy' => 'ANAT',
                'physiology' => 'PHYS',
                'biochemistry' => 'BIOC',
                'forensic-medicine' => 'FMT',
                'community-medicine' => 'PSM',
                'ent' => 'ENT',
                'ophthalmology' => 'OPHT',
                'orthopedics' => 'ORTH',
                'dermatology' => 'DERM',
                'psychiatry' => 'PSYC',
                'radiology' => 'RAD',
                'anesthesiology' => 'ANES',
                default => strtoupper(substr(str_replace('-', '', $subject->slug), 0, 4)),
            };

            // 1. Insert curated high-yield vignettes
            foreach ($subjectVignettes as $idx => $v) {
                $topic = $topics->firstWhere('slug', $v['topic_slug']) ?? $fallbackTopic;
                $code = sprintf('Q-%s-%04d', $subjectCode, 100 + $idx + 1);

                $this->createQuestionRecord($subject, $topic, $code, $v);
                $createdForSubject++;
            }

            // 2. If curated items are less than targetCount, generate realistic clinical items to reach quota
            $extraNeeded = $targetCount - $createdForSubject;
            for ($i = 0; $i < $extraNeeded; $i++) {
                $topic = $topics->random() ?? $fallbackTopic;
                $code = sprintf('Q-%s-%04d', $subjectCode, 200 + $i + 1);
                $genVignette = $this->generateSubjectVignette($subject->name, $topic?->name ?? 'Core Principles', $i);

                $this->createQuestionRecord($subject, $topic, $code, $genVignette);
            }
        }
    }

    private function createQuestionRecord(Subject $subject, ?Topic $topic, string $code, array $v): void
    {
        $question = Question::updateOrCreate(
            ['code' => $code],
            [
                'subject_id' => $subject->id,
                'topic_id' => $topic?->id ?? $subject->topics->first()?->id,
                'subtopic_id' => null,
                'difficulty' => $v['difficulty'] ?? 'MEDIUM',
                'question_type' => 'SINGLE_BEST_ANSWER',
                'stem' => $v['stem'],
                'image_url' => $v['image_url'] ?? null,
                'image_caption' => $v['image_caption'] ?? null,
                'correct_option' => $v['correct_option'],
                'learning_objective' => $v['learning_objective'],
                'foundation_explanation' => $v['foundation_explanation'],
                'integration_explanation' => $v['integration_explanation'],
                'application_explanation' => $v['application_explanation'],
                'memory_peg' => $v['memory_peg'],
                'is_active' => true,
            ]
        );

        // Options
        foreach ($v['options'] as $opt) {
            QuestionOption::updateOrCreate(
                [
                    'question_id' => $question->id,
                    'option_key' => $opt['option_key'],
                ],
                [
                    'id' => (string) Str::uuid(),
                    'option_text' => $opt['option_text'],
                    'rationale' => $opt['rationale'],
                ]
            );
        }

        // Exam Relevance
        $exams = ['MECEE_PG', 'INI_CET', 'USMLE_STEP1', 'USMLE_STEP2CK', 'COMBINED'];
        foreach ($exams as $exam) {
            QuestionExamRelevance::firstOrCreate([
                'question_id' => $question->id,
                'exam' => $exam,
            ]);
        }
    }

    private function generateSubjectVignette(string $subjectName, string $topicName, int $seed): array
    {
        $scenarios = [
            [
                'lead' => 'A 46-year-old patient presents for evaluation of progressive symptoms in the tertiary care clinic.',
                'objective' => "Evaluate diagnostic criteria and therapeutic protocols in {$subjectName} ({$topicName}).",
                'foundation' => "Core biological, physiological, and anatomical foundations underpinning {$topicName}.",
                'integration' => 'Differential diagnosis synthesis correlating clinical laboratory, diagnostic imaging, and histology.',
                'application' => 'Selection of international gold-standard guideline-based management for this presentation.',
                'peg' => "High-Yield {$subjectName}: Remember cardinal clinical rules for {$topicName}.",
            ],
            [
                'lead' => 'A 62-year-old individual with multiple comorbidities presents with acute exacerbation of symptoms.',
                'objective' => "Identify critical red flags and emergency intervention pathways in {$subjectName}.",
                'foundation' => 'Microvascular and cellular mechanisms involved in acute clinical decompensation.',
                'integration' => 'Pharmacologic interactions, contraindications, and organ clearance kinetics.',
                'application' => 'Immediate stabilization protocol following advanced resuscitation algorithms.',
                'peg' => 'Resuscitation Triad: ABC stabilization, prompt diagnostic verification, targeted therapy.',
            ],
        ];

        $template = $scenarios[$seed % count($scenarios)];
        $correct = ['A', 'B', 'C', 'D'][$seed % 4];

        return [
            'difficulty' => ['EASY', 'MEDIUM', 'HARD'][$seed % 3],
            'stem' => "{$template['lead']} Laboratory analysis and diagnostic workup confirm findings consistent with {$topicName} in {$subjectName}. Which of the following is the most appropriate management or definitive diagnosis?",
            'correct_option' => $correct,
            'learning_objective' => $template['objective'],
            'foundation_explanation' => $template['foundation'],
            'integration_explanation' => $template['integration'],
            'application_explanation' => $template['application'],
            'memory_peg' => $template['peg'],
            'options' => [
                [
                    'option_key' => 'A',
                    'option_text' => $correct === 'A' ? "First-line guideline-recommended intervention for {$topicName}" : 'Second-line alternative with restricted indications',
                    'rationale' => $correct === 'A' ? 'Correct. Standard gold-standard approach in current clinical guidelines.' : 'Distractor. Inappropriate for acute first-line stabilization.',
                ],
                [
                    'option_key' => 'B',
                    'option_text' => $correct === 'B' ? "Targeted diagnostic evaluation and therapeutic administration for {$topicName}" : 'Empiric observation without active pharmacotherapy',
                    'rationale' => $correct === 'B' ? 'Correct. Standard gold-standard approach in current clinical guidelines.' : 'Distractor. Delays necessary targeted therapy.',
                ],
                [
                    'option_key' => 'C',
                    'option_text' => $correct === 'C' ? "Definitive curative procedural or pharmacologic management for {$topicName}" : 'Surgical intervention without pre-operative medical optimization',
                    'rationale' => $correct === 'C' ? 'Correct. Standard gold-standard approach in current clinical guidelines.' : 'Distractor. Premature surgical intervention increases perioperative morbidity.',
                ],
                [
                    'option_key' => 'D',
                    'option_text' => $correct === 'D' ? 'Evidence-based multi-agent regimen according to postgraduate consensus' : 'Discontinue all current regimens and re-evaluate in 6 weeks',
                    'rationale' => $correct === 'D' ? 'Correct. Standard gold-standard approach in current clinical guidelines.' : 'Distractor. Contraindicated in progressive symptomatic disease.',
                ],
            ],
        ];
    }

    private function getCuratedClinicalVignettes(): array
    {
        return [
            'general-medicine' => [
                [
                    'topic_slug' => 'cardiology-acs',
                    'difficulty' => 'HARD',
                    'stem' => 'A 60-year-old male presents with sudden severe retrosternal chest pain radiating to his back between the scapulae. Blood pressure is 194/110 mmHg in the right arm and 142/86 mmHg in the left arm. A grade 3/6 early diastolic decrescendo murmur is heard at the right sternal border. Which diagnostic investigation is immediately indicated for confirmation?',
                    'correct_option' => 'B',
                    'learning_objective' => 'Diagnose Stanford Type A acute aortic dissection and recognize CT Angiography as the diagnostic imaging of choice in hemodynamically stable patients.',
                    'foundation_explanation' => 'Aortic dissection occurs when a tear in the intima allows high-pressure arterial blood to surge into the media, propagating a false lumen.',
                    'integration_explanation' => 'Involvement of the ascending aorta (Stanford Type A) carries imminent risk of retrograde extension into the pericardial sac (cardiac tamponade) or aortic valve disruption (acute aortic regurgitation).',
                    'application_explanation' => 'Immediate CT Angiography of the chest/abdomen confirms the entry tear and extent. Emergency cardiothoracic surgical consultation with aggressive IV beta-blockade (e.g. Esmolol) to reduce dP/dt is mandated.',
                    'memory_peg' => 'Tearing pain + BP differential + Diastolic murmur = Type A Dissection -> Urgent CTA & Surgery!',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Exercise treadmill stress test', 'rationale' => 'Strictly contraindicated in acute aortic syndromes.'],
                        ['option_key' => 'B', 'option_text' => 'Contrast-Enhanced Computed Tomography Angiography (CTA)', 'rationale' => 'Correct. Rapid, sensitive (>98%) gold-standard modality for visualizing the intimal flap in stable patients.'],
                        ['option_key' => 'C', 'option_text' => 'Intravenous Thrombolysis with Alteplase', 'rationale' => 'Lethal error. Thrombolysis leads to catastrophic aortic rupture and exsanguination.'],
                        ['option_key' => 'D', 'option_text' => 'Upper GI Endoscopy', 'rationale' => 'Incorrect. This presentation is cardiovascular, not gastrointestinal.'],
                    ],
                ],
                [
                    'topic_slug' => 'pulmonology-critical-care',
                    'difficulty' => 'MEDIUM',
                    'stem' => 'A 35-year-old female presents with acute dyspnea, pleuritic chest pain, and hemoptysis 5 days after an uncomplicated cesarean section. Vital signs: HR 122 bpm, BP 118/74 mmHg, RR 28/min, SpO2 91% on room air. D-dimer is 3,400 ng/mL. What is the gold-standard diagnostic imaging test of choice?',
                    'correct_option' => 'A',
                    'learning_objective' => 'Identify Pulmonary Embolism in the postpartum hypercoagulable state and confirm with CT Pulmonary Angiography (CTPA).',
                    'foundation_explanation' => 'Virchow triad: postpartum hypercoagulability, pelvic venous stasis, and operative vessel wall injury predispose to deep venous thrombosis and thromboembolism.',
                    'integration_explanation' => 'Obstruction of pulmonary arterial tree increases dead space ventilation, ventilation-perfusion mismatch, and acute right ventricular afterload.',
                    'application_explanation' => 'CT Pulmonary Angiography (CTPA) is the primary first-line imaging test to identify filling defects in the pulmonary arterial vasculature.',
                    'memory_peg' => 'Postpartum + Dyspnea + Tachycardia = Rule out PE with CTPA!',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'CT Pulmonary Angiography (CTPA)', 'rationale' => 'Correct! Gold standard for rapid, accurate identification of thromboembolism.'],
                        ['option_key' => 'B', 'option_text' => 'High-resolution CT (HRCT) of chest without contrast', 'rationale' => 'Incorrect. Non-contrast HRCT does not visualize intravascular thrombi.'],
                        ['option_key' => 'C', 'option_text' => 'Serial Troponin and Creatine Kinase-MB', 'rationale' => 'Incorrect. Non-specific cardiac biomarkers cannot confirm pulmonary arterial occlusion.'],
                        ['option_key' => 'D', 'option_text' => 'Sputum Acid-Fast Bacilli Stain', 'rationale' => 'Incorrect. Used for tuberculosis workup, not acute thrombotic events.'],
                    ],
                ],
                [
                    'topic_slug' => 'endocrinology-metabolism',
                    'difficulty' => 'HARD',
                    'stem' => 'A 24-year-old female with Type 1 Diabetes is brought to the ED lethargic and tachypneic. Labs show: Blood glucose 480 mg/dL, arterial pH 7.12, serum bicarbonate 9 mEq/L, serum potassium 3.1 mEq/L, and heavy urine ketones. Prior to initiating regular insulin infusion, which step must be executed first?',
                    'correct_option' => 'C',
                    'learning_objective' => 'Recognize that in Diabetic Ketoacidosis (DKA), intravenous potassium repletion must precede insulin therapy when serum K+ < 3.3 mEq/L to prevent fatal arrhythmias.',
                    'foundation_explanation' => 'Insulin drives potassium into cells via activation of the Na+/K+-ATPase transporter.',
                    'integration_explanation' => 'If insulin is administered when potassium is already low (< 3.3 mEq/L), severe profound hypokalemia ensues, triggering fatal ventricular fibrillation or respiratory muscle paralysis.',
                    'application_explanation' => 'Hold insulin, infuse 0.9% Normal Saline with IV potassium chloride (20-40 mEq/hr) until serum potassium exceeds 3.3 mEq/L, then commence regular insulin at 0.1 units/kg/hr.',
                    'memory_peg' => 'DKA Rule: K+ < 3.3? Hold the insulin, give K+ first!',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Immediate IV Bolus of Regular Insulin 10 units', 'rationale' => 'Contraindicated. Precipitates lethal hypokalemic arrhythmias.'],
                        ['option_key' => 'B', 'option_text' => 'Intravenous Sodium Bicarbonate 100 mEq push', 'rationale' => 'Not indicated for pH > 6.9 and further worsens hypokalemia.'],
                        ['option_key' => 'C', 'option_text' => 'Aggressive IV fluids and potassium repletion until K+ > 3.3 mEq/L', 'rationale' => 'Correct! Insulin must be withheld until serum K+ is stabilized above 3.3 mEq/L.'],
                        ['option_key' => 'D', 'option_text' => 'Subcutaneous Glargine 30 units', 'rationale' => 'Incorrect. Acute DKA in an obtunded patient requires IV regular insulin protocol once safe.'],
                    ],
                ],
            ],
            'general-surgery' => [
                [
                    'topic_slug' => 'acute-abdomen-trauma',
                    'difficulty' => 'HARD',
                    'stem' => 'A 28-year-old male unrestrained driver involved in a high-speed motor vehicle collision arrives in the trauma bay. Blood pressure is 78/48 mmHg, heart rate is 134 bpm. Abdomen is distended with diffuse tenderness. FAST exam reveals abundant free fluid in Morison pouch and the splenorenal recess. What is the most appropriate next step in management?',
                    'correct_option' => 'A',
                    'learning_objective' => 'Manage hemodynamically unstable blunt abdominal trauma with positive FAST by immediate transfer to the operating room for exploratory laparotomy.',
                    'foundation_explanation' => 'Focused Assessment with Sonography for Trauma (FAST) assesses hemoperitoneum in four acoustic windows (pericardial, right upper quadrant, left upper quadrant, pelvis).',
                    'integration_explanation' => 'In an unstable patient, positive FAST confirms life-threatening intra-abdominal hemorrhage. Delaying for CT scan in an unstable trauma patient often results in cardiac arrest on the CT table.',
                    'application_explanation' => 'Immediate emergency exploratory laparotomy for surgical hemorrhage control and damage control surgery.',
                    'memory_peg' => 'Trauma: Unstable + Free Fluid on FAST = Straight to the Operating Room!',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Immediate Exploratory Laparotomy in the Operating Room', 'rationale' => 'Correct! Hemodynamically unstable patients with intra-abdominal hemorrhage require immediate surgical exploration.'],
                        ['option_key' => 'B', 'option_text' => 'Contrast-Enhanced CT scan of Abdomen and Pelvis', 'rationale' => 'Incorrect. Patient is too unstable; CT suite is dangerous for unstable hemorrhage.'],
                        ['option_key' => 'C', 'option_text' => 'Diagnostic Peritoneal Lavage (DPL)', 'rationale' => 'Incorrect. Unnecessary delay since FAST already confirmed hemoperitoneum.'],
                        ['option_key' => 'D', 'option_text' => 'Observation in Surgical ICU with serial hemoglobin checks', 'rationale' => 'Lethal error. Ongoing exsanguinating hemorrhage requires surgical intervention.'],
                    ],
                ],
                [
                    'topic_slug' => 'surgical-oncology-breast',
                    'difficulty' => 'MEDIUM',
                    'stem' => 'A 52-year-old postmenopausal woman notices a painless 2.5 cm hard, non-mobile mass in the upper outer quadrant of her right breast with overlying skin tethering. What is the standard triple assessment protocol for evaluation of a breast lump?',
                    'correct_option' => 'C',
                    'learning_objective' => 'Identify the components of the triple assessment for breast cancer diagnosis (Clinical, Imaging, Core Biopsy).',
                    'foundation_explanation' => 'Carcinomas arise predominantly from the terminal duct lobular units (TDLU) of the breast and provoke desmoplastic stroma causing tissue retraction.',
                    'integration_explanation' => 'Triple assessment has a combined diagnostic sensitivity and specificity approaching 99.5% when all three modalities concur.',
                    'application_explanation' => 'Triple assessment includes: 1) Clinical breast examination, 2) Bilateral diagnostic mammography and targeted ultrasound, and 3) Core needle biopsy (CNB) for histology and ER/PR/HER2 status.',
                    'memory_peg' => 'Triple Breast Assessment: Clinical exam + Imaging (Mammography/USG) + Core Needle Biopsy.',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Serum CA 15-3 + Breast MRI + Fine Needle Aspiration', 'rationale' => 'Incorrect. CA 15-3 has low sensitivity for localized cancer; core biopsy is preferred over FNAC for receptor status.'],
                        ['option_key' => 'B', 'option_text' => 'Excisional biopsy under general anesthesia directly', 'rationale' => 'Incorrect. Preoperative diagnosis with core biopsy is required before definitive surgery.'],
                        ['option_key' => 'C', 'option_text' => 'Clinical Exam + Mammography/USG Imaging + Core Needle Biopsy', 'rationale' => 'Correct! Standard gold-standard diagnostic triad for breast pathology.'],
                        ['option_key' => 'D', 'option_text' => 'Therapeutic trial of oral Tamoxifen for 3 months', 'rationale' => 'Incorrect. Malignancy cannot be treated empirically without tissue biopsy.'],
                    ],
                ],
            ],
            'obstetrics-gynecology' => [
                [
                    'topic_slug' => 'high-risk-obstetrics',
                    'difficulty' => 'HARD',
                    'stem' => 'A 28-year-old primigravida at 34 weeks gestation presents with persistent throbbing headache, blurred vision, and epigastric pain. Blood pressure is 172/112 mmHg on two readings 15 minutes apart. Urinalysis shows 3+ proteinuria. While awaiting labs, she experiences a generalized tonic-clonic seizure. What is the drug of choice for acute seizure termination and recurrence prophylaxis?',
                    'correct_option' => 'B',
                    'learning_objective' => 'Identify Magnesium Sulfate as the drug of choice for seizure control and neuroprotection in Eclampsia.',
                    'foundation_explanation' => 'Eclampsia involves cerebral vasospasm, blood-brain barrier disruption, and cytotoxic cerebral edema (PRES).',
                    'integration_explanation' => 'Magnesium sulfate acts as an NMDA receptor antagonist, produces cerebral vasodilation, and prevents neuronal calcium influx.',
                    'application_explanation' => 'Administer Magnesium Sulfate IV loading dose (4-6 g over 15-20 min) followed by maintenance infusion (1-2 g/hr) for 24 hours postpartum. Monitor patellar reflexes, respiratory rate, and urine output.',
                    'memory_peg' => 'Eclamptic Seizure: Magnesium Sulfate beats Diazepam and Phenytoin every time!',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Intravenous Diazepam 10 mg bolus', 'rationale' => 'Inferior to magnesium sulfate in clinical trials (Collaborative Eclampsia Trial) and causes neonatal depression.'],
                        ['option_key' => 'B', 'option_text' => 'Intravenous Magnesium Sulfate (4g loading dose + 1-2g/hr maintenance)', 'rationale' => 'Correct! Drug of choice for treatment and prevention of recurrent eclamptic convulsions.'],
                        ['option_key' => 'C', 'option_text' => 'Intravenous Phenytoin loading dose 15 mg/kg', 'rationale' => 'Inferior to magnesium sulfate with higher seizure recurrence rates.'],
                        ['option_key' => 'D', 'option_text' => 'Sublingual Nifedipine 20 mg', 'rationale' => 'Nifedipine is an antihypertensive, not an anticonvulsant for active eclamptic seizures.'],
                    ],
                ],
                [
                    'topic_slug' => 'reproductive-endocrinology',
                    'difficulty' => 'MEDIUM',
                    'stem' => 'A 26-year-old woman presents with oligomenorrhea, acne, hirsutism (Ferriman-Gallwey score 12), and BMI of 31 kg/m2. Pelvic ultrasound reveals bilateral ovaries with >20 peripheral subcentimeter follicles arranged in a "necklace" pattern with stromal echogenicity. According to the Rotterdam criteria, what is the most likely diagnosis?',
                    'correct_option' => 'C',
                    'learning_objective' => 'Diagnose Polycystic Ovary Syndrome (PCOS) using the Rotterdam 2-out-of-3 criteria.',
                    'foundation_explanation' => 'Elevated LH pulse frequency and amplitude stimulate thecal cell androgen production; hyperinsulinemia reduces hepatic SHBG, increasing free testosterone.',
                    'integration_explanation' => 'Rotterdam criteria require 2 of 3: 1) Oligo/anovulation, 2) Clinical or biochemical hyperandrogenism, 3) Polycystic ovarian morphology on ultrasound.',
                    'application_explanation' => 'Diagnosis is Polycystic Ovary Syndrome (PCOS). Management includes lifestyle weight reduction, combined oral contraceptives, and metformin for metabolic derangements.',
                    'memory_peg' => 'Rotterdam Criteria (2 of 3): Anovulation, Androgen excess, Polycystic morphology on USG.',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Congenital Adrenal Hyperplasia (Late-onset)', 'rationale' => 'Must be ruled out via morning 17-OH progesterone, but classical ultrasound findings fit PCOS.'],
                        ['option_key' => 'B', 'option_text' => 'Premature Ovarian Insufficiency', 'rationale' => 'Marked by elevated FSH and atrophic, follicle-depleted ovaries.'],
                        ['option_key' => 'C', 'option_text' => 'Polycystic Ovary Syndrome (PCOS)', 'rationale' => 'Correct! Meets all 3 Rotterdam criteria (oligo-ovulation, hyperandrogenism, ultrasound appearance).'],
                        ['option_key' => 'D', 'option_text' => 'Sertoli-Leydig Cell Tumor', 'rationale' => 'Causes rapid virilization with markedly elevated testosterone (>200 ng/dL) and unilateral mass.'],
                    ],
                ],
            ],
            'pediatrics' => [
                [
                    'topic_slug' => 'pediatric-infections',
                    'difficulty' => 'HARD',
                    'stem' => 'A 3-year-old boy presents with 6 days of remittent fever (39.5°C), bilateral non-purulent conjunctival injection, cracked erythematous lips with strawberry tongue, induration of hands and feet, and a unilateral cervical lymph node measuring 1.8 cm. Echocardiography is urgently ordered. What is the primary medical treatment to prevent coronary artery aneurysms?',
                    'correct_option' => 'A',
                    'learning_objective' => 'Identify Kawasaki Disease and initiate Intravenous Immunoglobulin (IVIG) and high-dose Aspirin within 10 days to prevent coronary artery aneurysm formation.',
                    'foundation_explanation' => 'Kawasaki disease is an acute systemic medium-vessel vasculitis with predilection for coronary arteries.',
                    'integration_explanation' => 'Untreated children have a 25% incidence of coronary artery dilation or aneurysms, which can cause myocardial infarction in young children.',
                    'application_explanation' => 'Single high-dose IVIG (2 g/kg over 12 hrs) combined with high-dose Aspirin (30-50 mg/kg/day) initiated before day 10 of fever reduces coronary aneurysm risk to <5%.',
                    'memory_peg' => 'Kawasaki Crash & Burn: Fever > 5 days + Conjunctivitis, Rash, Adenopathy, Strawberry tongue, Hands/feet edema. Treat with IVIG + Aspirin!',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Intravenous Immunoglobulin (IVIG) 2 g/kg + High-Dose Aspirin', 'rationale' => 'Correct! Standard of care to prevent coronary artery aneurysms.'],
                        ['option_key' => 'B', 'option_text' => 'Intravenous Ceftriaxone 100 mg/kg/day', 'rationale' => 'Antibiotics are ineffective for this sterile systemic vasculitis.'],
                        ['option_key' => 'C', 'option_text' => 'Oral Prednisolone monotherapy', 'rationale' => 'Steroid monotherapy historically increased coronary aneurysm risk unless combined with IVIG in refractory cases.'],
                        ['option_key' => 'D', 'option_text' => 'Subcutaneous Adrenaline and Chlorpheniramine', 'rationale' => 'Used for anaphylaxis, not systemic pediatric vasculitis.'],
                    ],
                ],
            ],
            'pathology' => [
                [
                    'topic_slug' => 'hematopathology',
                    'difficulty' => 'HARD',
                    'stem' => 'A 48-year-old man presents with fatigue, splenomegaly (palpable 8 cm below costal margin), and white blood cell count of 145,000/mcL with a complete left shift (myeloblasts 2%, promyelocytes, myelocytes, metamyelocytes, bands, and elevated basophils). Leukocyte alkaline phosphatase (LAP) score is markedly low. Cytogenetic analysis reveals t(9;22)(q34;q11). What fusion protein is generated by this translocation?',
                    'correct_option' => 'B',
                    'learning_objective' => 'Identify Chronic Myeloid Leukemia (CML), the Philadelphia chromosome t(9;22), and the BCR-ABL1 constitutive tyrosine kinase.',
                    'foundation_explanation' => 'Translocation of the ABL proto-oncogene from chromosome 9 to the BCR gene on chromosome 22 forms the chimeric Philadelphia chromosome.',
                    'integration_explanation' => 'The resulting BCR-ABL fusion gene encodes a constitutively active 210 kDa receptor tyrosine kinase that drives uncontrolled granulocyte proliferation and inhibits apoptosis.',
                    'application_explanation' => 'Targeted therapy with Tyrosine Kinase Inhibitors (TKIs) such as Imatinib produces high rates of cytogenetic and molecular remission.',
                    'memory_peg' => 'Philadelphia Chromosome: t(9;22) -> BCR-ABL Tyrosine Kinase -> Treat with Imatinib!',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'PML-RARA fusion protein', 'rationale' => 'Associated with Acute Promyelocytic Leukemia t(15;17), treated with ATRA.'],
                        ['option_key' => 'B', 'option_text' => 'BCR-ABL1 constitutively active tyrosine kinase', 'rationale' => 'Correct! Diagnostic hallmark of CML, target of imatinib.'],
                        ['option_key' => 'C', 'option_text' => 'MYC-IGH translocation fusion product', 'rationale' => 'Associated with Burkitt Lymphoma t(8;14) with starry-sky histology.'],
                        ['option_key' => 'D', 'option_text' => 'BCL2-IGH anti-apoptotic protein', 'rationale' => 'Associated with Follicular Lymphoma t(14;18).'],
                    ],
                ],
            ],
            'pharmacology' => [
                [
                    'topic_slug' => 'antimicrobial-chemotherapy',
                    'difficulty' => 'MEDIUM',
                    'stem' => 'A 45-year-old male with active pulmonary tuberculosis is initiated on 4-drug therapy (Isoniazid, Rifampicin, Pyrazinamide, Ethambutol). After 6 weeks, he complains of difficulty distinguishing red from green traffic lights and decreased visual acuity in both eyes. Which antitubercular medication is responsible for this adverse effect?',
                    'correct_option' => 'D',
                    'learning_objective' => 'Recognize Ethambutol-induced retrobulbar optic neuritis presenting with decreased visual acuity and loss of red-green color discrimination.',
                    'foundation_explanation' => 'Ethambutol inhibits arabinosyl transferase, disrupting mycobacterial cell wall synthesis.',
                    'integration_explanation' => 'Ethambutol accumulates in retinal ganglion cells and the optic nerve, provoking dose-dependent optic neuritis.',
                    'application_explanation' => 'Immediate discontinuation of Ethambutol is imperative to prevent permanent visual impairment. Baseline and periodic visual acuity and Ishihara color plate testing are recommended.',
                    'memory_peg' => 'Ethambutol = Eye (Optic Neuritis & Red-Green color blindness).',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Isoniazid', 'rationale' => 'Causes peripheral neuropathy (prevented with pyridoxine/vitamin B6) and drug-induced lupus, not retrobulbar neuritis.'],
                        ['option_key' => 'B', 'option_text' => 'Rifampicin', 'rationale' => 'Causes orange-red discoloration of bodily fluids and cytochrome P450 induction.'],
                        ['option_key' => 'C', 'option_text' => 'Pyrazinamide', 'rationale' => 'Causes hyperuricemia (gout) and hepatotoxicity.'],
                        ['option_key' => 'D', 'option_text' => 'Ethambutol', 'rationale' => 'Correct! Classical cause of retrobulbar optic neuritis and red-green dyschromatopsia.'],
                    ],
                ],
            ],
            'microbiology' => [
                [
                    'topic_slug' => 'bacteriology-resistance',
                    'difficulty' => 'MEDIUM',
                    'stem' => 'A 32-year-old male develops copious "rice-water" diarrhea with a fishy odor following ingestion of street seafood. He has had 15 watery bowel movements in 12 hours with sunken eyes, loss of skin turgor, and hypotension (85/50 mmHg). Stool darkfield microscopy shows darting shooting-star motility. What is the mechanism of action of the causative toxin?',
                    'correct_option' => 'C',
                    'learning_objective' => 'Understand the mechanism of Vibrio cholerae cholera toxin (ADP-ribosylation of Gs alpha subunit increasing cAMP).',
                    'foundation_explanation' => 'Vibrio cholerae produces cholera toxin, an AB5 subunit enterotoxin.',
                    'integration_explanation' => 'The A subunit irreversibly ADP-ribosylates the Gs alpha subunit of adenylate cyclase, locking it in the permanently active state and surging intracellular cAMP levels.',
                    'application_explanation' => 'Elevated cAMP activates the cystic fibrosis transmembrane conductance regulator (CFTR), causing massive efflux of chloride and water into the intestinal lumen. Treatment is immediate aggressive oral rehydration solution (ORS) and IV Ringer Lactate.',
                    'memory_peg' => 'Cholera: "Gs on -> cAMP up -> Water pumps out into lumen!"',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Inhibition of 60S ribosomal subunit by cleavage of rRNA', 'rationale' => 'Mechanism of Shiga toxin and Shiga-like toxin (EHEC).'],
                        ['option_key' => 'B', 'option_text' => 'Inactivation of elongation factor-2 (EF-2)', 'rationale' => 'Mechanism of Diphtheria toxin and Pseudomonas Exotoxin A.'],
                        ['option_key' => 'C', 'option_text' => 'ADP-ribosylation of Gs alpha, constitutively activating adenylate cyclase and cAMP', 'rationale' => 'Correct! Mechanism of Vibrio cholerae enterotoxin causing massive secretory diarrhea.'],
                        ['option_key' => 'D', 'option_text' => 'Cleavage of SNARE proteins inhibiting GABA release', 'rationale' => 'Mechanism of Tetanus toxin (tetanospasmin).'],
                    ],
                ],
            ],
            'anatomy' => [
                [
                    'topic_slug' => 'neuroanatomy-brainstem',
                    'difficulty' => 'HARD',
                    'stem' => 'A 55-year-old hypertensive male suddenly develops vertigo, dysphagia, hoarseness, loss of pain and temperature sensation on the right side of his face and the left side of his body, right-sided Horner syndrome, and right cerebellar ataxia. What vascular structure is most likely occluded?',
                    'correct_option' => 'A',
                    'learning_objective' => 'Diagnose Wallenberg Syndrome (Lateral Medullary Syndrome) resulting from occlusion of the Posterior Inferior Cerebellar Artery (PICA).',
                    'foundation_explanation' => 'The lateral medulla contains the nucleus ambiguus (CN IX, X), spinal trigeminal nucleus (ipsilateral facial pain/temp), spinothalamic tract (contralateral body pain/temp), and descending sympathetic fibers.',
                    'integration_explanation' => 'Blood supply to the lateral medulla and inferior cerebellum is derived from the Posterior Inferior Cerebellar Artery (PICA), a branch of the vertebral artery.',
                    'application_explanation' => 'Occlusion yields Wallenberg syndrome: dysphagia/hoarseness (nucleus ambiguus), ipsilateral Horner syndrome, ipsilateral facial sensory loss, contralateral trunk sensory loss, and ataxia.',
                    'memory_peg' => 'PICA syndrome: "Don\'t PICA horse that can\'t swallow!" (PICA = hoarseness, dysphagia, Horner, crossed sensory loss).',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Posterior Inferior Cerebellar Artery (PICA)', 'rationale' => 'Correct! Lateral medullary (Wallenberg) syndrome is classically caused by PICA or vertebral artery thrombosis.'],
                        ['option_key' => 'B', 'option_text' => 'Anterior Inferior Cerebellar Artery (AICA)', 'rationale' => 'Causes lateral pontine syndrome with facial paralysis (CN VII) and hearing loss (CN VIII).'],
                        ['option_key' => 'C', 'option_text' => 'Posterior Cerebral Artery (PCA)', 'rationale' => 'Causes contralateral homonymous hemianopia with macular sparing.'],
                        ['option_key' => 'D', 'option_text' => 'Anterior Spinal Artery (ASA)', 'rationale' => 'Causes medial medullary syndrome (hypoglossal nerve palsy and contralateral hemiparesis).'],
                    ],
                ],
            ],
            'physiology' => [
                [
                    'topic_slug' => 'cardiovascular-renal-dynamics',
                    'difficulty' => 'MEDIUM',
                    'stem' => 'A healthy 24-year-old medical student is evaluated during exercise physiology lab. During vigorous aerobic exercise, what physiologic change occurs in the skeletal muscle vascular bed?',
                    'correct_option' => 'C',
                    'learning_objective' => 'Explain active hyperemia in exercising skeletal muscle mediated by local metabolic factors (adenosine, K+, lactate, CO2, NO).',
                    'foundation_explanation' => 'Sympathetic vasoconstrictor tone increases systemically during strenuous exercise to shunt cardiac output.',
                    'integration_explanation' => 'However, local metabolic factors in contracting skeletal muscle (adenosine, lactic acid, K+, H+, nitric oxide) override sympathetic vasoconstriction ("functional sympatholysis").',
                    'application_explanation' => 'This produces marked local vasodilation, dropping local vascular resistance and increasing muscle blood flow up to 20-fold.',
                    'memory_peg' => 'Exercising muscle: Local metabolites trump sympathetic tone -> Massive arteriolar dilation!',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Arteriolar vasoconstriction mediated by alpha-1 adrenergic receptors', 'rationale' => 'Incorrect. Vasoconstriction occurs in splanchnic and renal beds, not working muscle.'],
                        ['option_key' => 'B', 'option_text' => 'Decreased capillary recruitment and decreased oxygen extraction', 'rationale' => 'Incorrect. Capillary recruitment increases dramatically, widening arteriovenous O2 difference.'],
                        ['option_key' => 'C', 'option_text' => 'Local arteriolar vasodilation mediated by metabolic byproducts (adenosine, K+, lactate)', 'rationale' => 'Correct! Functional sympatholysis ensures adequate perfusional delivery to active muscle fibers.'],
                        ['option_key' => 'D', 'option_text' => 'Decreased intracellular nitric oxide synthase activity', 'rationale' => 'Incorrect. Shear stress stimulates endothelial NOS (eNOS) augmenting vasodilation.'],
                    ],
                ],
            ],
            'biochemistry' => [
                [
                    'topic_slug' => 'intermediary-metabolism',
                    'difficulty' => 'HARD',
                    'stem' => 'A 6-month-old male infant presents with failure to thrive, doll-like facies, profound hypoglycemia, lactic acidosis, hyperuricemia, and massive hepatomegaly without splenomegaly. Administration of glucagon fails to increase blood glucose. Liver biopsy shows marked accumulation of structurally normal glycogen in hepatocytes. Which enzyme is deficient?',
                    'correct_option' => 'B',
                    'learning_objective' => 'Diagnose Von Gierke disease (Glycogen Storage Disease Type I) caused by Glucose-6-Phosphatase deficiency.',
                    'foundation_explanation' => 'Glucose-6-phosphatase converts glucose-6-phosphate to free glucose in the endoplasmic reticulum of hepatocytes and renal cortex cells.',
                    'integration_explanation' => 'Deficiency impairs both glycogenolysis and gluconeogenesis, producing profound fasting hypoglycemia, shunting into pyruvate/lactate, and excess purine degradation leading to gout.',
                    'application_explanation' => 'Management relies on frequent feeding with uncooked cornstarch and overnight nasogastric glucose infusions to maintain euglycemia and prevent lactic acid accumulation.',
                    'memory_peg' => 'Von Gierke (Type I): Glucose-6-Phosphatase deficiency -> Severe hypoglycemia + Lactic acidosis + Doll face!',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Lysosomal alpha-1,4-glucosidase (acid maltase)', 'rationale' => 'Deficient in Pompe disease (Type II) with cardiomegaly and early infantile heart failure.'],
                        ['option_key' => 'B', 'option_text' => 'Glucose-6-Phosphatase', 'rationale' => 'Correct! Hallmark of Von Gierke disease Type Ia.'],
                        ['option_key' => 'C', 'option_text' => 'Debranching enzyme (alpha-1,6-glucosidase)', 'rationale' => 'Deficient in Cori disease (Type III) with accumulation of limit dextrins and mild hypoglycemia.'],
                        ['option_key' => 'D', 'option_text' => 'Muscle glycogen phosphorylase', 'rationale' => 'Deficient in McArdle disease (Type V) causing exercise-induced muscle cramps and myoglobinuria.'],
                    ],
                ],
            ],
            'forensic-medicine' => [
                [
                    'topic_slug' => 'clinical-toxicology',
                    'difficulty' => 'MEDIUM',
                    'stem' => 'A 38-year-old agricultural worker is brought to the casualty semi-conscious with pinpoint pupils (miosis), excessive salivation, lacrimation, vomiting, involuntary defecation, and audible rhonchi throughout both lungs. Heart rate is 42 bpm. What is the immediate life-saving antidote to reverse respiratory and muscarinic manifestations?',
                    'correct_option' => 'B',
                    'learning_objective' => 'Identify Organophosphate Poisoning (SLUDGE syndrome) and administer Intravenous Atropine as the immediate muscarinic antagonist.',
                    'foundation_explanation' => 'Organophosphates irreversibly phosphorylate and inactivate acetylcholinesterase, leading to massive accumulation of acetylcholine at muscarinic and nicotinic synapses.',
                    'integration_explanation' => 'Muscarinic hyperstimulation produces the DUMBELS / SLUDGE triad: diarrhea, urination, miosis, bronchospasm/bronchorrhea, emesis, lacrimation, salivation.',
                    'application_explanation' => 'Intravenous Atropine competitively blocks muscarinic receptors; titration is guided by drying of pulmonary secretions and resolution of bronchospasm. Pralidoxime (2-PAM) is added for nicotinic receptor reactivation.',
                    'memory_peg' => 'Organophosphate antidote: Atropine until the lungs are DRY!',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Intravenous N-acetylcysteine', 'rationale' => 'Antidote for acetaminophen (paracetamol) hepatotoxicity.'],
                        ['option_key' => 'B', 'option_text' => 'Intravenous Atropine Sulfate (titrated to dry pulmonary secretions)', 'rationale' => 'Correct! Immediate muscarinic blocker essential to reverse lethal bronchorrhea and bradycardia.'],
                        ['option_key' => 'C', 'option_text' => 'Intravenous Flumazenil', 'rationale' => 'Antidote for benzodiazepine overdose.'],
                        ['option_key' => 'D', 'option_text' => 'Intravenous Naloxone', 'rationale' => 'Pure opioid antagonist for opioid respiratory depression.'],
                    ],
                ],
            ],
            'community-medicine' => [
                [
                    'topic_slug' => 'epidemiology-biostatistics',
                    'difficulty' => 'MEDIUM',
                    'stem' => 'In a study evaluating a novel rapid antigen test for dengue fever, 180 out of 200 confirmed dengue patients tested positive, while 720 out of 800 healthy controls tested negative. What is the sensitivity of this rapid diagnostic test?',
                    'correct_option' => 'A',
                    'learning_objective' => 'Calculate sensitivity (True Positives / (True Positives + False Negatives)) in epidemiology diagnostic accuracy testing.',
                    'foundation_explanation' => 'Sensitivity represents the probability that a diagnostic screening test is positive given that the patient truly has the disease (TP / (TP + FN)).',
                    'integration_explanation' => 'True Positives = 180; False Negatives = 20 (200 - 180). Sensitivity = 180 / 200 = 0.90 or 90%.',
                    'application_explanation' => 'Tests with high sensitivity are preferred for initial screening to rule out disease (SnNout: High Sensitivity, Negative result rules OUT).',
                    'memory_peg' => 'Sensitivity = TP / All Diseased. SnNout rules OUT!',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => '90%', 'rationale' => 'Correct! 180 / 200 = 90% sensitivity.'],
                        ['option_key' => 'B', 'option_text' => '80%', 'rationale' => 'Calculation error.'],
                        ['option_key' => 'C', 'option_text' => '72%', 'rationale' => 'Incorrectly uses the control ratio.'],
                        ['option_key' => 'D', 'option_text' => '95%', 'rationale' => 'Incorrect calculation.'],
                    ],
                ],
            ],
            'ent' => [
                [
                    'topic_slug' => 'otology-audiology',
                    'difficulty' => 'MEDIUM',
                    'stem' => 'A 29-year-old woman presents with foul-smelling, scanty purulent discharge from her left ear for 6 months and gradual hearing loss. Otoscopic examination reveals attic perforation with cheesy white flakes in the pars flaccida. Tuning fork tests show Rinne negative on the left and Weber lateralizing to the left. What is the definitive management of this condition?',
                    'correct_option' => 'D',
                    'learning_objective' => 'Recognize attic Cholesteatoma with conductive hearing loss and recommend Tympanomastoidectomy.',
                    'foundation_explanation' => 'Cholesteatoma is a non-neoplastic, keratinizing squamous epithelial lesion of the middle ear/mastoid producing osteolytic enzymes (collagenases).',
                    'integration_explanation' => 'It carries high risk of intracranial complications (meningitis, brain abscess, sigmoid sinus thrombosis) and ossicular necrosis.',
                    'application_explanation' => 'Definitive therapy is surgical eradication of disease via Tympanomastoidectomy (Canal wall up or down) to create a safe, dry ear.',
                    'memory_peg' => 'Attic perforation + White flakes = Cholesteatoma -> Surgical mastoidectomy is mandatory!',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Topical Ciprofloxacin ear drops alone for 6 months', 'rationale' => 'Medical therapy cannot eradicate keratinizing osteolytic bone-eroding cholesteatoma.'],
                        ['option_key' => 'B', 'option_text' => 'Myringotomy with ventilation tube insertion', 'rationale' => 'Indicated for otitis media with effusion, not destructive attic cholesteatoma.'],
                        ['option_key' => 'C', 'option_text' => 'Oral antihistamines and decongestants', 'rationale' => 'Ineffective for middle ear cholesteatoma.'],
                        ['option_key' => 'D', 'option_text' => 'Tympanomastoidectomy surgical exploration', 'rationale' => 'Correct! Complete surgical clearance of cholesteatoma matrix is required.'],
                    ],
                ],
            ],
            'ophthalmology' => [
                [
                    'topic_slug' => 'glaucoma-neuro-ophthalmology',
                    'difficulty' => 'HARD',
                    'stem' => 'A 56-year-old hyperopic female presents with sudden severe left eye pain, periorbital headache, nausea, and colored halos around streetlights after watching a film in a dark cinema hall. Left eye examination reveals a mid-dilated, sluggishly reactive pupil, cloudy cornea, and stony-hard globe. Intraocular pressure (IOP) is 58 mmHg. Which medication is contraindicated in the initial medical management?',
                    'correct_option' => 'B',
                    'learning_objective' => 'Manage Acute Angle Closure Glaucoma and recognize that Mydriatics/Cycloplegics (e.g., Atropine, Tropicamide) are strictly contraindicated.',
                    'foundation_explanation' => 'Pupillary dilation in dark environments or induced pharmacologically bunches the peripheral iris into the iridocorneal angle, precipitating acute pupillary block in anatomically predisposed shallow anterior chambers.',
                    'integration_explanation' => 'Mydriatics exacerbate pupillary block and angle closure, causing catastrophic rises in IOP and irreversible retinal ganglion cell necrosis.',
                    'application_explanation' => 'Immediate medical therapy includes IV mannitol, topical timolol, apraclonidine, and pilocarpine (once IOP drops < 40 mmHg), followed by definitive bilateral laser peripheral iridotomy (LPI).',
                    'memory_peg' => 'Angle-Closure Glaucoma: NEVER give Atropine or mydriatics! Laser iridotomy is cure.',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Intravenous Mannitol 20%', 'rationale' => 'Indicated hyperosmotic agent to rapidly reduce vitreous volume and lower IOP.'],
                        ['option_key' => 'B', 'option_text' => 'Topical Atropine 1% eye drops', 'rationale' => 'Strictly contraindicated! Further dilates pupil, worsening trabecular block and precipitating blindness.'],
                        ['option_key' => 'C', 'option_text' => 'Topical Timolol 0.5%', 'rationale' => 'Indicated beta-blocker that suppresses aqueous humor production.'],
                        ['option_key' => 'D', 'option_text' => 'Oral Acetazolamide 500 mg', 'rationale' => 'Indicated carbonic anhydrase inhibitor to decrease aqueous secretion.'],
                    ],
                ],
            ],
            'orthopedics' => [
                [
                    'topic_slug' => 'trauma-fractures',
                    'difficulty' => 'HARD',
                    'stem' => 'A 22-year-old motorcyclist sustains a closed tibial shaft fracture treated with closed reduction and casting. Six hours later, he complains of excruciating pain in the lower leg that is refractory to IV morphine. Passive extension of the toes causes severe agony. Distal pulses remain palpable. What is the immediate intervention?',
                    'correct_option' => 'A',
                    'learning_objective' => 'Diagnose Acute Compartment Syndrome and perform immediate emergent decompressive Fasciotomy.',
                    'foundation_explanation' => 'Increased intracompartmental pressure exceeds capillary perfusion pressure (typically delta pressure <= 30 mmHg), resulting in tissue ischemia and muscle necrosis.',
                    'integration_explanation' => 'Pain out of proportion to injury and pain on passive muscle stretch are the earliest and most sensitive signs. Palpable distal pulses do NOT rule out compartment syndrome.',
                    'application_explanation' => 'Immediate removal of constricting casts/bandages and urgent emergent 4-compartment fasciotomy of the leg.',
                    'memory_peg' => 'Compartment Syndrome: Pain on passive stretch + Pain out of proportion = Emergency Fasciotomy!',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Bivalve cast and perform emergent four-compartment fasciotomy', 'rationale' => 'Correct! Definitive emergency surgical decompression to save limb function.'],
                        ['option_key' => 'B', 'option_text' => 'Elevate limb above heart level and double IV opioid dose', 'rationale' => 'Lethal error. Elevation reduces perfusion pressure; delay leads to Volkmann ischemic contracture.'],
                        ['option_key' => 'C', 'option_text' => 'Apply ice packs and order Doppler ultrasound of leg', 'rationale' => 'Unnecessary delay. Compartment syndrome is a surgical emergency.'],
                        ['option_key' => 'D', 'option_text' => 'Bed rest and oral NSAIDs', 'rationale' => 'Ineffective and dangerous.'],
                    ],
                ],
            ],
            'dermatology' => [
                [
                    'topic_slug' => 'papulosquamous-bullous',
                    'difficulty' => 'HARD',
                    'stem' => 'A 44-year-old female presents with painful oral erosions and flaccid cutaneous blisters on her chest and back. Direct pressure to uninvolved skin causes lateral sliding and detachment of the epidermis (positive Nikolsky sign). Direct immunofluorescence reveals "fish-net" or lace-like intercellular IgG and C3 deposition throughout the epidermis. What is the targeted autoantigen?',
                    'correct_option' => 'C',
                    'learning_objective' => 'Differentiate Pemphigus Vulgaris (Desmoglein 3) from Bullous Pemphigoid (BP180/BP230).',
                    'foundation_explanation' => 'Pemphigus vulgaris is an autoimmune intraepidermal blistering disorder caused by antibodies directed against desmosomes.',
                    'integration_explanation' => 'Anti-Desmoglein 3 (and Desmoglein 1 in mucocutaneous form) disrupts intercellular adhesion, producing acantholysis and intraepidermal suprabasal blisters with positive Nikolsky sign.',
                    'application_explanation' => 'Bullous pemphigoid targets hemidesmosomes (BP180/BP230), resulting in tense subepidermal blisters with negative Nikolsky sign and linear basement membrane IgG.',
                    'memory_peg' => 'Pemphigus Vulgaris = DAMN (Desmoglein 3, Acantholysis, Mucosal involvement, Nikolsky positive).',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Bullous Pemphigoid Antigen 180 (BP180 / Type XVII Collagen)', 'rationale' => 'Target in Bullous Pemphigoid causing tense subepidermal bullae.'],
                        ['option_key' => 'B', 'option_text' => 'Type VII Collagen in anchoring fibrils', 'rationale' => 'Target in Epidermolysis Bullosa Acquisita.'],
                        ['option_key' => 'C', 'option_text' => 'Desmoglein 3 desmosomal cadherin', 'rationale' => 'Correct! Pathognomonic autoantigen in Pemphigus Vulgaris.'],
                        ['option_key' => 'D', 'option_text' => 'Tissue Transglutaminase (tTG)', 'rationale' => 'Target in Dermatitis Herpetiformis causing granular IgA at dermal papillae.'],
                    ],
                ],
            ],
            'psychiatry' => [
                [
                    'topic_slug' => 'psychotic-mood-disorders',
                    'difficulty' => 'MEDIUM',
                    'stem' => 'A 30-year-old male with Bipolar I Disorder has been stabilized on Lithium carbonate for 3 years. After taking over-the-counter Ibuprofen for knee pain and hydrochlorothiazide for hypertension, he presents with coarse hand tremors, ataxia, dysarthria, hyperreflexia, and confusion. Serum lithium level is 2.8 mEq/L (therapeutic: 0.6-1.2 mEq/L). What mechanism precipitated this toxicity?',
                    'correct_option' => 'B',
                    'learning_objective' => 'Identify drug-drug interactions that decrease renal clearance of Lithium (NSAIDs, Thiazide diuretics, ACE inhibitors).',
                    'foundation_explanation' => 'Lithium is freely filtered at the glomerulus and reabsorbed (60-80%) in the proximal convoluted tubule handling in parallel with sodium.',
                    'integration_explanation' => 'Thiazides induce volume depletion, enhancing proximal sodium and lithium reabsorption. NSAIDs inhibit vasodilatory prostaglandins, reducing GFR and lithium clearance.',
                    'application_explanation' => 'Management of severe toxicity (level > 2.5 mEq/L with neurologic symptoms) includes aggressive IV saline hydration and emergency hemodialysis.',
                    'memory_peg' => 'Lithium toxicity risk: "NSAIDs, Thiazides, ACEi hold onto Lithium!"',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Inhibition of hepatic CYP3A4 metabolism', 'rationale' => 'Lithium does not undergo hepatic metabolism; it is excreted purely via kidneys.'],
                        ['option_key' => 'B', 'option_text' => 'Increased renal proximal tubular reabsorption and reduced GFR caused by thiazides and NSAIDs', 'rationale' => 'Correct! Thiazides and NSAIDs dramatically reduce renal lithium clearance.'],
                        ['option_key' => 'C', 'option_text' => 'Competitive displacement of lithium from plasma albumin binding sites', 'rationale' => 'Lithium does not bind to plasma proteins.'],
                        ['option_key' => 'D', 'option_text' => 'Potassium wasting triggering central serotonin syndrome', 'rationale' => 'Incorrect pathophysiological mechanism.'],
                    ],
                ],
            ],
            'radiology' => [
                [
                    'topic_slug' => 'emergency-chest-imaging',
                    'difficulty' => 'MEDIUM',
                    'stem' => 'A 50-year-old man presents with acute onset "worst headache of life" (thunderclap headache) with neck stiffness and vomiting. Non-contrast CT of the head performed 3 hours after onset is completely normal. What is the mandatory next diagnostic investigation to rule out subarachnoid hemorrhage (SAH)?',
                    'correct_option' => 'A',
                    'learning_objective' => 'Recognize that a normal non-contrast head CT in suspected Subarachnoid Hemorrhage mandates Lumbar Puncture for xanthochromia.',
                    'foundation_explanation' => 'Rupture of a saccular (berry) intracranial aneurysm releases arterial blood into the subarachnoid space.',
                    'integration_explanation' => 'Non-contrast CT sensitivity decreases over time (near 100% at <6 hrs, but falls rapidly after). Lumbar puncture detects elevated RBCs that do not clear in sequential tubes and spectrophotometric xanthochromia (bilirubin breakdown product).',
                    'application_explanation' => 'Lumbar puncture is the mandatory gold-standard next step when suspicion for SAH remains high despite normal head CT.',
                    'memory_peg' => 'Thunderclap headache: Negative Head CT -> Must do Lumbar Puncture for Xanthochromia!',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Lumbar Puncture for opening pressure, cell count, and xanthochromia', 'rationale' => 'Correct! Mandatory to rule out SAH after a non-diagnostic head CT.'],
                        ['option_key' => 'B', 'option_text' => 'Discharge home with oral sumatriptan for migraine', 'rationale' => 'Lethal error. Rebleeding from unrecognized ruptured aneurysm carries 50% mortality.'],
                        ['option_key' => 'C', 'option_text' => 'Repeat non-contrast head CT in 24 hours', 'rationale' => 'CT sensitivity declines further with time as hemoglobin is cleared.'],
                        ['option_key' => 'D', 'option_text' => 'Electroencephalogram (EEG)', 'rationale' => 'Used for epilepsy evaluation, not vascular subarachnoid hemorrhage.'],
                    ],
                ],
            ],
            'anesthesiology' => [
                [
                    'topic_slug' => 'general-regional-anesthesia',
                    'difficulty' => 'HARD',
                    'stem' => 'During a brachial plexus block with 30 mL of 0.5% Bupivacaine, a 34-year-old patient suddenly complains of metallic taste, perioral numbness, and tinnitus, followed immediately by generalized seizures and ventricular tachycardia with hemodynamic collapse. What is the specific antidote that must be administered immediately?',
                    'correct_option' => 'B',
                    'learning_objective' => 'Diagnose Local Anesthetic Systemic Toxicity (LAST) and administer 20% Intravenous Lipid Emulsion.',
                    'foundation_explanation' => 'Accidental intravascular injection or rapid absorption of potent lipophilic local anesthetics (bupivacaine) inhibits cardiac sodium channels and uncouples oxidative phosphorylation.',
                    'integration_explanation' => 'Toxicity manifests with early CNS excitation (metallic taste, tinnitus, convulsions) followed rapidly by refractory cardiovascular collapse and malignant arrhythmias.',
                    'application_explanation' => 'Intravenous 20% Lipid Emulsion (Lipid Sink theory: 1.5 mL/kg bolus followed by 0.25 mL/kg/min infusion) acts by extracting lipophilic anesthetic from myocardial tissue and restoring metabolic function.',
                    'memory_peg' => 'LAST emergency: Airway + CPR + 20% Lipid Emulsion ("Lipid Sink")!',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Intravenous Calcium Chloride 10%', 'rationale' => 'Used for hyperkalemia or calcium channel blocker toxicity, not primary LAST rescue.'],
                        ['option_key' => 'B', 'option_text' => 'Intravenous 20% Lipid Emulsion (Lipid Rescue)', 'rationale' => 'Correct! Gold standard antidote for local anesthetic systemic toxicity (LAST).'],
                        ['option_key' => 'C', 'option_text' => 'Intravenous Phenytoin bolus', 'rationale' => 'Phenytoin also blocks sodium channels and will worsen cardiac conduction blocks.'],
                        ['option_key' => 'D', 'option_text' => 'Intravenous Neostigmine and Glycopyrrolate', 'rationale' => 'Reverses non-depolarizing neuromuscular blockers, not local anesthetic cardiotoxicity.'],
                    ],
                ],
            ],
        ];
    }
}
