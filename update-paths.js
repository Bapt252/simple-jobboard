const fs = require('fs');
const path = require('path');

// Dossier contenant les pages HTML
const pagesDir = path.join(__dirname, 'pages');

// Fonction pour mettre à jour les chemins dans un fichier HTML
function updatePaths(filePath) {
  console.log(`Traitement du fichier : ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Mise à jour des chemins CSS
    content = content.replace(
      /<link rel="stylesheet" href="styles\.css">/g, 
      '<link rel="stylesheet" href="../styles/styles.css">'
    );
    
    // Mise à jour des chemins JS
    content = content.replace(
      /<script src="app\.js"><\/script>/g, 
      '<script src="../services/app.js"></script>'
    );
    
    // Mise à jour des composants
    content = content.replace(
      /<script src="header\.js"><\/script>/g, 
      '<script src="../components/header.js"></script>'
    );
    
    content = content.replace(
      /<script src="footer\.js"><\/script>/g, 
      '<script src="../components/footer.js"></script>'
    );
    
    // Mise à jour des utilitaires
    content = content.replace(
      /<script src="candidate-upload\.js"><\/script>/g, 
      '<script src="../utils/candidate-upload.js"></script>'
    );
    
    content = content.replace(
      /<script src="post-job\.js"><\/script>/g, 
      '<script src="../utils/post-job.js"></script>'
    );
    
    // Mise à jour des services
    content = content.replace(
      /<script src="matching-algorithm\.js"><\/script>/g, 
      '<script src="../services/matching-algorithm.js"></script>'
    );
    
    // Écriture du fichier mis à jour
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Mise à jour réussie pour : ${filePath}`);
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour de ${filePath} : ${error.message}`);
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
    updatePaths(filePath);
  });
});