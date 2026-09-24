// PARZI Academy — CONTENU pédagogique (données versionnées, pas de CMS en v1).
// Programme complet « Devenir agent de joueur » : 8 chapitres alignés sur les
// compétences du diagnostic (lecture juridique, contrats/mandats, écosystème,
// règlements, cas pratiques, méthode) et sur les domaines de la carte agent
// (Scouting, Négociation, Juridique, Business, IA, Management).
//
// Esprit : ce que dirait un agent accompli + un excellent pédagogue. On enseigne
// des PRINCIPES durables. Les chiffres réglementaires précis (plafonds de
// commission, barèmes) changent et font l'objet de contentieux : on invite
// toujours à vérifier le texte FFF/FIFA en vigueur plutôt que d'ancrer une valeur.
// Chaque leçon se termine par un « Cas concret » (situation vécue) et un quiz de
// validation dont au moins une question est une mise en situation.

export type QuizQuestion = { q: string; options: string[]; answer: number; explain?: string };
export type Lesson = {
  id: string; title: string; minutes: number;
  intro: string; blocks: string[]; quiz: QuizQuestion[];
};
export type Chapter = { id: string; title: string; subtitle: string; lessons: Lesson[] };

export const COURSE: { id: string; title: string; chapters: Chapter[] } = {
  id: "devenir-agent",
  title: "Devenir agent de joueur",
  chapters: [
    // ================= CH.1 — FONDAMENTAUX =================
    {
      id: "fondamentaux",
      title: "Les fondamentaux du métier",
      subtitle: "Ce qu'est vraiment le travail d'agent — et ce qu'il n'est pas.",
      lessons: [
        {
          id: "role",
          title: "Le rôle réel d'un agent",
          minutes: 5,
          intro: "Un agent n'est pas un chasseur de commissions : c'est le gestionnaire de carrière d'un joueur.",
          blocks: [
            "L'agent de joueur (ou « intermédiaire ») représente les intérêts d'un joueur — ou parfois d'un club — dans ses relations contractuelles. Son métier ne se résume pas à négocier un salaire : il conseille sur les choix de carrière, gère l'image, anticipe les échéances, et protège son client des mauvaises décisions.",
            "Le quotidien réel : beaucoup de relationnel, de la veille permanente sur le marché, de l'administratif (mandats, contrats), et des moments courts mais décisifs de négociation. La valeur d'un agent se mesure sur la durée d'une carrière, pas sur un transfert isolé.",
            "La règle d'or du métier : la confiance. Un joueur confie sa carrière — donc sa vie professionnelle — à son agent. Tout se construit et se détruit sur cette confiance. Un bon agent dit parfois « non » à son client : refuser un transfert alléchant mais mauvais pour la carrière, c'est ça, protéger un joueur.",
            "Cas concret — Un club de première division propose à ton joueur de 19 ans un contrat en or… pour le laisser sur le banc derrière deux internationaux. L'agent débutant voit la commission ; l'agent accompli voit une saison sans jouer qui casse une progression. Refuser ce contrat et l'envoyer jouer en deuxième division, c'est souvent la décision qui, trois ans plus tard, vaut dix fois plus — pour le joueur comme pour toi.",
            "⚠️ L'erreur classique — Le débutant court après la commission et dit oui à tout ; il confond « faire un transfert » et « gérer une carrière ». L'agent accompli sait dire non, même à un joli chèque, quand c'est mauvais pour le joueur.",
            "🎯 À retenir — Tu gères une carrière, pas un transfert · La confiance est ton seul vrai capital · Un bon « non » vaut mieux qu'un mauvais « oui ».",
          ],
          quiz: [
            { q: "Quelle est la mission première d'un agent ?", options: ["Toucher une commission sur chaque transfert", "Gérer et protéger la carrière de son client dans la durée", "Trouver le salaire le plus élevé à court terme"], answer: 1, explain: "La carrière se gère sur la durée : c'est ça, le vrai métier." },
            { q: "Sur quoi repose la relation agent-joueur ?", options: ["Le contrat uniquement", "La confiance", "La notoriété de l'agent"], answer: 1 },
            { q: "Ton joueur de 19 ans a une offre très bien payée mais sans temps de jeu garanti. Le bon réflexe ?", options: ["Signer : la commission est belle", "Évaluer l'impact sur sa progression et oser refuser si ça casse sa carrière", "Le laisser décider seul sans avis"], answer: 1, explain: "Protéger la carrière prime sur la commission immédiate." },
          ],
        },
        {
          id: "ecosysteme",
          title: "L'écosystème du football",
          minutes: 6,
          intro: "Tu ne négocies jamais dans le vide : tu évolues dans un système d'acteurs aux intérêts différents.",
          blocks: [
            "Les acteurs à connaître : les clubs (direction sportive, direction générale, cellule de recrutement), les ligues et fédérations (FFF en France), la FIFA au niveau mondial, les joueurs et leurs familles, les autres agents, et l'écosystème périphérique (médias, sponsors, avocats, préparateurs). Chacun a ses objectifs propres — un bon agent sait ce que veut vraiment chaque interlocuteur.",
            "La hiérarchie du football : fédérations nationales sous l'égide de la FIFA (et, en Europe, de l'UEFA pour les compétitions continentales). Les règlements descendent de ces instances vers les clubs. Comprendre « qui décide quoi » t'évite de perdre du temps avec le mauvais interlocuteur.",
            "Dans un club, l'agent parle surtout au directeur sportif et à la cellule recrutement pour l'aspect sportif, et à la direction pour l'aspect financier et contractuel. Savoir à qui s'adresser, et dans quel ordre, fait gagner des semaines. Le pouvoir réel n'est pas toujours où l'organigramme le dit — apprends à repérer qui pèse vraiment.",
            "Le marché a un rythme : les fenêtres de transfert (mercato d'été et d'hiver) structurent l'année. Mais le vrai travail se fait ENTRE les mercatos : c'est là qu'on prépare les coups, qu'on sonde les besoins et qu'on positionne ses joueurs.",
            "Cas concret — Tu veux placer un milieu dans un club de Ligue 2. Tu appelles le président, qui te renvoie poliment vers « le sportif ». Pendant ce temps, un agent mieux informé a déjà déjeuné avec le directeur sportif ET le coach, qui décident réellement du recrutement. Résultat : quand le poste s'ouvre, c'est son joueur qu'on appelle. Connaître qui décide vraiment, ce n'est pas un détail — c'est l'accès.",
            "⚠️ L'erreur classique — Parler au mauvais interlocuteur (le président quand c'est le directeur sportif qui décide) et perdre des semaines. Le pro cartographie qui pèse vraiment, au-delà de l'organigramme.",
            "🎯 À retenir — Hiérarchie : FIFA puis confédérations, fédérations, clubs · Le pouvoir réel n'est pas toujours sur l'organigramme · L'essentiel se prépare entre les mercatos.",
          ],
          quiz: [
            { q: "Au niveau mondial, quelle instance chapeaute le football ?", options: ["L'UEFA", "La FIFA", "La FFF"], answer: 1, explain: "L'UEFA gère l'Europe ; la FIFA est l'instance mondiale." },
            { q: "Dans un club, qui est l'interlocuteur clé de l'agent sur l'aspect sportif ?", options: ["Le directeur sportif / la cellule recrutement", "Le community manager", "Le speaker du stade"], answer: 0 },
            { q: "Quand se fait l'essentiel du travail d'un agent ?", options: ["Uniquement pendant le mercato", "Entre les mercatos, pour préparer les coups", "Le jour du match"], answer: 1 },
          ],
        },
        {
          id: "modele-economique",
          title: "Le modèle économique de l'agent",
          minutes: 6,
          intro: "Comprendre comment on gagne (vraiment) sa vie évite les illusions et les erreurs de gestion.",
          blocks: [
            "La rémunération principale de l'agent vient d'une commission, généralement calculée en pourcentage de la rémunération du joueur (parfois de l'indemnité de transfert côté club). Elle est encadrée par la loi et les règlements — on y reviendra en détail. Retiens déjà : la transparence est obligatoire, les commissions occultes détruisent une carrière.",
            "La réalité économique du débutant : les revenus sont irréguliers et différés. On peut travailler des mois sur un dossier qui ne se conclut pas. Un agent sérieux ne vit pas « au coup par coup » : il construit un portefeuille de plusieurs joueurs pour lisser les revenus et ne jamais dépendre d'un seul client.",
            "Les coûts réels : déplacements (matchs, rendez-vous), structure juridique et comptable, veille et outils, parfois des frais d'accompagnement du joueur. Beaucoup de débutants sous-estiment ces coûts et le temps avant le premier revenu significatif. Prévois une trésorerie de sécurité.",
            "La vraie richesse de l'agent, c'est son portefeuille et sa réputation. Un joueur bien accompagné en amène d'autres ; un joueur floué te ferme des portes pour des années. Le métier récompense la patience et l'intégrité bien plus que l'opportunisme.",
            "Cas concret — Un agent signe un unique joueur prometteur et vit un an sur l'espoir de son transfert. Le joueur se blesse gravement : zéro revenu, et une année perdue. À côté, un agent avec huit joueurs plus modestes encaisse des commissions étalées, encaisse le coup dur et continue. Le portefeuille n'est pas une question d'ego : c'est ta protection contre l'aléa.",
            "⚠️ L'erreur classique — Dépenser une grosse commission comme si c'était un salaire fixe, sans provisionner impôts ni période creuse. Le pro lisse des revenus en dents de scie.",
            "🎯 À retenir — Revenus irréguliers par nature · Provisionne impôts et trésorerie · Diversifie : plusieurs clients, pas un seul jackpot.",
          ],
          quiz: [
            { q: "Comment se rémunère principalement un agent ?", options: ["Un salaire fixe versé par la FFF", "Une commission (souvent un % de la rémunération du joueur)", "Les droits TV"], answer: 1 },
            { q: "Pourquoi construire un portefeuille de plusieurs joueurs ?", options: ["Pour la frime", "Pour lisser des revenus irréguliers et ne pas dépendre d'un seul client", "C'est obligatoire"], answer: 1, explain: "Un seul client = un seul point de défaillance." },
            { q: "Tu ne représentes qu'un seul joueur et il se blesse gravement. Quelle leçon ?", options: ["C'est la faute à pas de chance, rien à changer", "Diversifier son portefeuille protège contre l'aléa", "Il fallait le faire jouer blessé"], answer: 1, explain: "Un seul client = un seul point de défaillance." },
          ],
        },
        {
          id: "deontologie",
          title: "Éthique, déontologie & conflits d'intérêts",
          minutes: 6,
          intro: "Ta réputation est ton seul actif inimitable. L'éthique n'est pas un luxe : c'est ta stratégie long terme.",
          blocks: [
            "Le conflit d'intérêts est le piège numéro un. Représenter à la fois le joueur ET le club sur une même opération, ou percevoir une commission de plusieurs parties sans transparence, est strictement encadré (souvent interdit ou soumis à accord écrit de toutes les parties). Dans le doute : transparence totale et accord écrit, ou tu ne le fais pas.",
            "La double représentation (agir pour deux parties) fait l'objet de règles précises et évolutives selon les règlements. Le principe protecteur : chaque partie doit savoir qui tu représentes et comment tu es payé. Un agent qui cache un intérêt trahit la confiance — et s'expose à des sanctions lourdes.",
            "Les lignes rouges absolues : les mineurs (protection maximale), les paris (interdiction de parier sur ses propres matchs/joueurs), le blanchiment et les flux financiers opaques, les fausses déclarations aux instances. Ces fautes ne se « rattrapent » pas : elles finissent des carrières.",
            "L'éthique paie économiquement. Les clubs et joueurs reviennent vers les agents fiables. Ta signature doit valoir garantie. Ce chapitre n'est pas de la morale décorative : c'est ce qui fait qu'on te confiera, ou non, des joueurs et des millions.",
            "Cas concret — Un club te glisse : « Fais signer ton joueur chez nous, et on te verse un petit extra en direct, discret. » Tentant ? C'est le début de la fin : commission occulte, conflit d'intérêts, dossier « gris ». Le jour où ça sort — et ça sort toujours —, tu perds ta licence, ton joueur et ta réputation. La réponse d'un pro : tout ce qui est perçu est écrit, connu de toutes les parties, et déclaré. Point.",
            "⚠️ L'erreur classique — Se faire payer des deux côtés sans transparence : conflit d'intérêts, sanctions et réputation détruite. Le pro clarifie par écrit qui il représente.",
            "🎯 À retenir — Un mandant clair par opération · La transparence est une protection, pas une faiblesse · La réputation ne se perd qu'une fois.",
          ],
          quiz: [
            { q: "Le piège numéro un de la déontologie, c'est :", options: ["Parler trop", "Le conflit d'intérêts (représenter des parties opposées sans transparence)", "Voyager en classe éco"], answer: 1 },
            { q: "Face à une situation ambiguë sur les commissions, le bon réflexe est :", options: ["Ne rien dire", "Transparence totale et accord écrit de toutes les parties", "Demander plus d'argent"], answer: 1, explain: "La transparence écrite est ta protection." },
            { q: "Un club te propose un « extra discret » versé en direct pour faire signer ton joueur. Tu :", options: ["Acceptes, c'est un bonus", "Refuses : commission occulte = conflit d'intérêts qui peut finir ta carrière", "Acceptes si c'est en liquide"], answer: 1, explain: "Toute rémunération doit être écrite, connue de toutes les parties et déclarée." },
          ],
        },
      ],
    },

    // ================= CH.2 — CADRE JURIDIQUE =================
    {
      id: "cadre-juridique",
      title: "Cadre juridique & réglementaire",
      subtitle: "Connaître les règles, savoir les lire, et ne jamais s'appuyer sur une info datée.",
      lessons: [
        {
          id: "licence",
          title: "Licence & réglementation",
          minutes: 6,
          intro: "Exercer comme agent est encadré. Connaître le cadre, c'est éviter des erreurs qui coûtent cher.",
          blocks: [
            "En France, la profession d'agent sportif est régie par le Code du sport et la fédération (FFF pour le football). Historiquement, il faut réussir un examen pour obtenir la licence d'agent sportif. Au niveau international, la FIFA a réintroduit un système de licence avec examen pour les agents opérant sur les transferts internationaux.",
            "Le cadre évolue régulièrement : les règles FIFA sur les agents ont fait l'objet de plusieurs décisions juridiques récentes (recours devant des juridictions nationales et européennes, notamment sur les plafonds de commission). Un bon agent suit ces évolutions : ce qui est vrai une saison peut changer la suivante. C'est un point où l'on ne s'appuie JAMAIS sur une info datée — on vérifie le texte en vigueur.",
            "Point non négociable : la protection des mineurs. Les règles encadrant les joueurs mineurs sont strictes et protectrices. Tout manquement expose à de lourdes sanctions — et surtout, met en danger un jeune.",
            "Méthode pro : garde une source officielle à jour (site FFF, réglementation FIFA) et la date de dernière vérification. Devant un client, dire « je vérifie le texte à jour » vaut mille fois mieux qu'affirmer une règle périmée.",
            "Cas concret — Un confrère t'affirme, sûr de lui, que « la commission est plafonnée à X % » en citant une règle qu'il a apprise il y a cinq ans. Tu la répètes à un club dans un e-mail… et elle a changé depuis (contentieux, suspension de plafond selon les pays). Tu passes pour un amateur. Le réflexe qui te sauve : vérifier le texte en vigueur et sa date avant d'affirmer quoi que ce soit d'écrit.",
            "⚠️ L'erreur classique — Croire qu'une licence se contourne ou s'achète, et négliger l'examen. Le pro se prépare sérieusement et exerce toujours dans les règles.",
            "🎯 À retenir — La licence se gagne par examen · Exercer sans titre = risque majeur · Vérifie le régime en vigueur (il évolue).",
          ],
          quiz: [
            { q: "Comment obtient-on traditionnellement une licence d'agent ?", options: ["En payant une cotisation", "En réussissant un examen", "En étant recommandé par un club"], answer: 1 },
            { q: "Concernant les joueurs mineurs, la réglementation est :", options: ["Souple", "Inexistante", "Stricte et protectrice"], answer: 2, explain: "La protection des mineurs est une ligne rouge du métier." },
            { q: "Face à une règle réglementaire, le bon réflexe est :", options: ["Se fier à ce qu'on a appris il y a 3 ans", "Vérifier le texte en vigueur et sa date", "Demander à un autre agent"], answer: 1 },
          ],
        },
        {
          id: "lecture-juridique",
          title: "Savoir lire un texte juridique",
          minutes: 7,
          intro: "90 % des erreurs viennent d'une lecture approximative. Lire un texte, ça s'apprend en méthode.",
          blocks: [
            "Un texte juridique se lit à la lettre, pas « en gros ». Chaque mot compte : « peut » n'est pas « doit », « et » n'est pas « ou », « notamment » ouvre une liste non limitative, « à l'exclusion de » la ferme. Un contrat ou un règlement se lit lentement, crayon à la main.",
            "La méthode en 4 temps : (1) identifier la nature du texte et sa hiérarchie (loi, règlement fédéral, contrat) ; (2) repérer qui est obligé à quoi (les parties et leurs obligations) ; (3) traquer les conditions, délais et exceptions ; (4) chercher ce qui se passe en cas de manquement (sanctions, résiliation). Ce qui n'est pas écrit compte autant que ce qui l'est.",
            "Les pièges classiques : les renvois (« conformément à l'article X »), les définitions en préambule qui changent le sens de tout le document, les dates d'entrée en vigueur, et les clauses de juridiction (quel tribunal, quel droit applicable). Une clause anodine en apparence peut tout changer.",
            "Règle de survie : ce que tu ne comprends pas, tu ne le signes pas et tu ne le fais pas signer. Un bon agent sait quand appeler un avocat spécialisé en droit du sport. Reconnaître les limites de sa compétence juridique fait partie du professionnalisme — ce n'est pas un aveu de faiblesse.",
            "Cas concret — Un contrat indique que le club « peut » verser une prime de rendement. Ton joueur comprend « va toucher ». Un an plus tard, la prime n'est pas versée : « peut » n'obligeait à rien. Un mot lu de travers, et c'est une brouille avec ton client. En lecture juridique, on ne devine pas l'intention : on lit ce qui est écrit, mot à mot, et on fait transformer un « peut » en « doit » quand c'est un enjeu.",
            "⚠️ L'erreur classique — Citer un chiffre ou une règle de mémoire, ou d'un vieux document. Le pro remonte toujours au texte à jour avant d'agir.",
            "🎯 À retenir — Respecte la hiérarchie des normes · Toujours la version en vigueur · Lis la définition exacte avant de conclure.",
          ],
          quiz: [
            { q: "En lecture juridique, « peut » signifie :", options: ["Une obligation", "une faculté (pas une obligation)", "une interdiction"], answer: 1, explain: "« Peut » = faculté ; « doit » = obligation. La nuance change tout." },
            { q: "« Notamment » dans une liste indique :", options: ["Une liste fermée et complète", "Une liste non limitative (exemples)", "Une erreur de rédaction"], answer: 1 },
            { q: "Face à une clause que tu ne comprends pas :", options: ["Tu signes, on verra plus tard", "Tu ne signes pas et tu consultes un avocat spécialisé", "Tu la barres toi-même"], answer: 1 },
          ],
        },
        {
          id: "reglement-agents",
          title: "Les règlements sur les agents (FFF / FIFA)",
          minutes: 6,
          intro: "Le cadre spécifique aux agents : ce qui est permis, encadré, ou interdit dans ton activité.",
          blocks: [
            "Deux niveaux se superposent : le cadre NATIONAL (en France, Code du sport + règlement des agents sportifs de la FFF) pour l'activité domestique, et le cadre FIFA pour les opérations internationales. Selon l'opération (transfert interne ou international), ce n'est pas le même texte qui s'applique — sache toujours dans quel cadre tu es.",
            "Ce que ces règlements encadrent typiquement : l'accès à la profession (licence/examen), l'obligation de mandat écrit, la transparence des commissions, l'enregistrement des opérations auprès des instances, les incompatibilités (par ex. dirigeant de club et agent), et les sanctions. Le détail et les seuils varient et évoluent : vérifie la version en vigueur.",
            "Les plafonds de commission ont été un sujet chaud : la FIFA a voulu imposer des plafonds, contestés en justice dans plusieurs pays. Résultat : l'état exact du droit dépend du moment et de la juridiction. Ne cite jamais un pourcentage « de mémoire » à un client — vérifie.",
            "Réflexe pro : pour chaque opération, pose-toi trois questions — suis-je habilité (licence) ? ai-je un mandat écrit valide ? l'opération sera-t-elle déclarée dans les règles ? Si une réponse est « non », tu ne fais pas l'opération.",
            "Cas concret — Un joueur français que tu suis intéresse un club belge. Tu appliques par réflexe le cadre franco-français… mais c'est une opération internationale : le cadre FIFA s'ajoute, avec ses obligations d'enregistrement et ses spécificités. Se tromper de cadre, c'est risquer un dossier invalide. Avant d'avancer, la première question est toujours : dans quel cadre suis-je, national ou international ?",
            "⚠️ L'erreur classique — Appliquer un plafond « entendu entre confrères » sans vérifier, et négliger l'enregistrement de l'opération. Le pro s'appuie sur le texte FFF/FIFA.",
            "🎯 À retenir — Règles mouvantes et sujettes à contentieux · Enregistre/trace les opérations · Dans le doute, le texte officiel tranche.",
          ],
          quiz: [
            { q: "Pour une opération internationale, le cadre de référence est plutôt :", options: ["Uniquement le Code du sport français", "Le cadre FIFA (en plus du national)", "Aucun, c'est libre"], answer: 1 },
            { q: "Sur les plafonds de commission, la bonne posture est :", options: ["Citer un % de mémoire", "Vérifier l'état du droit en vigueur (il a été contesté et varie)", "Dire qu'il n'y en a pas"], answer: 1, explain: "Les plafonds FIFA ont été contestés : l'état du droit varie selon le moment et le pays." },
            { q: "Ton joueur français signe dans un club étranger. Ton premier réflexe ?", options: ["Appliquer seulement le cadre français", "Identifier que c'est une opération internationale (cadre FIFA en plus)", "Ne rien vérifier, c'est pareil"], answer: 1, explain: "Toujours savoir dans quel cadre — national ou international — on opère." },
          ],
        },
        {
          id: "mineurs",
          title: "La protection des joueurs mineurs",
          minutes: 6,
          intro: "La ligne rouge absolue du métier. Ici, aucune erreur n'est « pardonnable ».",
          blocks: [
            "Le principe FIFA : les transferts internationaux de joueurs mineurs (moins de 18 ans) sont en principe INTERDITS, sauf exceptions strictement définies (par ex. déménagement des parents pour des raisons non liées au football, certaines situations intra-UE/EEE sous conditions, zones frontalières). Ces exceptions sont encadrées et contrôlées par une instance dédiée.",
            "Côté national, l'encadrement des mineurs est également très strict : rôle des centres de formation, conventions, autorisations parentales, protection contre les approches abusives. Un mineur ne « signe » pas comme un majeur — chaque étape est protégée par la loi et par la présence des représentants légaux.",
            "Pour l'agent : approcher un mineur exige un respect absolu du cadre et de la famille. Les rémunérations liées à des mineurs sont particulièrement surveillées. La moindre pratique douteuse (promesse, versement, contournement) peut entraîner des sanctions majeures pour toi ET pour le club.",
            "La bonne pratique : privilégier la relation de confiance et le conseil sur le long terme, impliquer les représentants légaux à chaque étape, tout documenter, et refuser toute opération qui met le jeune en risque. Protéger le mineur passe TOUJOURS avant l'intérêt commercial.",
            "Cas concret — On te parle d'un talent de 16 ans à l'étranger, « facile à faire venir si on arrange le dossier ». Traduction : contourner l'interdiction de transfert international de mineurs. Même si tout le monde semble d'accord, c'est une faute grave qui peut valoir une suspension au club et à toi, et surtout mettre un enfant en danger. La seule bonne réponse : non. La protection du mineur passe avant tout deal.",
            "⚠️ L'erreur classique — Tenter un transfert international de mineur « parce que c'est un crack ». Le pro connaît le principe d'interdiction (art. 19) et ses exceptions strictes.",
            "🎯 À retenir — Le principe est l'interdiction · Les exceptions sont rares et encadrées · Protéger le mineur passe avant l'opération.",
          ],
          quiz: [
            { q: "Les transferts internationaux de mineurs sont en principe :", options: ["Libres", "Interdits, sauf exceptions strictement encadrées", "Encouragés"], answer: 1, explain: "Interdiction de principe (art. FIFA), avec exceptions limitées et contrôlées." },
            { q: "Face à un mineur, l'agent doit :", options: ["Le faire signer vite avant les concurrents", "Impliquer les représentants légaux et tout documenter, dans le respect du cadre", "Verser une prime à la famille"], answer: 1 },
            { q: "On te propose de « faire venir » un talent étranger de 16 ans en « arrangeant le dossier ». Tu :", options: ["Fonces, c'est une pépite", "Refuses : contourner l'interdiction de transfert de mineurs est une faute grave", "Demandes juste une commission plus élevée"], answer: 1, explain: "La protection du mineur passe toujours avant l'intérêt commercial." },
          ],
        },
        {
          id: "transferts-systeme",
          title: "Le système des transferts",
          minutes: 6,
          intro: "Un transfert international n'est pas qu'une poignée de main : c'est une procédure encadrée, tracée, datée.",
          blocks: [
            "Le transfert international passe par des systèmes électroniques de la FIFA (plateforme de mise en correspondance des transferts). Le club quittant délivre, via sa fédération, un certificat international de transfert (CIT/ITC) qui autorise l'enregistrement du joueur dans son nouveau pays. Sans cette étape, le joueur ne peut pas être qualifié.",
            "Les mécanismes financiers à connaître : l'indemnité de transfert (entre clubs), l'indemnité de formation et la contribution de solidarité (qui récompensent les clubs ayant formé le joueur, notamment pour les jeunes et les transferts internationaux). Ces mécanismes protègent les clubs formateurs — les ignorer fausse tout calcul de deal.",
            "Les fenêtres de transfert (périodes d'enregistrement) sont fixées par chaque fédération dans le cadre FIFA. Une opération doit être bouclée ET enregistrée dans les délais : un dossier parfait mais déposé en retard est un dossier mort. La gestion du temps est une compétence de l'agent.",
            "La tierce propriété des droits économiques d'un joueur (TPO) est interdite par la FIFA : un tiers investisseur ne peut pas détenir les droits économiques et influencer les transferts. De même, l'influence d'un tiers sur les décisions d'un club est encadrée. Ces règles visent l'intégrité des compétitions.",
            "Cas concret — Tout est signé à 23 h 40 le dernier jour du mercato. Mais le certificat international n'est déposé qu'à 00 h 05 : hors délai, le joueur n'est pas qualifié, le transfert tombe. Des dossiers en or meurent chaque année pour une question de minutes et de procédure. Un agent pro boucle l'administratif AVANT la dernière heure — la paperasse fait partie du deal, pas après.",
            "⚠️ L'erreur classique — Rater une fenêtre de transfert ou mal lire le calendrier/TMS. Le pro anticipe et positionne ses joueurs avant l'ouverture.",
            "🎯 À retenir — Les fenêtres sont des contraintes fortes · Le TMS trace chaque mouvement · Le coup se prépare avant le mercato, pas pendant.",
          ],
          quiz: [
            { q: "Qu'autorise le certificat international de transfert (CIT/ITC) ?", options: ["Le paiement de l'agent", "L'enregistrement du joueur dans son nouveau pays", "La diffusion TV du match"], answer: 1 },
            { q: "La contribution de solidarité / indemnité de formation sert à :", options: ["Payer les arbitres", "Récompenser les clubs ayant formé le joueur", "Financer la FIFA"], answer: 1 },
            { q: "La tierce propriété (TPO) des droits économiques d'un joueur est :", options: ["Encouragée", "Interdite par la FIFA", "Obligatoire au-delà de 10 M€"], answer: 1, explain: "La TPO est interdite pour préserver l'intégrité des compétitions." },
            { q: "Accord trouvé, mais l'enregistrement risque de dépasser la fermeture du mercato. Que fais-tu ?", options: ["On verra, l'accord suffit", "Boucler et enregistrer AVANT le délai : hors délai = joueur non qualifié", "Déposer le lendemain"], answer: 1, explain: "Un dossier parfait mais déposé en retard est un dossier mort." },
          ],
        },
      ],
    },

    // ================= CH.3 — CONTRATS & MANDATS =================
    {
      id: "contrats-mandats",
      title: "Contrats, mandats & rémunération",
      subtitle: "Le papier qui te rend légitime, protège ton joueur et sécurise ta commission.",
      lessons: [
        {
          id: "mandat",
          title: "Le mandat de représentation",
          minutes: 6,
          intro: "Sans mandat, tu n'es pas l'agent du joueur. Le mandat, c'est ta légitimité écrite.",
          blocks: [
            "Le mandat est le contrat qui lie l'agent à son client. Il définit la durée, l'étendue (exclusif ou non), et la rémunération. Un mandat exclusif signifie que le joueur ne peut être représenté que par toi sur la période — c'est la base d'une relation sérieuse.",
            "La durée est encadrée (souvent limitée, par ex. deux ans, renouvelable selon les règles en vigueur). L'échéance d'un mandat est un moment critique : le laisser expirer, c'est risquer de perdre son client. Un agent organisé suit ses échéances des mois à l'avance — jamais au dernier moment. C'est exactement ce que les alertes de Parzi Manage automatisent.",
            "La rémunération de l'agent est elle aussi encadrée (souvent exprimée en pourcentage de la rémunération brute du joueur) et doit figurer clairement dans le mandat. Transparence totale : les zones grises en matière de commission sont le meilleur moyen de perdre sa licence et sa réputation.",
            "Un mandat propre précise aussi : le périmètre (types d'opérations couvertes), le sort de la commission si le joueur signe après la fin du mandat sur un dossier que tu as initié, et les modalités de résiliation. Ces détails, négligés par les débutants, sont ceux qui protègent ton travail.",
            "Cas concret — Tu prépares depuis six mois le transfert de ton joueur ; ton mandat expire dans deux semaines et, pris par le dossier, tu oublies de le renouveler. Un concurrent en profite, signe le mandat, et empoche la commission de TON travail. Ce n'est pas de la malchance : c'est un défaut de suivi. Une simple alerte d'échéance aurait sauvé des mois d'efforts.",
            "⚠️ L'erreur classique — Travailler sans mandat écrit « parce qu'on se fait confiance », puis ne pas être payé. Le pro fait signer le mandat avant de bouger.",
            "🎯 À retenir — Pas de mandat, pas de mission · Écrit, daté, mentions obligatoires · Durée maîtrisée, jamais indéfinie.",
          ],
          quiz: [
            { q: "Qu'est-ce qu'un mandat exclusif ?", options: ["Le joueur peut avoir plusieurs agents", "Seul cet agent représente le joueur sur la période", "Un contrat avec un club"], answer: 1 },
            { q: "Pourquoi suivre l'échéance d'un mandat à l'avance ?", options: ["Pour augmenter sa commission", "Pour ne pas risquer de perdre son client", "Ce n'est pas important"], answer: 1, explain: "C'est exactement ce que les alertes de Parzi Manage automatisent." },
            { q: "Ton mandat expire dans 2 semaines et tu es absorbé par le transfert en cours. Le bon réflexe ?", options: ["Attendre la fin du transfert", "Renouveler le mandat maintenant : une échéance ratée = client perdu", "Ce n'est pas urgent"], answer: 1, explain: "On suit ses échéances des mois à l'avance, jamais au dernier moment." },
          ],
        },
        {
          id: "contrat-joueur",
          title: "Le contrat de travail du joueur",
          minutes: 7,
          intro: "Ce que tu négocies vraiment pour ton client : un contrat de travail, avec ses forces et ses pièges.",
          blocks: [
            "Le contrat professionnel d'un joueur est d'abord un contrat de travail : durée (souvent à durée déterminée « spécifique sportif »), rémunération fixe, et un cadre encadré par la convention collective (en France, la Charte du football professionnel) et le règlement de la ligue. Tu ne négocies pas dans le vide : certains planchers et règles s'imposent.",
            "Les composantes de rémunération : salaire fixe, primes (match, résultats, performance individuelle et collective), avantages (logement, véhicule, billets), et parfois droits à l'image. Un bon agent regarde le PACKAGE complet et sa fiscalité réelle, pas seulement le salaire brut affiché.",
            "Les points de vigilance : la durée et sa cohérence avec le plan de carrière, les conditions de renouvellement, les clauses de performance, la garantie des primes (sont-elles réalistes et atteignables ?), et le sort du contrat en cas de blessure ou de relégation. Un salaire élevé avec des primes inatteignables vaut moins qu'un fixe solide.",
            "La règle de l'agent expérimenté : on négocie pour le joueur d'aujourd'hui ET celui de dans deux ans. Un contrat trop long à bas prix enferme un talent qui explose ; un contrat trop court fragilise un joueur en difficulté. L'art, c'est d'ajuster la durée et les clauses au profil et au moment de carrière.",
            "Cas concret — Un club propose 30 K€/mois à ton joueur, dont 12 K€ de fixe et 18 K€ de primes conditionnées à 25 matchs joués et une qualification européenne. Sur le papier, c'est « 30 K€ ». Dans la réalité d'un joueur de rotation, ces primes tomberont rarement : le vrai salaire, c'est 12 K€. Un fixe de 20 K€ sans primes irréalistes vaut mieux. L'agent lit le package et sa probabilité, pas le chiffre affiché.",
            "⚠️ L'erreur classique — Ne regarder que le salaire brut affiché. Le pro décortique primes, durée, et clauses qui changent toute la valeur réelle.",
            "🎯 À retenir — Le salaire n'est qu'une ligne · Primes et clauses font la différence · Lis chaque article, sans exception.",
          ],
          quiz: [
            { q: "Le contrat d'un joueur professionnel est avant tout :", options: ["Un contrat commercial", "Un contrat de travail encadré (convention collective, règlements)", "Un simple accord verbal"], answer: 1 },
            { q: "Que doit regarder l'agent en priorité ?", options: ["Le salaire brut affiché seulement", "Le package complet et sa fiscalité réelle", "La couleur du maillot"], answer: 1, explain: "Primes, avantages, fiscalité : c'est le net et le package qui comptent." },
            { q: "Une prime très élevée mais irréaliste :", options: ["Vaut mieux qu'un fixe solide", "Vaut moins qu'un fixe atteignable", "Est toujours interdite"], answer: 1 },
          ],
        },
        {
          id: "clauses-cles",
          title: "Les clauses qui changent tout",
          minutes: 7,
          intro: "Le diable est dans les clauses. Celles-ci font gagner (ou perdre) des millions et des années.",
          blocks: [
            "La clause libératoire (ou de rachat) : elle fixe un montant permettant à un club tiers de « débloquer » le transfert du joueur. Bien calibrée, elle protège le joueur (elle lui ouvre une porte) et le club (elle sécurise une valeur). Trop basse, elle brade un talent ; trop haute, elle l'enferme. Son montant se négocie finement.",
            "Les clauses de bonus et d'intéressement : primes à la signature, primes conditionnelles (matchs joués, buts, maintien, qualification européenne), et surtout la clause de revente (le pourcentage sur une future plus-value au profit du club vendeur ou du joueur). Sur un jeune à fort potentiel, un pourcentage à la revente peut valoir plus que l'indemnité initiale.",
            "Les clauses liées à l'image et aux droits dérivés : qui exploite l'image du joueur, dans quel cadre, avec quel partage ? Pour les joueurs à forte notoriété, c'est un enjeu majeur qui dépasse le salaire. À l'inverse, mal cadrée, une clause d'image peut créer des conflits avec le club et les sponsors.",
            "Méthode : pour chaque clause, demande-toi « dans quel scénario cette clause se déclenche, et à qui profite-t-elle ? ». Simule les cas favorables ET défavorables (blessure, relégation, explosion du joueur). Une clause ne vaut que par ce qu'elle produit dans la réalité, pas par sa formulation élégante.",
            "Cas concret — Tu places un jeune de 18 ans à petit prix, mais tu négocies 15 % sur une future revente. Deux ans plus tard, il explose et part pour 20 M€ : la clause de revente rapporte 3 M€ au club vendeur — et prouve à tout le milieu que tu penses long terme. À l'inverse, l'agent qui n'a regardé que l'indemnité immédiate a laissé filer l'essentiel. Sur un jeune, la revente est souvent LA clause qui compte.",
            "⚠️ L'erreur classique — Laisser passer une clause libératoire mal calibrée, ou oublier le pourcentage à la revente. Le pro négocie chaque clause comme un levier.",
            "🎯 À retenir — La libératoire cadre le départ · Le sell-on est un revenu futur · Les droits à l'image se bornent noir sur blanc.",
          ],
          quiz: [
            { q: "À quoi sert une clause libératoire ?", options: ["À licencier le joueur", "À fixer un montant permettant à un club tiers de débloquer le transfert", "À payer l'agent"], answer: 1 },
            { q: "Sur un jeune à fort potentiel, quelle clause peut rapporter le plus à terme ?", options: ["Une prime de signature", "Un pourcentage à la revente (plus-value future)", "Une prime de match"], answer: 1, explain: "Le % à la revente capte la plus-value future — souvent l'enjeu majeur sur un jeune." },
            { q: "Comment évaluer une clause ?", options: ["À sa formulation élégante", "En simulant les scénarios où elle se déclenche et à qui elle profite", "À sa longueur"], answer: 1 },
          ],
        },
        {
          id: "commission",
          title: "La rémunération de l'agent",
          minutes: 6,
          intro: "Ta commission doit être claire, licite et sécurisée par écrit — jamais improvisée.",
          blocks: [
            "La commission se calcule le plus souvent en pourcentage de la rémunération du joueur (ou, côté club, de l'indemnité de transfert). En France, le Code du sport encadre ce montant (historiquement un plafond exprimé en pourcentage du contrat) ; vérifie le taux et l'assiette exacts en vigueur. Au niveau FIFA, les plafonds ont été contestés en justice : là encore, on vérifie l'état du droit.",
            "Qui paie ? Selon les cas et les règles applicables, l'agent est rémunéré par le joueur, par le club, ou dans un cadre autorisé de double représentation avec accord écrit de toutes les parties. Ce point doit être limpide AVANT l'opération : qui paie, combien, quand, sur quelle base.",
            "La fiscalité : la commission est un revenu professionnel, soumis à TVA et à l'impôt selon ta structure. Beaucoup de débutants oublient de provisionner ces charges et se retrouvent en difficulté. Raisonne toujours en NET après charges et impôts, pas en brut encaissé.",
            "Sécuriser sa commission : elle doit figurer dans le mandat, être cohérente avec l'opération, et son versement (échelonné ou non) doit être écrit noir sur blanc. Une commission « promise » oralement n'existe pas. Le professionnalisme administratif protège ton travail autant que ton talent de négociateur.",
            "Cas concret — Un club te promet ta commission « à la poignée de main », rien d'écrit. Le deal se fait, puis le club traîne, conteste, et finit par ne rien verser. Sans écrit, tu n'as quasiment aucun recours et tu perds des mois de travail. La règle d'airain : pas d'écrit, pas de commission. On sécurise qui paie, combien et quand AVANT de conclure.",
            "⚠️ L'erreur classique — Fixer une commission au feeling, au-dessus du plafond, sans échéancier. Le pro écrit qui paie, combien et quand, en vérifiant le plafond.",
            "🎯 À retenir — Qui paie, combien, quand · Plafond en vigueur vérifié · Tout formalisé par écrit.",
          ],
          quiz: [
            { q: "Sur quelle base se calcule souvent la commission de l'agent côté joueur ?", options: ["Le nombre de buts", "Un pourcentage de la rémunération du joueur", "La billetterie"], answer: 1 },
            { q: "Concernant les plafonds de commission :", options: ["Ils sont figés et universels", "Ils sont encadrés en France et ont été contestés au niveau FIFA : on vérifie le droit en vigueur", "Ils n'existent pas"], answer: 1, explain: "Cadre français encadré, plafonds FIFA contestés : vérifie toujours l'état du droit." },
            { q: "Une commission promise oralement :", options: ["Est aussi solide qu'un écrit", "N'existe pas : elle doit être écrite dans le mandat", "Se règle au tribunal facilement"], answer: 1 },
          ],
        },
        {
          id: "litiges",
          title: "Litiges & résolution des conflits",
          minutes: 6,
          intro: "Même bien fait, un dossier peut déraper. Savoir où et comment ça se règle fait partie du métier.",
          blocks: [
            "Les litiges fréquents : commission impayée, rupture de mandat, désaccord d'interprétation d'une clause, contentieux joueur-club (salaires, résiliation). Anticiper vaut mieux que guérir : un mandat et un contrat bien rédigés préviennent l'immense majorité des conflits.",
            "Les instances : au niveau FIFA, le Tribunal du football traite de nombreux litiges internationaux (notamment joueur-club, et certains différends impliquant des agents). En dernier recours, le Tribunal arbitral du sport (TAS/CAS) à Lausanne est la juridiction arbitrale suprême du sport. Au niveau national, des commissions fédérales (dont celles dédiées aux agents) et la voie judiciaire ou de conciliation existent.",
            "La clause de règlement des différends est donc capitale dans tes contrats : quel droit s'applique, quelle instance est compétente, quelle langue, quels délais. Une clause bien pensée t'évite de te battre sur un terrain qui ne t'est pas favorable.",
            "La posture pro : privilégier la résolution amiable quand c'est possible (elle préserve les relations et la réputation), documenter chaque échange, et ne judiciariser qu'à bon escient. Un agent qui a la réputation de « faire des procès à tout le monde » se coupe du marché. Choisis tes batailles.",
            "Cas concret — Un club conteste ta commission sur un dossier. Tu as tout tracé : mandat clair, e-mails horodatés, accord écrit. Résultat : soit le club paie sans aller plus loin, soit tu gagnes vite si ça monte en litige. L'agent qui, lui, avait tout fait à l'oral se retrouve démuni. Ce qui te protège en cas de conflit se prépare AVANT le conflit : par des écrits propres et une trace de chaque échange.",
            "⚠️ L'erreur classique — Régler à l'oral et se retrouver sans preuve le jour du conflit. Le pro écrit tout en amont et connaît les instances.",
            "🎯 À retenir — L'écrit prévient le litige · Connais les instances (CNRL, TAS/CAS) · Garde chaque trace et échange.",
          ],
          quiz: [
            { q: "Quelle est la juridiction arbitrale suprême du sport ?", options: ["La Cour de cassation", "Le Tribunal arbitral du sport (TAS/CAS)", "La FFF"], answer: 1, explain: "Le TAS/CAS à Lausanne est l'instance arbitrale suprême du sport." },
            { q: "Le meilleur moyen d'éviter les litiges est :", options: ["De ne jamais signer", "Un mandat et des contrats bien rédigés en amont", "De tout régler oralement"], answer: 1 },
            { q: "Un club conteste ta commission. Qu'est-ce qui te protège le mieux ?", options: ["Ta parole contre la leur", "Des écrits propres et une trace horodatée de chaque échange", "Menacer d'un procès immédiat"], answer: 1, explain: "Ce qui protège en cas de conflit se prépare avant : par l'écrit et la documentation." },
          ],
        },
      ],
    },

    // ================= CH.4 — SCOUTING & ÉVALUATION =================
    {
      id: "scouting-evaluation",
      title: "Détection & évaluation",
      subtitle: "Voir avant les autres, et juger juste. La matière première de l'agent, ce sont les joueurs.",
      lessons: [
        {
          id: "detection",
          title: "Détecter un talent",
          minutes: 6,
          intro: "Le talent brut ne suffit pas. On détecte un potentiel, un contexte et une trajectoire.",
          blocks: [
            "Détecter, c'est d'abord VOIR jouer — en vrai, régulièrement, dans différents contextes (à domicile, à l'extérieur, sous pression). La vidéo et les statistiques complètent l'œil, elles ne le remplacent pas. Un joueur peut briller en highlights et disparaître dans le jeu réel : seul l'œil entraîné voit la différence.",
            "Où chercher : divisions inférieures, centres de formation, championnats jeunes, ton réseau local, et les marchés « sous-cotés » que les grosses agences négligent. Le premier avantage du débutant, c'est d'aller là où les autres ne regardent pas encore. La détection est un travail de terrain, pas de bureau.",
            "Ce qu'on regarde au-delà du geste : l'intelligence de jeu (prise de décision, placement), la mentalité (attitude après une erreur, dans la difficulté), la constance sur plusieurs matchs, et le contexte (club, entraîneur, temps de jeu, âge relatif). Un même niveau ne vaut pas pareil à 17 ans en pro qu'à 21 ans en amateur.",
            "Le piège du débutant : tomber amoureux d'un joueur. Reste lucide : croise les avis, note factuellement, reviens le voir. La détection est une hypothèse à confirmer dans le temps, pas un coup de cœur à défendre coûte que coûte.",
            "Cas concret — Tu vois une compilation vidéo bluffante : dribbles, buts, gestes techniques. Emballé, tu veux signer. Puis tu vas le voir en vrai trois matchs de suite : il disparaît dès qu'il y a du combat, se cache dans les matchs difficiles. La vidéo montrait ses 5 meilleures minutes de la saison. L'œil sur le terrain, lui, montre les 90 minutes — et la vérité.",
            "⚠️ L'erreur classique — Se fier aux stats brutes ou au buzz du moment. Le pro croise la donnée, l'œil du terrain et le contexte.",
            "🎯 À retenir — La data seule ne dit pas tout · Vois le joueur en conditions réelles · Pèse le contexte (niveau, rôle, projet).",
          ],
          quiz: [
            { q: "Pour détecter, la meilleure base reste :", options: ["Les highlights vidéo uniquement", "Voir jouer en vrai, régulièrement et dans divers contextes", "Le nombre de followers"], answer: 1, explain: "L'œil entraîné sur le jeu réel prime ; data et vidéo complètent." },
            { q: "L'avantage du débutant en détection :", options: ["Regarder là où les grosses agences ne regardent pas encore", "Copier les recrues des gros clubs", "Attendre les classements"], answer: 0 },
            { q: "Le piège classique de la détection :", options: ["Prendre trop de notes", "Tomber amoureux d'un joueur et perdre sa lucidité", "Voir trop de matchs"], answer: 1 },
          ],
        },
        {
          id: "evaluation",
          title: "Évaluer un joueur et sa valeur",
          minutes: 7,
          intro: "Évaluer, c'est répondre à deux questions : quel niveau, et quelle valeur de marché ?",
          blocks: [
            "L'évaluation sportive : positionner le joueur sur son poste, par rapport à son niveau de compétition, avec une projection de progression réaliste. Un profil se juge sur ses qualités dominantes (ce qui le rend spécial) autant que sur ses lacunes corrigibles. Sois précis : « bon joueur » ne veut rien dire ; « latéral gauche solide défensivement, apport offensif limité, marge de progression sur la relance » est exploitable.",
            "La valeur de marché dépend de facteurs multiples : niveau et régularité, âge (la marge de revente), poste (un buteur ou un défenseur central coûtent cher), durée de contrat restante (un joueur en fin de contrat perd de la valeur pour son club mais gagne en liberté), et contexte du marché (besoins des clubs, concurrence). Une même performance ne vaut pas le même prix selon ces variables.",
            "Le rôle de la durée de contrat est central : plus un joueur approche de la fin de son contrat, plus sa valeur de transfert baisse pour le club (il partira bientôt libre) — mais plus l'agent et le joueur gagnent en levier. Savoir lire ce cycle, c'est savoir quand pousser une prolongation ou préparer un départ.",
            "L'erreur à éviter : confondre la valeur qu'on souhaite et la valeur réelle. Le marché ne se trompe pas longtemps. Un agent crédible annonce des valeurs défendables, preuves à l'appui — c'est ce qui le rend audible face aux clubs. Survendre une fois, c'est perdre sa crédibilité pour dix dossiers.",
            "Cas concret — Ton joueur est excellent, mais il lui reste six mois de contrat. Son club refuse toute prolongation raisonnable. Deux options : soit le club le vend maintenant à prix réduit (avant de le perdre libre), soit il attend et le perd pour rien. Toi, tu tiens le levier : dans six mois ton joueur choisit son club et négocie une belle prime à la signature. Lire l'horloge du contrat, c'est savoir quand on est en position de force.",
            "⚠️ L'erreur classique — Juger sur un seul match ou uniquement le physique. Le pro évalue un profil complet et sa projection.",
            "🎯 À retenir — Technique, physique, mental · La projection prime sur l'instantané · Toujours resituer dans le contexte de jeu.",
          ],
          quiz: [
            { q: "Une bonne évaluation d'un joueur est :", options: ["« C'est un bon joueur »", "Précise : qualités dominantes, lacunes corrigibles, projection", "Basée sur son nombre de followers"], answer: 1 },
            { q: "Quand un joueur approche de la fin de son contrat, sa valeur de transfert pour le club :", options: ["Augmente", "Baisse (il partira bientôt libre)", "Ne change pas"], answer: 1, explain: "Fin de contrat = valeur de transfert en baisse pour le club, levier en hausse pour le joueur." },
            { q: "L'erreur d'évaluation à éviter :", options: ["Confondre la valeur souhaitée et la valeur réelle du marché", "Regarder l'âge", "Comparer à d'autres joueurs"], answer: 0 },
          ],
        },
        {
          id: "data-video",
          title: "Data & vidéo dans le scouting moderne",
          minutes: 6,
          intro: "La donnée ne remplace pas l'œil — elle l'arme. Bien utilisée, elle te fait gagner du temps et de la crédibilité.",
          blocks: [
            "Les outils modernes (plateformes de data, vidéo à la demande, indicateurs avancés) permettent de filtrer, comparer et objectiver. Ils servent à répondre à des questions précises : ce joueur est-il régulier ? sur-performe-t-il par rapport à ses occasions ? comment se compare-t-il à des profils similaires ? La data trie ; l'œil décide.",
            "Attention aux pièges statistiques : un bon ratio sur un petit échantillon (peu de matchs) n'est pas fiable ; des chiffres flatteurs peuvent venir d'un système de jeu ou de partenaires, pas du joueur ; et certaines qualités (leadership, placement défensif, intelligence) se mesurent mal en chiffres. Ne jamais conclure sur une seule métrique.",
            "L'usage pro : utiliser la data pour PRÉ-sélectionner et pour ARGUMENTER. Devant un club, un dossier chiffré et vidéo bien monté rend ton joueur crédible et te fait gagner en professionnalisme. C'est aussi ce qui te distingue d'un agent « à l'ancienne » qui n'a que son carnet d'adresses.",
            "L'avenir (et l'atout Parzi) : centraliser la donnée de tes joueurs, suivre leurs échéances et leur évolution au même endroit, et t'appuyer sur des outils intelligents pour ne rien laisser passer. L'agent qui maîtrise ses outils traite plus de dossiers, mieux, sans se noyer.",
            "Cas concret — Un attaquant affiche 12 buts : impressionnant. Mais la data montre qu'il a marqué sur très peu d'occasions (il a « sur-performé »), et 9 buts sont tombés contre les trois derniers du classement. L'œil confirme : il vit sur une série chanceuse. À l'inverse, un dossier vidéo + data solide sur un profil régulier convainc un directeur sportif en dix minutes. La data ne signe pas à ta place — elle sépare le vrai du flatteur et rend ton argumentaire imparable.",
            "⚠️ L'erreur classique — Prendre un chiffre isolé pour argent comptant. Le pro recoupe vidéo et données sur un échantillon suffisant.",
            "🎯 À retenir — Exige un échantillon suffisant · La vidéo explique le « comment » · Méfie-toi des faux signaux statistiques.",
          ],
          quiz: [
            { q: "Le bon rapport entre data et œil du scout :", options: ["La data remplace l'œil", "La data trie et arme la décision ; l'œil décide", "L'œil est dépassé"], answer: 1, explain: "La data pré-sélectionne et argumente ; le jugement reste humain." },
            { q: "Un très bon ratio statistique sur peu de matchs :", options: ["Est une preuve solide", "N'est pas fiable (petit échantillon)", "Suffit à signer"], answer: 1 },
            { q: "Un buteur affiche 12 buts mais surtout contre les derniers et sur peu d'occasions. Tu :", options: ["Signes sur le chiffre brut", "Croises data + vidéo + œil avant de conclure (méfiance sur l'échantillon)", "Doubles sa valeur annoncée"], answer: 1, explain: "Ne jamais conclure sur une seule métrique flatteuse." },
          ],
        },
      ],
    },

    // ================= CH.5 — GESTION DE CARRIÈRE =================
    {
      id: "gestion-carriere",
      title: "Accompagner et développer un joueur",
      subtitle: "Le cœur du métier sur la durée : signer, puis faire grandir une carrière.",
      lessons: [
        {
          id: "approche",
          title: "Trouver et approcher un joueur",
          minutes: 6,
          intro: "On ne signe pas un joueur par chance : on construit une relation avant d'avoir quoi que ce soit à signer.",
          blocks: [
            "Le premier joueur vient rarement d'un grand club : il vient souvent de divisions inférieures, de centres de formation, ou de ton propre réseau local. L'observation régulière (matchs, scouting) est la base — tu dois voir jouer, pas juste lire des statistiques.",
            "L'approche se fait avec respect et patience. Un jeune joueur (et sa famille) a besoin de confiance avant tout. Se présenter, montrer qu'on comprend son parcours, apporter de la valeur AVANT de parler mandat : c'est ce qui distingue un agent sérieux d'un opportuniste.",
            "Ton atout de débutant, c'est le travail et la disponibilité. Un joueur négligé par les grosses agences peut trouver chez toi une attention que personne d'autre ne lui donne. C'est là que se gagne un premier mandat.",
            "Le respect du cadre : n'approche jamais un joueur déjà sous contrat de mandat de façon déloyale, et pour un mineur, passe toujours par les représentants légaux. La façon dont tu approches dit déjà quel agent tu seras — les familles le sentent.",
            "Cas concret — Tu repères un jeune de National 2 négligé par tout le monde. Plutôt que de lui promettre la Ligue 1 dès le premier café, tu viens le voir jouer, tu lui envoies une analyse honnête de son jeu, tu le mets en relation avec un préparateur. Trois mois plus tard, quand il pense « agent », c'est ton nom qui vient — parce que tu as apporté de la valeur avant de rien demander. Le premier mandat se gagne comme ça, pas par des promesses.",
            "⚠️ L'erreur classique — Survendre et promettre monts et merveilles au premier contact, en brûlant la famille. Le pro écoute, cadre et reste éthique.",
            "🎯 À retenir — Le premier contact construit la confiance · Implique la famille · Aucune promesse creuse.",
          ],
          quiz: [
            { q: "D'où vient souvent le premier joueur d'un agent ?", options: ["D'un club de Ligue 1", "De divisions inférieures ou de son réseau local", "D'un transfert international"], answer: 1 },
            { q: "Avant de parler mandat, il faut d'abord :", options: ["Promettre un gros contrat", "Construire la confiance et apporter de la valeur", "Faire signer le plus vite possible"], answer: 1 },
            { q: "Tu veux convaincre un jeune négligé de te confier son mandat. La meilleure approche ?", options: ["Lui promettre la Ligue 1 tout de suite", "Lui apporter de la valeur concrète avant de demander quoi que ce soit", "Le faire signer au premier rendez-vous"], answer: 1, explain: "Donner d'abord, demander ensuite : c'est ce qui gagne la confiance." },
          ],
        },
        {
          id: "relation",
          title: "Construire la relation dans la durée",
          minutes: 6,
          intro: "Signer un joueur, c'est le début. Le garder et le faire grandir, c'est le métier.",
          blocks: [
            "La relation agent-joueur est une relation de confiance sur des années. Elle se nourrit de disponibilité (répondre, être présent dans les moments durs), d'honnêteté (dire les vérités qui dérangent), et de résultats. Un joueur qui se sent unique et bien conseillé ne part pas — même quand un concurrent fait miroiter mieux.",
            "La famille et l'entourage font partie de l'équation, surtout pour les jeunes. Un bon agent sait intégrer les proches sans se laisser dicter la stratégie sportive. L'entourage mal géré est la première cause de rupture agent-joueur : anticipe-le, respecte-le, cadre-le.",
            "Les moments décisifs de la relation : la blessure grave, le banc, un échec de transfert, un conflit avec l'entraîneur. C'est LÀ qu'un agent prouve sa valeur — pas quand tout va bien. Être présent dans la difficulté crée une loyauté qu'aucune promesse financière ne rachète.",
            "Le piège : négliger un joueur « installé » pour courir après de nouveaux. Un portefeuille se cultive : chaque joueur bien suivi devient une référence, une source de recommandations, et parfois un futur dirigeant ou entraîneur qui se souviendra de toi. La fidélité est un investissement.",
            "Cas concret — Ton joueur se rompt les ligaments croisés : six mois loin des terrains, moral au plus bas, et aucune commission en vue pour toi. L'agent opportuniste disparaît. Toi, tu l'appelles chaque semaine, tu organises sa rééducation, tu le rassures sur son retour. À sa reprise, il refuse trois agences qui le courtisent : « lui, il était là quand j'étais à terre ». Cette loyauté-là ne s'achète pas — elle se mérite dans les moments durs.",
            "⚠️ L'erreur classique — Disparaître entre deux deals et ne réapparaître qu'au moment utile. Le pro reste présent dans les creux.",
            "🎯 À retenir — Sois disponible dans les périodes calmes · Communique régulièrement · La durée fait la relation.",
          ],
          quiz: [
            { q: "Quand un agent prouve-t-il vraiment sa valeur ?", options: ["Quand tout va bien", "Dans les moments durs (blessure, banc, échec)", "Le jour de la signature"], answer: 1, explain: "La présence dans la difficulté crée une loyauté durable." },
            { q: "La première cause de rupture agent-joueur est souvent :", options: ["Le salaire de l'agent", "Un entourage mal géré", "La couleur du maillot"], answer: 1 },
            { q: "Ton joueur est gravement blessé (aucune commission en vue avant longtemps). Tu :", options: ["Te concentres sur d'autres dossiers plus rentables", "Restes présent et l'accompagnes : la loyauté se gagne là", "Attends son retour pour le rappeler"], answer: 1, explain: "Être présent dans la difficulté crée une loyauté qu'aucun concurrent ne rachète." },
          ],
        },
        {
          id: "plan-carriere",
          title: "Bâtir un plan de carrière",
          minutes: 6,
          intro: "Un grand agent ne réagit pas au marché : il pilote une trajectoire, étape par étape.",
          blocks: [
            "Un plan de carrière, c'est une trajectoire pensée sur 3 à 5 ans : quel niveau viser, quand, via quel type de club. Le bon palier n'est pas toujours le plus prestigieux : un jeune a souvent besoin de temps de jeu dans un club adapté avant un grand club, sous peine de « griller » sa progression sur le banc.",
            "Chaque choix se pèse selon le moment de carrière : à 18 ans on privilégie le développement et le temps de jeu ; au pic (24-29 ans) on maximise la valeur sportive et financière ; en fin de carrière on sécurise et on prépare l'après. Un transfert n'est jamais « bon » ou « mauvais » dans l'absolu — il l'est par rapport au plan.",
            "Le plan intègre l'extra-sportif : formation, reconversion, image, finances, équilibre de vie. Un joueur bien accompagné hors du terrain performe mieux dessus. Les meilleurs agents pensent la personne, pas seulement le joueur — et préparent l'après-carrière bien avant la fin.",
            "Piloter un plan suppose des OUTILS : suivre les échéances de contrat, les fenêtres de marché, les besoins des clubs cibles, l'évolution du joueur. C'est précisément le rôle d'un outil comme Parzi Manage : transformer une intention (« le faire monter d'un cran l'été prochain ») en actions datées et suivies.",
            "Cas concret — Deux jeunes de même niveau à 18 ans. Le premier signe dans un grand club prestigieux : il joue 4 matchs en deux ans, stagne, se démoralise. Le second, guidé par un plan, part en Ligue 2 : 70 matchs, il progresse, et à 21 ans un grand club l'achète — cette fois pour jouer. Même talent au départ, trajectoires opposées. La différence, c'est un plan qui privilégie le temps de jeu au bon moment plutôt que le prestige immédiat.",
            "⚠️ L'erreur classique — Viser le plus gros chèque à chaque étape. Le pro cale les transferts sur la progression sportive.",
            "🎯 À retenir — Jouer vaut mieux qu'un banc doré · Avance par paliers · Le bon moment prime sur le gros montant.",
          ],
          quiz: [
            { q: "Pour un jeune joueur prometteur, le bon palier est souvent :", options: ["Le plus grand club possible tout de suite", "Un club adapté offrant du temps de jeu pour progresser", "Rester le plus longtemps possible au même endroit"], answer: 1, explain: "Le temps de jeu au bon niveau prime souvent sur le prestige immédiat." },
            { q: "Un transfert est « bon » quand :", options: ["Il rapporte le plus d'argent", "Il sert le plan de carrière au bon moment", "Il fait le plus de bruit médiatique"], answer: 1 },
            { q: "Un grand club veut ton jeune de 18 ans, mais pour le banc. Un club moyen lui garantit 30 matchs. Tu conseilles :", options: ["Le grand club, pour le prestige et la fiche de paie", "Le club qui offre du temps de jeu, au service du plan de carrière", "De rester où il est indéfiniment"], answer: 1, explain: "Le bon palier n'est pas toujours le plus prestigieux : le temps de jeu construit la carrière." },
          ],
        },
        {
          id: "image-sponsors",
          title: "Image, marque personnelle & sponsors",
          minutes: 6,
          intro: "Le terrain fait la valeur sportive ; l'image peut la démultiplier — ou la fragiliser.",
          blocks: [
            "Au-delà du contrat sportif, un joueur génère de la valeur via son image : sponsors, équipementiers, partenariats, contenus. Pour certains profils, ces revenus dépassent le salaire. Mais l'image se construit sur la durée et la cohérence — pas sur des coups. Le rôle de l'agent est de protéger et valoriser cette image en accord avec le projet sportif.",
            "Les droits à l'image se cadrent juridiquement : ce que le club peut exploiter (image collective) versus ce que le joueur garde (image individuelle), le partage des revenus, les exclusivités. Une clause d'image mal négociée crée des conflits joueur-club-sponsor. Ici encore : tout par écrit, tout clair.",
            "La marque personnelle moderne passe aussi par les réseaux sociaux et les contenus. Une présence maîtrisée renforce la valeur marchande d'un joueur ; une présence mal gérée (propos déplacés, polémiques) peut ruiner un transfert ou un contrat de sponsoring. L'agent conseille, cadre, et parfois protège le joueur de lui-même.",
            "L'équilibre à tenir : l'image sert la carrière, elle ne la remplace pas. Un joueur « influenceur » mais en perte de niveau perd tout à terme. La performance sportive reste le socle ; l'image est un multiplicateur. Ne jamais inverser l'ordre des priorités avec un jeune.",
            "Cas concret — Ton joueur, en pleine négociation avec un club sérieux et une marque d'équipementier, poste un message polémique un soir. En 24 h, la marque se retire et le club s'interroge sur son sérieux. Un tweet a coûté deux contrats. Depuis, tu as instauré une règle simple avec tes joueurs : sur les sujets sensibles, on en parle avant de publier. Protéger l'image fait partie du métier — parfois contre le joueur lui-même.",
            "⚠️ L'erreur classique — Négliger l'image d'un jeune, ou la brader au premier sponsor venu. Le pro construit la marque tôt et cadre les droits.",
            "🎯 À retenir — L'image est un actif · Cadre les droits par écrit · Pilote les réseaux, ne les subis pas.",
          ],
          quiz: [
            { q: "Pour l'agent, l'image d'un joueur est :", options: ["Un gadget sans importance", "Un multiplicateur de valeur à protéger et cadrer, sans remplacer le sportif", "Plus importante que le jeu"], answer: 1, explain: "L'image démultiplie la valeur sportive ; elle ne s'y substitue pas." },
            { q: "Une clause de droits à l'image mal négociée :", options: ["N'a aucune conséquence", "Peut créer des conflits joueur-club-sponsor", "Augmente toujours les revenus"], answer: 1 },
            { q: "Ton joueur veut publier un message polémique en pleine négociation avec un sponsor. Tu :", options: ["Le laisses faire, c'est sa vie privée", "Le conseilles et le cadres : une polémique peut faire capoter contrat et sponsoring", "L'encourages pour faire le buzz"], answer: 1, explain: "L'agent protège l'image du joueur — parfois contre lui-même." },
          ],
        },
      ],
    },

    // ================= CH.6 — NÉGOCIATION =================
    {
      id: "art-negociation",
      title: "L'art de la négociation",
      subtitle: "Le moment court et décisif où se joue la valeur de ton travail.",
      lessons: [
        {
          id: "negociation",
          title: "Les bases de la négociation",
          minutes: 6,
          intro: "Négocier, ce n'est pas gagner contre l'autre : c'est construire un accord que les deux camps veulent tenir.",
          blocks: [
            "Une bonne négociation se prépare plus qu'elle ne s'improvise. Avant de parler, tu dois connaître : la valeur de marché de ton joueur, les besoins réels du club, la marge dont tu disposes, et ton point de rupture (le seuil en dessous duquel tu dis non).",
            "Écouter vaut mieux que parler. Le club qui exprime son besoin te donne les clés de l'accord. L'agent qui écoute comprend ce qui compte vraiment pour l'autre — parfois ce n'est pas le montant, mais le timing, la durée, ou une clause précise.",
            "Un accord durable est un accord équilibré. Un club qui se sent floué se vengera au prochain dossier ; un joueur surpayé mais mal intégré échouera. Le bon agent protège la relation à long terme, pas juste la commission du jour.",
            "Le ton fait la musique : ferme sur le fond, souple sur la forme. On peut défendre durement des intérêts tout en restant respectueux et fiable. Ta réputation de négociateur — dur mais loyal — est un actif que tu bâtis dossier après dossier.",
            "Cas concret — Un club bloque sur le salaire que tu demandes. Au lieu de camper, tu écoutes : en réalité, leur problème n'est pas le montant annuel mais la trésorerie de cette saison. Tu proposes le même salaire, mais avec une prime à la signature étalée : le club dit oui, ton joueur est content. Tu n'as rien lâché sur le fond — tu as juste entendu le vrai besoin de l'autre. Écouter, c'est trouver la clé.",
            "⚠️ L'erreur classique — Négocier à l'émotion, sans plancher défini. Le pro connaît son point de rupture avant d'entrer dans la pièce.",
            "🎯 À retenir — Connais ton seuil de refus · Écoute plus que tu ne parles · Jamais de décision à chaud.",
          ],
          quiz: [
            { q: "Qu'est-ce qu'un « point de rupture » en négociation ?", options: ["Le moment où on s'énerve", "Le seuil en dessous duquel on refuse l'accord", "La commission de l'agent"], answer: 1 },
            { q: "En négociation, la meilleure posture est :", options: ["Parler le plus possible", "Écouter pour comprendre le besoin de l'autre", "Imposer son chiffre d'emblée"], answer: 1, explain: "Écouter, c'est trouver les clés de l'accord." },
            { q: "Le club bloque sur ton salaire demandé. Le réflexe d'un bon négociateur ?", options: ["Camper sur sa position jusqu'au clash", "Écouter le vrai besoin (souvent trésorerie/timing) et ajuster la forme sans céder sur le fond", "Baisser tout de suite le salaire"], answer: 1, explain: "Comprendre le besoin réel de l'autre débloque l'accord sans se sacrifier." },
          ],
        },
        {
          id: "preparer-nego",
          title: "Préparer une négociation",
          minutes: 7,
          intro: "80 % d'une négociation se joue AVANT d'entrer dans la pièce. La préparation, c'est ton avantage.",
          blocks: [
            "Deux concepts à maîtriser. Ta MESORE (meilleure solution de rechange, ou BATNA) : que se passe-t-il si ça ne se conclut pas ? Plus ta solution de repli est solide (autre club intéressé, contrat actuel confortable), plus tu négocies fort. Et la ZAP (zone d'accord possible, ou ZOPA) : la fourchette où un accord est possible entre ce que tu acceptes et ce que l'autre accepte.",
            "Prépare tes chiffres et tes arguments : valeur de marché documentée (comparables, data, performances), besoins du club (poste à combler, budget, urgence), et scénarios de clauses. Entre avec une cible (ce que tu vises), un plancher (ton point de rupture), et des variables d'ajustement (durée, primes, clause de revente) pour créer de la valeur sans céder sur l'essentiel.",
            "Anticipe l'autre camp : quels sont SES contraintes, SON calendrier, SES alternatives ? Un club sous pression (fin de mercato, blessure d'un titulaire) n'a pas le même rapport de force qu'un club serein. Lire la situation de l'autre vaut mieux que la plus belle des argumentations.",
            "Prépare aussi le joueur : aligne ses attentes sur la réalité du marché AVANT la négociation. Un client qui a des attentes irréalistes sabote ton travail. Une bonne partie du métier, c'est de gérer les attentes de son propre camp autant que de négocier avec l'autre.",
            "Cas concret — Avant un rendez-vous, tu fais tes devoirs : ton joueur a une offre ferme d'un autre club (ta MESORE est solide), le club en face vient de perdre son titulaire au poste sur blessure (il est pressé). Tu entres donc en position de force sans avoir à bluffer. Résultat : tu obtiens ta cible. L'agent d'en face, arrivé sans rien préparer, a subi. La négociation était gagnée avant même de commencer.",
            "⚠️ L'erreur classique — Arriver sans informations ni scénarios de repli. Le pro fixe plancher/plafond et prépare son alternative.",
            "🎯 À retenir — Objectifs chiffrés à l'avance · Renseigne-toi sur l'autre partie · Prépare ton plan B (BATNA).",
          ],
          quiz: [
            { q: "La MESORE (BATNA), c'est :", options: ["Ta meilleure solution de rechange si l'accord échoue", "Le montant maximum", "Le nom d'une clause"], answer: 0, explain: "Plus ta solution de repli est solide, plus tu négocies fort." },
            { q: "Créer de la valeur sans céder sur l'essentiel passe par :", options: ["Baisser le salaire demandé", "Jouer sur des variables (durée, primes, clause de revente)", "Menacer l'autre partie"], answer: 1 },
            { q: "Gérer un client aux attentes irréalistes :", options: ["N'est pas ton problème", "Fait partie du travail : aligner les attentes avant de négocier", "Se règle en négociant plus fort"], answer: 1 },
          ],
        },
        {
          id: "techniques-nego",
          title: "Techniques & tactiques",
          minutes: 6,
          intro: "Des leviers concrets — à utiliser avec éthique. Manipuler se paie ; convaincre se capitalise.",
          blocks: [
            "L'ancrage : la première proposition oriente toute la discussion. Proposer en premier, avec un chiffre ambitieux mais défendable, fixe le cadre. Mais l'ancrage ne marche que s'il est crédible : un chiffre délirant te décrédibilise. Ancre haut ET argumente.",
            "La concession réciproque : on ne lâche rien sans contrepartie. « J'accepte cette durée SI vous ajoutez cette prime. » Chaque concession doit acheter quelque chose. Céder gratuitement affaiblit ta position et signale que tu peux céder encore.",
            "Le silence et le temps : après une proposition, se taire met une pression saine sur l'autre. Et gérer le calendrier (ne pas paraître pressé, utiliser les échéances) est une arme. Beaucoup d'accords se débloquent dans les dernières heures — savoir attendre sans craquer est décisif.",
            "La ligne éthique : ces techniques servent à défendre des intérêts légitimes, pas à tromper. Le mensonge, la pression déloyale ou les fausses promesses fonctionnent une fois et détruisent la confiance pour toujours. Dans un milieu où tout le monde se connaît, ta réputation te précède à chaque table.",
            "Cas concret — Le club te demande de baisser le salaire de ton joueur « pour rentrer dans le budget ». Plutôt que de céder sec, tu réponds : « D'accord pour baisser de 10 % le fixe, SI on ajoute une prime d'objectifs et un an de contrat en plus. » Tu as transformé une concession en échange gagnant pour ton joueur. La règle : jamais un cadeau, toujours un troc — chaque chose lâchée doit t'en rapporter une autre.",
            "⚠️ L'erreur classique — Montrer son empressement et céder au silence de l'autre. Le pro ancre en premier et laisse le temps travailler.",
            "🎯 À retenir — Pose la première référence (ancrage) · Le silence est un outil · Une concession contre une contrepartie.",
          ],
          quiz: [
            { q: "La technique de l'« ancrage » consiste à :", options: ["Parler très fort", "Poser une première proposition ambitieuse mais crédible qui cadre la discussion", "Attendre la proposition de l'autre toujours"], answer: 1 },
            { q: "Face à une demande de concession, le bon réflexe est :", options: ["Céder pour faire avancer", "Obtenir une contrepartie (concession réciproque)", "Quitter la table"], answer: 1, explain: "On ne lâche rien sans contrepartie." },
            { q: "Le club te demande de baisser le fixe de ton joueur. La meilleure réponse ?", options: ["Accepter pour conclure vite", "Accepter en échange d'une contrepartie (prime, durée, clause)", "Refuser tout net et partir"], answer: 1, explain: "Chaque concession doit acheter quelque chose : jamais de cadeau gratuit." },
          ],
        },
        {
          id: "negocier-transfert",
          title: "Négocier un transfert",
          minutes: 7,
          intro: "Le grand œuvre : faire converger un joueur, un club vendeur et un club acheteur aux intérêts opposés.",
          blocks: [
            "Un transfert, c'est une négociation à plusieurs étages : le club acheteur (indemnité de transfert, clauses), le club vendeur (montant, pourcentage à la revente, calendrier), et le joueur (salaire, prime à la signature, durée). Chaque étage a sa logique, et un blocage à un étage fait tout capoter. L'agent orchestre l'ensemble.",
            "L'ordre compte : souvent, on sécurise d'abord l'accord de principe du joueur et du club acheteur sur les termes personnels, avant de finaliser l'indemnité entre clubs — ou l'inverse selon le rapport de force. Savoir dans quel ordre débloquer les pièces est un art qui vient avec l'expérience.",
            "Les leviers spécifiques : la durée de contrat restante du joueur (un joueur en fin de contrat change tout le rapport de force), les besoins urgents d'un club, la concurrence entre acheteurs (créer une saine émulation sans bluffer), et les clauses créatives (paiements échelonnés, bonus, revente) qui débloquent un accord quand les positions sur le prix sec sont figées.",
            "Le calendrier du mercato est ton allié et ton ennemi : la pression de fin de fenêtre débloque des dossiers mais fait aussi rater des trains. Un agent expérimenté prépare ses coups en amont et ne dépend jamais de la dernière heure — tout en sachant l'exploiter quand elle sert son joueur.",
            "Cas concret — Deux clubs se bloquent : l'acheteur propose 4 M€, le vendeur en veut 6. Impasse sur le prix sec. Tu débloques tout avec une structure créative : 4,5 M€ fermes + 1 M€ de bonus (matchs joués) + 15 % à la revente. L'acheteur limite son risque, le vendeur garde un intérêt à la plus-value future, ton joueur signe. Quand le prix ne bouge plus, ce sont les clauses créatives — pas l'ultimatum — qui font le deal.",
            "⚠️ L'erreur classique — Gérer une seule partie et oublier le calendrier du mercato. Le pro orchestre clubs et joueur en même temps.",
            "🎯 À retenir — C'est une négociation multi-parties · Le timing est un levier · Sécurise chaque point par écrit.",
          ],
          quiz: [
            { q: "Un transfert se négocie :", options: ["Uniquement avec le joueur", "À plusieurs étages : club acheteur, club vendeur, joueur", "Uniquement entre clubs"], answer: 1, explain: "L'agent orchestre trois logiques aux intérêts opposés." },
            { q: "Quand les positions sur le prix sec sont bloquées, on débloque souvent via :", options: ["Un ultimatum", "Des clauses créatives (échelonnement, bonus, revente)", "L'abandon"], answer: 1 },
            { q: "Un joueur en fin de contrat :", options: ["Ne vaut plus rien", "Change tout le rapport de force (levier accru)", "Ne peut pas être transféré"], answer: 1 },
          ],
        },
      ],
    },

    // ================= CH.7 — BUSINESS & RÉSEAU =================
    {
      id: "business-reseau",
      title: "Développer son activité d'agent",
      subtitle: "Passer d'un agent qui a un joueur à une activité qui dure et grandit.",
      lessons: [
        {
          id: "structurer-activite",
          title: "Structurer son activité",
          minutes: 6,
          intro: "Le talent ne suffit pas : une activité mal structurée coule, même avec de bons joueurs.",
          blocks: [
            "Le cadre : exercer comme agent suppose d'être habilité (licence) et de choisir une structure adaptée (exercice en nom propre, société). Chaque forme a des conséquences juridiques, fiscales et sociales. Faire ce choix avec un expert-comptable et, si besoin, un avocat, dès le départ, évite des erreurs coûteuses.",
            "L'administratif est le socle invisible du métier : mandats à jour, contrats archivés, opérations déclarées, facturation propre, comptabilité tenue. Un agent brillant en négociation mais bordélique en administratif se met en danger (sanctions, litiges, commissions perdues). L'ordre administratif protège ton travail.",
            "La conformité : selon les opérations, tu es soumis à des obligations (déclarations aux instances, lutte anti-blanchiment, transparence des flux). Ces obligations ne sont pas optionnelles. Un dossier « gris » peut te coûter ta licence. La rigueur n'est pas un frein : c'est ce qui te rend fréquentable pour les gros clubs.",
            "L'outillage : centraliser joueurs, échéances, contacts et tâches dans un système fiable (comme Parzi Manage) te fait gagner un temps considérable et t'évite les oublis qui coûtent cher (un mandat expiré, une échéance ratée). Un agent outillé traite plus, mieux, sans se noyer — et paraît instantanément plus professionnel.",
            "Cas concret — Un agent doué signe trois joueurs la même année mais tient sa compta dans un carnet et ses mandats dans une boîte mail. À la fin de la saison : une commission jamais facturée, un mandat qu'il ne retrouve plus, un contrôle qui vire au cauchemar. Le talent était là ; l'organisation, non. Structurer dès le départ (statut, compta, outil de suivi) n'est pas de la paperasse — c'est ce qui transforme des coups en une vraie activité qui dure.",
            "⚠️ L'erreur classique — Travailler « au black » tant que l'activité est petite. Le pro se structure dès le premier mandat.",
            "🎯 À retenir — Choisis un statut et tiens une comptabilité · Reste en conformité · Sépare pro et perso.",
          ],
          quiz: [
            { q: "L'administratif pour un agent, c'est :", options: ["Une perte de temps", "Le socle qui protège son travail (mandats, déclarations, compta)", "Optionnel tant qu'on gagne"], answer: 1, explain: "Un dossier propre protège tes commissions et ta licence." },
            { q: "Les obligations de conformité (déclarations, anti-blanchiment) sont :", options: ["Optionnelles", "Obligatoires : un dossier « gris » peut coûter la licence", "Réservées aux gros agents"], answer: 1 },
            { q: "Tu signes tes premiers joueurs. Pour durer, tu commences par :", options: ["Attendre d'avoir beaucoup d'argent pour t'organiser", "Structurer dès le départ (statut, compta, suivi des mandats/échéances)", "Tout garder dans ta tête et ta boîte mail"], answer: 1, explain: "L'organisation transforme des coups isolés en une activité pérenne." },
          ],
        },
        {
          id: "prospection",
          title: "Prospecter et développer son portefeuille",
          minutes: 6,
          intro: "Un portefeuille ne tombe pas du ciel : il se construit avec méthode, pas au hasard.",
          blocks: [
            "Prospecter, c'est identifier des joueurs correspondant à ta stratégie (niveau, région, poste, âge) et construire une relation avant qu'ils aient besoin de toi. La prospection au hasard épuise ; la prospection ciblée capitalise. Définis ta niche de départ : c'est là que ton temps limité produira le plus.",
            "Le cycle est long : entre le premier contact et une signature, il peut se passer des mois. D'où l'importance d'un suivi organisé — savoir où en est chaque relation, quand relancer, quelle est la prochaine action. Un agent qui « oublie » un prospect prometteur perd un client au profit d'un concurrent plus organisé.",
            "La valeur avant la demande : apporter quelque chose au joueur (un conseil, une mise en relation, une analyse) AVANT de demander un mandat crée une dette de réciprocité et prouve ta valeur. Les meilleurs agents donnent d'abord. C'est plus lent, mais ça construit des relations qui durent.",
            "Mesure et pilote : combien de joueurs suivis, à quel stade, avec quelle prochaine action datée ? Traiter sa prospection comme un pipeline (exactement ce que permet Parzi Manage) transforme un flou anxiogène en un processus maîtrisé et régulier.",
            "Cas concret — Tu suis quinze jeunes prometteurs, mais tout est dans ta tête. Tu en relances cinq, tu en oublies dix. Trois mois plus tard, deux d'entre eux ont signé ailleurs — tu ne les avais pas rappelés. Avec un pipeline (chaque prospect, son stade, sa prochaine action datée), aucun ne passe à la trappe. La prospection n'est pas qu'une affaire de flair : c'est un suivi discipliné.",
            "⚠️ L'erreur classique — Viser tout de suite la Ligue 1 et les stars. Le pro commence par le local et les divisions inférieures.",
            "🎯 À retenir — Le réseau local d'abord · Volume et patience · Crée de la valeur avant de chercher la notoriété.",
          ],
          quiz: [
            { q: "La prospection efficace est :", options: ["Au hasard, le plus large possible", "Ciblée sur une stratégie (niche, poste, région, âge)", "Réservée aux mercatos"], answer: 1, explain: "Cibler concentre ton temps limité là où il produit le plus." },
            { q: "Avant de demander un mandat, les meilleurs agents :", options: ["Promettent un gros contrat", "Apportent d'abord de la valeur au joueur", "Font signer vite"], answer: 1 },
            { q: "Tu suis 15 prospects « dans ta tête » et deux signent ailleurs faute de relance. La solution ?", options: ["Suivre moins de joueurs", "Gérer un pipeline : chaque prospect, son stade, sa prochaine action datée", "Relancer tout le monde au hasard"], answer: 1, explain: "Un suivi organisé évite de perdre un prospect par oubli." },
          ],
        },
        {
          id: "reseau",
          title: "Bâtir et entretenir son réseau",
          minutes: 6,
          intro: "Dans ce métier, ton réseau EST ton capital. Il se cultive comme un jardin, pas comme une conquête.",
          blocks: [
            "Le réseau utile : directeurs sportifs, recruteurs, entraîneurs, autres agents (oui, on collabore parfois), avocats du sport, médecins, journalistes, dirigeants de centres de formation. Chaque relation est une porte potentielle — pour placer un joueur, obtenir une information, ou monter un dossier. Un réseau large et vrai bat un réseau étroit et transactionnel.",
            "La règle d'or : donner avant de recevoir. Rendre service, transmettre une information utile, mettre en relation sans intérêt immédiat — c'est ce qui fait qu'on pense à toi quand une opportunité surgit. Le réseau se construit sur la réciprocité, jamais sur l'exploitation à sens unique.",
            "La régularité : un réseau qu'on ne contacte que quand on a besoin de quelque chose s'assèche. Les meilleurs agents entretiennent leurs relations en continu — un message, un café, un suivi après un dossier. Garder une trace de ses contacts et de la dernière interaction (un CRM, comme dans Parzi Manage) évite de laisser mourir des relations précieuses.",
            "La réputation circule vite : le milieu du football est petit et parle beaucoup. Un agent fiable, discret et loyal se fait recommander ; un agent malhonnête se fait fermer les portes en silence. Ton comportement d'aujourd'hui construit ton réseau de dans cinq ans.",
            "Cas concret — Un directeur sportif cherche en urgence un latéral gauche. Tu n'en as pas sous mandat, mais tu connais le bon profil chez un confrère : tu fais la mise en relation, sans rien demander. Six mois plus tard, ce même directeur sportif t'appelle en premier pour placer un de SES joueurs sortants — parce que tu lui avais rendu service. Le réseau, c'est ça : on sème sans calcul immédiat, on récolte plus tard.",
            "⚠️ L'erreur classique — Ne contacter les gens que lorsqu'on a besoin d'eux. Le pro entretient ses relations avant de demander quoi que ce soit.",
            "🎯 À retenir — Donne avant de prendre · Tiens toujours ta parole · Un réseau se cultive en continu.",
          ],
          quiz: [
            { q: "La règle d'or du réseau est :", options: ["Prendre le maximum, vite", "Donner avant de recevoir (réciprocité)", "Ne parler qu'aux plus puissants"], answer: 1, explain: "Rendre service crée les relations qui durent." },
            { q: "Un réseau qu'on ne contacte qu'en cas de besoin :", options: ["Se renforce", "S'assèche : il faut de la régularité", "Est le plus efficace"], answer: 1 },
            { q: "Un directeur sportif cherche un profil que tu n'as pas. Le réflexe qui construit ton réseau ?", options: ["Ignorer, ça ne te rapporte rien", "Le mettre en relation avec le bon profil sans rien demander", "Lui inventer un joueur pour ne pas passer à côté"], answer: 1, explain: "Donner avant de recevoir : le service rendu revient plus tard." },
          ],
        },
        {
          id: "finances",
          title: "Gérer ses finances d'agent",
          minutes: 6,
          intro: "Des revenus irréguliers et différés : sans gestion, même un bon agent se met en danger.",
          blocks: [
            "La nature des revenus : irréguliers (des mois sans rentrée), différés (encaissés bien après le travail), et parfois échelonnés (une commission payée sur la durée d'un contrat). Cette réalité impose une discipline : lisser, provisionner, et ne jamais dépenser une commission avant de l'avoir encaissée.",
            "Provisionner les charges : TVA, impôts, charges sociales, frais de structure. Une erreur classique du débutant est de considérer la commission brute comme du disponible. Mets systématiquement de côté la part destinée aux impôts et charges dès l'encaissement — raisonne en NET.",
            "La trésorerie de sécurité : garde de quoi tenir plusieurs mois sans rentrée. Le métier récompense la patience, mais la patience suppose de pouvoir attendre. Un agent sous pression financière prend de mauvaises décisions (signer un mauvais deal pour toucher vite) — la sécurité financière protège ton jugement.",
            "Voir loin : un portefeuille de joueurs, c'est aussi des revenus futurs prévisibles (commissions sur contrats en cours, échéances connues). Anticiper ces flux, les suivre, et planifier en conséquence transforme l'angoisse du « prochain deal » en gestion sereine. Là encore, l'outil et la rigueur font la différence.",
            "Cas concret — Un agent touche 120 K€ de commission et se sent riche : voiture, train de vie, tout y passe. Il oublie que ~40 % partiront en TVA, impôts et charges. Six mois plus tard, l'appel des impôts tombe et il n'a plus rien de côté : il accepte alors un mauvais dossier juste pour rentrer du cash. En provisionnant dès l'encaissement et en gardant une trésorerie de sécurité, il aurait gardé son jugement libre. On raisonne toujours en NET, pas en brut encaissé.",
            "⚠️ L'erreur classique — Confondre chiffre d'affaires et revenu net, et ne rien mettre de côté. Le pro provisionne et lisse ses revenus.",
            "🎯 À retenir — Chiffre d'affaires n'est pas revenu net · Provisionne les impôts · Garde une trésorerie de sécurité.",
          ],
          quiz: [
            { q: "Face à une commission encaissée, le bon réflexe est :", options: ["Tout dépenser, c'est mérité", "Provisionner impôts et charges, raisonner en net", "L'oublier"], answer: 1, explain: "La commission brute n'est pas du disponible : provisionne." },
            { q: "Pourquoi une trésorerie de sécurité ?", options: ["Pour frimer", "Pour pouvoir attendre le bon deal sans être sous pression", "Ce n'est pas utile"], answer: 1 },
            { q: "Tu encaisses 120 K€ de commission. Le réflexe d'un pro ?", options: ["Tout dépenser, c'est mérité", "Provisionner impôts/charges et garder une réserve : raisonner en net", "Vite signer un autre deal pour doubler la mise"], answer: 1, explain: "Provisionner protège ta trésorerie — et ton jugement." },
          ],
        },
      ],
    },

    // ================= CH.8 — PSYCHOLOGIE & FACTEUR HUMAIN =================
    {
      id: "psychologie-humain",
      title: "Psychologie & facteur humain",
      subtitle: "Le métier se joue autant sur l'humain que sur le contrat : émotions, entourage et moments durs.",
      lessons: [
        {
          id: "mental-performance",
          title: "Le mental de la performance",
          minutes: 6,
          intro: "Un joueur n'est pas une machine : sa tête fait autant que ses jambes. Un bon agent protège l'équilibre mental de son client.",
          blocks: [
            "La performance sur le terrain dépend d'un mental stable : confiance, gestion du stress, capacité à encaisser l'échec. L'agent n'est pas psychologue, mais il est souvent le premier confident — et le premier à détecter quand ça ne va pas.",
            "Les moments à risque : une méforme, une blessure longue, un banc prolongé, une critique publique, une contre-performance décisive. Ce sont ces creux qui cassent les carrières — ou les révèlent, si le joueur est bien entouré.",
            "Ton rôle : normaliser les hauts et les bas, entourer le joueur des bonnes personnes (préparateur mental, staff médical), et éviter les décisions à chaud (demande de transfert, clash avec le coach) prises sous le coup de l'émotion.",
            "Cas concret — Ton joueur enchaîne trois matchs sans marquer, la presse l'enterre, il veut « partir tout de suite ». L'agent débutant active le marché sous la pression. L'agent accompli l'aide à respirer, lui rappelle le plan, et attend que la tête soit froide avant de décider. Trois semaines plus tard, le joueur repart — et sa valeur avec.",
            "⚠️ L'erreur classique — Confondre le rôle d'agent et celui de psy, ou à l'inverse ignorer le mental sous prétexte que « ce n'est pas mon domaine ». Le pro ne soigne pas, mais il écoute, détecte et oriente vers les bons professionnels.",
            "🎯 À retenir — Le mental fait la performance · Repère les moments de creux · Jamais de décision majeure à chaud.",
          ],
          quiz: [
            { q: "Quand un joueur en méforme veut tout plaquer, l'agent avisé :", options: ["Active le transfert immédiatement", "L'aide à décider à froid, une fois l'émotion retombée", "Ignore, ça passera"], answer: 1, explain: "Les décisions majeures se prennent à tête reposée." },
            { q: "Le rôle de l'agent sur le plan mental, c'est :", options: ["Remplacer un psychologue", "Écouter, détecter et orienter vers les bons pros", "Ne pas s'en mêler"], answer: 1 },
            { q: "Les moments les plus à risque pour un joueur sont :", options: ["Les victoires", "Les creux : blessure, banc, critiques, méforme", "Les vacances"], answer: 1 },
          ],
        },
        {
          id: "gerer-entourage",
          title: "Gérer l'entourage du joueur",
          minutes: 6,
          intro: "Autour d'un joueur gravitent une famille, des amis, parfois des « conseillers » improvisés. Bien géré, l'entourage est un socle ; mal géré, il fait tout dérailler.",
          blocks: [
            "L'entourage sain veut le bien du joueur sur le long terme. L'entourage toxique profite (argent, réseaux, promesses), pousse aux mauvais choix ou te court-circuite auprès d'autres agents. Savoir distinguer les deux est vital.",
            "Ta position est délicate : tu dois travailler AVEC la famille (surtout pour un jeune) sans te laisser dicter la stratégie par des gens qui n'en ont pas les compétences. Respect des personnes, fermeté sur la méthode, pédagogie constante.",
            "Signaux d'alerte : un « ami » qui parle argent à ta place, un proche qui multiplie les contacts avec d'autres agents, des promesses irréalistes faites au joueur par des tiers. Nomme ces dérives tôt, calmement, avec des faits.",
            "Cas concret — Le cousin du joueur, sans mandat ni compétence, négocie en parallèle avec un club et promet un salaire irréaliste. L'agent débutant se braque ou se tait. L'agent accompli réunit joueur et famille, explique factuellement les risques (opération qui capote, réputation abîmée) et recentre la décision sur l'intérêt du joueur.",
            "⚠️ L'erreur classique — Vouloir écarter brutalement l'entourage (tu perds le joueur) ou tout lui céder (tu perds la stratégie). Le pro tient une ligne : chaleureux avec les personnes, ferme sur la méthode.",
            "🎯 À retenir — L'entourage peut porter ou couler une carrière · Travaille avec la famille sans lui déléguer la stratégie · Nomme les dérives tôt et calmement.",
          ],
          quiz: [
            { q: "Face à un proche qui négocie en parallèle sans compétence, le pro :", options: ["L'écarte brutalement", "Réunit joueur et famille, explique les risques, recentre sur l'intérêt du joueur", "Laisse faire"], answer: 1 },
            { q: "La bonne posture avec l'entourage d'un jeune joueur :", options: ["Chaleureux avec les personnes, ferme sur la méthode", "Tout céder pour être apprécié", "Les ignorer"], answer: 0 },
            { q: "Un signal d'entourage toxique :", options: ["Un proche discret et présent", "Un « ami » qui promet des salaires irréalistes et multiplie les contacts d'agents", "Une famille présente aux matchs"], answer: 1 },
          ],
        },
        {
          id: "conversations-difficiles",
          title: "Les conversations difficiles",
          minutes: 5,
          intro: "Dire non, annoncer une mauvaise nouvelle, gérer un désaccord : ces moments définissent un agent. Les fuir détruit la confiance ; les mener bien la renforce.",
          blocks: [
            "Les conversations qu'on n'a pas envie d'avoir : refuser une offre alléchante mais mauvaise, annoncer qu'un club ne veut plus du joueur, conseiller à un jeune de descendre d'un niveau pour jouer, gérer un conflit avec un coach.",
            "La méthode : prépare ton message, sois direct mais respectueux, appuie-toi sur des faits, et propose toujours une voie de sortie. On ne noie pas la mauvaise nouvelle : on l'assume et on montre le plan d'après.",
            "Le timing et le canal comptent : une mauvaise nouvelle se dit en direct (appel, face à face), jamais par un SMS sec. Le joueur doit sentir que tu es avec lui, même quand le message est dur.",
            "Cas concret — Un club de National veut ton joueur ; son club de Ligue 2 le laisse sur le banc. Tu dois lui conseiller de « descendre » pour jouer — un message que son ego rejette. L'agent accompli explique factuellement (temps de jeu, progression, valeur dans 18 mois), assume le conseil, et le cadre comme une étape, pas une régression.",
            "⚠️ L'erreur classique — Éviter la conversation, l'édulcorer ou la déléguer par écrit. Le joueur l'apprend autrement et la confiance s'effondre. Le pro dit les choses, en face, avec un plan.",
            "🎯 À retenir — Ne fuis jamais la conversation dure · Faits + respect + une voie de sortie · Les mauvaises nouvelles se disent en direct.",
          ],
          quiz: [
            { q: "Une mauvaise nouvelle importante se transmet idéalement :", options: ["Par un SMS bref", "En direct (appel ou face à face), avec un plan", "Via un proche"], answer: 1 },
            { q: "Bien mener une conversation difficile, c'est :", options: ["Édulcorer pour ménager", "Être direct et respectueux, appuyé sur des faits, avec une voie de sortie", "L'éviter"], answer: 1 },
            { q: "Ton joueur peut jouer à un niveau inférieur plutôt que rester sur le banc. Tu :", options: ["Évites le sujet, trop sensible", "Expliques factuellement l'intérêt et assumes le conseil", "Le laisses croupir sur le banc"], answer: 1 },
          ],
        },
        {
          id: "jeune-argent-celebrite",
          title: "Jeune joueur : argent & célébrité",
          minutes: 6,
          intro: "Un talent qui explose à 18 ans découvre en même temps l'argent, la célébrité et les réseaux sociaux. Sans cadre, ce cocktail brise plus de carrières qu'il n'en construit.",
          blocks: [
            "Les pièges du jeune qui perce : train de vie qui explose, entourage qui grossit, réseaux sociaux mal maîtrisés, sentiment d'invincibilité, perte du travail qui l'a fait monter. L'argent facile est le plus difficile à gérer.",
            "Ton rôle : poser des garde-fous sans étouffer. Éduquer à l'argent (épargne, fiscalité, prudence), cadrer la communication (ce qu'on poste et ce qu'on ne poste pas), et rappeler que la performance reste la seule base durable.",
            "La règle du temps long : un jeune pense en semaines, l'agent pense en années. Ton boulot est de protéger le joueur de lui-même quand il le faut — quitte à être celui qui dit « pas maintenant ».",
            "Cas concret — Un joueur de 19 ans signe son premier gros contrat et veut tout : voitures, montre, entourage payé. L'agent débutant approuve pour rester populaire. L'agent accompli l'assoit, pose un budget, met en place une épargne et un conseil fiscal, et lui rappelle que sa prochaine prolongation dépendra de ses matchs, pas de son compte de réseau social.",
            "⚠️ L'erreur classique — Vouloir être « le pote » qui dit toujours oui pour rester dans les bonnes grâces. Le pro préfère être respecté dans dix ans plutôt qu'adoré ce mois-ci.",
            "🎯 À retenir — Argent + célébrité + jeunesse = cocktail à cadrer · Éduque à l'argent et à la communication · La performance reste la seule base durable.",
          ],
          quiz: [
            { q: "Face à un jeune qui veut tout dépenser à sa première grosse signature, le pro :", options: ["Approuve pour rester populaire", "Pose un budget, met en place épargne et conseil fiscal", "Ne dit rien, c'est son argent"], answer: 1 },
            { q: "Le bon état d'esprit de l'agent avec un jeune qui perce :", options: ["Être le pote qui dit toujours oui", "Être respecté dans la durée, quitte à dire « pas maintenant »", "Le laisser gérer seul"], answer: 1 },
            { q: "Ce qui reste la base durable d'une carrière :", options: ["Le nombre d'abonnés", "La performance sur le terrain", "Le train de vie"], answer: 1 },
          ],
        },
      ],
    },

    // ================= CH.9 — TRANSFERTS INTERNATIONAUX =================
    {
      id: "transferts-internationaux",
      title: "Transferts internationaux",
      subtitle: "Faire signer un joueur au-delà des frontières : éligibilité, mécanique FIFA et pièges à éviter.",
      lessons: [
        {
          id: "jouer-a-letranger",
          title: "Jouer à l'étranger : éligibilité & permis",
          minutes: 6,
          intro: "Avant de rêver d'un transfert à l'étranger, une question tranche tout : le joueur a-t-il le droit d'y jouer ? L'éligibilité administrative fait ou défait un deal.",
          blocks: [
            "Deux grands régimes. Au sein de l'Union européenne, la libre circulation facilite l'emploi des ressortissants de l'UE. Hors UE — et, depuis le Brexit, pour l'Angleterre — l'accès est filtré par des permis de travail, des systèmes à points ou des quotas de joueurs étrangers.",
            "Chaque pays et chaque ligue a ses propres règles, et elles changent (quotas, critères d'expérience internationale, systèmes à points). Ne promets jamais un transfert avant d'avoir vérifié l'éligibilité pour ce pays, cette saison.",
            "La nationalité sportive et un éventuel second passeport pèsent lourd : un joueur binational peut devenir « communautaire » et débloquer un marché entier. Connaître le dossier administratif d'un joueur fait partie du métier.",
            "Cas concret — Tu tiens un accord de principe pour placer un joueur non-UE en Angleterre. L'agent débutant annonce la bonne nouvelle au joueur ; l'agent accompli vérifie d'abord le système à points : faute de sélections internationales suffisantes, le permis est refusé et le deal s'effondre. Vérifier l'éligibilité AVANT d'engager la parole, c'est se protéger d'une humiliation.",
            "⚠️ L'erreur classique — Raisonner « niveau sportif » en oubliant l'administratif. Un transfert parfait sur le papier ne vaut rien si le joueur ne peut pas être enregistré.",
            "🎯 À retenir — UE : libre circulation ; hors UE : permis/quotas · Les règles varient par pays et par saison · Vérifie l'éligibilité avant de promettre.",
          ],
          quiz: [
            { q: "Avant d'annoncer un transfert à l'étranger, le réflexe n°1 :", options: ["Négocier le salaire", "Vérifier l'éligibilité administrative (permis, quotas) du joueur", "Prévenir la presse"], answer: 1, explain: "Un joueur inéligible ne peut pas être enregistré : l'administratif prime." },
            { q: "Depuis le Brexit, jouer en Angleterre pour un non-UE dépend souvent :", options: ["D'un simple accord entre clubs", "D'un système à points / permis de travail", "De rien de particulier"], answer: 1 },
            { q: "Un second passeport communautaire peut :", options: ["Compliquer le transfert", "Débloquer l'accès à tout un marché (statut communautaire)", "Être sans effet"], answer: 1 },
          ],
        },
        {
          id: "mecanique-transfert-int",
          title: "La mécanique d'un transfert international",
          minutes: 6,
          intro: "Un transfert entre deux pays suit un circuit précis, tracé et minuté. Connaître la mécanique t'évite de faire capoter un accord pour un détail administratif.",
          blocks: [
            "Le passage d'une fédération à une autre nécessite un Certificat International de Transfert (CIT / ITC) : l'ancienne fédération le délivre, la nouvelle enregistre le joueur. Sans CIT validé, le joueur ne peut pas jouer, même si tout le reste est signé.",
            "Tout transite par le TMS (Transfer Matching System) de la FIFA : les deux clubs y saisissent les informations, qui doivent concorder. La moindre incohérence (dates, montants, documents) bloque l'opération.",
            "Le nerf de la guerre, c'est le temps : les fenêtres de transfert ont des dates limites strictes. Un dossier incomplet à minuit, c'est un transfert perdu. Le pro anticipe les documents (passeport, contrat, visite médicale) bien avant la clôture.",
            "Cas concret — Dernier jour du mercato, l'accord est trouvé, mais l'ancienne fédération tarde à délivrer le CIT et un document manque dans le TMS. L'agent accompli avait tout préparé et relancé 48 h avant ; le débutant découvre le blocage à 23 h et regarde le deal mourir au buzzer.",
            "⚠️ L'erreur classique — Croire que « accord signé = joueur qualifié ». Tant que le CIT n'est pas validé et le TMS bouclé, rien n'est fait.",
            "🎯 À retenir — CIT/ITC obligatoire entre fédérations · Tout passe par le TMS, les infos doivent concorder · Anticipe les documents avant la clôture.",
          ],
          quiz: [
            { q: "Pour enregistrer un joueur venu d'une autre fédération, il faut :", options: ["Rien de spécial", "Un Certificat International de Transfert (CIT/ITC) validé", "Uniquement l'accord des clubs"], answer: 1 },
            { q: "Le TMS (FIFA) sert à :", options: ["Diffuser les matchs", "Saisir et faire concorder les informations du transfert entre les deux clubs", "Payer les agents"], answer: 1 },
            { q: "Le vrai risque le dernier jour du mercato :", options: ["Un dossier incomplet / CIT en retard qui fait tout capoter", "Le prix du café", "La météo"], answer: 0 },
          ],
        },
        {
          id: "formation-solidarite",
          title: "Indemnités de formation & solidarité",
          minutes: 5,
          intro: "Quand un joueur est transféré, les clubs qui l'ont formé peuvent toucher de l'argent. Comprendre ces mécanismes, c'est comprendre une partie de l'économie d'un transfert.",
          blocks: [
            "L'indemnité de formation récompense les clubs ayant formé un jeune joueur (jusqu'à un certain âge), lors de ses premiers contrats professionnels et de certains transferts. Objectif : encourager la formation.",
            "Le mécanisme de solidarité prévoit qu'une part de l'indemnité de transfert d'un joueur encore « jeune » soit redistribuée aux clubs formateurs, au prorata des années de formation. C'est prévu par le règlement FIFA.",
            "Pour l'agent, ces mécanismes ont un impact concret : ils modifient le « net vendeur » d'un club, donc la marge de négociation, et peuvent compliquer — ou débloquer — un accord. Les ignorer, c'est mal évaluer un deal.",
            "Cas concret — Un club vend ton joueur 5 M€ mais n'anticipe pas la contribution de solidarité due aux clubs formateurs. Le net encaissé est plus faible que prévu, ce qui tend la négociation sur ta commission. L'agent accompli intègre ces flux dès le départ pour éviter les mauvaises surprises.",
            "⚠️ L'erreur classique — Raisonner sur le montant brut du transfert sans tenir compte des indemnités de formation/solidarité. Le chiffre annoncé n'est pas le chiffre encaissé.",
            "🎯 À retenir — La formation se rémunère (indemnité + solidarité) · Ça change le net vendeur et la négociation · Anticipe ces flux dans chaque deal.",
          ],
          quiz: [
            { q: "Le mécanisme de solidarité bénéficie :", options: ["Aux agents", "Aux clubs ayant formé le joueur", "Aux sponsors"], answer: 1 },
            { q: "Pour l'agent, les indemnités de formation/solidarité :", options: ["N'ont aucun impact", "Modifient le net vendeur et donc la négociation", "Concernent seulement la FIFA"], answer: 1 },
            { q: "Le montant brut d'un transfert :", options: ["Est toujours ce que le club encaisse", "Peut différer du net après indemnités de formation/solidarité", "Est fixé par l'agent"], answer: 1 },
          ],
        },
        {
          id: "montages-a-eviter",
          title: "Montages à éviter : TPO & pièges",
          minutes: 5,
          intro: "Certains montages promettent de l'argent rapide et finissent en sanctions. Un agent qui veut durer connaît les lignes rouges et s'y tient.",
          blocks: [
            "La TPO (Third-Party Ownership) — la détention des droits économiques d'un joueur par un tiers investisseur — est interdite par la FIFA. Les montages qui contournent cette interdiction exposent joueurs, clubs et agents à de lourdes sanctions.",
            "Autres pièges : prête-noms, fausses factures, sur-commissions occultes, contrats « parallèles » non déclarés. Ils peuvent enrichir vite… puis détruire une carrière et une réputation d'un seul contrôle.",
            "La règle de l'agent qui dure : si un montage doit rester caché, c'est qu'il ne faut pas le faire. La transparence n'est pas une contrainte, c'est ton assurance-vie professionnelle.",
            "Cas concret — Un « investisseur » te propose de financer le transfert d'un joueur contre un pourcentage de sa future revente. C'est de la TPO déguisée : interdit. L'agent débutant voit l'argent facile ; l'agent accompli refuse, explique pourquoi, et garde les mains propres — parce qu'une seule affaire suffit à te bannir du métier.",
            "⚠️ L'erreur classique — Se dire « tout le monde le fait » ou « personne ne verra ». Les contrôles existent, et le risque n'est jamais proportionnel au gain.",
            "🎯 À retenir — La TPO est interdite · Fuis prête-noms, sur-commissions occultes et contrats parallèles · Si ça doit rester caché, ne le fais pas.",
          ],
          quiz: [
            { q: "La détention des droits économiques d'un joueur par un tiers investisseur (TPO) est :", options: ["Encouragée", "Interdite par la FIFA", "Obligatoire"], answer: 1 },
            { q: "La règle de l'agent qui veut durer :", options: ["Si un montage doit rester caché, ne le fais pas", "Profiter tant que ça passe", "Suivre ce que font les autres"], answer: 0 },
            { q: "Un « investisseur » propose de financer un transfert contre un % de future revente. C'est :", options: ["Une bonne affaire", "De la TPO déguisée, à refuser", "Sans risque"], answer: 1 },
          ],
        },
      ],
    },

    // ================= CH.10 — MÉDIAS, IMAGE & COMMUNICATION =================
    {
      id: "medias-communication",
      title: "Médias, image & communication",
      subtitle: "Aujourd'hui, l'agent gère aussi l'espace médiatique : presse, réseaux, crises et prises de parole.",
      lessons: [
        {
          id: "relation-medias",
          title: "Gérer la relation avec les médias",
          minutes: 6,
          intro: "Les médias peuvent porter un joueur au sommet ou l'enfoncer. L'agent n'est pas attaché de presse, mais il pilote la relation et protège son client.",
          blocks: [
            "Les journalistes ne sont ni des amis ni des ennemis : ce sont des professionnels avec leurs objectifs. Une relation saine repose sur la fiabilité (tu ne mens pas) et la clarté (ce qui est public, ce qui ne l'est pas). Un bon contact presse est un actif de long terme.",
            "Maîtrise la distinction « on the record » / « off the record » : tout ce qui est dit peut être publié, sauf accord explicite — et même là, prudence. Ne dis jamais en « off » ce qui te détruirait en « on ».",
            "Choisis les moments : une prise de parole se prépare (message clé, ce qu'on ne dira pas). Le silence est parfois la meilleure communication — ne pas répondre à une rumeur, c'est parfois l'éteindre.",
            "Cas concret — Une rumeur de transfert sort en plein mercato. L'agent débutant dément avec véhémence (et alimente le sujet), ou confirme trop tôt (et fragilise la négociation). L'agent accompli répond de façon mesurée, protège la négociation en cours, et ne commente pas ce qui n'est pas signé.",
            "⚠️ L'erreur classique — Traiter les journalistes comme des potes (et lâcher une info sensible) ou comme des ennemis (et se les mettre à dos). Le pro reste fiable, cadré et respectueux.",
            "🎯 À retenir — Fiabilité + clarté = relation presse saine · « On the record » par défaut · Le silence est parfois la meilleure réponse.",
          ],
          quiz: [
            { q: "Face à une rumeur de transfert non signé, le pro :", options: ["Dément avec véhémence", "Répond de façon mesurée et ne commente pas ce qui n'est pas signé", "Confirme tout de suite"], answer: 1, explain: "Commenter un deal non signé fragilise la négociation." },
            { q: "« Off the record » signifie :", options: ["Que rien ne pourra jamais fuiter", "Une zone à manier avec prudence : ne dis jamais en off ce qui te détruirait en on", "Que tu peux tout dire sans risque"], answer: 1 },
            { q: "Un bon contact presse, c'est :", options: ["Un ami à qui on dit tout", "Un actif de long terme fondé sur la fiabilité", "Un ennemi à éviter"], answer: 1 },
          ],
        },
        {
          id: "reseaux-sociaux",
          title: "Maîtriser les réseaux sociaux",
          minutes: 5,
          intro: "Les réseaux sociaux sont à la fois le plus grand atout d'image d'un joueur et son plus grand risque. Ils se pilotent, ils ne se subissent pas.",
          blocks: [
            "Un compte bien géré construit une marque, attire des sponsors et donne de la valeur au joueur au-delà du terrain. Mal géré, il crée des polémiques, tend les relations avec le club et fait fuir les partenaires.",
            "Les règles de base à poser avec le joueur : réfléchir avant de poster, éviter les sujets clivants gratuits, ne pas répondre à chaud, ne rien publier qui trahisse le vestiaire ou le club. Ce qui est en ligne y reste.",
            "L'agent aide à structurer : une ligne éditoriale simple, cohérente avec l'image visée, et parfois un professionnel (community manager) quand le joueur monte. Les réseaux servent la carrière, ils ne la remplacent pas.",
            "Cas concret — Après une défaite, ton joueur veut poster un message rageur visant son coach. L'agent débutant laisse faire (ou ne voit rien). L'agent accompli l'appelle avant, désamorce, et transforme l'élan en un message neutre — évitant une amende du club et une brouille durable.",
            "⚠️ L'erreur classique — Croire que les réseaux sont un espace privé sans conséquence. Un post de dix secondes peut coûter un transfert, un sponsor ou une place dans le groupe.",
            "🎯 À retenir — Les réseaux sont un actif ET un risque · Réfléchir avant de poster, jamais à chaud · Une ligne cohérente avec l'image visée.",
          ],
          quiz: [
            { q: "Un compte social bien géré :", options: ["Ne sert à rien", "Construit une marque et attire des sponsors", "Remplace les performances"], answer: 1 },
            { q: "Ton joueur veut poster un message rageur contre son coach. Tu :", options: ["Laisses faire, c'est son compte", "L'appelles avant, désamorces, et proposes un message neutre", "Postes à sa place sans le prévenir"], answer: 1 },
            { q: "La bonne règle de publication :", options: ["Poster à chaud pour être authentique", "Réfléchir avant, jamais à chaud, cohérent avec l'image", "Publier tout, tout le temps"], answer: 1 },
          ],
        },
        {
          id: "communication-crise",
          title: "Communication de crise",
          minutes: 6,
          intro: "Blessure grave, affaire extra-sportive, clash public, bad buzz : la crise arrive toujours. Ce qui distingue un grand agent, c'est sa gestion des tempêtes.",
          blocks: [
            "Les principes d'une crise : agir vite mais sans panique, dire la vérité (ou se taire, jamais mentir), parler d'une seule voix (joueur, agent, club alignés), et penser à l'après (reconstruire l'image une fois la tempête passée).",
            "La cellule de crise : qui parle, qui ne parle pas, quel message, quel canal. Improviser en pleine tempête est le meilleur moyen d'aggraver les choses. Un plan simple préparé à froid vaut mille réactions à chaud.",
            "Certaines crises se gèrent par le silence et le temps ; d'autres exigent une prise de parole claire et assumée. Savoir distinguer les deux — et ne jamais laisser le joueur seul face aux micros — fait partie du métier.",
            "Cas concret — Ton joueur est impliqué dans une polémique virale un soir de match. L'agent débutant le laisse répondre seul sur les réseaux, en pleine émotion. L'agent accompli coupe le bruit, aligne joueur et club sur un message unique, et choisit le bon moment pour s'exprimer — ou pour ne rien dire.",
            "⚠️ L'erreur classique — Réagir dans la panique, multiplier les prises de parole contradictoires, ou laisser le joueur gérer seul. La crise se pilote à froid, à plusieurs voix alignées.",
            "🎯 À retenir — Vite mais sans panique · Une seule voix, jamais de mensonge · Prépare un plan de crise à froid.",
          ],
          quiz: [
            { q: "En pleine crise médiatique, le pro :", options: ["Multiplie les prises de parole spontanées", "Aligne joueur et club sur un message unique et choisit le bon moment", "Laisse le joueur répondre seul à chaud"], answer: 1 },
            { q: "Un principe de communication de crise :", options: ["Mentir si nécessaire", "Dire la vérité ou se taire, jamais mentir", "Ignorer totalement la crise"], answer: 1 },
            { q: "Le meilleur plan de crise :", options: ["S'improvise pendant la tempête", "Se prépare à froid, avant la crise", "N'existe pas"], answer: 1 },
          ],
        },
        {
          id: "prise-de-parole",
          title: "Préparer une prise de parole",
          minutes: 5,
          intro: "Une interview, une conférence, une story : chaque prise de parole peut servir ou desservir. Ça se prépare comme une négociation — avec un message et des limites.",
          blocks: [
            "Avant une prise de parole : définis 1 à 3 messages clés, et surtout ce qu'on ne dira pas (le mercato, le vestiaire, les sujets qui fâchent). Un joueur préparé garde le contrôle ; un joueur improvisé se fait piéger.",
            "Les techniques : ramener chaque question vers ton message, répondre court sur les sujets sensibles, ne jamais répéter une formulation négative posée par le journaliste. Le silence et « je ne commente pas » sont des réponses valables.",
            "L'objectif n'est pas de « bien parler » mais de servir la carrière : renforcer l'image, protéger la négociation, ne créer aucun problème. Une prise de parole réussie, c'est souvent celle qui ne fait pas de vagues.",
            "Cas concret — Avant une interview d'après-match tendue, tu prépares ton joueur : trois messages, deux sujets à esquiver, une phrase de sortie prête. Le joueur reste maître de l'échange. L'agent débutant, lui, l'envoie à froid — et passe la soirée à éteindre l'incendie d'une phrase malheureuse.",
            "⚠️ L'erreur classique — Envoyer le joueur sans préparation, ou le sur-briefer au point de le rendre robotique. Le pro prépare l'essentiel : messages, limites, et une posture naturelle.",
            "🎯 À retenir — Prépare 1 à 3 messages + ce qu'on ne dira pas · Ramène vers ton message, réponds court sur le sensible · « Je ne commente pas » est une réponse.",
          ],
          quiz: [
            { q: "Bien préparer une prise de parole, c'est définir :", options: ["Rien, il faut être spontané", "1 à 3 messages clés ET ce qu'on ne dira pas", "Uniquement la tenue"], answer: 1 },
            { q: "Face à une question piège sur un sujet sensible :", options: ["Répondre longuement pour se justifier", "Répondre court, ramener vers son message, ou « je ne commente pas »", "Répéter la formulation négative du journaliste"], answer: 1 },
            { q: "Une prise de parole réussie :", options: ["Fait le buzz à tout prix", "Sert la carrière et ne crée aucun problème", "Dure le plus longtemps possible"], answer: 1 },
          ],
        },
      ],
    },

    // ================= CH.11 — FISCALITÉ & STATUT DE L'AGENT =================
    // Chiffres France 2026 (seuils micro 2026-2028, franchise TVA, taux URSSAF
    // 2026, calendrier facture électronique) : ils changent — la leçon le dit
    // et renvoie toujours vers l'expert-comptable et les sources officielles.
    {
      id: "fiscalite-statut",
      title: "Fiscalité & statut de l'agent",
      subtitle: "Choisir sa structure, comprendre la TVA et facturer proprement ses commissions.",
      lessons: [
        {
          id: "choisir-statut",
          title: "Choisir son statut",
          minutes: 6,
          intro: "Entreprise individuelle ou société : un choix qui décide de tes charges, de ton impôt et de ta protection.",
          blocks: [
            "Deux grandes familles. L'entreprise individuelle (dont la micro-entreprise) : simple à créer, peu de formalités, idéale pour démarrer quand les commissions sont encore rares. La société (SASU, EURL…) : plus lourde à gérer (statuts, comptabilité complète, frais d'expert-comptable), mais plus souple quand l'activité grossit — rémunération, dividendes, associés, image auprès des clubs.",
            "Ce que le statut change vraiment : la façon dont tu es imposé (impôt sur le revenu ou impôt sur les sociétés), le montant et la nature de tes charges sociales, ta protection sociale, et ce que tu peux déduire (déplacements, téléphone, logiciels, formation). Depuis 2022, le patrimoine personnel de l'entrepreneur individuel est séparé par défaut du patrimoine professionnel ; la société reste toutefois la structure la plus lisible pour accueillir un associé ou un investisseur.",
            "Le bon ordre : ta licence d'agent d'abord (sans elle, pas d'activité), puis le statut adapté à ton volume réel. Beaucoup d'agents démarrent en micro-entreprise, puis passent en société quand les commissions dépassent les seuils ou que les frais réels deviennent importants. Ce passage se prépare avec un expert-comptable, idéalement avant la grosse commission — pas après.",
            "Cas concret — Un jeune agent crée directement une SASU « pour faire sérieux ». Première année : deux petites commissions, mais 2 500 € de frais comptables et une gestion lourde. Son confrère, en micro-entreprise, a encaissé autant avec presque aucun frais. Deux ans plus tard, avec un portefeuille qui tourne, c'est l'inverse : la société devient intéressante. Le bon statut n'est pas le plus prestigieux, c'est celui qui colle à ton volume.",
            "⚠️ L'erreur classique — Choisir un statut sur un conseil entendu au vestiaire, sans chiffrer. Le pro fait une simulation (chiffre d'affaires prévu, frais, impôt, charges) avec un expert-comptable avant de créer.",
            "🎯 À retenir — Licence d'abord, statut ensuite · Micro-entreprise pour démarrer, société quand le volume le justifie · Toujours chiffrer avec un expert-comptable.",
          ],
          quiz: [
            { q: "Tu démarres avec quelques commissions attendues dans l'année. Le statut le plus adapté en général ?", options: ["Une holding avec plusieurs sociétés", "Une entreprise individuelle, souvent en micro-entreprise", "Aucun statut : on déclarera plus tard"], answer: 1, explain: "Simple et peu coûteuse, la micro-entreprise convient au démarrage ; on évolue quand le volume le justifie." },
            { q: "Qu'est-ce qui doit venir en premier pour exercer comme agent ?", options: ["La licence d'agent", "La création d'une SASU", "Le logo et le site internet"], answer: 0, explain: "Sans licence, pas d'activité d'agent possible : le statut vient ensuite." },
            { q: "Quand envisager le passage en société ?", options: ["Jamais, c'est toujours plus cher", "Quand le volume et les frais réels le justifient, après simulation avec un expert-comptable", "Dès le premier mandat, pour impressionner les clubs"], answer: 1 },
          ],
        },
        {
          id: "micro-entreprise-agent",
          title: "La micro-entreprise en pratique",
          minutes: 7,
          intro: "Le régime le plus simple — à condition de connaître ses seuils, ses taux et ses échéances.",
          blocks: [
            "Le principe : tu déclares ton chiffre d'affaires encaissé (mensuellement ou trimestriellement) et tu paies des cotisations sociales en pourcentage de ce chiffre. Pas de comptabilité complète, mais un livre des recettes tenu à jour. Chiffres 2026 à vérifier chaque année : plafond de 83 600 € de chiffre d'affaires par an pour les prestations de services (seuils fixés pour 2026-2028) ; cotisations d'environ 25,6 % du chiffre d'affaires pour une activité libérale relevant de la Sécurité sociale des indépendants.",
            "L'impôt : en micro-BNC, le fisc applique un abattement forfaitaire de 34 % pour frais, et le reste s'ajoute à tes autres revenus. Sous condition de revenus du foyer, tu peux opter pour le versement libératoire : 2,2 % du chiffre d'affaires payés en même temps que les cotisations, et l'impôt est réglé. Ta catégorie fiscale exacte (BNC le plus souvent pour une activité de représentation et de conseil) se valide avec un expert-comptable : elle change l'abattement et le taux.",
            "Les autres échéances : la cotisation foncière des entreprises (CFE) arrive à partir de la deuxième année (exonération l'année de création), et un compte bancaire dédié est obligatoire dès que ton chiffre d'affaires dépasse 10 000 € deux années de suite — en pratique, ouvre-le dès le départ. Le vrai piège : les frais. En micro-entreprise, tu ne déduis pas tes frais réels ; si tu voyages beaucoup pour voir des joueurs, l'abattement forfaitaire peut devenir moins intéressant qu'une structure au réel.",
            "Cas concret — Un agent encaisse une commission de 20 000 € en mars. Il la voit comme « 20 000 € pour moi ». En réalité, environ 5 100 € partent en cotisations (25,6 %), et l'impôt suivra. Il met aussitôt 30 % de côté sur un compte séparé : quand l'URSSAF et les impôts se présentent, l'argent est là. Son confrère qui a tout dépensé, lui, doit demander un échéancier — et négocie ensuite ses deals sous pression.",
            "⚠️ L'erreur classique — Oublier de déclarer un mois « sans commission » ou déclarer en retard : pénalités assurées. Même à zéro, on déclare dans les temps.",
            "🎯 À retenir — Plafond et taux changent : vérifie-les chaque année · Mets de côté environ 30 % de chaque commission · Déclare toujours dans les temps, même à zéro.",
          ],
          quiz: [
            { q: "En micro-entreprise, sur quoi sont calculées tes cotisations sociales ?", options: ["Sur ton bénéfice après frais réels", "Sur ton chiffre d'affaires encaissé", "Sur un forfait fixe annuel"], answer: 1, explain: "En micro-entreprise, les cotisations sont un pourcentage du chiffre d'affaires encaissé." },
            { q: "Tu viens d'encaisser une commission de 20 000 €. Le bon réflexe ?", options: ["Considérer les 20 000 € comme disponibles", "Mettre immédiatement de côté une part pour les cotisations et l'impôt", "Attendre la relance de l'URSSAF pour s'en occuper"], answer: 1 },
            { q: "Aucun encaissement ce trimestre : dois-tu déclarer ?", options: ["Non, il n'y a rien à déclarer", "Oui, on déclare dans les temps même à zéro", "Seulement si l'URSSAF le demande"], answer: 1, explain: "Une déclaration manquante, même à zéro, entraîne des pénalités." },
          ],
        },
        {
          id: "tva-commissions",
          title: "La TVA sur tes commissions",
          minutes: 7,
          intro: "Facturer avec ou sans TVA, en France ou à l'étranger : une erreur ici coûte cher et se voit tout de suite.",
          blocks: [
            "La franchise en base : tant que ton chiffre d'affaires reste sous un seuil (37 500 € pour les prestations de services en 2026, avec une tolérance à 41 250 €), tu ne factures pas de TVA et tu ne la récupères pas. Ta facture doit alors porter la mention « TVA non applicable, article 293 B du CGI ». Le projet d'abaisser ce seuil à 25 000 € a été abandonné : les seuils antérieurs restent en vigueur — mais on vérifie chaque année.",
            "Au-delà du seuil (ou si tu optes pour la TVA), tu factures la TVA à 20 % sur tes commissions, tu la reverses à l'État et tu récupères celle payée sur tes achats professionnels. Attention au passage : dès que le seuil majoré est dépassé en cours d'année, la TVA s'applique immédiatement. Pour un club, payer la TVA n'est pas un problème (il la récupère) ; pour un joueur particulier, elle alourdit le coût — c'est un point à clarifier dans le mandat.",
            "À l'international : pour une prestation rendue à un club étranger établi dans l'Union européenne et assujetti à la TVA, la règle générale est que la TVA française n'est pas facturée ; c'est le club qui l'autoliquide dans son pays. Ta facture porte alors les numéros de TVA intracommunautaire des deux parties — et tu en as besoin même en franchise. Hors UE, d'autres règles s'appliquent. Chaque opération internationale mérite une validation par ton expert-comptable.",
            "Cas concret — Un agent en franchise facture « 10 000 € TTC » à un club, avec une TVA de 20 % qu'il n'a pas le droit de facturer. Le club la déduit, l'agent ne la reverse pas : au premier contrôle, redressement pour les deux. À l'inverse, un agent qui a dépassé le seuil en mai et continue à facturer sans TVA jusqu'en décembre devra la payer de sa poche sur tout ce qu'il a facturé depuis le dépassement. La TVA ne pardonne pas l'à-peu-près.",
            "⚠️ L'erreur classique — Ne pas surveiller son chiffre d'affaires en cours d'année et découvrir trop tard qu'on a dépassé le seuil de franchise. Le pro suit son cumul après chaque encaissement.",
            "🎯 À retenir — Sous le seuil : pas de TVA, mention article 293 B · Seuil dépassé : TVA immédiatement · Client UE assujetti : autoliquidation, numéros de TVA sur la facture.",
          ],
          quiz: [
            { q: "Tu es en franchise en base de TVA. Que dois-tu indiquer sur ta facture ?", options: ["Une TVA à 20 % comme tout le monde", "La mention « TVA non applicable, article 293 B du CGI »", "Rien de particulier"], answer: 1, explain: "En franchise, on ne facture pas de TVA et on l'indique avec la mention légale." },
            { q: "Ton chiffre d'affaires dépasse le seuil majoré en cours d'année. Que se passe-t-il ?", options: ["Rien avant l'année suivante", "La TVA s'applique immédiatement à tes facturations", "Tu dois fermer ton entreprise"], answer: 1 },
            { q: "Tu factures une commission à un club espagnol assujetti à la TVA. La règle générale ?", options: ["Tu factures la TVA française à 20 %", "Pas de TVA française : le club autoliquide, les numéros de TVA intracommunautaire figurent sur la facture", "Tu factures la TVA espagnole toi-même"], answer: 1, explain: "Pour une prestation B2B dans l'UE, la TVA est en principe due par le preneur (autoliquidation)." },
          ],
        },
        {
          id: "facturer-commission",
          title: "Facturer et encaisser une commission",
          minutes: 6,
          intro: "Une commission n'existe vraiment qu'une fois facturée correctement, encaissée et déclarée.",
          blocks: [
            "Qui reçoit la facture ? Celui qui te doit la commission d'après le mandat. En France, le Code du sport plafonne la rémunération de l'agent à 10 % du montant du contrat conclu par les parties qu'il a mises en rapport, et le club peut régler la commission à la place du joueur. Ce point se prépare dès le mandat : qui paie, combien, sur quelle base, à quelles échéances — et on vérifie le texte en vigueur au moment de l'opération.",
            "Une facture propre comporte : un numéro unique et chronologique, la date, ton identité (nom, adresse, numéro SIREN), celle du client, la description précise (opération, joueur, contrat, échéance concernée), le montant hors taxe, la TVA ou la mention de franchise, les conditions et la date limite de paiement. Pour une commission étalée sur la durée d'un contrat, on facture chaque échéance quand elle devient exigible.",
            "Le virage numérique : en France, toutes les entreprises doivent pouvoir recevoir des factures électroniques depuis le 1er septembre 2026, et les TPE, PME et micro-entreprises devront les émettre à partir du 1er septembre 2027 pour leurs clients professionnels (via une plateforme agréée). Les ventes à des particuliers et à l'étranger suivent un circuit de déclaration séparé. Choisis dès maintenant un outil de facturation compatible.",
            "Cas concret — Un club doit à un agent 30 000 € payables en trois échéances annuelles. L'agent envoie une seule facture « 30 000 € » le jour de la signature. Le club la rejette : elle ne correspond pas à l'échéancier du contrat. Trois mois perdus. Refaite proprement — trois factures, chacune à son échéance, avec la référence du contrat et du joueur — chaque paiement arrive à l'heure.",
            "⚠️ L'erreur classique — Facturer approximativement (mauvais client, montant flou, pas de référence au contrat) et s'étonner que le club ne paie pas. Une facture précise est payée ; une facture floue est mise de côté.",
            "🎯 À retenir — Facturer celui qui doit la commission selon le mandat · Plafond légal et échéancier vérifiés · Facture complète et numérotée, bientôt électronique.",
          ],
          quiz: [
            { q: "Ta commission est payable en trois échéances annuelles. Comment factures-tu ?", options: ["Une seule facture du total le jour de la signature", "Une facture à chaque échéance, avec la référence du contrat", "Aucune facture : le virement suffit"], answer: 1, explain: "On facture chaque échéance quand elle devient exigible, en référençant le contrat." },
            { q: "En France, qui peut régler la commission de l'agent du joueur ?", options: ["Uniquement le joueur, jamais le club", "Le joueur, ou le club à sa place, dans le cadre prévu par le Code du sport", "N'importe quel tiers, sans règle"], answer: 1 },
            { q: "À partir de quand une micro-entreprise devra-t-elle émettre des factures électroniques à ses clients professionnels ?", options: ["Elle n'est pas concernée", "Le 1er septembre 2027", "Le 1er janvier 2030"], answer: 1, explain: "Réception obligatoire dès le 1er septembre 2026 ; émission pour les TPE-PME et micro-entreprises au 1er septembre 2027." },
          ],
        },
      ],
    },

    // ================= CH.12 — MÉTHODE & PROFESSIONNALISATION =================
    {
      id: "methode-pro",
      title: "Méthode, examen & outils",
      subtitle: "Réussir l'examen d'agent, traiter un cas comme un pro, et rester irréprochable.",
      lessons: [
        {
          id: "methode-examen",
          title: "Réussir l'examen d'agent",
          minutes: 6,
          intro: "L'examen valide surtout une chose : sais-tu appliquer une règle à une situation ? Ça se travaille en méthode.",
          blocks: [
            "L'examen d'agent (FFF pour le cadre national, FIFA pour le cadre international) porte sur la réglementation et son application. On n'y récite pas des articles : on montre qu'on sait retrouver la règle applicable et la mettre en œuvre sur un cas. La compréhension bat le par-cœur.",
            "La méthode gagnante : maîtriser la structure des textes (savoir OÙ chercher plutôt que tout mémoriser), s'entraîner sur des cas pratiques et des annales, et travailler sous chronomètre pour gérer le temps le jour J. La régularité (un peu chaque jour, révisions espacées) bat le bachotage de dernière minute.",
            "Les pièges de l'examen : questions à double négation, options « presque vraies », faux amis entre règle nationale et internationale, et gestion du temps. Lis chaque énoncé DEUX fois, repère le mot qui change tout, et ne laisse jamais une question sans réponse s'il n'y a pas de pénalité au hasard.",
            "L'état d'esprit : l'examen n'est pas une fin, c'est un permis d'exercer. Le vrai apprentissage continue sur le terrain. Mais un examen réussi proprement, sans zone d'ombre, pose des bases solides — et t'évite de découvrir une règle essentielle le jour où elle te coûte cher.",
            "Cas concret — Deux candidats. Le premier apprend par cœur des centaines d'articles la veille : le jour J, il panique dès qu'une question est reformulée en cas concret. Le second a travaillé la MÉTHODE (savoir où chercher, s'entraîner sur des cas, gérer le temps) un peu chaque jour pendant deux mois : il retrouve calmement la règle applicable et l'applique. C'est le second qui passe. À l'examen d'agent, on teste l'application, pas la récitation.",
            "⚠️ L'erreur classique — Réviser sans méthode et mal gérer le temps le jour J. Le pro s'entraîne en conditions réelles.",
            "🎯 À retenir — Lis bien chaque question · Gère ton temps · Entraîne-toi comme le jour de l'examen.",
          ],
          quiz: [
            { q: "L'examen d'agent évalue surtout :", options: ["Le par-cœur des articles", "La capacité à retrouver et appliquer la règle à un cas", "La culture footballistique générale"], answer: 1, explain: "Savoir où chercher et appliquer prime sur la récitation." },
            { q: "La meilleure préparation est :", options: ["Le bachotage la veille", "La régularité, les cas pratiques et le travail chronométré", "Regarder des matchs"], answer: 1 },
            { q: "À une semaine de l'examen, la stratégie la plus efficace ?", options: ["Tout apprendre par cœur la veille", "S'entraîner sur des cas pratiques chronométrés et réviser régulièrement", "Ne réviser que la culture foot"], answer: 1, explain: "L'examen teste l'application de la règle, pas la récitation." },
          ],
        },
        {
          id: "cas-pratiques",
          title: "Traiter un cas pratique",
          minutes: 7,
          intro: "Le réflexe du pro : face à n'importe quelle situation, dérouler une méthode fiable plutôt qu'improviser.",
          blocks: [
            "La méthode en 4 temps face à un cas (à l'examen comme dans la vraie vie) : (1) QUALIFIER les faits — qui sont les parties, quelle opération, quel cadre (national/international, majeur/mineur) ? (2) IDENTIFIER la ou les règles applicables. (3) APPLIQUER la règle aux faits précis. (4) CONCLURE clairement, avec les conséquences et les risques.",
            "L'erreur classique : répondre à la question qu'on aurait aimé lire plutôt qu'à celle qui est posée. Reformule le problème avec tes mots avant de répondre. Un cas bien qualifié est à moitié résolu — la précision des faits commande la règle applicable.",
            "Le raisonnement doit être visible : on ne se contente pas d'une conclusion, on montre le chemin (« puisque le joueur est mineur ET que le transfert est international, alors le principe est l'interdiction, sauf si… »). Cette rigueur rassure un examinateur comme un client, et t'évite les conclusions hâtives.",
            "Dans la vraie vie, ajoute une 5e étape : SÉCURISER — mettre par écrit, obtenir les accords nécessaires, et documenter. Un raisonnement juste mais non tracé ne te protège pas. Le cas pratique n'est pas qu'un exercice d'examen : c'est le réflexe quotidien qui distingue l'agent fiable.",
            "Cas concret — Énoncé : « Un joueur de 17 ans, résidant au Brésil, veut signer dans un club français. » Le candidat pressé conclut « oui, avec accord des parents ». Le candidat méthodique QUALIFIE d'abord : mineur + transfert international → principe = interdiction, sauf exceptions strictes. Il IDENTIFIE la règle, l'APPLIQUE, et CONCLUT prudemment. Même énoncé, deux notes opposées : la méthode, pas l'instinct, fait la différence.",
            "⚠️ L'erreur classique — Répondre à l'instinct sans méthode d'analyse. Le pro qualifie les faits, identifie la règle, puis conclut.",
            "🎯 À retenir — Les faits d'abord · La bonne règle ensuite · Une conclusion claire et motivée.",
          ],
          quiz: [
            { q: "Face à un cas, la première étape est :", options: ["Conclure vite", "Qualifier les faits (parties, opération, cadre)", "Chercher la sanction"], answer: 1, explain: "Un cas bien qualifié est à moitié résolu." },
            { q: "L'erreur classique sur un cas pratique :", options: ["Trop qualifier les faits", "Répondre à une autre question que celle posée", "Montrer son raisonnement"], answer: 1 },
            { q: "Dans la vraie vie, la 5e étape à ajouter est :", options: ["Oublier le dossier", "Sécuriser : écrit, accords, documentation", "Facturer plus"], answer: 1 },
          ],
        },
        {
          id: "veille",
          title: "Faire sa veille réglementaire & marché",
          minutes: 5,
          intro: "Dans un métier qui bouge, celui qui sait avant les autres a un temps d'avance décisif.",
          blocks: [
            "La veille réglementaire : les règles (FIFA, FFF, jurisprudence) évoluent — parfois brutalement (les plafonds de commission en sont l'exemple récent). Un agent qui travaille sur une info périmée prend des risques juridiques réels. Suis les sources officielles, note la date de dernière vérification, et méfie-toi des « on m'a dit que ».",
            "La veille marché : besoins des clubs, mouvements d'entraîneurs (un changement de coach rebat les cartes d'un effectif), fins de contrat, tendances. Cette information, captée tôt, te permet de positionner tes joueurs au bon endroit au bon moment. Le mercato se prépare toute l'année, pas pendant la fenêtre.",
            "La méthode : se construire des routines (sources à consulter, alertes, réseau qui remonte l'info) et un système pour NE RIEN oublier. L'information ne vaut que si elle déclenche une action au bon moment — une fin de contrat repérée six mois à l'avance vaut de l'or ; repérée trop tard, elle ne vaut rien.",
            "L'atout d'un outil : un système qui te remonte automatiquement les échéances de tes joueurs, croise l'actualité avec ton portefeuille et te propose les actions prioritaires (comme le fait Parzi Manage) transforme la veille d'une corvée aléatoire en un avantage systématique.",
            "Cas concret — Un club change d'entraîneur en octobre. Le nouveau coach joue en 3-5-2 : il va avoir besoin de pistons, et deux défenseurs centraux du précédent système vont se retrouver sur le banc. L'agent qui capte l'info tout de suite positionne son piston ET propose une porte de sortie à un central mécontent. Celui qui l'apprend en janvier arrive trop tard. La veille, ce n'est pas de la curiosité — c'est de l'avance transformée en opportunités.",
            "⚠️ L'erreur classique — Se figer sur ce qu'on a appris une fois pour toutes. Le pro fait une veille continue.",
            "🎯 À retenir — Les règles bougent · Suis les sources officielles · Mets tes réflexes à jour régulièrement.",
          ],
          quiz: [
            { q: "Pourquoi la veille réglementaire est-elle vitale ?", options: ["Pour la culture générale", "Parce que les règles évoluent et travailler sur une info périmée est risqué", "Ce n'est pas important"], answer: 1, explain: "Les plafonds de commission ont changé récemment : l'info datée est un risque." },
            { q: "Un changement d'entraîneur dans un club :", options: ["N'a aucun impact", "Rebat les cartes de l'effectif (opportunités à saisir tôt)", "Concerne seulement les supporters"], answer: 1 },
            { q: "Tu apprends qu'un club change de coach pour un système différent. Le bon réflexe d'agent ?", options: ["Attendre le mercato pour agir", "Anticiper : positionner tes joueurs correspondant au nouveau système, tôt", "Ne rien faire, ça ne te concerne pas"], answer: 1, explain: "L'info captée tôt se transforme en opportunités bien placées." },
          ],
        },
        {
          id: "outils-parzi",
          title: "S'outiller pour être irréprochable",
          minutes: 5,
          intro: "Le dernier écart entre un agent moyen et un grand agent : la rigueur d'exécution, décuplée par les bons outils.",
          blocks: [
            "Le talent relationnel et la connaissance des règles ne suffisent pas si l'exécution est brouillonne. Les erreurs qui coûtent le plus cher sont souvent bêtes : un mandat laissé expirer, une échéance ratée, une relance oubliée, un dossier mal suivi. Ce ne sont pas des erreurs de talent, mais d'organisation.",
            "Un bon système centralise l'essentiel : tes joueurs et leurs contrats, les échéances (contrat, mandat) avec alertes automatiques, tes contacts et la dernière interaction, tes tâches et opportunités en cours. Tout au même endroit, à jour, accessible. C'est la différence entre subir son activité et la piloter.",
            "Parzi Manage est pensé exactement pour ça : suivre les échéances pour ne jamais perdre un client par oubli, gérer le portefeuille et le pipeline d'opportunités, garder un CRM des clubs et contacts, et s'appuyer sur des analyses pour prioriser. L'outil ne remplace pas l'agent — il élimine les oublis et libère du temps pour ce qui compte : les relations et les deals.",
            "La discipline finale : ce que tu apprends dans cette formation ne vaut que si tu l'exécutes avec constance. Choisis un système, tiens-le à jour religieusement, et fais-en une habitude quotidienne. C'est cette rigueur, invisible mais implacable, qui sépare ceux qui durent de ceux qui disparaissent.",
            "Cas concret — Deux agents de talent égal. Le premier garde tout en tête et dans des mails éparpillés : sur une année, il perd un client (mandat expiré), rate une prolongation (échéance oubliée) et laisse filer une opportunité (relance jamais faite). Le second centralise tout dans un outil qui l'alerte : zéro oubli. À la fin de la saison, l'écart n'est pas une question de talent — c'est trois dossiers sauvés par la rigueur. C'est exactement ce que Parzi Manage automatise.",
            "⚠️ L'erreur classique — Tout gérer de tête ou dans des notes éparses, et rater une échéance. Le pro centralise mandats, joueurs et dates clés.",
            "🎯 À retenir — Une seule source de vérité · Des alertes d'échéances · Le suivi rigoureux fait la différence.",
          ],
          quiz: [
            { q: "Les erreurs les plus coûteuses d'un agent sont souvent :", options: ["Des erreurs de talent", "Des erreurs d'organisation (mandat expiré, échéance ratée)", "Des erreurs de tactique de jeu"], answer: 1, explain: "Ce sont des oublis évitables, pas des manques de talent." },
            { q: "À quoi sert un outil comme Parzi Manage ?", options: ["À jouer au football", "À centraliser échéances, portefeuille, CRM et priorités pour ne rien oublier", "À remplacer l'agent"], answer: 1 },
            { q: "Deux agents de talent égal : l'un s'outille, l'autre garde tout en tête. Qui prend l'avantage ?", options: ["Celui qui garde tout en tête, plus libre", "Celui qui s'outille : il élimine les oublis coûteux (mandats, échéances, relances)", "Aucun, l'outil ne change rien"], answer: 1, explain: "La rigueur d'exécution, décuplée par l'outil, sépare ceux qui durent." },
          ],
        },
      ],
    },
  ],
};

