#!/usr/bin/env python3
"""
Script de test simple pour vérifier que Python fonctionne correctement avec l'API Node.js
"""

import sys
import json

def process_data(input_json):
    """Traite les données d'entrée et renvoie un résultat de test"""
    try:
        # Charger les données JSON
        data = json.loads(input_json)
        
        # Créer un résultat de test simple
        result = {
            "status": "success",
            "message": "Le parser Python fonctionne correctement",
            "input_size": len(input_json),
            "data_keys": list(data.keys())
        }
        
        return json.dumps(result)
    except Exception as e:
        # En cas d'erreur, renvoyer un message d'erreur
        return json.dumps({
            "status": "error",
            "message": f"Erreur: {str(e)}"
        })

if __name__ == "__main__":
    # Lire les données d'entrée depuis stdin
    input_data = sys.stdin.read()
    
    # Traiter les données
    result = process_data(input_data)
    
    # Afficher le résultat sur stdout
    print(result)