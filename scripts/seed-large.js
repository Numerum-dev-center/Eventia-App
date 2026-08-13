/**
 * Seed massif de la base locale avec des données réalistes.
 * Usage: node scripts/seed-large.js
 */
const { Client } = require("pg");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://eventia:eventia_local_dev@localhost:5432/eventia_dev";

const uuid = () => crypto.randomUUID();
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const int = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const bool = (p = 0.5) => Math.random() < p;

const VILLES = [
  ["Lomé", "Togo"], ["Cotonou", "Bénin"], ["Accra", "Ghana"],
  ["Abidjan", "Côte d'Ivoire"], ["Ouagadougou", "Burkina Faso"],
  ["Lagos", "Nigéria"], ["Dakar", "Sénégal"], ["Kara", "Togo"],
];
const LIEUX = [
  "Terminal Rooftop", "Palais des Congrès", "Stade Municipal", "Centre Novotel",
  "Institut Goethe", "Espace Latérite", "Plage de Robinson", "Arena Sportive",
  "Jardin Botanique", "Hôtel Sarakawa", "Salle Bia Yentema", "Marché des Artisans",
];
const CATEGORIES_EVT = ["Concert", "Conférence", "Spectacle", "Marché", "Sport", "Festival", "Atelier"];
const ADJ = ["Nuit", "Festival", "Soirée", "Grand", "Nouvelle Édition", "Rencontre", "Sommet", "Tournoi", "Foire", "Gala"];
const THEMES = ["Afrobeat", "Tech Togo", "Culture Urbaine", "Jazz", "Startups", "Mode", "Gastronomie", "Sport Urbain", "Cinéma", "Artisanat", "Musique Live", "Digital"];

const PRENOMS = ["Kokou", "Sandra", "Yaovi", "Adjoa", "Kossi", "Ama", "Komi", "Afi", "Edem", "Akosua", "Mawuli", "Efua", "Kodjo", "Abla", "Senyo", "Delali", "Fiifi", "Naa", "Selom", "Dzifa"];
const NOMS = ["Agbeko", "Mensah", "Dogbe", "Amouzou", "Kponton", "Adjovi", "Tchamba", "Anani", "Sossou", "Ayivi", "Klutse", "Bakoena", "Fiawoo", "Gnassingbe", "Houngbo"];