// ---------- Index plat pour la navigation ----------
export const ALL_LESSONS: { chapter: Chapter; lesson: Lesson }[] = COURSE.chapters.flatMap((c) =>
  c.lessons.map((l) => ({ chapter: c, lesson: l })),
);
export const LESSON_COUNT = ALL_LESSONS.length;

export function findLesson(lessonId: string): { chapter: Chapter; lesson: Lesson; index: number } | null {
  const idx = ALL_LESSONS.findIndex((x) => x.lesson.id === lessonId);
  if (idx < 0) return null;
  return { ...ALL_LESSONS[idx], index: idx };
}

/** Nombre de chapitres entièrement complétés (toutes leurs leçons validées). */
export function chaptersCompleted(done: Set<string>): number {
  return COURSE.chapters.filter((c) => c.lessons.every((l) => done.has(l.id))).length;
}

// ---------- Attributs de la carte agent (Indice de progression) ----------
// Chaque leçon nourrit un domaine de compétence. Les scores partent d'un socle
// et montent avec les leçons validées + le niveau. Rien d'inventé : tout dérive
// de l'activité réelle.
export type AttrKey = "SCO" | "NEG" | "JUR" | "BUS" | "IA" | "MGT";
export const ATTR_DEFS: { key: AttrKey; label: string }[] = [
  { key: "SCO", label: "Scouting" },
  { key: "NEG", label: "Négociation" },
  { key: "JUR", label: "Juridique" },
  { key: "BUS", label: "Business" },
  { key: "IA", label: "IA" },
  { key: "MGT", label: "Management" },
];

