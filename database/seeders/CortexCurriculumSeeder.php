<?php

namespace Database\Seeders;

use App\Models\Subject;
use App\Models\Subtopic;
use App\Models\Topic;
use Illuminate\Database\Seeder;

class CortexCurriculumSeeder extends Seeder
{
    public function run(): void
    {
        $subjectsData = [
            [
                'name' => 'General Medicine',
                'slug' => 'general-medicine',
                'icon_key' => 'Stethoscope',
                'order_index' => 1,
                'topics' => [
                    ['name' => 'Cardiology & Acute Coronary Syndromes', 'slug' => 'cardiology-acs', 'priority' => 3, 'subtopics' => ['STEMI vs NSTEMI Management', 'Arrhythmias & ECG Interpretation', 'Heart Failure Guidelines']],
                    ['name' => 'Pulmonology & Critical Care', 'slug' => 'pulmonology-critical-care', 'priority' => 3, 'subtopics' => ['ARDS & Mechanical Ventilation', 'COPD & Asthma Exacerbations', 'Interstitial Lung Diseases']],
                    ['name' => 'Nephrology & Acid-Base', 'slug' => 'nephrology-acid-base', 'priority' => 2, 'subtopics' => ['Glomerulonephritis Spectrum', 'Acute Kidney Injury', 'Electrolyte Emergencies']],
                    ['name' => 'Endocrinology & Metabolism', 'slug' => 'endocrinology-metabolism', 'priority' => 3, 'subtopics' => ['Diabetic Ketoacidosis & HHS', 'Thyroid Storm & Myxedema', 'Adrenal Insufficiency']],
                ],
            ],
            [
                'name' => 'General Surgery',
                'slug' => 'general-surgery',
                'icon_key' => 'Scissors',
                'order_index' => 2,
                'topics' => [
                    ['name' => 'Acute Abdomen & Trauma ATLS', 'slug' => 'acute-abdomen-trauma', 'priority' => 3, 'subtopics' => ['FAST Exam & Hemoperitoneum', 'Bowel Obstruction & Perforation', 'Splenic & Liver Injury Grading']],
                    ['name' => 'Surgical Oncology & Breast', 'slug' => 'surgical-oncology-breast', 'priority' => 2, 'subtopics' => ['Triple Negative Breast Carcinoma', 'Colorectal Adenocarcinoma', 'Thyroid Nodules (Bethesda)']],
                    ['name' => 'Vascular Surgery', 'slug' => 'vascular-surgery', 'priority' => 2, 'subtopics' => ['Ruptured Abdominal Aortic Aneurysm', 'Acute Limb Ischemia', 'Carotid Artery Stenosis']],
                ],
            ],
            [
                'name' => 'Obstetrics & Gynecology',
                'slug' => 'obstetrics-gynecology',
                'icon_key' => 'Baby',
                'order_index' => 3,
                'topics' => [
                    ['name' => 'High-Risk Obstetrics', 'slug' => 'high-risk-obstetrics', 'priority' => 3, 'subtopics' => ['Preeclampsia with Severe Features & Eclampsia', 'Postpartum Hemorrhage (PPH)', 'Antepartum Hemorrhage']],
                    ['name' => 'Gynecologic Oncology', 'slug' => 'gynecologic-oncology', 'priority' => 2, 'subtopics' => ['Cervical Cancer Screening (FIGO)', 'Ovarian Epithelial Tumors', 'Endometrial Hyperplasia & Cancer']],
                    ['name' => 'Reproductive Endocrinology & Infertility', 'slug' => 'reproductive-endocrinology', 'priority' => 2, 'subtopics' => ['PCOS Rotterdam Criteria', 'Primary Amenorrhea Workup', 'Endometriosis Management']],
                ],
            ],
            [
                'name' => 'Pediatrics',
                'slug' => 'pediatrics',
                'icon_key' => 'Smile',
                'order_index' => 4,
                'topics' => [
                    ['name' => 'Neonatology & Perinatal Emergencies', 'slug' => 'neonatology-perinatal', 'priority' => 3, 'subtopics' => ['Neonatal Resuscitation Protocol', 'Respiratory Distress Syndrome (Surfactant)', 'Neonatal Sepsis & Jaundice']],
                    ['name' => 'Pediatric Infectious Diseases', 'slug' => 'pediatric-infections', 'priority' => 3, 'subtopics' => ['Kawasaki Disease vs MIS-C', 'Broup & Epiglottitis', 'Febrile Neutropenia in Children']],
                    ['name' => 'Pediatric Genetics & Development', 'slug' => 'pediatric-genetics', 'priority' => 2, 'subtopics' => ['Inborn Errors of Metabolism', 'Trisomies & Chromosomal Microdeletions', 'Developmental Milestones Red Flags']],
                ],
            ],
            [
                'name' => 'Pathology',
                'slug' => 'pathology',
                'icon_key' => 'Microscope',
                'order_index' => 5,
                'topics' => [
                    ['name' => 'Hematopathology', 'slug' => 'hematopathology', 'priority' => 3, 'subtopics' => ['Acute Leukemias (AML vs ALL)', 'Hodgkin vs Non-Hodgkin Lymphoma', 'Myeloproliferative Neoplasms (JAK2)']],
                    ['name' => 'General Neoplasia & Genetics', 'slug' => 'general-neoplasia', 'priority' => 3, 'subtopics' => ['Hallmarks of Cancer & Oncometabolism', 'Tumor Suppressor Genes (p53, RB)', 'Paraneoplastic Syndromes']],
                ],
            ],
            [
                'name' => 'Pharmacology',
                'slug' => 'pharmacology',
                'icon_key' => 'Pill',
                'order_index' => 6,
                'topics' => [
                    ['name' => 'Autonomic & Cardiovascular Drugs', 'slug' => 'cardiovascular-drugs', 'priority' => 3, 'subtopics' => ['Antiarrhythmic Classes (Vaughan Williams)', 'Antihypertensive Combinations in CKD/DM', 'Heart Failure Neurohormonal Blockers']],
                    ['name' => 'Antimicrobial Chemotherapy', 'slug' => 'antimicrobial-chemotherapy', 'priority' => 3, 'subtopics' => ['Beta-lactams & Resistant Organisms (MRSA, CRE)', 'Antifungal Mechanism & Toxicity', 'Antitubercular Drug Toxicities & Regimens']],
                    ['name' => 'Neuropharmacology', 'slug' => 'neuropharmacology', 'priority' => 2, 'subtopics' => ['Antiepileptic Drug Selection & Teratogenicity', 'Atypical Antipsychotics & Metabolic Risk', 'Anesthetics (MAC, Malignant Hyperthermia)']],
                ],
            ],
            [
                'name' => 'Microbiology',
                'slug' => 'microbiology',
                'icon_key' => 'Bug',
                'order_index' => 7,
                'topics' => [
                    ['name' => 'Bacteriology & Resistance', 'slug' => 'bacteriology-resistance', 'priority' => 3, 'subtopics' => ['Atypical Pneumonias', 'Spore-Forming Anaerobes', 'Gram-Negative Enteric Pathogens']],
                    ['name' => 'Virology & Immunology', 'slug' => 'virology-immunology', 'priority' => 3, 'subtopics' => ['HIV Dynamics & Opportunistic Infections', 'Hepatitis Serology Interpretation', 'Herpesviridae Spectrum']],
                ],
            ],
            [
                'name' => 'Anatomy',
                'slug' => 'anatomy',
                'icon_key' => 'Bone',
                'order_index' => 8,
                'topics' => [
                    ['name' => 'Neuroanatomy & Brainstem', 'slug' => 'neuroanatomy-brainstem', 'priority' => 3, 'subtopics' => ['Cross-Sectional Brainstem Syndromes (Wallenberg)', 'Cavernous Sinus & Cranial Nerves', 'Visual Pathway Defects']],
                    ['name' => 'Thoracoabdominal Anatomy', 'slug' => 'thoracoabdominal-anatomy', 'priority' => 2, 'subtopics' => ['Brachial Plexus & Upper Limb Nerve Entrapments', 'Inguinal Canal & Hernia Boundaries', 'Pelvic Autonomics & Ureteric Relations']],
                ],
            ],
            [
                'name' => 'Physiology',
                'slug' => 'physiology',
                'icon_key' => 'Activity',
                'order_index' => 9,
                'topics' => [
                    ['name' => 'Cardiovascular & Renal Dynamics', 'slug' => 'cardiovascular-renal-dynamics', 'priority' => 3, 'subtopics' => ['Pressure-Volume Loops & Murmurs', 'Glomerular Filtration & Tubuloglomerular Feedback', 'Countercurrent Multiplication & Osmoregulation']],
                    ['name' => 'Neurophysiology & Endocrinology', 'slug' => 'neurophysiology-endocrine', 'priority' => 2, 'subtopics' => ['Action Potential & Synaptic Plasticity', 'Hypothalamic-Pituitary-Target Axes', 'Calcium Homeostasis (PTH, Vitamin D, Calcitonin)']],
                ],
            ],
            [
                'name' => 'Biochemistry',
                'slug' => 'biochemistry',
                'icon_key' => 'Dna',
                'order_index' => 10,
                'topics' => [
                    ['name' => 'Molecular Biology & Genetics', 'slug' => 'molecular-biology-genetics', 'priority' => 3, 'subtopics' => ['DNA Repair Defects (Xeroderma, Lynch)', 'Polymerase Chain Reaction & Blotting Techniques', 'Epigenetic Regulation & Imprinting']],
                    ['name' => 'Intermediary Metabolism', 'slug' => 'intermediary-metabolism', 'priority' => 3, 'subtopics' => ['Glycogen Storage Diseases (Type I-V)', 'Lysosomal Storage Disorders (Gaucher, Tay-Sachs)', 'Hyperlipidemias & Lipid Transport']],
                ],
            ],
            [
                'name' => 'Forensic Medicine',
                'slug' => 'forensic-medicine',
                'icon_key' => 'Scale',
                'order_index' => 11,
                'topics' => [
                    ['name' => 'Medical Jurisprudence & Thanatology', 'slug' => 'jurisprudence-thanatology', 'priority' => 2, 'subtopics' => ['Early & Late Signs of Death (Rigor, Algor, Livor)', 'Mechanical Injury Patterns (Blunt vs Sharp vs Firearm)', 'Medical Ethics, Negligence & Informed Consent']],
                    ['name' => 'Clinical Toxicology', 'slug' => 'clinical-toxicology', 'priority' => 3, 'subtopics' => ['Organophosphate & Carbamate Poisoning', 'Heavy Metal Poisoning (Lead, Arsenic)', 'Snake Envenomation Syndromes (Neuro vs Hemotoxic)']],
                ],
            ],
            [
                'name' => 'Community Medicine (PSM)',
                'slug' => 'community-medicine',
                'icon_key' => 'Users',
                'order_index' => 12,
                'topics' => [
                    ['name' => 'Epidemiology & Biostatistics', 'slug' => 'epidemiology-biostatistics', 'priority' => 3, 'subtopics' => ['Study Designs (RCT, Cohort, Case-Control)', 'Measures of Association (OR, RR, HR, NNT)', 'Sensitivity, Specificity & Predictive Values']],
                    ['name' => 'Preventive Health & Global Health Programs', 'slug' => 'preventive-health', 'priority' => 2, 'subtopics' => ['Universal Immunization Schedule (EPI)', 'Maternal & Child Health Indicators', 'Vector-Borne Disease Control Strategies']],
                ],
            ],
            [
                'name' => 'ENT (Otorhinolaryngology)',
                'slug' => 'ent',
                'icon_key' => 'Ear',
                'order_index' => 13,
                'topics' => [
                    ['name' => 'Otology & Audiology', 'slug' => 'otology-audiology', 'priority' => 2, 'subtopics' => ['Pure Tone Audiometry & Impedance', 'Chronic Suppurative Otitis Media (Cholesteatoma)', 'Ménière Disease vs Vestibular Neuritis']],
                    ['name' => 'Rhinology & Laryngology', 'slug' => 'rhinology-laryngology', 'priority' => 2, 'subtopics' => ['Juvenile Nasopharyngeal Angiofibroma', 'Vocal Cord Palsies (Recurrent Laryngeal Nerve)', 'Head & Neck Squamous Cell Carcinoma']],
                ],
            ],
            [
                'name' => 'Ophthalmology',
                'slug' => 'ophthalmology',
                'icon_key' => 'Eye',
                'order_index' => 14,
                'topics' => [
                    ['name' => 'Retina & Posterior Segment', 'slug' => 'retina-posterior-segment', 'priority' => 3, 'subtopics' => ['Diabetic & Hypertensive Retinopathy', 'Retinal Detachment & Rhegmatogenous Tears', 'Central Retinal Artery vs Vein Occlusion']],
                    ['name' => 'Glaucoma & Neuro-ophthalmology', 'slug' => 'glaucoma-neuro-ophthalmology', 'priority' => 3, 'subtopics' => ['Primary Open Angle vs Acute Angle Closure Glaucoma', 'Optic Neuritis & Papilledema', 'Pupillary Reflex Abnormalities (Argyll Robertson, Horner)']],
                ],
            ],
            [
                'name' => 'Orthopedics',
                'slug' => 'orthopedics',
                'icon_key' => 'Accessibility',
                'order_index' => 15,
                'topics' => [
                    ['name' => 'Trauma & Fractures', 'slug' => 'trauma-fractures', 'priority' => 3, 'subtopics' => ['Compartment Syndrome (6 Ps & Delta Pressure)', 'Femoral Neck & Intertrochanteric Fractures', 'Pelvic Ring Fractures & Shock Management']],
                    ['name' => 'Pediatric Orthopedics & Bone Tumors', 'slug' => 'pediatric-ortho-tumors', 'priority' => 2, 'subtopics' => ['Developmental Dysplasia of the Hip (Barlow/Ortolani)', 'Osteosarcoma vs Ewing Sarcoma Histology', 'Septic Arthritis vs Transient Synovitis']],
                ],
            ],
            [
                'name' => 'Dermatology',
                'slug' => 'dermatology',
                'icon_key' => 'Sparkles',
                'order_index' => 16,
                'topics' => [
                    ['name' => 'Papulosquamous & Autoimmune Bullous', 'slug' => 'papulosquamous-bullous', 'priority' => 3, 'subtopics' => ['Pemphigus Vulgaris (Desmoglein 3) vs Bullous Pemphigoid', 'Psoriasis Spectrum & Auspitz Sign', 'Lichen Planus & Wickham Striae']],
                    ['name' => 'Dermatologic Emergencies & Infections', 'slug' => 'derm-emergencies-infections', 'priority' => 3, 'subtopics' => ['Stevens-Johnson Syndrome / Toxic Epidermal Necrolysis', 'Leprosy Ridley-Jopling Classification', 'Melanoma ABCDE Criteria & Breslow Depth']],
                ],
            ],
            [
                'name' => 'Psychiatry',
                'slug' => 'psychiatry',
                'icon_key' => 'Brain',
                'order_index' => 17,
                'topics' => [
                    ['name' => 'Psychotic & Mood Disorders', 'slug' => 'psychotic-mood-disorders', 'priority' => 3, 'subtopics' => ['Schizophrenia DSM-5 Criteria & Negative Symptoms', 'Bipolar I vs II & Lithium Toxicity', 'Major Depressive Disorder with Psychotic Features']],
                    ['name' => 'Neurocognitive & Anxiety Disorders', 'slug' => 'neurocognitive-anxiety', 'priority' => 2, 'subtopics' => ['Delirium vs Dementia (Alzheimer vs Lewy Body)', 'Post-Traumatic Stress Disorder', 'Somatic Symptom & Conversion Disorders']],
                ],
            ],
            [
                'name' => 'Radiology',
                'slug' => 'radiology',
                'icon_key' => 'Scan',
                'order_index' => 18,
                'topics' => [
                    ['name' => 'Emergency & Chest Imaging', 'slug' => 'emergency-chest-imaging', 'priority' => 3, 'subtopics' => ['Non-Contrast Head CT in Acute Ischemic vs Hemorrhagic Stroke', 'Pneumoperitoneum (Rigler Sign, Crescent Sign)', 'Pulmonary Embolism CT Pulmonary Angiography (CTPA)']],
                    ['name' => 'Abdominal & Musculoskeletal Imaging', 'slug' => 'abdominal-msk-imaging', 'priority' => 2, 'subtopics' => ['Target Sign in Intussusception & USG findings', 'MRI Sequences (T1, T2, FLAIR, DWI/ADC mismatch)', 'Barium Swallow Patterns in Achalasia vs Esophageal Spasm']],
                ],
            ],
            [
                'name' => 'Anesthesiology',
                'slug' => 'anesthesiology',
                'icon_key' => 'Syringe',
                'order_index' => 19,
                'topics' => [
                    ['name' => 'Airway Management & Critical Resuscitation', 'slug' => 'airway-resuscitation', 'priority' => 3, 'subtopics' => ['Difficult Airway Algorithm & Mallampati Scoring', 'Capnography Waveform Analysis', 'ACLS Cardiac Arrest Algorithms']],
                    ['name' => 'General & Regional Anesthesia', 'slug' => 'general-regional-anesthesia', 'priority' => 2, 'subtopics' => ['Local Anesthetic Systemic Toxicity (LAST) & Lipid Emulsion', 'Spinal vs Epidural Complications (Post-Dural Puncture Headache)', 'Neuromuscular Blockade Reversal (Sugammadex vs Neostigmine)']],
                ],
            ],
        ];

        foreach ($subjectsData as $sData) {
            $subject = Subject::updateOrCreate(
                ['slug' => $sData['slug']],
                [
                    'name' => $sData['name'],
                    'icon_key' => $sData['icon_key'],
                    'order_index' => $sData['order_index'],
                ]
            );

            foreach ($sData['topics'] as $tData) {
                $topic = Topic::updateOrCreate(
                    [
                        'subject_id' => $subject->id,
                        'slug' => $tData['slug'],
                    ],
                    [
                        'name' => $tData['name'],
                        'high_yield_priority' => $tData['priority'],
                    ]
                );

                foreach ($tData['subtopics'] as $stName) {
                    Subtopic::firstOrCreate([
                        'topic_id' => $topic->id,
                        'name' => $stName,
                    ]);
                }
            }
        }
    }
}
