<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlayWebController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = null;
        try {
            $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
        } catch (\Throwable $e) {
            // Graceful fallback
        }

        // Multi-Case Clinical Bank for Medle
        $medleCases = [
            [
                'id' => 'medle-142',
                'caseNumber' => 142,
                'disease' => 'Infective Endocarditis',
                'specialty' => 'Cardiology / Infectious Disease',
                'organEmoji' => '🫀',
                'clues' => [
                    [
                        'type' => 'ecg',
                        'icon' => 'ecg',
                        'title' => 'ECG / Conduction',
                        'text' => 'New-onset 1st-degree AV block (PR > 210 ms) in a patient with a newly documented holosystolic murmur.',
                        'danger' => 'Suggests aortic root abscess extending into the AV conduction system (bundle of His).',
                    ],
                    [
                        'type' => 'temperature',
                        'icon' => 'thermometer',
                        'title' => 'Vitals & Presentation',
                        'text' => 'Temp 39.2°C (102.6°F), HR 104 bpm; 2-week history of remittent fevers, night sweats, and marked malaise.',
                        'danger' => 'Persistent bacteremia with fluctuating pyrexia refractory to oral outpatient antibiotics.',
                    ],
                    [
                        'type' => 'blood',
                        'icon' => 'blood',
                        'title' => 'Laboratory & Cultures',
                        'text' => 'Blood cultures x 3 positive for Streptococcus gallolyticus (S. bovis). Elevated ESR 88 mm/hr and CRP.',
                        'danger' => 'S. gallolyticus bacteremia has a strong, pathognomonic association with occult colorectal adenoma/carcinoma.',
                    ],
                    [
                        'type' => 'cardiac',
                        'icon' => 'heart',
                        'title' => 'Physical Examination',
                        'text' => 'Painless erythematous macules on palms (Janeway lesions), splinter hemorrhages, and TEE showing 12mm oscillating aortic vegetation.',
                        'danger' => 'Major Duke criteria met. High risk of systemic septic embolization to brain and kidneys.',
                    ],
                ],
                'options' => [
                    'Infective Endocarditis',
                    'Acute Pericarditis',
                    'Rheumatic Heart Disease',
                    'Non-bacterial Thrombotic Endocarditis (Libman-Sacks)',
                ],
                'differentialReasons' => [
                    'Acute Pericarditis' => 'Pericarditis produces diffuse ST elevations and PR depressions, but does not form mobile vegetations or cause positive bacteremic blood cultures.',
                    'Rheumatic Heart Disease' => 'RHD presents weeks after Group A Strep pharyngitis with migratory polyarthritis and Sydenham chorea, not persistent S. gallolyticus bacteremia.',
                    'Non-bacterial Thrombotic Endocarditis (Libman-Sacks)' => 'Associated with SLE and antiphospholipid syndrome; sterile vegetations with negative blood cultures and no spiking fever.',
                ],
                'pearl' => 'Duke Criteria: 2 Major (positive blood cultures + echo showing vegetation/abscess) or 1 Major + 3 Minor. Streptococcus gallolyticus endocarditis warrants mandatory colonoscopy.',
                'immediateManagement' => 'Draw 3 sets of blood cultures from separate venipuncture sites before empiric IV Vancomycin + Ceftriaxone. Order emergent TEE.',
            ],
            [
                'id' => 'medle-143',
                'caseNumber' => 143,
                'disease' => 'Tension Pneumothorax',
                'specialty' => 'Emergency Medicine / Pulmonology',
                'organEmoji' => '🫁',
                'clues' => [
                    [
                        'type' => 'ecg',
                        'icon' => 'ecg',
                        'title' => 'ECG & Hemodynamics',
                        'text' => 'Marked sinus tachycardia (HR 138 bpm), low QRS voltage, and severe hypotension (BP 72/44 mmHg).',
                        'danger' => 'Obstructive shock secondary to compressed vena cava and drastically impaired venous return to the heart.',
                    ],
                    [
                        'type' => 'temperature',
                        'icon' => 'thermometer',
                        'title' => 'Vitals & Triage',
                        'text' => 'RR 34/min, SpO2 84% on 15L non-rebreather, afebrile; patient in severe acute respiratory distress with diaphoresis.',
                        'danger' => 'Imminent cardiovascular collapse; progressive intrathoracic pressure causing complete one-way valve effect.',
                    ],
                    [
                        'type' => 'blood',
                        'icon' => 'blood',
                        'title' => 'ABG & Diagnostics',
                        'text' => 'ABG: pH 7.22, PaCO2 56 mmHg, PaO2 50 mmHg. Bedside eFAST reveals absent lung sliding on the right hemithorax.',
                        'danger' => 'Hypoxemic and hypercapnic respiratory acidosis with loss of visceral-parietal pleural interface.',
                    ],
                    [
                        'type' => 'cardiac',
                        'icon' => 'heart',
                        'title' => 'Physical Signs',
                        'text' => 'Absent breath sounds and hyperresonance to percussion over right hemithorax; trachea visibly deviated to the LEFT with distended neck veins (JVD).',
                        'danger' => 'Pathognomonic triad: Absent breath sounds, hyperresonance, and contralateral tracheal deviation.',
                    ],
                ],
                'options' => [
                    'Tension Pneumothorax',
                    'Cardiac Tamponade',
                    'Massive Hemothorax',
                    'Severe Acute Asthma Exacerbation',
                ],
                'differentialReasons' => [
                    'Cardiac Tamponade' => 'Tamponade also causes hypotension and JVD (Beck triad), but has BILATERAL breath sounds and lungs are clear to auscultation with no tracheal shift.',
                    'Massive Hemothorax' => 'Hemothorax causes DULLNESS to percussion and collapsed neck veins due to severe hypovolemic shock, rather than hyperresonance and JVD.',
                    'Severe Acute Asthma Exacerbation' => 'Presents with diffuse expiratory wheezes bilaterally and prolonged expiratory phase, not unilateral absent breath sounds with tracheal shift.',
                ],
                'pearl' => 'Tension Pneumothorax is a CLINICAL diagnosis. Never delay decompression to obtain a chest X-ray!',
                'immediateManagement' => 'Immediate needle thoracostomy (decompression) at 2nd intercostal space midclavicular line or 5th ICS anterior axillary line, followed immediately by tube thoracostomy.',
            ],
            [
                'id' => 'medle-144',
                'caseNumber' => 144,
                'disease' => 'Acute Biliary Pancreatitis',
                'specialty' => 'Gastroenterology / General Surgery',
                'organEmoji' => '🫀',
                'clues' => [
                    [
                        'type' => 'ecg',
                        'icon' => 'ecg',
                        'title' => 'ECG & Hemodynamics',
                        'text' => 'Sinus tachycardia at 116 bpm, non-specific ST depressions, dry mucous membranes, delayed capillary refill.',
                        'danger' => 'Severe third-spacing of fluid into the retroperitoneum causing systemic hypovolemia.',
                    ],
                    [
                        'type' => 'temperature',
                        'icon' => 'thermometer',
                        'title' => 'Vitals & Pain Presentation',
                        'text' => 'Temp 38.4°C, severe epigastric pain radiating directly to the mid-back, relieved somewhat by leaning forward; severe nausea and vomiting.',
                        'danger' => 'Severe acute pancreatic inflammation; leaning forward relaxes retroperitoneal pressure on the celiac plexus.',
                    ],
                    [
                        'type' => 'blood',
                        'icon' => 'blood',
                        'title' => 'Laboratory & Liver Panel',
                        'text' => 'Serum Lipase 1,840 U/L (>3x ULN), ALT 320 U/L, Total Bilirubin 3.8 mg/dL, elevated alkaline phosphatase.',
                        'danger' => 'ALT > 150 U/L has a 95% positive predictive value for a biliary (gallstone) etiology.',
                    ],
                    [
                        'type' => 'cardiac',
                        'icon' => 'heart',
                        'title' => 'Exam & Imaging',
                        'text' => 'Severe epigastric tenderness with guarding, faint periumbilical ecchymosis (Cullen sign); RUQ ultrasound confirms cholelithiasis and a dilated common bile duct (8.5 mm).',
                        'danger' => 'Cullen sign indicates retroperitoneal hemorrhage. Dilated CBD signifies impacted choledocholithiasis.',
                    ],
                ],
                'options' => [
                    'Acute Biliary Pancreatitis',
                    'Perforated Peptic Ulcer',
                    'Acute Cholecystitis',
                    'Acute Mesenteric Ischemia',
                ],
                'differentialReasons' => [
                    'Perforated Peptic Ulcer' => 'Presents with sudden catastrophic peritonitis ("board-like" abdomen) and free air under the diaphragm on upright CXR, without markedly elevated lipase.',
                    'Acute Cholecystitis' => 'Features Murphy sign and gallbladder wall thickening, but lipase is normal and pain does not radiate straight through to the back.',
                    'Acute Mesenteric Ischemia' => 'Known for "pain out of proportion to exam", severe metabolic acidosis with elevated lactate, and unremarkable abdominal palpation initially.',
                ],
                'pearl' => 'Diagnosis requires 2 of 3: (1) characteristic epigastric pain radiating to back, (2) lipase/amylase > 3x ULN, (3) diagnostic imaging. ALT > 150 strongly predicts biliary etiology.',
                'immediateManagement' => 'Aggressive IV fluid resuscitation with Lactated Ringer solution (250-500 mL/hr), bowel rest, opioid analgesia, and urgent ERCP if concurrent cholangitis or persistent biliary obstruction is present.',
            ],
            [
                'id' => 'medle-145',
                'caseNumber' => 145,
                'disease' => 'Guillain-Barré Syndrome',
                'specialty' => 'Neurology',
                'organEmoji' => '🧠',
                'clues' => [
                    [
                        'type' => 'ecg',
                        'icon' => 'ecg',
                        'title' => 'ECG & Autonomic Signs',
                        'text' => 'Fluctuating cardiac telemetry: episodes of sinus bradycardia (42 bpm) alternating with paroxysmal sinus tachycardia (130 bpm) and labile blood pressure.',
                        'danger' => 'Dysautonomia caused by autoimmune involvement of the autonomic nervous system.',
                    ],
                    [
                        'type' => 'temperature',
                        'icon' => 'thermometer',
                        'title' => 'History & Vitals',
                        'text' => 'Afebrile, BP 154/92 mmHg; history of bloody diarrheal illness 2.5 weeks prior following a poultry barbecue (Campylobacter jejuni).',
                        'danger' => 'Classic molecular mimicry: antibodies against C. jejuni lipooligosaccharides cross-react with gangliosides (GM1) on peripheral nerves.',
                    ],
                    [
                        'type' => 'blood',
                        'icon' => 'blood',
                        'title' => 'Lumbar Puncture / CSF',
                        'text' => 'Lumbar puncture reveals: Opening pressure normal, WBC 2 /mcL, Glucose normal, Protein 168 mg/dL (markedly elevated).',
                        'danger' => 'Hallmark "albuminocytologic dissociation": high protein with normal white cell count.',
                    ],
                    [
                        'type' => 'cardiac',
                        'icon' => 'heart',
                        'title' => 'Neurological Exam',
                        'text' => 'Symmetrical ascending muscle weakness (legs > arms), bilateral foot drop, absent deep tendon reflexes (areflexia, 0/4 in patellar and Achilles tendons bilaterally).',
                        'danger' => 'Rapid ascending paralysis; forced vital capacity (FVC) monitoring is essential to detect diaphragmatic failure before respiratory arrest.',
                    ],
                ],
                'options' => [
                    'Guillain-Barré Syndrome',
                    'Myasthenia Gravis',
                    'Multiple Sclerosis Exacerbation',
                    'Tick Paralysis',
                ],
                'differentialReasons' => [
                    'Myasthenia Gravis' => 'MG presents with fatiguable weakness predominantly in ocular/bulbar muscles (ptosis, diplopia) with NORMAL deep tendon reflexes, and no CSF albuminocytologic dissociation.',
                    'Multiple Sclerosis Exacerbation' => 'MS involves the central nervous system with hyperreflexia, positive Babinski sign, and oligoclonal bands in CSF, not areflexic flaccid ascending paralysis.',
                    'Tick Paralysis' => 'Can mimic GBS closely, but CSF protein is completely normal and weakness rapidly reverses within hours of tick removal.',
                ],
                'pearl' => 'Hallmark is albuminocytologic dissociation in CSF. Monitor Forced Vital Capacity (FVC) and Negative Inspiratory Force (NIF). Intravenous immunoglobulin (IVIG) or plasmapheresis is definitive; corticosteroids are NOT effective.',
                'immediateManagement' => 'Serial monitoring of pulmonary mechanics (FVC and NIF). Initiate IVIG (0.4 g/kg/day for 5 days) or Plasmapheresis. Prepare for elective endotracheal intubation if FVC drops below 15-20 mL/kg.',
            ],
            [
                'id' => 'medle-146',
                'caseNumber' => 146,
                'disease' => 'Pheochromocytoma',
                'specialty' => 'Endocrinology / Nephrology',
                'organEmoji' => '🫀',
                'clues' => [
                    [
                        'type' => 'ecg',
                        'icon' => 'ecg',
                        'title' => 'ECG & Hemodynamics',
                        'text' => 'Sinus tachycardia (HR 128 bpm) with left ventricular hypertrophy (voltage criteria) and frequent premature ventricular contractions (PVCs).',
                        'danger' => 'Excess catecholamine surge causing hyperadrenergic cardiomyopathy and tachyarrhythmias.',
                    ],
                    [
                        'type' => 'temperature',
                        'icon' => 'thermometer',
                        'title' => 'Paroxysmal Triad',
                        'text' => 'Episodic BP spikes to 220/125 mmHg accompanied by sudden throbbing headache, profuse diaphoresis, and severe palpitations.',
                        'danger' => 'Classic clinical triad: Episodic headache, sweating, and tachycardia with paroxysmal hypertension.',
                    ],
                    [
                        'type' => 'blood',
                        'icon' => 'blood',
                        'title' => 'Biochemical Markers',
                        'text' => 'Plasma free metanephrines 5.8 nmol/L (normal < 0.5); 24-hour urine fractionated metanephrines and normetanephrine elevated > 6 times upper reference limit.',
                        'danger' => 'Diagnostic confirmation of autonomous catecholamine hypersecretion by chromaffin tissue.',
                    ],
                    [
                        'type' => 'cardiac',
                        'icon' => 'heart',
                        'title' => 'Abdominal Imaging',
                        'text' => 'Abdominal MRI demonstrates a 5.2 cm heterogeneous, hyperintense right adrenal mass with cystic changes on T2-weighted sequence ("lightbulb sign").',
                        'danger' => 'Adrenal medullary chromaffin tumor. Associated with MEN 2A/2B, VHL, and NF1 syndromes.',
                    ],
                ],
                'options' => [
                    'Pheochromocytoma',
                    'Essential Hypertension',
                    'Panic Disorder',
                    'Thyroid Storm',
                ],
                'differentialReasons' => [
                    'Essential Hypertension' => 'Sustained elevated BP without paroxysmal surges, drenching diaphoresis, or multifold elevation of plasma free metanephrines.',
                    'Panic Disorder' => 'Causes palpitations and anxiety, but does not cause malignant systolic pressures > 220 mmHg or positive urinary metanephrines.',
                    'Thyroid Storm' => 'Presents with hyperthermia (>39°C), severe delirium, jaundice, and suppressed TSH with elevated free T4, unlike adrenal chromaffin tumors.',
                ],
                'pearl' => 'Always achieve ALPHA-BLOCKADE FIRST (Phenoxybenzamine) for 10-14 days before beta-blockade! Giving a beta-blocker first causes unopposed alpha-1 vasoconstriction and fatal hypertensive crisis.',
                'immediateManagement' => 'Initiate irreversible alpha-1 adrenergic antagonist Phenoxybenzamine (or Doxazosin). Add beta-blocker (Propranolol) ONLY after adequate alpha-blockade is established. Surgical adrenalectomy after medical optimization.',
            ],
            [
                'id' => 'medle-147',
                'caseNumber' => 147,
                'disease' => 'Stanford Type A Aortic Dissection',
                'specialty' => 'Vascular Surgery / Emergency Medicine',
                'organEmoji' => '🫀',
                'clues' => [
                    [
                        'type' => 'ecg',
                        'icon' => 'ecg',
                        'title' => 'ECG & Conduction',
                        'text' => 'Sinus tachycardia with inferior ST-segment elevations in lead III and aVF; retrograde dissection into the right coronary artery (RCA) ostium.',
                        'danger' => 'Dissection flap propagating proximally into coronary ostia causing acute inferior wall myocardial ischemia.',
                    ],
                    [
                        'type' => 'temperature',
                        'icon' => 'thermometer',
                        'title' => 'Vitals & Blood Pressure Discrepancy',
                        'text' => 'Right arm BP 184/102 mmHg, left arm BP 112/68 mmHg (>20 mmHg inter-arm difference); unequal radial pulses.',
                        'danger' => 'Dissection flap compromising the left subclavian or innominate artery origin.',
                    ],
                    [
                        'type' => 'blood',
                        'icon' => 'blood',
                        'title' => 'Biomarkers & Radiography',
                        'text' => 'Serum D-dimer markedly elevated (>5,000 ng/mL). Portable CXR shows a widened mediastinum (>8 cm) and abnormal aortic knob contour.',
                        'danger' => 'Very high negative predictive value of D-dimer. Widened superior mediastinum is a classic board clue.',
                    ],
                    [
                        'type' => 'cardiac',
                        'icon' => 'heart',
                        'title' => 'Physical Signs & CTA',
                        'text' => 'Sudden-onset "tearing", excruciating pain radiating between the shoulder blades; new early diastolic murmur (aortic regurgitation). CTA shows intimal flap in ascending aorta.',
                        'danger' => 'Stanford Type A involves ascending aorta. High risk of acute tamponade, aortic rupture, and death (1-2% mortality per hour).',
                    ],
                ],
                'options' => [
                    'Stanford Type A Aortic Dissection',
                    'Acute Inferior STEMI',
                    'Boerhaave Syndrome (Esophageal Rupture)',
                    'Massive Pulmonary Embolism',
                ],
                'differentialReasons' => [
                    'Acute Inferior STEMI' => 'Pain builds gradually with ST elevations on ECG, without inter-arm blood pressure discrepancy or mediastinal widening.',
                    'Boerhaave Syndrome' => 'Occurs after severe violent retching; CXR shows pneumomediastinum and pleural effusion, but no aortic intimal flap or pulse deficit.',
                    'Massive Pulmonary Embolism' => 'Causes acute dyspnea, tachycardia, and right ventricular strain on ECG, but does not cause inter-arm blood pressure difference or mediastinal widening.',
                ],
                'pearl' => 'Stanford Type A (involves ascending aorta) = Emergent OPEN SURGICAL REPAIR! Stanford Type B (descending aorta only) = Medical management first with IV beta-blockers (Esmolol) targeting SBP 100-120 mmHg and HR < 60 bpm.',
                'immediateManagement' => 'Immediate IV Esmolol or Labetalol to lower heart rate (< 60 bpm) and shear stress, followed by Nitroprusside if SBP remains > 120 mmHg. Emergent Cardiothoracic Surgery consultation for open graft repair.',
            ],
        ];

        // Comprehensive Medical Conditions Dictionary for Autocomplete
        $medicalDictionary = [
            'Infective Endocarditis',
            'Tension Pneumothorax',
            'Acute Biliary Pancreatitis',
            'Guillain-Barré Syndrome',
            'Pheochromocytoma',
            'Stanford Type A Aortic Dissection',
            'Diabetic Ketoacidosis',
            'Cardiac Tamponade',
            'Acute Pericarditis',
            'Rheumatic Heart Disease',
            'Myasthenia Gravis',
            'Multiple Sclerosis',
            'Boerhaave Syndrome',
            'Acute Cholecystitis',
            'Massive Pulmonary Embolism',
            'Acute Coronary Syndrome (STEMI)',
            'Hypertrophic Cardiomyopathy',
            'Thyroid Storm',
            'Addisonian Crisis',
            'Cushing Syndrome',
            'Kawasaki Disease',
            'Henoch-Schönlein Purpura',
            'Temporal (Giant Cell) Arteritis',
            'Granulomatosis with Polyangiitis',
            'Takotsubo Cardiomyopathy',
            'Mesenteric Ischemia',
            'Appendicitis',
            'Subarachnoid Hemorrhage',
            'Normal Pressure Hydrocephalus',
        ];

        // Active Daily Medle Case
        $dailyMedle = $medleCases[0];

        // Synapses Connections Game
        $synapsesData = [
            'groups' => [
                [
                    'category' => 'Causes of Digital Clubbing',
                    'color' => 'bg-amber-100 text-amber-900 border-amber-300',
                    'items' => ['Bronchiectasis', 'Lung Adenocarcinoma', 'Cyanotic Heart Disease', 'Idiopathic Pulmonary Fibrosis'],
                ],
                [
                    'category' => 'Glycogen Storage Diseases',
                    'color' => 'bg-emerald-100 text-emerald-900 border-emerald-300',
                    'items' => ['Von Gierke', 'Pompe', 'Cori', 'McArdle'],
                ],
                [
                    'category' => 'First-Line Anti-TB Regimen (RIPE)',
                    'color' => 'bg-sky-100 text-sky-900 border-sky-300',
                    'items' => ['Rifampin', 'Isoniazid', 'Pyrazinamide', 'Ethambutol'],
                ],
                [
                    'category' => 'Retroperitoneal Organs (SAD PUCKER)',
                    'color' => 'bg-purple-100 text-purple-900 border-purple-300',
                    'items' => ['Suprarenal glands', 'Aorta & IVC', 'Duodenum (2nd-4th)', 'Pancreas (except tail)'],
                ],
            ],
        ];

        // Here & There (Swipe Left / Right Binary Classification)
        $hereAndThereData = [
            'leftCategory' => "Crohn's Disease",
            'rightCategory' => 'Ulcerative Colitis',
            'cards' => [
                ['text' => 'Skip lesions throughout the GI tract', 'correct' => 'left'],
                ['text' => 'Continuous colonic involvement starting from the rectum', 'correct' => 'right'],
                ['text' => 'Transmural inflammation leading to fistulas and strictures', 'correct' => 'left'],
                ['text' => 'Lead-pipe sign on abdominal radiography with pseudopolyps', 'correct' => 'right'],
                ['text' => 'Non-caseating granulomas on mucosal biopsy', 'correct' => 'left'],
                ['text' => 'Markedly increased risk of Toxic Megacolon', 'correct' => 'right'],
            ],
        ];

        // Image Rush
        $imageRushCards = [
            [
                'id' => 'ir-1',
                'question' => 'What is the classic radiographic sign seen on this chest X-ray in aortic coarctation?',
                'emoji' => '🫀',
                'options' => ['Rib Notching (Roesler Sign)', 'Water Bottle Sign', 'Hampton Hump', 'Westermark Sign'],
                'correct' => 0,
                'explanation' => 'Inferior rib notching (3rd-8th ribs) results from engorged collateral intercostal arteries eroding the bone.',
            ],
            [
                'id' => 'ir-2',
                'question' => 'A young athlete collapses during soccer. Autopsy reveals asymmetrical septal hypertrophy. Diagnosis?',
                'emoji' => '⚡',
                'options' => ['Hypertrophic Cardiomyopathy (HCM)', 'Dilated Cardiomyopathy', 'Arrhythmogenic Right Ventricular Dysplasia', 'Myocarditis'],
                'correct' => 0,
                'explanation' => 'HCM is caused by mutations in sarcomeric proteins (beta-myosin heavy chain, myosin-binding protein C).',
            ],
            [
                'id' => 'ir-3',
                'question' => 'What diagnostic EEG finding is characteristic of Childhood Absence Seizures?',
                'emoji' => '🧠',
                'options' => ['3 Hz Spike-and-Wave complexes', 'Hypsarrhythmia', 'Periodic lateralized discharges', 'Triphasic waves'],
                'correct' => 0,
                'explanation' => 'Classic 3-per-second spike-and-wave discharges provoked by hyperventilation. Treated with Ethosuximide.',
            ],
        ];

        return Inertia::render('play/index', [
            'user' => $user,
            'dailyMedle' => $dailyMedle,
            'medleCases' => $medleCases,
            'medicalDictionary' => $medicalDictionary,
            'synapsesData' => $synapsesData,
            'hereAndThereData' => $hereAndThereData,
            'imageRushCards' => $imageRushCards,
            'playerStats' => [
                'level' => 4,
                'title' => 'Senior Resident',
                'xp' => 1420,
                'streakDays' => 5,
                'completedToday' => 2,
            ],
        ]);
    }
}
