# Workflow CI en attente

`ci.yml` doit être déplacé vers `.github/workflows/ci.yml` dès qu'un token GitHub
avec le scope `workflow` est disponible (l'actuel ne permet pas de pousser des
fichiers de workflow). Commande :

    mkdir -p .github/workflows && git mv ci-pending/ci.yml .github/workflows/ci.yml && rm -rf ci-pending