function randDateBetween(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log("Connecté à la base:", DATABASE_URL);

  const passwordHash = await bcrypt.hash("Demo1234!", 10);
  const now = new Date();
  const pastFar = new Date(now.getTime() - 200 * 24 * 3600 * 1000);
  const futureFar = new Date(now.getTime() + 90 * 24 * 3600 * 1000);

  // ---------- 1. Organisateurs ----------
  const NB_ORGANISATEURS = 60;
  const organisateurs = []; // { utilisateurId, profilId }

  console.log(`Création de ${NB_ORGANISATEURS} organisateurs...`);
  for (let i = 0; i < NB_ORGANISATEURS; i++) {
    const uId = uuid();
    const prenom = pick(PRENOMS);
    const nom = pick(NOMS);
    const email = `orga${i}.${nom.toLowerCase()}@eventia.seed`;
    await client.query(
      `INSERT INTO utilisateur (id, email, "motDePasse", nom, prenoms, role, "estActif", telephone)
       VALUES ($1,$2,$3,$4,$5,'Organisateur',true,$6)`,
      [uId, email, passwordHash, nom, prenom, `+228 9${int(1000000, 9999999)}`]
    );
    const pId = uuid();
    await client.query(
      `INSERT INTO profil_organisateurs (id, "nomEntreprise", "statutVerification", utilisateur_id)
       VALUES ($1,$2,$3,$4)`,
      [pId, `${prenom} ${nom} Events`, pick(["Approuvé", "En attente", "Approuvé", "Approuvé"]), uId]
    );
    organisateurs.push({ utilisateurId: uId, profilId: pId });
  }

  // ---------- 2. Clients ----------
  const NB_CLIENTS = 250;
  const clients = [];
  console.log(`Création de ${NB_CLIENTS} clients...`);
  for (let i = 0; i < NB_CLIENTS; i++) {
    const uId = uuid();
    const prenom = pick(PRENOMS);
    const nom = pick(NOMS);
    const email = `client${i}.${nom.toLowerCase()}@eventia.seed`;
    await client.query(
      `INSERT INTO utilisateur (id, email, "motDePasse", nom, prenoms, role, "estActif", telephone)
       VALUES ($1,$2,$3,$4,$5,'Client',true,$6)`,
      [uId, email, passwordHash, nom, prenom, `+228 9${int(1000000, 9999999)}`]
    );
    clients.push({ utilisateurId: uId, nom: `${prenom} ${nom}`, email });
  }

  // Admin de test
  const adminExists = await client.query(`SELECT id FROM utilisateur WHERE email = 'admin.seed@eventia.seed'`);
  if (adminExists.rowCount === 0) {
    await client.query(
      `INSERT INTO utilisateur (id, email, "motDePasse", nom, prenoms, role, "estActif")
       VALUES ($1,'admin.seed@eventia.seed',$2,'Admin','Seed','Admin',true)`,
      [uuid(), passwordHash]
    );
  }

  // ---------- 3. Événements + catégories de billets ----------
  const NB_EVENEMENTS = 180;
  const evenements = []; // { id, statut, categories: [{id, prix, quantiteTotale, quantiteDisponible}] }
  const STATUTS_POOL = [
    ...Array(70).fill("Publié"),
    ...Array(15).fill("Brouillon"),
    ...Array(10).fill("Annulé"),
    ...Array(35).fill("Terminé"),
  ];

  console.log(`Création de ${NB_EVENEMENTS} événements...`);
  for (let i = 0; i < NB_EVENEMENTS; i++) {
    const statut = pick(STATUTS_POOL);
    const orga = pick(organisateurs);
    const [ville, pays] = pick(VILLES);
    const lieu = pick(LIEUX);
    const cat = pick(CATEGORIES_EVT);
    const titre = `${pick(ADJ)} ${pick(THEMES)}`;

    let dateDebut;
    if (statut === "Terminé") dateDebut = randDateBetween(pastFar, now);
    else if (statut === "Annulé") dateDebut = randDateBetween(pastFar, futureFar);
    else dateDebut = randDateBetween(new Date(now.getTime() - 5 * 24 * 3600 * 1000), futureFar);
    const dateFin = new Date(dateDebut.getTime() + int(2, 6) * 3600 * 1000);

    const evId = uuid();
    await client.query(
      `INSERT INTO evenement (id, titre, description, categorie, "lieuNom", adresse, "dateDebut", "dateFin", statut, profil_organisateur_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        evId, titre,
        `${titre} — un événement organisé à ${ville}. Une expérience à ne pas manquer, avec une programmation soignée et un accueil chaleureux.`,
        cat, lieu, `${lieu}, ${ville}, ${pays}`, dateDebut, dateFin, statut, orga.profilId,
      ]
    );

    const nbCategories = bool(0.7) ? 1 : int(2, 3);
    const categories = [];
    const NOMS_CAT = ["Standard", "VIP", "Early Bird", "Table Premium"];
    for (let c = 0; c < nbCategories; c++) {
      const prix = int(1, 20) * 1000;
      const quantiteTotale = int(50, 500);
      // taux d'occupation variable selon statut
      const tauxVente = statut === "Terminé" ? int(60, 100) : statut === "Publié" ? int(0, 80) : 0;
      const vendus = Math.floor((quantiteTotale * tauxVente) / 100);
      const quantiteDisponible = quantiteTotale - vendus;
      const catId = uuid();
      await client.query(
        `INSERT INTO categorie_ticket (id, nom, prix, "quantiteTotale", "quantiteDisponible", "limiteParPersonne", evenement_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [catId, NOMS_CAT[c] || `Catégorie ${c + 1}`, prix, quantiteTotale, quantiteDisponible, int(2, 10), evId]
      );
      categories.push({ id: catId, prix, quantiteTotale, vendus });
    }

    evenements.push({ id: evId, statut, dateDebut, categories, organisateurId: orga.utilisateurId });
  }

  // ---------- 4. Commandes + billets ----------
  console.log("Génération des commandes et billets...");
  let totalCommandes = 0;
  let totalBillets = 0;

  for (const ev of evenements) {
    for (const cat of ev.categories) {
      if (cat.vendus <= 0) continue;

      let restant = cat.vendus;
      while (restant > 0) {
        const quantite = Math.min(restant, int(1, 4));
        restant -= quantite;

        const buyer = bool(0.5) ? pick(clients) : null;
        const prenom = pick(PRENOMS);
        const nom = pick(NOMS);
        const buyerName = buyer ? buyer.nom : `${prenom} ${nom}`;
        const buyerEmail = buyer ? buyer.email : `guest${totalCommandes}.${nom.toLowerCase()}@eventia.seed`;

        const montantTotal = quantite * cat.prix;
        const statutPaiement = bool(0.92) ? "Payé" : pick(["En attente", "Echoué"]);
        const dateCommande = randDateBetween(
          new Date(Math.min(ev.dateDebut.getTime() - 20 * 24 * 3600 * 1000, now.getTime())),
          new Date(Math.min(ev.dateDebut.getTime(), now.getTime()))
        );

        const commandeId = uuid();
        await client.query(
          `INSERT INTO commande (id, "montantTotal", "statutPaiement", "dateCommande", client_id, "buyerName", "buyerEmail", "buyerTelephone")
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            commandeId, montantTotal, statutPaiement, dateCommande,
            buyer ? buyer.utilisateurId : null, buyerName, buyerEmail, `+228 9${int(1000000, 9999999)}`,
          ]
        );
        totalCommandes++;

        if (statutPaiement === "Payé") {
          const dejaTermine = ev.statut === "Terminé";
          for (let t = 0; t < quantite; t++) {
            const scanne = dejaTermine ? bool(0.85) : bool(0.1);
            const code = crypto.randomBytes(16).toString("hex");
            await client.query(
              `INSERT INTO ticket_emis (id, "codeUniqueCrypto", "statutValidation", "scanneA", commande_id, categorie_ticket_id, scanne_par)
               VALUES ($1,$2,$3,$4,$5,$6,$7)`,
              [
                uuid(), code, scanne ? "Scanne" : "Valide",
                scanne ? randDateBetween(ev.dateDebut, new Date(ev.dateDebut.getTime() + 5 * 3600 * 1000)) : null,
                commandeId, cat.id, scanne ? ev.organisateurId : null,
              ]
            );
            totalBillets++;
          }
        }
      }
    }
  }

  const totals = await client.query(`
    SELECT
      (SELECT count(*) FROM utilisateur) AS utilisateurs,
      (SELECT count(*) FROM profil_organisateurs) AS profils,
      (SELECT count(*) FROM evenement) AS evenements,
      (SELECT count(*) FROM categorie_ticket) AS categories,
      (SELECT count(*) FROM commande) AS commandes,
      (SELECT count(*) FROM ticket_emis) AS billets
  `);

  console.log("\n=== Seed terminé ===");
  console.table(totals.rows[0]);
  const t = totals.rows[0];
  const grandTotal = Object.values(t).reduce((s, v) => s + Number(v), 0);
  console.log("TOTAL toutes tables confondues:", grandTotal);

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
