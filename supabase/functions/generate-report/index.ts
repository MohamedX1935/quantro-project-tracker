
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { summary, difficulties, solutions, recommendations, time_spent, quality_rating, location } = await req.json()

    const prompt = `
Générez un rapport professionnel détaillé de fin de tâche basé sur les informations suivantes :

RÉSUMÉ DES TRAVAUX :
${summary}

DIFFICULTÉS RENCONTRÉES :
${difficulties || 'Aucune difficulté particulière signalée'}

SOLUTIONS APPORTÉES :
${solutions || 'Aucune solution spécifique mentionnée'}

RECOMMANDATIONS :
${recommendations || 'Aucune recommandation particulière'}

TEMPS PASSÉ : ${time_spent || 'Non spécifié'} heures
QUALITÉ DU TRAVAIL : ${quality_rating || 'Non évaluée'}
LIEU DE TRAVAIL : ${location || 'Non spécifié'}

Le rapport doit être structuré, professionnel et complet, avec une introduction, un développement détaillé des points mentionnés, et une conclusion. Utilisez un ton formel et technique approprié pour un environnement professionnel.
`

    const HUGGING_FACE_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')
    
    if (!HUGGING_FACE_TOKEN) {
      throw new Error('Token Hugging Face non configuré')
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      {
        headers: {
          "Authorization": `Bearer ${HUGGING_FACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.7,
            do_sample: true
          }
        }),
      }
    )

    if (!response.ok) {
      // Fallback en cas d'erreur avec l'API
      const fallbackReport = generateFallbackReport(summary, difficulties, solutions, recommendations, time_spent, quality_rating, location)
      return new Response(
        JSON.stringify({ generatedReport: fallbackReport }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result = await response.json()
    let generatedReport = ''

    if (result && result.length > 0 && result[0].generated_text) {
      generatedReport = result[0].generated_text
    } else {
      generatedReport = generateFallbackReport(summary, difficulties, solutions, recommendations, time_spent, quality_rating, location)
    }

    return new Response(
      JSON.stringify({ generatedReport }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating report:', error)
    
    // En cas d'erreur, générer un rapport de base
    const fallbackReport = "Rapport de fin de tâche généré automatiquement.\n\nLes détails fournis ont été enregistrés et le travail a été complété selon les spécifications demandées."
    
    return new Response(
      JSON.stringify({ generatedReport: fallbackReport }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateFallbackReport(summary: string, difficulties: string, solutions: string, recommendations: string, time_spent: number, quality_rating: string, location: string): string {
  return `
RAPPORT DE FIN DE TÂCHE
=======================

DATE: ${new Date().toLocaleDateString('fr-FR')}
LIEU: ${location || 'Non spécifié'}

1. RÉSUMÉ DES TRAVAUX EFFECTUÉS
${summary}

2. TEMPS CONSACRÉ
Durée totale: ${time_spent || 'Non spécifié'} heures

3. DIFFICULTÉS RENCONTRÉES
${difficulties || 'Aucune difficulté particulière n\'a été rencontrée lors de la réalisation de cette tâche.'}

4. SOLUTIONS MISES EN ŒUVRE
${solutions || 'Les méthodes standard ont été appliquées pour mener à bien cette tâche.'}

5. RECOMMANDATIONS
${recommendations || 'Aucune recommandation particulière à signaler.'}

6. ÉVALUATION QUALITÉ
Auto-évaluation: ${quality_rating || 'Non renseignée'}

7. CONCLUSION
La tâche a été réalisée conformément aux spécifications demandées. Tous les objectifs ont été atteints dans les délais impartis.

---
Rapport généré automatiquement
  `.trim()
}
