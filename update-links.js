const fs = require('fs');
const path = require('path');

// Dossier contenant les pages HTML
const pagesDir = path.join(__dirname, 'pages');

// Liste des fichiers HTML à traiter
const htmlFiles = [
  'index.html',
  'candidate-upload.html',
  'candidate-login.html',
  'candidate-questionnaire.html',
  'candidate-matches.html',
  'candidate-applications.html',
  'candidate-dashboard.html',
  'candidate-job-selection.html',
  'new-candidate-questionnaire.html',
  'post-job.html',
  'recruiter-dashboard.html',
  'recruiter-login.html',
  'recruiter-questionnaire.html',
  'recruiter-questionnaire-matching.html',
  'recruiter-matches.html',
  'recruiter-candidate-selection.html'
];

// Fonction pour mettre à jour les liens dans un fichier HTML
function updateLinks(filePath) {
  console.log(`Traitement des liens dans : ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Mise à jour des liens vers d'autres pages
    htmlFiles.forEach(htmlFile => {
      // Exclure les liens qui contiennent déjà un chemin (../ ou /)
      const regex = new RegExp(`href="(?!\\.\\./)(?!/)${htmlFile}"`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, `href="${htmlFile}"`);
        updated = true;
      }
    });
    
    // Écriture du fichier mis à jour uniquement si des modifications ont été faites
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Liens mis à jour pour : ${filePath}`);
    } else {
      console.log(`ℹ️ Aucun lien à mettre à jour pour : ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour des liens dans ${filePath} : ${error.message}`);
  }
}

// Traitement de tous les fichiers HTML dans le dossier pages
fs.readdir(pagesDir, (err, files) => {
  if (err) {
    console.error(`Erreur lors de la lecture du dossier pages : ${err.message}`);
    return;
  }
  
  files.filter(file => path.extname(file) === '.html').forEach(file => {
    const filePath = path.join(pagesDir, file);
    updateLinks(filePath);
  });
});