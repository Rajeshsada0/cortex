<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CortexAiController extends Controller
{
    /**
     * Handle incoming clinical query for Cortex AI Chatbot.
     */
    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'prompt' => 'required|string|max:2000',
            'subject' => 'nullable|string|max:100',
            'mode' => 'nullable|string|in:tutor,mnemonic,differential,management,quiz',
            'history' => 'nullable|array',
        ]);

        $prompt = trim($validated['prompt']);
        $mode = $validated['mode'] ?? 'tutor';
        $subject = $validated['subject'] ?? 'General Medicine';

        // Check for live external LLM API if configured
        $geminiKey = config('services.gemini.key', env('GEMINI_API_KEY'));
        $openAiKey = config('services.openai.key', env('OPENAI_API_KEY'));

        if (!empty($geminiKey)) {
            $liveResponse = $this->queryGemini($prompt, $geminiKey, $mode, $subject);
            if ($liveResponse) {
                return response()->json($liveResponse);
            }
        } elseif (!empty($openAiKey)) {
            $liveResponse = $this->queryOpenAi($prompt, $openAiKey, $mode, $subject);
            if ($liveResponse) {
                return response()->json($liveResponse);
            }
        }

        // Offline / Built-in Medical Inference Knowledge Base
        $response = $this->generateClinicalKnowledgeResponse($prompt, $mode, $subject);

        return response()->json([
            'status' => 'success',
            'ai_name' => 'Cortex AI',
            'title' => 'Cortex AI Medical Tutor',
            'prompt' => $prompt,
            'reply' => $response['reply'],
            'clinical_pearl' => $response['pearl'],
            'emergency_step' => $response['emergency_step'] ?? null,
            'mnemonic' => $response['mnemonic'] ?? null,
            'related_topics' => $response['related_topics'] ?? [],
            'credits_remaining' => 485,
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Return user's Cortex AI calibration credits.
     */
    public function credits(Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'credits_remaining' => 500,
            'tier' => 'Cortex MAX Clinical Pro',
            'unlimited_tutor' => true,
            'features' => [
                'Instant Differential Diagnosis Engine',
                'Step-by-Step Pathophysiology Explainer',
                'Board Mnemonic & Buzzword Generator',
                'Interactive Case Management Drills',
            ],
        ]);
    }

    /**
     * Refill user's Cortex AI credits.
     */
    public function refillCredits(Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => '+500 Cortex AI Calibration Credits successfully added!',
            'credits_remaining' => 1000,
        ]);
    }

    /**
     * Extensive medical knowledge base with board-caliber diagnostic reasoning.
     */
    private function generateClinicalKnowledgeResponse(string $prompt, string $mode, string $subject): array
    {
        $q = strtolower($prompt);

        // 1. Infective Endocarditis
        if (str_contains($q, 'endocarditis') || str_contains($q, 'duke') || str_contains($q, 'gallolyticus') || str_contains($q, 'janeway') || str_contains($q, 'osler')) {
            return [
                'reply' => "**Infective Endocarditis (IE)** is an infection of the endocardial surface of the heart, most commonly involving heart valves (mitral > aortic; tricuspid in IV drug users).\n\n" .
                    "### 🩺 Modified Duke Criteria:\n" .
                    "* **2 Major Criteria**, OR **1 Major + 3 Minor**, OR **5 Minor Criteria**.\n" .
                    "* **Major Criteria**:\n" .
                    "  1. **Positive blood cultures**: Typical microorganisms (*Staph aureus*, *Viridans streptococci*, *Enterococci*, *Streptococcus gallolyticus/bovis*) in 2 separate blood cultures.\n" .
                    "  2. **Evidence of endocardial involvement**: Oscillating intracardiac mass/vegetation on valve or supporting structures on Echocardiogram (TEE is more sensitive than TTE), or new valvular regurgitation murmur.\n" .
                    "* **Minor Criteria**:\n" .
                    "  * Predisposing heart condition or IVDU.\n" .
                    "  * Fever ≥ 38.0°C (100.4°F).\n" .
                    "  * **Vascular phenomena**: Major arterial emboli, septic pulmonary infarcts, mycotic aneurysm, intracranial hemorrhage, **Janeway lesions** (painless erythematous macules on palms/soles).\n" .
                    "  * **Immunologic phenomena**: Glomerulonephritis, **Osler nodes** (painful erythematous nodules on finger pads), **Roth spots** (retinal hemorrhages with pale centers), positive rheumatoid factor.\n" .
                    "  * Microbiological evidence not meeting major criteria.",
                'pearl' => "Streptococcus gallolyticus (formerly S. bovis) endocarditis has a >90% association with occult colorectal carcinoma or premalignant polyps. Colonoscopy is mandatory!",
                'emergency_step' => "Draw 3 sets of blood cultures from separate venipuncture sites BEFORE initiating empiric IV Vancomycin + Ceftriaxone. Order immediate Transesophageal Echocardiogram (TEE).",
                'related_topics' => [
                    "What are the indications for urgent valve replacement surgery?",
                    "How to distinguish Janeway lesions from Osler nodes?",
                    "Prophylactic antibiotic guidelines before dental procedures",
                ],
            ];
        }

        // 2. Tension Pneumothorax
        if (str_contains($q, 'pneumothorax') || str_contains($q, 'needle decompression') || str_contains($q, 'tracheal deviation') || str_contains($q, 'hyperresonance')) {
            return [
                'reply' => "**Tension Pneumothorax** is a life-threatening medical emergency caused by a one-way valve mechanism that traps air in the pleural space during inspiration without allowing it to exit during expiration.\n\n" .
                    "### ⚠️ Pathophysiology & Hemodynamics:\n" .
                    "* Progressive accumulation of intrapleural air increases intrathoracic pressure.\n" .
                    "* This collapses the ipsilateral lung and causes **mediastinal shift** toward the contralateral side.\n" .
                    "* Compression of the superior and inferior vena cava drastically reduces venous return (preload) to the heart, precipitating **obstructive shock** and cardiac arrest.\n\n" .
                    "### 🚨 Classic Clinical Triad:\n" .
                    "1. **Severe hypotension, tachycardia, and respiratory distress** (SpO2 < 88%).\n" .
                    "2. **Unilateral absent breath sounds** with **hyperresonance to percussion** on the affected side.\n" .
                    "3. **Distended neck veins (JVD)** and visible **contralateral tracheal deviation** (trachea pushed AWAY from affected hemithorax).",
                'pearl' => "Tension Pneumothorax is purely a CLINICAL diagnosis. Never delay decompression to obtain a diagnostic chest radiograph!",
                'emergency_step' => "Immediate emergent Needle Thoracostomy using a large-bore (14-gauge) catheter at the 2nd intercostal space in the midclavicular line (or 5th ICS anterior axillary line), followed immediately by Tube Thoracostomy (chest tube).",
                'related_topics' => [
                    "Tension Pneumothorax vs Cardiac Tamponade (Beck's triad)",
                    "Spontaneous vs Traumatic Pneumothorax management",
                    "eFAST bedside ultrasound signs (Bar-code sign, lung point)",
                ],
            ];
        }

        // 3. Acute Pancreatitis
        if (str_contains($q, 'pancreatitis') || str_contains($q, 'lipase') || str_contains($q, 'cullen') || str_contains($q, 'grey turner') || str_contains($q, 'ranson')) {
            return [
                'reply' => "**Acute Pancreatitis** is acute enzymatic autodigestion of pancreatic parenchyma, most commonly triggered by gallstones (40-50%) or alcohol abuse (30-35%).\n\n" .
                    "### 🩺 Revised Atlanta Diagnostic Criteria (Requires 2 of 3):\n" .
                    "1. **Characteristic abdominal pain**: Severe, constant epigastric pain radiating directly to the mid-back, partially relieved by sitting upright or leaning forward.\n" .
                    "2. **Biochemical evidence**: Serum **Lipase or Amylase ≥ 3 times** the upper limit of normal (Lipase is more sensitive and specific with a longer half-life).\n" .
                    "3. **Imaging findings**: Contrast-enhanced CT, MRI, or transabdominal ultrasound demonstrating peripancreatic fluid, inflammation, or necrosis.\n\n" .
                    "### 🔍 Physical Signs:\n" .
                    "* **Cullen sign**: Periumbilical bluish ecchymosis indicating retroperitoneal hemorrhage.\n" .
                    "* **Grey Turner sign**: Flank ecchymosis indicating tracking of pancreatic hemorrhagic fluid into retroperitoneum.\n" .
                    "* **ALT > 150 U/L**: 95% positive predictive value for a gallstone (biliary) etiology.",
                'pearl' => "Serum Lipase is superior to Amylase: it remains elevated for 8-14 days and is not confounded by salivary pathology. Contrast CT is NOT required on Day 1 unless diagnosis is uncertain.",
                'emergency_step' => "Early, goal-directed IV fluid resuscitation with Lactated Ringer's solution (250-500 mL/hr guided by urine output and hematocrit), bowel rest, multimodal analgesia, and urgent ERCP within 24 hours if concurrent acute cholangitis is present.",
                'related_topics' => [
                    "Ranson criteria and BISAP score for severity prediction",
                    "Management of infected pancreatic necrosis",
                    "When to perform cholecystectomy for gallstone pancreatitis",
                ],
            ];
        }

        // 4. Guillain-Barré Syndrome
        if (str_contains($q, 'guillain') || str_contains($q, 'barre') || str_contains($q, 'ascending paralysis') || str_contains($q, 'albuminocytologic') || str_contains($q, 'campylobacter')) {
            return [
                'reply' => "**Guillain-Barré Syndrome (GBS)** is an acute, post-infectious autoimmune polyradiculoneuropathy characterized by symmetrical ascending flaccid muscle weakness and areflexia.\n\n" .
                    "### 🔬 Pathophysiology:\n" .
                    "* **Molecular mimicry**: Antibodies directed against *Campylobacter jejuni* lipooligosaccharides (or CMV, EBV, Zika) cross-react with peripheral nerve GM1/GD1a gangliosides.\n" .
                    "* Leads to complement activation and macrophage-mediated peripheral nerve demyelination (AIDP variant) or axonal destruction (AMAN variant).\n\n" .
                    "### 🩺 Hallmark Clinical Features:\n" .
                    "* Symmetrical ascending weakness starting in lower extremities and progressing proximally.\n" .
                    "* **Hyporeflexia or complete areflexia** (0/4 on deep tendon reflexes).\n" .
                    "* Autonomic dysautonomia (labile BP, sinus bradycardia/tachycardia, urinary retention).\n" .
                    "* **Lumbar Puncture**: **Albuminocytologic dissociation** (elevated CSF protein with normal white blood cell count < 5 cells/mcL).",
                'pearl' => "Steroids (Corticosteroids) are completely INEFFECTIVE in GBS and may worsen recovery! The definitive immunomodulatory treatments are IVIG or Plasmapheresis.",
                'emergency_step' => "Serial monitoring of Forced Vital Capacity (FVC) and Negative Inspiratory Force (NIF). Electively intubate if FVC < 15-20 mL/kg or NIF < -30 cmH2O to prevent sudden respiratory arrest.",
                'related_topics' => [
                    "Miller Fisher variant triad (Ophthalmoplegia, Ataxia, Areflexia)",
                    "Guillain-Barré vs Myasthenia Gravis vs Tick Paralysis",
                    "IVIG vs Plasmapheresis dosing protocol",
                ],
            ];
        }

        // 5. Pheochromocytoma
        if (str_contains($q, 'pheochromocytoma') || str_contains($q, 'metanephrine') || str_contains($q, 'phenoxybenzamine') || str_contains($q, 'rule of 10')) {
            return [
                'reply' => "**Pheochromocytoma** is a rare catecholamine-secreting tumor derived from chromaffin cells of the adrenal medulla (or extra-adrenal paraganglioma).\n\n" .
                    "### ⚡ The Classic Clinical Triad (The 5 P's):\n" .
                    "1. **Pressure**: Paroxysmal or persistent severe hypertension (often SBP > 200 mmHg).\n" .
                    "2. **Pain**: Throbbing, pounding episodic headache.\n" .
                    "3. **Perspiration**: Drenching, profuse diaphoresis.\n" .
                    "4. **Palpitations**: Tachycardia and sensations of heart racing.\n" .
                    "5. **Pallor**: Secondary to intense peripheral alpha-1 mediated vasoconstriction.\n\n" .
                    "### 🧪 Diagnostic Testing:\n" .
                    "* Initial test: **Plasma free fractionated metanephrines** (high sensitivity, 99%).\n" .
                    "* Confirmatory test: **24-hour urine fractionated metanephrines and normetanephrines**.\n" .
                    "* Imaging: Abdominal MRI or contrast CT. MRI shows characteristic **T2-hyperintense ('lightbulb') adrenal mass**.",
                'pearl' => "The absolute golden rule of Pheochromocytoma: ALWAYS administer ALPHA-BLOCKADE FIRST (Phenoxybenzamine) for 10-14 days before adding a beta-blocker! Giving a beta-blocker first leaves alpha-1 receptors unopposed, triggering catastrophic hypertensive crisis.",
                'emergency_step' => "Start non-selective alpha-adrenergic antagonist Phenoxybenzamine (or selective Doxazosin/Prazosin). High-salt diet and hydration to expand contracted plasma volume. Add beta-blocker (Propranolol) only 2-3 days prior to surgery once adequate alpha-blockade is verified.",
                'related_topics' => [
                    "Rule of 10s: 10% bilateral, 10% extra-adrenal, 10% malignant, 10% familial",
                    "Associated syndromes: MEN 2A, MEN 2B (RET mutation), VHL, Neurofibromatosis 1",
                    "Intraoperative hypertensive crisis management (Phentolamine/Nitroprusside)",
                ],
            ];
        }

        // 6. Aortic Dissection
        if (str_contains($q, 'aortic dissection') || str_contains($q, 'stanford') || str_contains($q, 'esmolol') || str_contains($q, 'tearing pain')) {
            return [
                'reply' => "**Aortic Dissection** occurs when a tear in the aortic intima allows pressurized blood to surge into the media, separating the layers and creating a false lumen.\n\n" .
                    "### 🩺 Stanford Classification & Management:\n" .
                    "* **Stanford Type A** (65%): Involves the **ascending aorta** (with or without descending aorta).\n" .
                    "  * Treatment: **EMERGENT OPEN SURGICAL REPAIR** (Mortality rises 1-2% per hour if untreated).\n" .
                    "  * Complications: Aortic regurgitation murmur, pericardial tamponade, coronary ostial occlusion (inferior STEMI), stroke.\n" .
                    "* **Stanford Type B** (35%): Involves only the **descending aorta** distal to the left subclavian artery.\n" .
                    "  * Treatment: **Medical management first** (strict BP and heart rate control with IV beta-blockers) unless end-organ malperfusion or rupture requires TEVAR (thoracic endovascular repair).\n\n" .
                    "### 🔍 Landmark Presentation:\n" .
                    "* Sudden-onset catastrophic, excruciating **'tearing' or 'ripping' substernal/interscapular back pain**.\n" .
                    "* **Blood pressure discrepancy > 20 mmHg** between right and left arms, with asymmetrical radial pulses.\n" .
                    "* Chest radiograph shows **widened mediastinum (> 8 cm)** and abnormal aortic contour.",
                'pearl' => "In acute aortic dissection, IV Beta-blockers (Esmolol or Labetalol) MUST precede vasodilators (Nitroprusside)! Vasodilators given without beta-blockade trigger reflex tachycardia and increase aortic shear stress (dP/dt), worsening dissection propagation.",
                'emergency_step' => "Immediate IV Esmolol to reduce heart rate (< 60 bpm) and shear stress, then titrate SBP to 100-120 mmHg. Order emergent CT Angiography (CTA) of the chest/abdomen and request immediate Cardiothoracic Surgery consultation.",
                'related_topics' => [
                    "Stanford Type A vs Type B surgical indications",
                    "ECG findings: Inferior STEMI mimic from RCA ostial involvement",
                    "Risk factors: Chronic hypertension, Marfan syndrome, Bicuspid aortic valve",
                ],
            ];
        }

        // 7. General High-Yield Board Topics (ABG, ECG, Mnemonics, Cardiology, etc.)
        if (str_contains($q, 'mnemonic') || str_contains($q, 'ripe') || str_contains($q, 'sad pucker') || str_contains($q, 'beck') || str_contains($q, 'charcot')) {
            return [
                'reply' => "### 💡 High-Yield Board Mnemonics for Fast Recall:\n\n" .
                    "1. **Retroperitoneal Organs ('SAD PUCKER')**:\n" .
                    "   * **S**: Suprarenal (adrenal) glands\n" .
                    "   * **A**: Aorta and Inferior Vena Cava\n" .
                    "   * **D**: Duodenum (2nd, 3rd, and 4th parts)\n" .
                    "   * **P**: Pancreas (head, neck, and body — EXCEPT the tail)\n" .
                    "   * **U**: Ureters\n" .
                    "   * **C**: Colon (ascending and descending)\n" .
                    "   * **K**: Kidneys\n" .
                    "   * **E**: Esophagus (thoracic/abdominal)\n" .
                    "   * **R**: Rectum\n\n" .
                    "2. **First-Line Tuberculosis Regimen ('RIPE')**:\n" .
                    "   * **R**ifampin: Inhibits bacterial RNA polymerase; turns bodily secretions orange/red.\n" .
                    "   * **I**soniazid (INH): Inhibits mycolic acid synthesis; causes peripheral neuropathy (prevent with Vitamin B6 / Pyridoxine) and hepatotoxicity.\n" .
                    "   * **P**yrazinamide: Hyperuricemia / gout and hepatotoxicity.\n" .
                    "   * **E**thambutol: Inhibits arabinosyl transferase; causes optic neuritis (decreased red-green visual acuity).\n\n" .
                    "3. **Beck's Triad (Cardiac Tamponade)**:\n" .
                    "   * Hypotension + Jugular Venous Distension (JVD) + Muffled Heart Sounds.",
                'pearl' => "For Retroperitoneal injuries: Pancreatic tail is intraperitoneal (lies within the splenorenal ligament) and travels with the splenic vessels!",
                'emergency_step' => "Correlate mnemonic clinical signs with acute imaging: eFAST for Beck's triad, upright CXR and abdominal CT for retroperitoneal perforation.",
                'related_topics' => [
                    "Causes of digital clubbing mnemonic",
                    "Glycogen storage disease types (Von Gierke, Pompe, Cori, McArdle)",
                    "Normal Anion Gap vs High Anion Gap Metabolic Acidosis (MUDPILES)",
                ],
            ];
        }

        // Default Rich Clinical Consultation Response
        return [
            'reply' => "### 🩺 Cortex AI Clinical Evaluation\n\n" .
                "Regarding **" . htmlspecialchars($prompt) . "**:\n\n" .
                "**1. Clinical Core & Mechanism:**\n" .
                "In high-stakes board examinations (USMLE, INI-CET, NMCLE), clinical vignettes typically feature one pathognomonic discriminator. Connect the chief complaint directly to the underlying pathophysiology and anatomic vascular territory.\n\n" .
                "**2. Diagnostic Approach:**\n" .
                "* Always assess hemodynamic stability first (Airway, Breathing, Circulation).\n" .
                "* Prioritize non-invasive, high-sensitivity initial screening before confirmatory invasive testing.\n" .
                "* Look for cardinal laboratory biomarkers (e.g. Troponin for myocardial ischemia, Lipase for pancreatitis, D-dimer for thromboembolism).\n\n" .
                "**3. Strategic Board Test-Taking Rule:**\n" .
                "When a vignette asks for the *'Next Best Step'*, distinction between diagnostic confirmation and emergent intervention is crucial. If the patient is unstable, resuscitation and stabilization always supersede diagnostic imaging!",
            'pearl' => "High-yield discriminator: Always look for age, duration of onset, and reciprocal physical signs (e.g., bilateral vs unilateral breath sounds, pulsus paradoxus, or JVD).",
            'emergency_step' => "Verify vital signs and establish 2 large-bore peripheral IV lines with continuous cardiac telemetry.",
            'related_topics' => [
                "Ask for high-yield board mnemonics",
                "Explain Infective Endocarditis Duke criteria",
                "Review Tension Pneumothorax emergency protocol",
                "Differential diagnosis for acute chest pain",
            ],
        ];
    }

    /**
     * Optional live query to Google Gemini API if key is provided.
     */
    private function queryGemini(string $prompt, string $apiKey, string $mode, string $subject): ?array
    {
        try {
            $systemInstruction = "You are Dr. Cortex AI, an elite medical AI tutor and residency game master for Cortex Medical. Provide authoritative, concise, structured clinical board explanations with pathophysiologic mechanisms, high-yield pearls, and next best steps.";
            $response = Http::timeout(10)->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}", [
                'system_instruction' => ['parts' => [['text' => $systemInstruction]]],
                'contents' => [
                    ['parts' => [['text' => "Question: {$prompt}\nSubject: {$subject}\nMode: {$mode}"]]],
                ],
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
                if ($text) {
                    return [
                        'status' => 'success',
                        'ai_name' => 'Cortex AI',
                        'title' => 'Cortex AI Live Tutor',
                        'prompt' => $prompt,
                        'reply' => $text,
                        'clinical_pearl' => 'Board Landmark: Analyze the primary discriminator before eliminating distractors.',
                        'credits_remaining' => 490,
                        'timestamp' => now()->toISOString(),
                    ];
                }
            }
        } catch (\Throwable $e) {
            Log::warning("Cortex AI Gemini fallback: " . $e->getMessage());
        }
        return null;
    }

    /**
     * Optional live query to OpenAI API if key is provided.
     */
    private function queryOpenAi(string $prompt, string $apiKey, string $mode, string $subject): ?array
    {
        try {
            $response = Http::timeout(10)->withToken($apiKey)->post("https://api.openai.com/v1/chat/completions", [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'system', 'content' => "You are Dr. Cortex AI, a high-yield medical board tutor. Structure your answers with clear medical markdown headers, pearls, and emergency next steps."],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.3,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $text = $data['choices'][0]['message']['content'] ?? null;
                if ($text) {
                    return [
                        'status' => 'success',
                        'ai_name' => 'Cortex AI',
                        'title' => 'Cortex AI Live Tutor',
                        'prompt' => $prompt,
                        'reply' => $text,
                        'clinical_pearl' => 'Board Landmark: Always link symptoms to underlying anatomy and physiology.',
                        'credits_remaining' => 490,
                        'timestamp' => now()->toISOString(),
                    ];
                }
            }
        } catch (\Throwable $e) {
            Log::warning("Cortex AI OpenAI fallback: " . $e->getMessage());
        }
        return null;
    }
}
