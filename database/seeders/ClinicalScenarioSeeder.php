<?php

namespace Database\Seeders;

use App\Models\ClinicalScenario;
use App\Models\ClinicalScenarioQuestion;
use Illuminate\Database\Seeder;

class ClinicalScenarioSeeder extends Seeder
{
    public function run(): void
    {
        $stations = [
            [
                'pathway_code' => 'NMC',
                'discipline' => 'Internal Medicine / Tropical Diseases',
                'title' => 'Station 1: A 26-year-old male with acute febrile illness from Chitwan',
                'stem' => "A 26-year-old male residing in Chitwan presents to the Emergency Department in September with a 5-day history of acute high-grade continuous fever, retro-orbital pain, severe myalgia ('breakbone' pain), and vomiting.\n\nOn Day 5, the fever suddenly subsided, but he developed persistent abdominal pain, recurrent vomiting, and epistaxis. On examination, he is lethargic, cold, and clammy. Blood pressure is 85/65 mmHg (narrow pulse pressure of 20 mmHg), pulse is 118 bpm, and respiratory rate is 24/min. Abdominal palpation reveals right upper quadrant tenderness with mild ascites.",
                'vitals' => "• BP: 85/65 mmHg | Pulse: 118 bpm (thready)\n• Hematocrit (Hct): 54% (Baseline: 41%)\n• Platelet count: 21,000 /cu mm\n• Total Leukocytes: 2,800 /cu mm",
                'order_index' => 1,
                'is_active' => true,
                'questions' => [
                    [
                        'question_number' => 1,
                        'stem' => 'According to WHO/NMC clinical guidelines, what is the exact stage of Dengue illness this patient is currently experiencing?',
                        'options' => [
                            'Febrile phase',
                            'Critical phase with plasma leakage and compensated shock',
                            'Convalescent/Recovery phase',
                            'Dengue fever without warning signs',
                        ],
                        'correct_option' => 1,
                        'explanation' => 'The critical phase starts around defervescence (days 3-7). Persistent abdominal pain, mucosal bleeding, severe hemoconcentration (Hct rise >20%), and narrowed pulse pressure indicate plasma leakage and severe dengue shock.',
                        'order_index' => 1,
                    ],
                    [
                        'question_number' => 2,
                        'stem' => 'What is the primary underlying pathological mechanism responsible for the sudden rise in hematocrit (54%) in this patient?',
                        'options' => [
                            'Direct bone marrow hyperproduction of erythrocytes',
                            'Acute splenic contraction',
                            'Increased capillary permeability resulting in plasma leakage',
                            'Intravascular hemolysis of white blood cells',
                        ],
                        'correct_option' => 2,
                        'explanation' => 'In severe dengue, immune-mediated endothelial activation causes systemic microvascular permeability, resulting in loss of plasma into the pleural and peritoneal cavities and subsequent hemoconcentration.',
                        'order_index' => 2,
                    ],
                    [
                        'question_number' => 3,
                        'stem' => 'What is the immediate fluid resuscitation protocol of choice for this patient in dengue shock?',
                        'options' => [
                            'Immediate transfusion of 4 units of random donor platelets',
                            "Rapid IV infusion of isotonic crystalloid (e.g., Ringer's Lactate) at 10–20 mL/kg over 1 hour",
                            'Infusion of 10% Dextrose in water at 100 mL/hr',
                            'Intravenous loop diuretic (Furosemide 40 mg) to prevent pulmonary edema',
                        ],
                        'correct_option' => 1,
                        'explanation' => "Initial management of dengue shock is immediate volume resuscitation with isotonic crystalloid (Ringer's Lactate or 0.9% Normal Saline) at 10–20 mL/kg over 1 hour, titrated by hematocrit and clinical parameters.",
                        'order_index' => 3,
                    ],
                    [
                        'question_number' => 4,
                        'stem' => 'Which of the following constitutes an evidence-based indication for Platelet Transfusion in dengue?',
                        'options' => [
                            'Platelet count dropping below 50,000/cu mm without bleeding',
                            'Prophylactically in all patients entering the critical phase',
                            'Significant clinically documented bleeding with refractory thrombocytopenia',
                            'Petechial rash on the extremities alone',
                        ],
                        'correct_option' => 2,
                        'explanation' => 'Platelet transfusions are not recommended prophylactically regardless of low numbers alone due to fluid overload risks. They are reserved for systemic or life-threatening severe hemorrhage.',
                        'order_index' => 4,
                    ],
                    [
                        'question_number' => 5,
                        'stem' => 'Which analgesic/antipyretic agent is strictly contraindicated due to the risk of aggravating bleeding and Reye-like complications?',
                        'options' => [
                            'Paracetamol',
                            'Aspirin and NSAIDs (e.g., Ibuprofen)',
                            'Tepid sponging',
                            'Oral hydration solution',
                        ],
                        'correct_option' => 1,
                        'explanation' => 'Aspirin, Ibuprofen, and all NSAIDs must be strictly avoided because they inhibit platelet aggregation and promote severe gastrointestinal bleeding.',
                        'order_index' => 5,
                    ],
                ],
            ],
            [
                'pathway_code' => 'NMC',
                'discipline' => 'General Surgery / Emergency',
                'title' => 'Station 2: A 21-year-old college student with acute abdominal pain',
                'stem' => "A 21-year-old male is brought to the surgical outpatient department with a 24-hour history of abdominal pain. The pain initially began as a dull, periumbilical discomfort accompanied by anorexia and two episodes of vomiting. Six hours ago, the pain shifted and localized to the right lower quadrant, becoming sharp and exacerbated by walking and coughing.\n\nOn examination, temperature is 38.2°C (100.8°F), pulse is 96 bpm. Abdominal examination reveals localized tenderness, muscle guarding, and rebound tenderness at McBurney's point. Pain is elicited in the right iliac fossa when the left iliac fossa is palpated.",
                'vitals' => "• Temp: 100.8°F | Pulse: 96 bpm | BP: 120/80 mmHg\n• Total Leukocyte Count (TLC): 14,800/cu mm (82% Neutrophils)\n• Urine Dipstick: Normal",
                'order_index' => 2,
                'is_active' => true,
                'questions' => [
                    [
                        'question_number' => 1,
                        'stem' => 'The phenomenon where pain is referred to the right iliac fossa upon deep palpation of the left iliac fossa is known as:',
                        'options' => [
                            "Murphy's sign",
                            "Rovsing's sign",
                            'Psoas sign',
                            'Obturator sign',
                        ],
                        'correct_option' => 1,
                        'explanation' => "Rovsing's sign is positive when pressure applied to the left lower quadrant elicits pain in the right lower quadrant, indicating localized peritoneal irritation in acute appendicitis.",
                        'order_index' => 1,
                    ],
                    [
                        'question_number' => 2,
                        'stem' => "Why did the patient's pain transition from the periumbilical region to the right lower quadrant?",
                        'options' => [
                            'Initial irritation was of the parietal peritoneum, which later switched to the visceral peritoneum',
                            'Initial visceral pain mediated by sympathetic afferents (T10 dermatome) followed by somatic irritation of the parietal peritoneum',
                            'Ascending infection into the hepatic flexure',
                            'Sudden perforation of the appendiceal base',
                        ],
                        'correct_option' => 1,
                        'explanation' => "Early appendiceal distension triggers visceral sensory afferents entering the spinal cord at T10, referred to the periumbilical area. As transmural inflammation touches the parietal peritoneum, localized somatic pain occurs at McBurney's point.",
                        'order_index' => 2,
                    ],
                    [
                        'question_number' => 3,
                        'stem' => 'What is the most common luminal obstructing agent initiating acute appendicitis in young adults?',
                        'options' => [
                            'Carcinoid tumor',
                            'Lymphoid follicular hyperplasia',
                            'Fecalith (Appendicolith)',
                            'Foreign body / Gallstone',
                        ],
                        'correct_option' => 1,
                        'explanation' => 'In children and young adults, lymphoid follicular hyperplasia (often after a viral infection) is the most frequent cause of lumen obstruction. In elderly patients, fecaliths predominate.',
                        'order_index' => 3,
                    ],
                    [
                        'question_number' => 4,
                        'stem' => 'On the Alvarado Scoring system, which laboratory finding awards 2 points (as opposed to 1)?',
                        'options' => [
                            'Shift to the left of neutrophils',
                            'Leukocytosis (> 10,000/cu mm)',
                            'Elevated C-reactive protein (CRP)',
                            'Microscopic hematuria',
                        ],
                        'correct_option' => 1,
                        'explanation' => 'In the Alvarado (MANTRELS) score, only two criteria receive 2 points each: Tenderness in the RIF and Leukocytosis (>10,000). All others receive 1 point.',
                        'order_index' => 4,
                    ],
                    [
                        'question_number' => 5,
                        'stem' => 'What is the definitive, gold-standard management for this patient with confirmed acute non-perforated appendicitis?',
                        'options' => [
                            'Exclusive 14-day course of high-dose intravenous Metronidazole',
                            'Appendectomy (Open or Laparoscopic) with perioperative antibiotics',
                            'Immediate colonoscopy and endoscopic drainage',
                            'Percutaneous peritoneal catheter insertion',
                        ],
                        'correct_option' => 1,
                        'explanation' => 'Appendectomy (laparoscopic or open) remains the definitive curative gold standard of treatment for uncomplicated acute appendicitis.',
                        'order_index' => 5,
                    ],
                ],
            ],
            [
                'pathway_code' => 'NMC',
                'discipline' => 'Obstetrics & Gynecology',
                'title' => 'Station 3: A 29-year-old primigravida at 35 weeks with headache',
                'stem' => "A 29-year-old primigravida at 35 weeks of gestation presents to the antenatal triage complaining of a throbbing frontal headache and visual blurring. Her antenatal course up to 28 weeks was uncomplicated.\n\nOn physical examination, her blood pressure is 165/112 mmHg on two measurements taken 15 minutes apart. Bilateral 3+ pitting edema of both lower extremities and puffiness of the face are evident. Neurological exam reveals brisk patellar reflexes (4+) with sustained ankle clonus. Cardiotocography (CTG) shows a reactive baseline fetal heart rate of 144 bpm.",
                'vitals' => "• BP: 165/112 mmHg | Reflexes: 4+ with ankle clonus\n• Urine Albumin (Dipstick): 3+ (approx. 300 mg/dL)\n• Serum Creatinine: 1.2 mg/dL | Platelets: 98,000/cu mm\n• ALT / AST: 88 IU/L and 94 IU/L",
                'order_index' => 3,
                'is_active' => true,
                'questions' => [
                    [
                        'question_number' => 1,
                        'stem' => 'What is the primary maternal diagnosis for this patient?',
                        'options' => [
                            'Chronic Essential Hypertension with superimposed migraine',
                            'Gestational Hypertension',
                            'Severe Preeclampsia',
                            'Eclampsia',
                        ],
                        'correct_option' => 2,
                        'explanation' => 'BP ≥ 160/110 mmHg after 20 weeks with severe proteinuria (3+), hyperreflexia/clonus, visual disturbances, thrombocytopenia, and transaminitis defines Preeclampsia with severe features. Fits have not occurred yet, excluding eclampsia.',
                        'order_index' => 1,
                    ],
                    [
                        'question_number' => 2,
                        'stem' => 'What is the standard loading dose of Magnesium Sulfate according to the Pritchard regimen (intramuscular protocol)?',
                        'options' => [
                            '4 g IV (20% solution) over 5-10 mins PLUS 10 g IM (5 g in each buttock as 50% solution)',
                            '2 g IV bolus only without maintenance',
                            '10 g IV bolus over 1 minute',
                            '20 g continuous subcutaneous infusion',
                        ],
                        'correct_option' => 0,
                        'explanation' => 'The standard Pritchard loading dose consists of 4 g IV (20% solution) slowly over 5-10 mins plus 10 g deep IM (5 g in each buttock as 50% solution with 1 mL 2% lidocaine).',
                        'order_index' => 2,
                    ],
                    [
                        'question_number' => 3,
                        'stem' => 'Which of the following is the earliest clinical sign of Magnesium Sulfate toxicity?',
                        'options' => [
                            'Respiratory depression (< 12 breaths/minute)',
                            'Loss of deep tendon (patellar/knee jerk) reflex',
                            'Oliguria (< 30 mL/hour)',
                            'Cardiac arrest in diastole',
                        ],
                        'correct_option' => 1,
                        'explanation' => 'Loss of the patellar tendon reflex is the first clinical warning sign of magnesium toxicity, typically occurring at serum concentrations of 7–10 mEq/L, well before respiratory depression occurs.',
                        'order_index' => 3,
                    ],
                    [
                        'question_number' => 4,
                        'stem' => 'Which bedside intravenous agent is the specific antidote for acute magnesium toxicity?',
                        'options' => [
                            '10 mL of 10% Calcium Gluconate IV given slowly over 10 minutes',
                            'Sodium Bicarbonate 8.4% IV',
                            'Atropine sulfate 0.6 mg IV',
                            'Flumazenil 0.2 mg IV',
                        ],
                        'correct_option' => 0,
                        'explanation' => '10 mL of 10% Calcium Gluconate administered intravenously over 10 minutes is the established antidote for magnesium toxicity.',
                        'order_index' => 4,
                    ],
                    [
                        'question_number' => 5,
                        'stem' => 'What is the definitive curative treatment for preeclampsia once the mother has been clinically stabilized?',
                        'options' => [
                            'Strict bed rest until spontaneous labor at 40 weeks',
                            'Termination of pregnancy / delivery of the fetus and placenta',
                            'Lifelong ACE inhibitors and loop diuretics',
                            'Plasmapheresis and high-dose corticosteroid maintenance',
                        ],
                        'correct_option' => 1,
                        'explanation' => 'Delivery of the fetus and placenta is the sole definitive treatment that resolves the endothelial pathology of preeclampsia.',
                        'order_index' => 5,
                    ],
                ],
            ],
            [
                'pathway_code' => 'NMC',
                'discipline' => 'Pediatrics & Child Health',
                'title' => 'Station 4: A 14-month-old child with fast breathing and chest indrawing',
                'stem' => "A 14-month-old girl is brought by her mother to the district hospital in rural Nepal with a 3-day history of cough, runny nose, and progressively worsening breathing difficulty. She is irritable and has refused breastfeeding since this morning.\n\nOn examination, the child is conscious but visibly tachypneic. The counted respiratory rate is 58 breaths per minute. There is marked subcostal and intercostal lower chest wall indrawing. Audible grunting is noted. Oxygen saturation on room air is 88%. Auscultation reveals bilateral coarse crackles and bronchial breath sounds over the right mid-zone.",
                'vitals' => "• Respiratory Rate: 58 breaths/min | SpO2: 88% (Room Air)\n• Temperature: 39.0°C (102.2°F)\n• Weight: 9.0 kg\n• Cyanosis: Absent on room air, but nasal flaring present",
                'order_index' => 4,
                'is_active' => true,
                'questions' => [
                    [
                        'question_number' => 1,
                        'stem' => "Under standard WHO / Nepal IMNCI (Integrated Management of Neonatal & Childhood Illness) guidelines, what is the classification of this child's condition?",
                        'options' => [
                            'No Pneumonia (Cough or Cold)',
                            'Pneumonia',
                            'Severe Pneumonia',
                            'Asthma exacerbation',
                        ],
                        'correct_option' => 2,
                        'explanation' => 'Under IMNCI guidelines, the presence of lower chest wall indrawing, grunting, oxygen saturation <90%, or inability to feed in a child with cough classifies the illness as Severe Pneumonia, requiring urgent hospitalization.',
                        'order_index' => 1,
                    ],
                    [
                        'question_number' => 2,
                        'stem' => "What is the threshold for defining 'Fast Breathing' in a child aged 12 months to 5 years according to IMNCI?",
                        'options' => [
                            '60 breaths per minute or more',
                            '50 breaths per minute or more',
                            '40 breaths per minute or more',
                            '30 breaths per minute or more',
                        ],
                        'correct_option' => 2,
                        'explanation' => 'Fast breathing cutoffs: <2 months: ≥60 breaths/min; 2–11 months: ≥50 breaths/min; 12 months–5 years: ≥40 breaths/min. At 14 months, 58 breaths/min is distinctly fast.',
                        'order_index' => 2,
                    ],
                    [
                        'question_number' => 3,
                        'stem' => 'What is the immediate supportive respiratory priority for this child?',
                        'options' => [
                            'Immediate endotracheal intubation and mechanical ventilation',
                            'Supplemental oxygen therapy via nasal prongs to maintain SpO2 ≥ 94%',
                            'Immediate administration of oral cough expectorants',
                            'Intravenous fluid bolus of 40 mL/kg within 15 minutes',
                        ],
                        'correct_option' => 1,
                        'explanation' => 'With an SpO2 of 88% and marked chest indrawing, immediate humidified supplemental oxygen via nasal prongs or nasal catheter to achieve saturation ≥94% is mandatory.',
                        'order_index' => 3,
                    ],
                    [
                        'question_number' => 4,
                        'stem' => 'What is the first-line parenteral antibiotic regimen recommended for hospitalized severe childhood community-acquired pneumonia in Nepal?',
                        'options' => [
                            'Oral Azithromycin syrup once daily',
                            'Injectable Ampicillin (or Benzylpenicillin) combined with Gentamicin',
                            'Intravenous Vancomycin and Meropenem',
                            'Oral Ciprofloxacin',
                        ],
                        'correct_option' => 1,
                        'explanation' => 'Standard IMNCI / national pediatric protocols recommend IV/IM Ampicillin (50 mg/kg q6h) combined with Gentamicin (7.5 mg/kg once daily) as empirical first-line therapy for severe pneumonia.',
                        'order_index' => 4,
                    ],
                    [
                        'question_number' => 5,
                        'stem' => 'Which bacterial organism represents the most common cause of Community-Acquired severe pneumonia in this age group globally and in Nepal?',
                        'options' => [
                            'Streptococcus pneumoniae',
                            'Pseudomonas aeruginosa',
                            'Klebsiella pneumoniae',
                            'Mycoplasma pneumoniae',
                        ],
                        'correct_option' => 0,
                        'explanation' => 'Streptococcus pneumoniae (Pneumococcus) remains the leading bacterial etiology of childhood pneumonia and severe respiratory mortality worldwide.',
                        'order_index' => 5,
                    ],
                ],
            ],
        ];

        foreach ($stations as $stationData) {
            $questions = $stationData['questions'];
            unset($stationData['questions']);

            $scenario = ClinicalScenario::updateOrCreate(
                ['title' => $stationData['title']],
                $stationData
            );

            foreach ($questions as $qData) {
                ClinicalScenarioQuestion::updateOrCreate(
                    [
                        'clinical_scenario_id' => $scenario->id,
                        'question_number' => $qData['question_number'],
                    ],
                    $qData
                );
            }
        }
    }
}