// Rattachement de chaque leçon à un domaine (pour la carte agent).
const LESSON_ATTR: Record<string, AttrKey> = {
  // Fondamentaux
  role: "MGT", ecosysteme: "MGT", "modele-economique": "BUS", deontologie: "JUR",
  // Cadre juridique
  licence: "JUR", "lecture-juridique": "JUR", "reglement-agents": "JUR", mineurs: "JUR", "transferts-systeme": "JUR",
  // Contrats & mandats
  mandat: "JUR", "contrat-joueur": "JUR", "clauses-cles": "JUR", commission: "BUS", litiges: "JUR",
  // Scouting & évaluation
  detection: "SCO", evaluation: "SCO", "data-video": "IA",
  // Gestion de carrière
  approche: "SCO", relation: "MGT", "plan-carriere": "MGT", "image-sponsors": "BUS",
  // Négociation
  negociation: "NEG", "preparer-nego": "NEG", "techniques-nego": "NEG", "negocier-transfert": "NEG",
  // Business & réseau
  "structurer-activite": "BUS", prospection: "BUS", reseau: "BUS", finances: "BUS",
  // Psychologie & facteur humain
  "mental-performance": "MGT", "gerer-entourage": "MGT", "conversations-difficiles": "NEG", "jeune-argent-celebrite": "MGT",
  // Transferts internationaux
  "jouer-a-letranger": "JUR", "mecanique-transfert-int": "JUR", "formation-solidarite": "BUS", "montages-a-eviter": "JUR",
  // Médias, image & communication
  "relation-medias": "MGT", "reseaux-sociaux": "BUS", "communication-crise": "MGT", "prise-de-parole": "NEG",
  // Fiscalité & statut
  "choisir-statut": "BUS", "micro-entreprise-agent": "BUS", "tva-commissions": "BUS", "facturer-commission": "BUS",
  // Méthode & pro
  "methode-examen": "MGT", "cas-pratiques": "JUR", veille: "IA", "outils-parzi": "IA",
};

export type AttrScore = { key: AttrKey; label: string; score: number };
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function computeAttributes(
  done: Set<string>,
  level: number,
  bonuses?: Partial<Record<AttrKey, number>>,
): { ovr: number; attrs: AttrScore[] } {
  const counts: Record<string, number> = {};
  for (const id of done) { const a = LESSON_ATTR[id]; if (a) counts[a] = (counts[a] ?? 0) + 1; }
  const attrs: AttrScore[] = ATTR_DEFS.map(({ key, label }) => ({
    key, label,
    score: clamp(40 + (counts[key] ?? 0) * 8 + Math.floor(level / 4) + (bonuses?.[key] ?? 0), 40, 99),
  }));
  const ovr = Math.round(attrs.reduce((s, a) => s + a.score, 0) / attrs.length);
  return { ovr, attrs };
}

/** Leçons rattachées à un domaine de compétence (pour orienter les révisions). */
export function lessonsForAttr(key: AttrKey): { id: string; title: string }[] {
  const out: { id: string; title: string }[] = [];
  for (const id of Object.keys(LESSON_ATTR)) {
    if (LESSON_ATTR[id] !== key) continue;
    const f = findLesson(id);
    if (f) out.push({ id, title: f.lesson.title });
  }
  return out;
}
