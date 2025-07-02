
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
    const { summary, difficulties, solutions, recommendations, time_spent, quality_rating, location, task_title, project_name, employee_name } = await req.json()

    console.log('Generating report for task:', task_title, 'in project:', project_name)

    // Prompt optimisé pour générer un rapport professionnel structuré
    const prompt = `<s>[INST] Vous êtes un assistant professionnel spécialisé dans la rédaction de rapports de fin de tâche. Générez un rapport détaillé et structuré basé sur les informations suivantes :

INFORMATIONS DE LA TÂCHE :
- Titre : ${task_title || 'Tâche non spécifiée'}
- Projet : ${project_name || 'Projet non spécifié'}
- Employé : ${employee_name || 'Non spécifié'}
- Localisation : ${location || 'Non spécifiée'}
- Temps passé : ${time_spent || 'Non spécifié'} heures
- Qualité auto-évaluée : ${quality_rating || 'Non renseignée'}

RÉSUMÉ DES TRAVAUX EFFECTUÉS :
${summary}

DIFFICULTÉS RENCONTRÉES :
${difficulties || 'Aucune difficulté particulière signalée'}

SOLUTIONS MISES EN ŒUVRE :
${solutions || 'Méthodes standards appliquées'}

RECOMMANDATIONS :
${recommendations || 'Aucune recommandation particulière'}

Rédigez un rapport professionnel avec les sections suivantes :
1. EN-TÊTE avec les informations de base
2. RÉSUMÉ EXÉCUTIF (2-3 phrases)
3. DESCRIPTION DES TRAVAUX RÉALISÉS
4. DIFFICULTÉS ET SOLUTIONS
5. RECOMMANDATIONS POUR L'AVENIR
6. CONCLUSION

Utilisez un style formel et professionnel. Le rapport doit faire environ 300-500 mots. [/INST]</s>`

    const HUGGING_FACE_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')
    
    if (!HUGGING_FACE_TOKEN) {
      console.error('HUGGING_FACE_ACCESS_TOKEN not configured')
      throw new Error('Token Hugging Face non configuré')
    }

    // Utilisation d'un modèle plus performant pour la génération de texte
    const modelUrl = "https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct"
    
    console.log('Calling Hugging Face API with model:', modelUrl)

    let retryCount = 0
    const maxRetries = 3
    let response

    // Système de retry pour gérer les erreurs temporaires
    while (retryCount < maxRetries) {
      try {
        response = await fetch(modelUrl, {
          headers: {
            "Authorization": `Bearer ${HUGGING_FACE_TOKEN}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 800,
              temperature: 0.3,
              do_sample: true,
              top_p: 0.9,
              repetition_penalty: 1.1,
              return_full_text: false
            },
            options: {
              wait_for_model: true
            }
          }),
        })

        if (response.ok) {
          break
        } else if (response.status === 503) {
          console.log(`Model loading, retry ${retryCount + 1}/${maxRetries}`)
          retryCount++
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount))
            continue
          }
        } else {
          console.error('API error:', response.status, await response.text())
          throw new Error(`API returned status ${response.status}`)
        }
      } catch (error) {
        console.error(`Attempt ${retryCount + 1} failed:`, error)
        retryCount++
        if (retryCount >= maxRetries) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
      }
    }

    if (!response || !response.ok) {
      console.log('Falling back to default report')
      const fallbackReport = generateFallbackReport(summary, difficulties, solutions, recommendations, time_spent, quality_rating, location, task_title, project_name, employee_name)
      return new Response(
        JSON.stringify({ generatedReport: fallbackReport }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result = await response.json()
    console.log('Hugging Face API response:', result)
    
    let generatedReport = ''

    if (result && Array.isArray(result) && result.length > 0 && result[0].generated_text) {
      generatedReport = result[0].generated_text.trim()
    } else if (result && result.generated_text) {
      generatedReport = result.generated_text.trim()
    } else {
      console.log('No valid response from AI, using fallback')
      generatedReport = generateFallbackReport(summary, difficulties, solutions, recommendations, time_spent, quality_rating, location, task_title, project_name, employee_name)
    }

    // Nettoyer le rapport généré
    generatedReport = cleanGeneratedReport(generatedReport)

    console.log('Generated report length:', generatedReport.length)

    return new Response(
      JSON.stringify({ generatedReport }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-report function:', error)
    
    // En cas d'erreur, générer un rapport de base
    const { summary, difficulties, solutions, recommendations, time_spent, quality_rating, location, task_title, project_name, employee_name } = await req.json().catch(() => ({}))
    const fallbackReport = generateFallbackReport(summary, difficulties, solutions, recommendations, time_spent, quality_rating, location, task_title, project_name, employee_name)
    
    return new Response(
      JSON.stringify({ 
        generatedReport: fallbackReport,
        warning: 'Rapport généré en mode de secours suite à une erreur technique'
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function cleanGeneratedReport(report: string): string {
  // Nettoyer le rapport des balises et artifacts indésirables
  return report
    .replace(/\[INST\]|\[\/INST\]|<s>|<\/s>/g, '')
    .replace(/^\s*Assistant:\s*/i, '')
    .replace(/^\s*Voici le rapport.*?:\s*/i, '')
    .trim()
}

function generateFallbackReport(summary: string, difficulties: string, solutions: string, recommendations: string, time_spent: number, quality_rating: string, location: string, task_title?: string, project_name?: string, employee_name?: string): string {
  const currentDate = new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  return `
═══════════════════════════════════════════════════════════════
                    RAPPORT DE FIN DE TÂCHE
═══════════════════════════════════════════════════════════════

📋 INFORMATIONS GÉNÉRALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Date d'émission    : ${currentDate}
• Tâche              : ${task_title || 'Non spécifiée'}
• Projet             : ${project_name || 'Non spécifié'}
• Employé            : ${employee_name || 'Non spécifié'}
• Localisation       : ${location || 'Non spécifiée'}
• Temps consacré     : ${time_spent ? `${time_spent} heures` : 'Non renseigné'}
• Auto-évaluation    : ${quality_rating || 'Non renseignée'}

📝 RÉSUMÉ EXÉCUTIF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Les travaux demandés ont été réalisés selon les spécifications établies. 
Cette mission s'est déroulée dans de bonnes conditions et a permis d'atteindre 
les objectifs fixés.

🔧 DESCRIPTION DES TRAVAUX RÉALISÉS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${summary}

${difficulties ? `⚠️ DIFFICULTÉS RENCONTRÉES ET SOLUTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Difficultés identifiées :
${difficulties}

Solutions mises en œuvre :
${solutions || 'Des solutions appropriées ont été appliquées pour résoudre les difficultés rencontrées.'}
` : ''}

${recommendations ? `💡 RECOMMANDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${recommendations}
` : ''}

✅ CONCLUSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mission accomplie avec succès. Les objectifs ont été atteints dans les 
conditions requises et dans les délais impartis. Les livrables sont 
conformes aux attentes exprimées.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rapport automatiquement généré le ${new Date().toLocaleString('fr-FR')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim()
}
