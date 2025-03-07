const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Route pour traiter les données de candidat
app.post('/api/process-candidate', (req, res) => {
  try {
    const candidateData = req.body;
    
    // Lancer le script Python pour le traitement
    // Utiliser simple_test.py pour tester, ou candidate_parser.py pour la version complète
    const pythonProcess = spawn('python3', ['parsers/simple_test.py']);
    
    // Erreur du processus Python
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Erreur Python: ${data}`);
      res.status(500).json({ error: 'Erreur lors du traitement des données' });
    });
    
    let result = '';
    
    // Résultat du processus Python
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    // Fin du processus Python
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: `Le processus Python s'est terminé avec le code ${code}` });
      }
      
      try {
        // Essayer de parser le résultat JSON
        const parsedResult = JSON.parse(result);
        res.json(parsedResult);
      } catch (e) {
        console.error('Erreur lors du parsing du résultat JSON:', e);
        res.status(500).json({ error: 'Erreur lors du parsing du résultat' });
      }
    });
    
    // Envoyer les données au processus Python
    pythonProcess.stdin.write(JSON.stringify(candidateData));
    pythonProcess.stdin.end();
    
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Route de test simple
app.get('/api/test', (req, res) => {
  res.json({ message: 'Le serveur API fonctionne correctement!' });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur API démarré sur le port ${port}`);
});